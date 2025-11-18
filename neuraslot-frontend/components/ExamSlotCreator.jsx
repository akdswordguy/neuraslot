import React, { useEffect, useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

const periodTimes = ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM'];
const sectionsDefault = ['S1 CSE A', 'S1 CSE B', 'S1 CSE C', 'S1 CSE D'];

function dayNameFromDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long' });
}

export default function ExamSlotCreator({ onClose, apiBase = 'http://127.0.0.1:8000/api/scheduling/' }) {
  const [date, setDate] = useState('');
  const [sections, setSections] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTarget, setSendTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  
  // Fetch timetables from API
  useEffect(() => {
    const fetchTimetables = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBase}timetable/?format=json`, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch timetables');
        const data = await response.json();
        const ttData = Array.isArray(data) ? data : data.results || [];
        setTimetables(ttData);
        localStorage.setItem('timetables', JSON.stringify(ttData));
      } catch (err) {
        console.error('Fetch error:', err);
        // Fallback to localStorage
        try {
          const cached = localStorage.getItem('timetables');
          if (cached) {
            setTimetables(JSON.parse(cached));
            setError('Using cached data');
          } else {
            setError('Failed to load timetables');
          }
        } catch (e) {
          setError('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, [apiBase]);

  // Detect conflicts when date/periods/sections change
  useEffect(() => {
    detectConflicts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, periods, sections]);

  function toggleSection(s) {
    setSections(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));
  }

  function togglePeriod(p) {
    setPeriods(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]));
  }

  function detectConflicts() {
    if (!date || periods.length === 0 || sections.length === 0) {
      setConflicts([]);
      return;
    }

    const dayName = dayNameFromDate(date);
    const found = [];

    timetables.forEach(t => {
      if (!sections.includes(t.className)) return;

      (t.timetable || []).forEach(slot => {
        if (slot.day === dayName && periods.includes(slot.period)) {
          if (slot.subject && slot.subject !== 'Free') {
            found.push({ 
              className: t.className, 
              slot,
              conflictType: 'scheduled_class'
            });
          }
        }
      });
    });

    setConflicts(found);
  }

  async function saveExamSlots() {
    if (!date || sections.length === 0 || periods.length === 0) {
      alert('Please select date, sections and period(s)');
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
          subject: selectedLabSubject // must be a valid Subject.id
        });
      });
    });

    const response = await fetch(`${apiBase}exam/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        examSlots: newSlots,
        detectedConflicts: conflicts
      })
    });




      if (!response.ok) throw new Error('Failed to save exam slots');

      // Also save to localStorage
      const existing = localStorage.getItem('examSlots');
      const exams = existing ? JSON.parse(existing) : [];
      localStorage.setItem('examSlots', JSON.stringify([...exams, ...newSlots]));

      alert('Exam slots created successfully');
      setDate('');
      setSections([]);
      setPeriods([]);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      alert(`Failed to save exam slots: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function openSend(conflict) {
    setSendTarget(conflict);
    setNotificationMessage(
      `Dear Faculty,\n\nPlease note that exam scheduling may conflict with your class:\n\n` +
      `Section: ${conflict.className}\n` +
      `Subject: ${conflict.slot.subject}\n` +
      `Date: ${date}\n` +
      `Period: ${conflict.slot.period}\n` +
      `Day: ${dayNameFromDate(date)}\n\n` +
      `Please make necessary arrangements.\n\nRegards,\nAdmin`
    );
    setShowSendModal(true);
  }

  async function sendNotification() {
    if (!sendTarget) return;

    try {
      // Log notification (in real scenario, POST to notification API)
      console.log('Sending notification:', {
        target: sendTarget,
        message: notificationMessage,
        timestamp: new Date().toISOString()
      });

      // Optional: POST to API
      await fetch(`${apiBase}activity/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'NOTIFICATION_SENT',
          details: {
            section: sendTarget.className,
            subject: sendTarget.slot.subject,
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
        <div>
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
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="mt-2 p-2 border rounded w-full text-black dark:text-white dark:bg-slate-800"
                />
              </div>

              {/* Section Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Sections</label>
                <div className="flex gap-2 flex-wrap">
                  {sectionsDefault.map(s => (
                    <label key={s} className={`px-3 py-2 rounded cursor-pointer border transition-all ${
                      sections.includes(s) 
                        ? 'bg-cyan-500 text-white border-cyan-600' 
                        : 'bg-white/50 dark:bg-slate-800 text-black dark:text-white border-gray-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        checked={sections.includes(s)} 
                        onChange={() => toggleSection(s)} 
                        className="mr-2"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Period Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Period(s)</label>
                <div className="grid grid-cols-4 gap-2">
                  {periodTimes.map((t, idx) => (
                    <label key={t} className={`px-2 py-2 rounded border cursor-pointer transition-all ${
                      periods.includes(idx + 1) 
                        ? 'bg-violet-500 text-white border-violet-600' 
                        : 'bg-white/50 dark:bg-slate-800 text-black dark:text-white border-gray-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        checked={periods.includes(idx + 1)} 
                        onChange={() => togglePeriod(idx + 1)} 
                        className="mr-2"
                      />
                      P{idx + 1}
                    </label>
                  ))}
                </div>
              </div>

              {/* Conflicts Display */}
              <div>
                <h4 className="font-semibold mb-2 text-black dark:text-white">Detected Conflicts ({conflicts.length})</h4>
                {conflicts.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    ✓ No conflicts detected for selected date/period(s)/sections.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conflicts.map((c, i) => (
                      <div key={i} className="p-3 rounded border bg-red-50 dark:bg-red-900/20 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-black dark:text-white">{c.className}</div>
                          <div className="text-sm text-black dark:text-gray-300">
                            {c.slot.subject || 'Unknown'} • {c.slot.day} • Period {c.slot.period}
                          </div>
                        </div>
                        <button 
                          onClick={() => openSend(c)}
                          className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm hover:bg-yellow-200 transition-all"
                        >
                          Notify
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={() => {
                    setDate('');
                    setSections([]);
                    setPeriods([]);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-400 transition-all"
                >
                  Reset
                </button>
                <button 
                  onClick={saveExamSlots}
                  disabled={saving || !date || sections.length === 0 || periods.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded disabled:opacity-50 hover:shadow-lg transition-all"
                >
                  {saving ? 'Saving...' : 'Save Exam Slots'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Modal */}
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
ExamSlotCreator.jsx