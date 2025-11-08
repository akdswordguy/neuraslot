import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Eye, Edit3 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ScheduleEditor = dynamic(() => import('./ScheduleEditor'), { ssr: false });
const ScheduleViewer = dynamic(() => import('./ScheduleViewer'), { ssr: false });

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periodTimes = ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM'];

function generateDefaultForClass(className) {
  const subjects = ['Data Structures Lab', 'Web Development Lab', 'AI & ML Lab', 'Database Lab', 'Computer Networks Lab', 'Operating Systems Lab'];
  const labs = ['Lab-A', 'Lab-B', 'Lab-C', 'Lab-D', 'Lab-E', 'Lab-F'];
  const faculties = ['Dr. Smith', 'Dr. Johnson', 'Dr. Kumar', 'Dr. Patel', 'Dr. Wilson', 'Dr. Rao'];

  const generated = [];
  days.forEach((day, dIdx) => {
    for (let p = 0; p < 8; p++) {
      const subj = subjects[(dIdx * 8 + p) % subjects.length];
      const lab = labs[(dIdx * 8 + p) % labs.length];
      const faculty = faculties[(dIdx * 8 + p) % faculties.length];
      generated.push({
        day,
        period: p + 1,
        time: periodTimes[p],
        lab,
        subject: subj,
        faculty,
        duration: '1 hr'
      });
    }
  });
  return generated;
}

export default function ScheduleManager({ onClose }) {
  const [timetables, setTimetables] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editorData, setEditorData] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerData, setViewerData] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('timetables');
    if (raw) {
      try {
        setTimetables(JSON.parse(raw));
        return;
      } catch (e) {
        console.error('Invalid timetables in storage', e);
      }
    }
    // seed default classes S1 CSE A-D
    const classes = ['S1 CSE A', 'S1 CSE B', 'S1 CSE C', 'S1 CSE D'];
    const seeded = classes.map(cls => ({ id: Date.now() + Math.random(), className: cls, timetable: generateDefaultForClass(cls), createdAt: new Date().toISOString() }));
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
    const newItem = { id: Date.now() + Math.random(), className, timetable: generateDefaultForClass(className), createdAt: new Date().toISOString() };
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
