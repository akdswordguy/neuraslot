import React, { useEffect, useState } from 'react';

// Subjects for timetable
const defaultSubjects = [
  { id: 'software', name: 'Software' },
  { id: 'deep-learning', name: 'Deep Learning' },
  { id: 'machine-learning', name: 'Machine Learning' },
  { id: 'maths', name: 'Maths' },
  { id: 'environment', name: 'Environment' },
  { id: 'computer-networks', name: 'Computer Networks' }
];

// 11 teachers, 2 per subject except Environment (1 teacher for all)
const sampleFaculty = [
  { id: 'F1', name: 'Aditya', email: 'aditya@example.edu', specialization: 'Maths' },
  { id: 'F2', name: 'Priya', email: 'priya@example.edu', specialization: 'Maths' },
  { id: 'F3', name: 'Rahul', email: 'rahul@example.edu', specialization: 'Software' },
  { id: 'F4', name: 'Sneha', email: 'sneha@example.edu', specialization: 'Software' },
  { id: 'F5', name: 'Vikram', email: 'vikram@example.edu', specialization: 'Deep Learning' },
  { id: 'F6', name: 'Meera', email: 'meera@example.edu', specialization: 'Deep Learning' },
  { id: 'F7', name: 'Arjun', email: 'arjun@example.edu', specialization: 'Machine Learning' },
  { id: 'F8', name: 'Divya', email: 'divya@example.edu', specialization: 'Machine Learning' },
  { id: 'F9', name: 'Kiran', email: 'kiran@example.edu', specialization: 'Computer Networks' },
  { id: 'F10', name: 'Ritu', email: 'ritu@example.edu', specialization: 'Computer Networks' },
  { id: 'F11', name: 'Dr. Green', email: 'green@example.edu', specialization: 'Environment' }, // common for all
];

export default function FacultyManager({ onClose }) {
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [faculty, setFaculty] = useState(sampleFaculty);
  const [assignments, setAssignments] = useState({}); // keys: subjectId::className -> facultyId
  const [timetables, setTimetables] = useState([]);
  const [clashes, setClashes] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    // load timetables from storage
    try {
      const raw = localStorage.getItem('timetables');
      if (raw) setTimetables(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load timetables', e);
    }
    // set default selected class if available
    try {
      const raw = localStorage.getItem('timetables');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.length) setSelectedClass(parsed[0].className);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    detectClashes();
  }, [assignments, timetables]);

  function onDragStart(e, fId) {
    e.dataTransfer.setData('text/plain', fId);
  }

  // subjectId and className target for per-class assignments
  function onDropAssignment(e, subjectId, className) {
    e.preventDefault();
    const fId = e.dataTransfer.getData('text/plain');
    if (!fId) return;
    const key = `${subjectId}::${className}`;
    setAssignments(prev => ({ ...prev, [key]: fId }));
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  function detectClashes() {
    const found = [];

    // Check 1: Multi-subject conflict (teacher assigned to multiple subjects at same day/period)
    const facToSlots = {};
    timetables.forEach(t => {
      (t.timetable || []).forEach(slot => {
        const subj = subjects.find(s => s.name === slot.subject) || null;
        if (!subj) return;
        const facKey = `${subj.id}::${t.className}`;
        const facId = assignments[facKey];
        if (!facId) return;
        facToSlots[facId] = facToSlots[facId] || [];
        facToSlots[facId].push({ className: t.className, day: slot.day, period: slot.period, subject: subj.name });
      });
    });

    Object.keys(facToSlots).forEach(fId => {
      const slots = facToSlots[fId];
      const seen = {};
      slots.forEach(s => {
        const key = `${s.day}::${s.period}`;
        if (seen[key]) {
          found.push({ 
            type: 'multi-subject', 
            facultyId: fId, 
            conflict: s, 
            other: seen[key],
            message: `${s.subject} vs ${seen[key].subject} at same time`
          });
        } else seen[key] = s;
      });
    });

    // Check 2: 2-class rule violation (teacher assigned to more than 2 classes for a subject)
    subjects.forEach(s => {
      const classesForSubj = new Set();
      const assignmentsByClass = {};
      
      Object.keys(assignments).forEach(key => {
        // key format: subjectId::className
        const [subjId, className] = key.split('::');
        if (subjId === s.id) {
          const facId = assignments[key];
          if (facId) {
            classesForSubj.add(facId);
            assignmentsByClass[facId] = assignmentsByClass[facId] || [];
            assignmentsByClass[facId].push(className);
          }
        }
      });

      // Check if any teacher (except Environment) is assigned to >2 classes for this subject
      Object.keys(assignmentsByClass).forEach(fId => {
        const classes = assignmentsByClass[fId];
        // Environment teacher can teach all 4 classes; others max 2
        const fac = faculty.find(f => f.id === fId);
        const isEnv = fac && fac.specialization === 'Environment';
        if (!isEnv && classes.length > 2) {
          found.push({
            type: '2-class-violation',
            facultyId: fId,
            subject: s.name,
            classes: classes,
            message: `${fac.name} assigned to ${classes.length} classes for ${s.name} (max 2 allowed)`
          });
        }
      });
    });

    setClashes(found);
  }

  function resolveClash(clash) {
    // simple resolution: unassign faculty from the 'other' subject (user-facing decision could be added)
    // Find subject ids assigned to this faculty where conflict occurs and unassign one
    const fId = clash.facultyId;
    // find subject id for clash.other.subject
    const subj1 = subjects.find(s => s.name === clash.conflict.subject);
    const subj2 = subjects.find(s => s.name === clash.other.subject);
    // prefer to unassign subj2 if exists
    const toUnassign = subj2 ? subj2.id : (subj1 ? subj1.id : null);
    if (!toUnassign) return;
    // clash.other.className used to identify class
    const key = `${toUnassign}::${clash.other.className}`;
    setAssignments(prev => {
      const next = { ...prev };
      if (next[key] === fId) delete next[key];
      return next;
    });
  }

  function unassign(subjectId) {
    // subjectId may be unassigned for currently selectedClass (see UI)
    // If className provided in args, only unassign for that class; otherwise remove all
    const args = Array.from(arguments);
    const className = args.length > 1 ? args[1] : null;
    setAssignments(prev => {
      const next = { ...prev };
      if (className) {
        const key = `${subjectId}::${className}`;
        delete next[key];
      } else {
        Object.keys(next).forEach(k => {
          if (k === subjectId || k.startsWith(subjectId + '::')) delete next[k];
        });
      }
      return next;
    });
  }

  function openSendModal(fac) {
    setSendingTo(fac);
    setShowSendModal(true);
  }

  function sendInfoMock(message) {
    // mock send
    console.log('Sending to', sendingTo, message);
    setShowSendModal(false);
    alert(`Email mock sent to ${sendingTo.email}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-screen">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white flex-shrink-0">
          <h3 className="text-lg font-bold text-white">Manage Faculty</h3>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">Close</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">

        <div className="p-6 grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-white">Faculty Pool</h4>
            <div className="space-y-3">
              {faculty.map(f => (
                <div key={f.id} draggable onDragStart={(e) => onDragStart(e, f.id)} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800 cursor-grab">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.specialization} • {f.id}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button onClick={() => openSendModal(f)} className="text-xs px-2 py-1 bg-cyan-50 text-cyan-700 rounded">Send Info</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <div className="text-sm font-semibold text-black mb-3">Select Class</div>
              <div className="grid grid-cols-2 gap-2">
                {['S1 CSE A', 'S1 CSE B', 'S1 CSE C', 'S1 CSE D'].map(cls => (
                  <button 
                    key={cls} 
                    onClick={() => setSelectedClass(cls)} 
                    className={`py-2 px-3 rounded font-semibold transition-all ${selectedClass === cls ? 'bg-violet-600 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
            <h4 className="font-semibold mb-3 text-white">Subjects for {selectedClass}</h4>
            <div className="space-y-4">
              {subjects.map(s => {
                const assignedKey = `${s.id}::${selectedClass}`;
                const assigned = assignments[assignedKey];
                const fac = faculty.find(f => f.id === assigned);
                // mark red if there are scheduled classes for this subject
                const hasScheduled = timetables.some(t => (t.timetable || []).some(slot => slot.subject === s.name));
                return (
                  <div key={s.id} onDrop={(e) => onDropAssignment(e, s.id, selectedClass)} onDragOver={allowDrop} className={`p-3 rounded-lg border ${hasScheduled ? 'border-red-400 bg-red-50' : 'border-gray-100 bg-gray-50'} dark:bg-slate-800`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-black">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.id}</div>
                      </div>
                      <div className="text-xs text-gray-600">{hasScheduled ? <span className="text-red-600 font-bold">Scheduled</span> : <span className="text-green-600">No classes</span>}</div>
                    </div>
                    <div className="mt-2">
                      {fac ? (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                          <div>
                            <div className="font-medium text-black">{fac.name}</div>
                            <div className="text-xs text-gray-500">{fac.specialization}</div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => unassign(s.id, selectedClass)} className="text-xs px-2 py-1 bg-yellow-50 rounded">Unassign</button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Drop faculty here</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Detected Clashes</h4>
            <div className="text-sm text-gray-500">{clashes.length} found</div>
          </div>
          <div className="space-y-2">
            {clashes.length === 0 && <div className="text-sm text-gray-500">No clashes detected.</div>}
            {clashes.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                <div>
                  <div className="font-semibold">Faculty: {c.facultyId}</div>
                  {c.type === 'multi-subject' && (
                    <div className="text-sm">Conflict at {c.conflict.day} period {c.conflict.period} — {c.message} ({c.conflict.className} vs {c.other.className})</div>
                  )}
                  {c.type === '2-class-violation' && (
                    <div className="text-sm">{c.message} ({c.classes.join(', ')})</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => resolveClash(c)} className="px-3 py-1 bg-yellow-100 rounded">Resolve (unassign)</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

      </div>

      {/* Send modal */}
      {showSendModal && sendingTo && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSendModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
            <h4 className="font-bold mb-3 text-black">Send Info to {sendingTo.name}</h4>
            <p className="text-sm text-black mb-3">This is a mock send — no actual email will be sent.</p>
            <textarea defaultValue={`Dear ${sendingTo.name},\nYou have been assigned to subjects. Please check your schedule.`} className="w-full h-28 p-2 border rounded mb-3 text-black" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSendModal(false)} className="px-3 py-1 rounded text-black">Cancel</button>
              <button onClick={() => sendInfoMock()} className="px-3 py-1 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
