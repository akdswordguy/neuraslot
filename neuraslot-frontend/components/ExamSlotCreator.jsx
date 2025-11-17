import React, { useEffect, useState } from 'react';

const periodTimes = ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM'];
const sectionsDefault = ['S1 CSE A', 'S1 CSE B', 'S1 CSE C', 'S1 CSE D'];

function dayNameFromDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long' });
}

export default function ExamSlotCreator({ onClose }) {
  const [date, setDate] = useState('');
  const [sections, setSections] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTarget, setSendTarget] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('timetables');
      if (raw) setTimetables(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load timetables', e);
    }
  }, []);

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
      // only consider selected sections (classes)
      if (!sections.includes(t.className)) return;
      (t.timetable || []).forEach(slot => {
        if (slot.day === dayName && periods.includes(slot.period)) {
          found.push({ className: t.className, slot });
        }
      });
    });
    setConflicts(found);
  }

  function saveExamSlots() {
    if (!date || sections.length === 0 || periods.length === 0) {
      alert('Please select date, sections and period(s)');
      return;
    }

    const newSlots = [];
    sections.forEach(sec => {
      periods.forEach(p => {
        newSlots.push({ id: Date.now() + Math.random(), date, section: sec, period: p, createdAt: new Date().toISOString() });
      });
    });

    try {
      const raw = localStorage.getItem('examSlots');
      const existing = raw ? JSON.parse(raw) : [];
      const next = [...existing, ...newSlots];
      localStorage.setItem('examSlots', JSON.stringify(next));
      alert('Exam slots created.');
      onClose && onClose();
    } catch (e) {
      console.error('Failed to save exam slots', e);
      alert('Failed to save exam slots. See console.');
    }
  }

  function openSend(target) {
    setSendTarget(target);
    setShowSendModal(true);
  }

  function sendMock(message) {
    console.log('Mock send', sendTarget, message);
    setShowSendModal(false);
    alert('Notification mock sent');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <h3 className="text-lg font-bold">Create Exam Slot</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">Close</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-2 p-2 border rounded w-full text-black" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Sections</label>
            <div className="flex gap-2 flex-wrap">
              {sectionsDefault.map(s => (
                <label key={s} className={`px-3 py-2 rounded cursor-pointer border ${sections.includes(s) ? 'bg-cyan-500 text-white border-cyan-600' : 'bg-white/50'}`}>
                  <input type="checkbox" checked={sections.includes(s)} onChange={() => toggleSection(s)} className="mr-2" />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Period(s)</label>
            <div className="grid grid-cols-4 gap-2">
              {periodTimes.map((t, idx) => (
                <label key={t} className={`px-2 py-2 rounded border cursor-pointer ${periods.includes(idx + 1) ? 'bg-violet-500 text-white' : 'bg-white/50'}`}>
                  <input type="checkbox" checked={periods.includes(idx + 1)} onChange={() => togglePeriod(idx + 1)} className="mr-2" />
                  P{idx + 1} • {t}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Detected Conflicts</h4>
            {conflicts.length === 0 && <div className="text-sm text-gray-500">No conflicts detected for selected date/period(s)/sections.</div>}
            <div className="space-y-2">
              {conflicts.map((c, i) => (
                <div key={i} className="p-3 rounded border bg-red-50 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-black">{c.className}</div>
                    <div className="text-sm text-black">{c.slot.subject || c.slot.lab || 'Unknown subject'} • {c.slot.day} • Period {c.slot.period}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openSend(c)} className="px-3 py-1 bg-yellow-100 rounded text-black">Send Notification</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button onClick={saveExamSlots} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded">Save Exam Slots</button>
          </div>
        </div>
      </div>

      {showSendModal && sendTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSendModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
            <h4 className="font-bold mb-3 text-black">Send Notification</h4>
            <p className="text-sm text-black mb-3">Notify about exam slot change for <strong>{sendTarget.className}</strong> — {sendTarget.slot.day} Period {sendTarget.slot.period}</p>
            <textarea defaultValue={`Dear Faculty,\n\nPlease note an exam has been scheduled on ${sendTarget.slot.day} (Period ${sendTarget.slot.period}).\n\nRegards,\nAdmin`} className="w-full h-28 p-2 border rounded mb-3 text-black" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSendModal(false)} className="px-3 py-1 rounded text-black">Cancel</button>
              <button onClick={() => sendMock('notify')} className="px-3 py-1 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}