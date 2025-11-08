import React, { useEffect, useState } from 'react';

const defaultLabs = [
  { id: 'lab-surya', name: 'Surya', type: 'CPS' },
  { id: 'lab-chandra', name: 'Chandra', type: 'High-Compute' },
  { id: 'lab-vigyan', name: 'Vigyan', type: 'Hardware' }
];

const defaultSubjects = [
  { id: 'sub-cps', name: 'CPS', labId: 'lab-surya' },
  { id: 'sub-java', name: 'Java (High Compute)', labId: 'lab-chandra' },
  { id: 'sub-hardware', name: 'Hardware Essentials', labId: 'lab-vigyan' },
  { id: 'sub-maths', name: 'Linear Algebra', labId: null }
];

const sampleFaculty = [
  { id: 'F1', name: 'Dr. Smith', email: 'smith@example.edu', specialization: 'CPS' },
  { id: 'F2', name: 'Dr. Johnson', email: 'johnson@example.edu', specialization: 'Java' },
  { id: 'F3', name: 'Dr. Kumar', email: 'kumar@example.edu', specialization: 'Hardware' },
  { id: 'F4', name: 'Dr. Patel', email: 'patel@example.edu', specialization: 'Maths' }
];

export default function FacultyManager({ onClose }) {
  const [labs] = useState(defaultLabs);
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [faculty, setFaculty] = useState(sampleFaculty);
  const [assignments, setAssignments] = useState({}); // subjectId -> facultyId
  const [timetables, setTimetables] = useState([]);
  const [clashes, setClashes] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);

  useEffect(() => {
    // load timetables from storage
    try {
      const raw = localStorage.getItem('timetables');
      if (raw) setTimetables(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load timetables', e);
    }
  }, []);

  useEffect(() => {
    detectClashes();
  }, [assignments, timetables]);

  function onDragStart(e, fId) {
    e.dataTransfer.setData('text/plain', fId);
  }

  function onDropAssignment(e, subjectId) {
    e.preventDefault();
    const fId = e.dataTransfer.getData('text/plain');
    if (!fId) return;
    setAssignments(prev => ({ ...prev, [subjectId]: fId }));
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  function detectClashes() {
    // Detect if a faculty is assigned to multiple subjects that have scheduled classes at same day/period
    const facToSlots = {};
    // build map of faculty -> list of {classId, day, period}
    timetables.forEach(t => {
      (t.timetable || []).forEach(slot => {
        // slot has day, period, subject maybe
        const key = `${t.className}::${slot.day}::${slot.period}`;
        // find subject id by name
        const subj = subjects.find(s => s.name === slot.subject) || subjects.find(s => s.labId === slot.lab) || null;
        if (!subj) return;
        // who is assigned to this subject?
        const facId = assignments[subj.id];
        if (!facId) return;
        facToSlots[facId] = facToSlots[facId] || [];
        facToSlots[facId].push({ className: t.className, day: slot.day, period: slot.period, subject: subj.name });
      });
    });

    const found = [];
    Object.keys(facToSlots).forEach(fId => {
      const slots = facToSlots[fId];
      // check duplicates by day+period across different classes
      const seen = {};
      slots.forEach(s => {
        const key = `${s.day}::${s.period}`;
        if (seen[key]) {
          found.push({ facultyId: fId, conflict: s, other: seen[key] });
        } else seen[key] = s;
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
    setAssignments(prev => {
      const next = { ...prev };
      if (next[toUnassign] === fId) delete next[toUnassign];
      return next;
    });
  }

  function unassign(subjectId) {
    setAssignments(prev => {
      const next = { ...prev };
      delete next[subjectId];
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
      <div className="relative w-full max-w-6xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
          <h3 className="text-lg font-bold">Manage Labs & Faculty</h3>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">Close</button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Faculty Pool</h4>
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

          <div className="col-span-2">
            <h4 className="font-semibold mb-3">Labs & Subjects (drop faculty onto subject)</h4>
            <div className="space-y-4">
              {labs.map(l => (
                <div key={l.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{l.name}</div>
                      <div className="text-xs text-gray-500">Type: {l.type}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {subjects.filter(s => s.labId === l.id).map(s => {
                      const assigned = assignments[s.id];
                      const fac = faculty.find(f => f.id === assigned);
                      // mark red if there are scheduled classes for this subject
                      const hasScheduled = timetables.some(t => (t.timetable || []).some(slot => slot.subject === s.name));
                      return (
                        <div key={s.id} onDrop={(e) => onDropAssignment(e, s.id)} onDragOver={allowDrop} className={`p-3 rounded-lg border ${hasScheduled ? 'border-red-400 bg-red-50' : 'border-gray-100 bg-gray-50'} dark:bg-slate-800`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{s.name}</div>
                              <div className="text-xs text-gray-500">{s.id}</div>
                            </div>
                            <div className="text-xs text-gray-600">{hasScheduled ? <span className="text-red-600 font-bold">Scheduled</span> : <span className="text-green-600">No classes</span>}</div>
                          </div>
                          <div className="mt-2">
                            {fac ? (
                              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                <div>
                                  <div className="font-medium">{fac.name}</div>
                                  <div className="text-xs text-gray-500">{fac.specialization}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <button onClick={() => unassign(s.id)} className="text-xs px-2 py-1 bg-yellow-50 rounded">Unassign</button>
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
              ))}
            </div>
          </div>
        </div>

        {/* Clashes area */}
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
                  <div className="text-sm">Conflict at {c.conflict.day} period {c.conflict.period} — {c.conflict.subject} vs {c.other.subject} ({c.conflict.className} vs {c.other.className})</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => resolveClash(c)} className="px-3 py-1 bg-yellow-100 rounded">Resolve (unassign)</button>
                </div>
              </div>
            ))}
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
