import React, { useEffect, useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

const periodTimes = ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM'];

function dayNameFromDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long' });
}

export default function ExamSlotCreator({ onClose, apiBase = 'http://127.0.0.1:8000/api/scheduling/' }) {
  const [date, setDate] = useState('');
  const [selectedLabSubject, setSelectedLabSubject] = useState(null);
  const [sections, setSections] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [classes, setClasses] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [slotRecommendations, setSlotRecommendations] = useState({ bestSlot: null, bestAltSlots: [] });
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTarget, setSendTarget] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const labSubjects = Object.values(subjects).filter(s => s.has_lab);
  const sectionsDefault = Object.values(classes);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [ttRes, subjRes, classRes] = await Promise.all([
          fetch(`${apiBase}timetable/?format=json`),
          fetch(`${apiBase}subjects/`),
          fetch(`${apiBase}classes/`)
        ]);
        if (!ttRes.ok || !subjRes.ok || !classRes.ok) throw new Error('Failed to fetch required data');

        const [ttData, subjData, classData] = await Promise.all([ttRes.json(), subjRes.json(), classRes.json()]);

        const subjMap = {};
        subjData.forEach(s => (subjMap[s.id] = s));
        setSubjects(subjMap);

        const classMap = {};
        classData.forEach(c => (classMap[c.id] = c.name));
        setClasses(classMap);

        const enrichedTT = ttData.map(entry => ({
          ...entry,
          subjectName: subjMap[entry.subject]?.name || 'Free',
          subjectHasLab: subjMap[entry.subject]?.has_lab || false,
          className: classMap[entry.class_id || entry.klass] || 'Unknown',
          dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][entry.day_of_week - 1] || 'Unknown',
          periodTime: periodTimes[(entry.period_number || entry.period) - 1] || 'Unknown'
        }));

        setTimetables(enrichedTT);
        localStorage.setItem('timetables', JSON.stringify(enrichedTT));
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
        try {
          const cached = localStorage.getItem('timetables');
          if (cached) {
            setTimetables(JSON.parse(cached));
            setError('Using cached data');
          }
        } catch {}
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiBase]);

  function toggleSection(s) {
    setSections(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));
  }

  function togglePeriod(p) {
    setPeriods(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]));
  }

  // Lab periods considered blocking, others weighted by credit_score
  const isLabPeriod = slot => slot.is_lab && slot.subject !== null && subjects[slot.subject]?.has_lab;

  useEffect(() => {
    if (!date || !selectedLabSubject || sections.length === 0 || periods.length === 0) {
      setConflicts([]);
      setSlotRecommendations({ bestSlot: null, bestAltSlots: [] });
      return;
    }
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const selectedDayName = dayNameFromDate(date);
    const scheduledDays = new Set(timetables.map(slot => slot.dayName));
    // Only days with classes scheduled, excluding selected day
    const alternativeDays = allDays.filter(d => d !== selectedDayName && scheduledDays.has(d));

    const slotMap = {};
    timetables.forEach(slot => {
      const key = `${slot.className}_${slot.dayName}_${slot.period_number}`;
      slotMap[key] = slot;
    });

    function countConflicts(day, period) {
      const conflictsList = [];
      let hasScheduledSlot = false;
      let hasLabOrFree = false;
      sections.forEach(cls => {
        const key = `${cls}_${day}_${period}`;
        const slot = slotMap[key];
        if (slot) {
          hasScheduledSlot = true;
          if (slot.subjectName === 'Free') {
            hasLabOrFree = true;
          } else if (isLabPeriod(slot)) {
            conflictsList.push({
              className: cls,
              subjectName: slot.subjectName,
              subjectId: slot.subject,
              credit_score: subjects[slot.subject]?.credit_score ?? 0,
              periodNumber: period,
              day,
              isLab: true
            });
          } else {
            conflictsList.push({
              className: cls,
              subjectName: slot.subjectName,
              subjectId: slot.subject,
              credit_score: subjects[slot.subject]?.credit_score ?? 0,
              periodNumber: period,
              day,
              isLab: false
            });
          }
        }
      });
      return hasScheduledSlot || hasLabOrFree ? conflictsList : null;
    }

    // Conflicts for selected periods
    const selectedConflicts = [];
    periods.forEach(p => {
      const cs = countConflicts(selectedDayName, p);
      if (cs) cs.forEach(c => selectedConflicts.push(c));
    });

    // Helper to calculate slot score: infinite if lab conflict, else sum credit scores
    const slotScore = confs => {
      if (!confs || confs.length === 0) return 0;
      if (confs.some(c => c.isLab)) return Number.MAX_SAFE_INTEGER;
      return confs.reduce((acc, c) => acc + (c.credit_score || 0), 0);
    };

    // Find best slot on selected day (minimal slotScore)
    let bestSlot = null;
    let bestScore = Number.MAX_SAFE_INTEGER;
    for (let p = 1; p <= periodTimes.length; p++) {
      const confs = countConflicts(selectedDayName, p);
      const score = slotScore(confs);
      if (score < bestScore) {
        bestSlot = { day: selectedDayName, period: p, conflictsList: confs || [], conflictScore: score };
        bestScore = score;
      }
    }

    // Best slots on alternative days
    const bestAltSlots = alternativeDays.map(day => {
      let bestAlt = null;
      let bestAltScore = Number.MAX_SAFE_INTEGER;
      for (let p = 1; p <= periodTimes.length; p++) {
        const confs = countConflicts(day, p);
        const score = slotScore(confs);
        if (score < bestAltScore) {
          bestAlt = { day, period: p, conflictsList: confs || [], conflictScore: score };
          bestAltScore = score;
        }
      }
      return bestAlt;
    });

    setConflicts(selectedConflicts);
    setSlotRecommendations({ bestSlot, bestAltSlots });
  }, [date, selectedLabSubject, sections, periods, timetables, subjects]);

  async function saveExamSlots() {
    if (!date || sections.length === 0 || periods.length === 0 || !selectedLabSubject) {
      alert('Please select date, lab subject, sections and period(s)');
      return;
    }

    setSaving(true);

    try {
      const newSlots = [];

      sections.forEach(sec => {
        periods.forEach(p => {
          newSlots.push({
            date,
            section: sec,
            period: p,
            day: dayNameFromDate(date),
            subject: selectedLabSubject
          });
        });
      });

      const response = await fetch(`${apiBase}exam/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // 🔥 Session cookie authentication
        body: JSON.stringify({
          examSlots: newSlots,
          detectedConflicts: conflicts
        })
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error("Response:", responseData);
        throw new Error(responseData.error || "Failed to save exam slots");
      }

      alert(`Exam slots created: ${responseData.created_slots}`);

      setDate("");
      setSections([]);
      setPeriods([]);
      setSelectedLabSubject(null);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }


  function openSend(conflict) {
    setSendTarget(conflict);
    setNotificationMessage(
      `Dear Faculty,\n\nPlease note potential exam scheduling conflict with your class:\n` +
        `Section: ${conflict.className}\n` +
        `Subject: ${conflict.subjectName}\n` +
        `Date: ${conflict.day}\n` +
        `Period: ${conflict.periodNumber}\n\n` +
        `Please make necessary arrangements.\n\nRegards,\nAdmin`
    );
    setShowSendModal(true);
  }

  async function sendNotification() {
    if (!sendTarget) return;
    try {
      console.log('Sending notification:', { target: sendTarget, message: notificationMessage });
      await fetch(`${apiBase}activity/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'NOTIFICATION_SENT',
          details: {
            section: sendTarget.className,
            subject: sendTarget.subjectName,
            message: notificationMessage
          }
        })
      }).catch(err => console.log('Activity log error:', err));
      alert('Notification sent successfully');
      setShowSendModal(false);
      setSendTarget(null);
    } catch (err) {
      console.error('Send error:', err);
      alert(`Failed to send notification: ${err.message}`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <h3 className="text-lg font-bold">Create Exam Slot</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">Close</button>
        </div>
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading timetables...</p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-2 p-2 border rounded w-full text-black dark:text-white dark:bg-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Lab Subject</label>
                <div className="flex gap-2 flex-wrap">
                  {labSubjects.map(lab => (
                    <label key={lab.id} className={`px-3 py-2 rounded cursor-pointer border transition-all ${selectedLabSubject === lab.id ? 'bg-cyan-500 text-white border-cyan-600' : 'bg-white/50 dark:bg-slate-800 text-black dark:text-white border-gray-300'}`}>
                      <input type="radio" name="labSubject" checked={selectedLabSubject === lab.id} onChange={() => setSelectedLabSubject(lab.id)} className="mr-2" />
                      {lab.name} ({lab.credit_score} credits)
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Sections</label>
                <div className="flex gap-2 flex-wrap">
                  {sectionsDefault.map(s => (
                    <label key={s} className={`px-3 py-2 rounded cursor-pointer border transition-all ${sections.includes(s) ? 'bg-cyan-500 text-white border-cyan-600' : 'bg-white/50 dark:bg-slate-800 text-black dark:text-white border-gray-300'}`}>
                      <input type="checkbox" checked={sections.includes(s)} onChange={() => toggleSection(s)} className="mr-2" />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Period(s)</label>
                <div className="grid grid-cols-4 gap-2">
                  {periodTimes.map((t, idx) => (
                    <label key={t} className={`px-2 py-2 rounded border cursor-pointer transition-all ${periods.includes(idx + 1) ? 'bg-violet-500 text-white border-violet-600' : 'bg-white/50 dark:bg-slate-800 text-black dark:text-white border-gray-300'}`}>
                      <input type="checkbox" checked={periods.includes(idx + 1)} onChange={() => togglePeriod(idx + 1)} className="mr-2" />
                      P{idx + 1}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-black dark:text-white">Detected Conflicts ({conflicts.length})</h4>
                {conflicts.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-green-50 dark:bg-green-900/20 rounded">✓ No conflicts detected for selected date/period(s)/sections.</div>
                ) : (
                  <div className="space-y-2">
                    {conflicts.map((c, i) => (
                      <div key={i} className="p-3 rounded border bg-red-50 dark:bg-red-900/20 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-black dark:text-white">{c.className}</div>
                          <div className="text-sm text-black dark:text-gray-300">{c.subjectName || 'Unknown'} • Period {c.periodNumber}</div>
                        </div>
                        <button onClick={() => openSend(c)} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm hover:bg-yellow-200 transition-all">Notify</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-black dark:text-white">Best Slot for Selected Day</h4>
                {slotRecommendations.bestSlot ? (
                  <div className="p-3 border rounded mb-4">
                    <div>Day: {slotRecommendations.bestSlot.day}</div>
                    <div>
                      Period: {slotRecommendations.bestSlot.period} ({periodTimes[slotRecommendations.bestSlot.period - 1]})
                    </div>
                    <div>Conflict Score: {slotRecommendations.bestSlot.conflictScore}</div>
                    <div className="mt-2 font-semibold">Conflicting Classes:</div>
                    {slotRecommendations.bestSlot.conflictsList.length > 0 ? (
                      slotRecommendations.bestSlot.conflictsList.map((c, idx) => (
                        <div key={idx} className="ml-4">
                          {c.className} - {c.subjectName} ({c.credit_score} credits)
                          {c.isLab ? ' (Lab - cannot reschedule)' : ''}
                        </div>
                      ))
                    ) : (
                      <div className="ml-4">No conflicts</div>
                    )}
                  </div>
                ) : (
                  <p>No best slot found for selected date</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-black dark:text-white">Best Alternative Slots</h4>
                {slotRecommendations.bestAltSlots.length > 0 ? (
                  slotRecommendations.bestAltSlots.map((alt, idx) => (
                    <div key={idx} className="p-3 border rounded mb-4">
                      <div>Day: {alt.day}</div>
                      <div>
                        Period: {alt.period} ({periodTimes[alt.period - 1]})
                      </div>
                      <div>Conflict Score: {alt.conflictScore}</div>
                      <div className="mt-2 font-semibold">Conflicting Classes:</div>
                      {alt.conflictsList.length > 0 ? (
                        alt.conflictsList.map((c, idx2) => (
                          <div key={idx2} className="ml-4">
                            {c.className} - {c.subjectName} ({c.credit_score} credits)
                            {c.isLab ? ' (Lab - cannot reschedule)' : ''}
                          </div>
                        ))
                      ) : (
                        <div className="ml-4">No conflicts</div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No alternative slots found</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setDate('');
                    setSections([]);
                    setPeriods([]);
                    setSelectedLabSubject(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-400 transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={saveExamSlots}
                  disabled={saving || !date || sections.length === 0 || !selectedLabSubject}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded disabled:opacity-50 hover:shadow-lg transition-all"
                >
                  {saving ? 'Saving...' : 'Save Exam Slots'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSendModal && sendTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSendModal(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold mb-3 text-black dark:text-white">Send Notification</h4>
            <p className="text-sm text-black dark:text-gray-300 mb-3">
              Notify about potential exam scheduling conflict for <strong>{sendTarget.className}</strong>
            </p>
            <textarea
              value={notificationMessage}
              onChange={e => setNotificationMessage(e.target.value)}
              className="w-full h-32 p-2 border rounded mb-3 text-black dark:text-white dark:bg-slate-800 dark:border-slate-700"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-3 py-1 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={sendNotification}
                className="px-3 py-1 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
