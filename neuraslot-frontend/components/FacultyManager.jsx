import React, { useEffect, useState } from "react";

export default function FacultyManager({ onClose }) {
  const api = "http://localhost:8000/api/scheduling/";

  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedClass, setSelectedClass] = useState(null);
  const [errors, setErrors] = useState({});
  const [showAssignedModal, setShowAssignedModal] = useState(false);
  const [assignedDisplay, setAssignedDisplay] = useState([]);

  /* LOAD from backend */
  useEffect(() => {
    loadFaculty();
    loadSubjects();
    loadClasses();
    loadAssignments();
  }, []);

  async function loadFaculty() {
    const res = await fetch("http://localhost:8000/api/users/");
    const data = await res.json();
    setFaculty(data.filter((u) => u.is_staff));
  }

  async function loadSubjects() {
    const res = await fetch(api + "subjects/");
    setSubjects(await res.json());
  }

  async function loadClasses() {
    const res = await fetch(api + "classes/");
    const data = await res.json();
    setClasses(data);
    if (data.length) setSelectedClass(data[0].id);
  }

  async function loadAssignments() {
    const res = await fetch(api + "assign/");
    const data = await res.json();

    const formatted = {};

    data.forEach((row) => {
      if (!formatted[row.klass]) formatted[row.klass] = {};
      formatted[row.klass][row.subject] = {
        facultyId: row.faculty,
        assignId: row.id,
      };
    });

    setAssignments(formatted);
  }

  /* Drag functionality */
  function onDragStart(e, facultyId) {
    e.dataTransfer.setData("faculty", facultyId);
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  function onDropAssignment(e, subjectId, klassId) {
    e.preventDefault();
    const facultyId = parseInt(e.dataTransfer.getData("faculty"));
    if (!facultyId) return;

    const existing = assignments[klassId]?.[subjectId];

    setAssignments((prev) => ({
      ...prev,
      [klassId]: {
        ...(prev[klassId] || {}),
        [subjectId]: {
          facultyId,
          assignId: existing?.assignId || null,
        },
      },
    }));
  }

  /* DELETE from backend */
  async function removeAssignment(klassId, subjectId) {
    const entry = assignments[klassId]?.[subjectId];

    // backend delete if already stored
    if (entry?.assignId) {
      await fetch(api + `assign/${entry.assignId}/`, { method: "DELETE" });
    }

    setAssignments((prev) => {
      const copy = { ...prev };
      delete copy[klassId][subjectId];
      return copy;
    });
  }

  /* Submit to backend */
  async function submitAssignments() {
    setErrors({});
    const payload = [];

    Object.keys(assignments).forEach((klassId) => {
      const subjectMap = assignments[klassId];
      Object.keys(subjectMap).forEach((subjectId) => {
        const { facultyId } = subjectMap[subjectId];
        payload.push({
          faculty: facultyId,
          klass: Number(klassId),
          subject: Number(subjectId),
        });
      });
    });

    let newErrors = {};
    for (const row of payload) {
      const res = await fetch(api + "assign/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Error" }));
        newErrors[`${row.klass}-${row.subject}`] =
          err.detail || JSON.stringify(err);
      }
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      alert("Some assignments failed. Fix errors shown.");
    } else {
      alert("All assignments saved!");
      loadAssignments();
    }
  }

  async function openAssignedModal() {
    const res = await fetch(api + "assign/");
    const data = await res.json();

    const resTT = await fetch(api + `timetable/${selectedClass}/get_class_timetable/`);
    const timetable = await resTT.json();

    const filtered = data
      .filter(r => r.klass === selectedClass)
      .map(r => {
        const fac = faculty.find(f => f.id === r.faculty);

        const matchingPeriod = timetable.find(t => t.faculty === r.faculty);
        const subj = subjects.find(s => s.id === matchingPeriod?.subject);

        return {
          id: r.id,
          faculty: fac ? `${fac.first_name} ${fac.last_name}` : "Unknown",
          subject: subj ? subj.name : "Unassigned"
        };
      });


    setAssignedDisplay(filtered);
    setShowAssignedModal(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl bg-slate-900 p-6 rounded-xl text-white">
        <h2 className="text-xl font-bold mb-5">Faculty Manager</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Faculty List */}
          <div>
            <h3 className="font-semibold">Faculty Pool</h3>
            <div className="space-y-2 mt-3">
              {faculty.map((f) => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, f.id)}
                  className="p-3 bg-slate-800 border border-gray-700 rounded cursor-grab"
                >
                  {f.first_name} {f.last_name}
                </div>
              ))}
            </div>
          </div>

          {/* Class & Subjects */}
          <div>
            <label className="text-sm block mb-2">Select Class</label>
            <select
              value={selectedClass || ""}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              className="text-black p-2 rounded mb-4"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="space-y-2">
              {subjects.map((subject) => {
                const entry = assignments[selectedClass]?.[subject.id];
                const fac = faculty.find((f) => f.id === entry?.facultyId);

                return (
                  <div
                    key={subject.id}
                    onDrop={(e) =>
                      !entry && onDropAssignment(e, subject.id, selectedClass)
                    }
                    onDragOver={(e) => !entry && allowDrop(e)}
                    className={`p-3 rounded border ${
                      entry
                        ? "bg-green-900/40 border-green-600"
                        : "bg-slate-800 border-gray-600"
                    }`}
                  >
                    <div className="flex justify-between">
                      {subject.name}
                      {entry && <span className="text-green-300 text-xs">✓</span>}
                    </div>

                    {entry ? (
                      <div className="flex justify-between mt-2">
                        <span className="text-green-300 text-sm">
                          {fac?.first_name} {fac?.last_name}
                        </span>
                        <button
                          className="bg-red-500/30 text-red-200 px-2 py-1 rounded text-xs"
                          onClick={() =>
                            removeAssignment(selectedClass, subject.id)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Drag faculty here</span>
                    )}

                    {errors[`${selectedClass}-${subject.id}`] && (
                      <div className="text-xs text-red-400 mt-1">
                        {errors[`${selectedClass}-${subject.id}`]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={openAssignedModal}
            className="bg-blue-500 px-4 py-2 rounded mr-3"
          >
            View Assigned Teachers
          </button>

          <button
            onClick={submitAssignments}
            className="bg-violet-600 px-4 py-2 rounded"
          >
            Submit Assignments
          </button>
        </div>

        {showAssignedModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-xl text-white w-80 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">
                Assigned Teachers (Class: {selectedClass})
              </h3>

              <div className="max-h-56 overflow-y-auto space-y-2">
                {assignedDisplay.length ? (
                  assignedDisplay.map((item) => (
                    <div key={item.id} className="p-2 bg-slate-700 rounded">
                      <div>{item.faculty}</div>
                        <div className="text-xs text-gray-300">{item.subject}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-xs">No assignments.</div>
                )}
              </div>

              <button
                className="mt-4 bg-red-500 px-4 py-2 rounded"
                onClick={() => setShowAssignedModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
