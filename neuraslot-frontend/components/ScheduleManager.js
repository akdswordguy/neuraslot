import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Eye, Edit3 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ScheduleEditor = dynamic(() => import('./ScheduleEditor'), { ssr: false });
const ScheduleViewer = dynamic(() => import('./ScheduleViewer'), { ssr: false });

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periodTimes = ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM'];

// Custom timetable generator based on user requirements
function generateCustomTimetableForClass(className) {
  // Subjects
  const subjects = ['Software', 'Deep Learning', 'Machine Learning', 'Maths', 'Environment', 'Computer Networks'];
  // Lab subjects
  const labSubjects = ['Software', 'Computer Networks', 'Machine Learning'];
  // Only one lab room
  const labRoom = 'Tejas lab';
  // Number of periods per day
  const periodsPerDay = 8;
  // Number of days
  const numDays = days.length;

  // Track which lab subject has been assigned for this batch
  let labAssigned = {};
  labSubjects.forEach(subj => { labAssigned[subj] = false; });

  // Randomize lab subject order for variety
  const shuffledLabSubjects = [...labSubjects].sort(() => Math.random() - 0.5);

  // Pick a random day and period for each lab subject (2 consecutive periods, only once per week)
  let labPlacements = [];
  shuffledLabSubjects.forEach((subj, idx) => {
    let placed = false;
    while (!placed) {
      const dayIdx = Math.floor(Math.random() * numDays);
      const periodIdx = Math.floor(Math.random() * (periodsPerDay - 1)); // ensure room for 2 consecutive
      // Check for collision
      if (!labPlacements.some(lp => lp.dayIdx === dayIdx && (Math.abs(lp.periodIdx - periodIdx) < 2))) {
        labPlacements.push({ subj, dayIdx, periodIdx });
        placed = true;
      }
    }
  });

  // For each day/period, fill timetable
  const generated = [];
  for (let dIdx = 0; dIdx < numDays; dIdx++) {
    let dayLabs = labPlacements.filter(lp => lp.dayIdx === dIdx);
    let labPeriods = dayLabs.map(lp => lp.periodIdx);
    for (let p = 0; p < periodsPerDay; p++) {
      // Check if this is a lab period
      const labHere = dayLabs.find(lp => lp.periodIdx === p);
      if (labHere) {
        // Add lab for 2 consecutive periods
        for (let k = 0; k < 2; k++) {
          generated.push({
            day: days[dIdx],
            period: p + 1 + k,
            time: periodTimes[p + k],
            lab: labRoom,
            subject: labHere.subj + ' Lab',
            duration: '1 hr',
          });
        }
        p++; // skip next period (already filled)
        continue;
      }
      // Otherwise, fill with subject or free slot
      // Exclude lab subjects for non-lab periods
      const nonLabSubjects = subjects.filter(s => !labSubjects.includes(s));
      // Randomly decide if this is a free period (20% chance)
      if (Math.random() < 0.2) {
        generated.push({
          day: days[dIdx],
          period: p + 1,
          time: periodTimes[p],
          lab: '',
          subject: 'Free',
          duration: '1 hr',
        });
      } else {
        // Pick a random non-lab subject
        const subj = nonLabSubjects[Math.floor(Math.random() * nonLabSubjects.length)];
        generated.push({
          day: days[dIdx],
          period: p + 1,
          time: periodTimes[p],
          lab: '',
          subject: subj,
          duration: '1 hr',
        });
      }
    }
  }
  return generated;
}

export default function ScheduleManager({ onClose }) {
  const [timetables, setTimetables] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editorData, setEditorData] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerData, setViewerData] = useState(null);

  useEffect(() => {
    // Always reseed timetables with new generator to clear old data
    localStorage.removeItem('timetables');
    const classes = ['S1 CSE A', 'S1 CSE B', 'S1 CSE C', 'S1 CSE D'];
    const seeded = classes.map(cls => ({ id: Date.now() + Math.random(), className: cls, timetable: generateCustomTimetableForClass(cls), createdAt: new Date().toISOString() }));
    localStorage.setItem('timetables', JSON.stringify(seeded));
    setTimetables(seeded);
  }, []);

  function persist(list) {
    localStorage.setItem('timetables', JSON.stringify(list));
    setTimetables(list);
  }

  function handleCreate() {
    const className = prompt('Enter class name (e.g. S1 CSE A)');
    if (!className) return;
    const newItem = { id: Date.now() + Math.random(), className, timetable: generateCustomTimetableForClass(className), createdAt: new Date().toISOString() };
    setEditorData(newItem);
    setShowEditor(true);
  }

  function handleEdit(item) {
    setEditorData(item);
    setShowEditor(true);
  }

  function handleDelete(id) {
    if (!confirm('Delete timetable? This cannot be undone.')) return;
    const next = timetables.filter(t => t.id !== id);
    persist(next);
  }

  function handleView(item) {
    setViewerData(item);
    setShowViewer(true);
  }

  function handleSaveEdited(arr) {
    // arr is timetable array; editorData contains id/className
    const updated = { ...editorData, timetable: arr };
    const exists = timetables.find(t => t.id === updated.id);
    let next;
    if (exists) {
      next = timetables.map(t => (t.id === updated.id ? updated : t));
    } else {
      next = [updated, ...timetables];
    }
    persist(next);
    setShowEditor(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
          <h3 className="text-lg font-bold">Timetable Manager</h3>
          <div className="flex items-center gap-3">
            <button onClick={handleCreate} className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold">
              <PlusCircle className="w-4 h-4" /> Create New
            </button>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">Close</button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {timetables.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{item.className}</div>
                  <div className="text-xs text-gray-500">Created: {new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleView(item)} className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm inline-flex items-center gap-2">
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button onClick={() => handleEdit(item)} className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm inline-flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm inline-flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEditor && (
        <ScheduleEditor
          initialSchedule={editorData.timetable}
          onClose={() => setShowEditor(false)}
          onSave={(arr) => handleSaveEdited(arr)}
        />
      )}

      {showViewer && (
        <ScheduleViewer
          timetable={viewerData.timetable}
          className={viewerData.className}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  );
}
