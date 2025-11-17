// ScheduleManager.jsx — no changes needed in this file
import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2, Eye, Edit3 } from "lucide-react";
import dynamic from "next/dynamic";

const ScheduleEditor = dynamic(() => import("./ScheduleEditor"), { ssr: false });
const ScheduleViewer = dynamic(() => import("./ScheduleViewer"), { ssr: false });

export default function ScheduleManager({ onClose }) {
  const api = "http://localhost:8000/api/scheduling/";

  const [classes, setClasses] = useState([]);
  const [timetables, setTimetables] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [subjectMap, setSubjectMap] = useState({});

  const [showEditor, setShowEditor] = useState(false);
  const [editorData, setEditorData] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerData, setViewerData] = useState(null);

  useEffect(() => {
    async function loadSubjects() {
      const res = await fetch(api + "subjects/");
      const data = await res.json();
      setSubjects(data);
      const map = {};
      data.forEach(s => (map[s.id] = s.name));
      setSubjectMap(map);
    }
    loadSubjects();
  }, []);

  function convertRow(row) {
    return {
      id: row.id,
      day: row.day_of_week,
      period: row.period_number,
      klass: row.klass,
      subjectId: row.subject,
      subjectName: subjectMap[row.subject] || "FREE",
      is_lab: row.is_lab
    };
  }

  useEffect(() => {
    if (subjects.length === 0) return;
    loadClasses();
    loadTimetables();
  }, [subjects]);

  async function loadClasses() {
    const res = await fetch(api + "classes/");
    const data = await res.json();
    setClasses(data);
  }

  async function createClass() {
    const name = prompt("Enter class name");
    if (!name) return;
    const res = await fetch(api + "classes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(Object.values(data)[0][0]);
      return;
    }
    setClasses([data, ...classes]);
  }

  async function deleteClass(id) {
    if (!confirm("Delete this class?")) return;
    await fetch(api + `classes/${id}/`, { method: "DELETE" });
    const updated = { ...timetables };
    delete updated[id];
    setClasses(classes.filter(c => c.id !== id));
    setTimetables(updated);
  }

  async function loadTimetables() {
    const res = await fetch(api + "timetable/");
    const data = await res.json();
    const grouped = {};
    data.forEach(row => {
      const classId = row.klass;
      if (!grouped[classId]) grouped[classId] = [];
      grouped[classId].push(convertRow(row));
    });
    setTimetables(grouped);
  }

  async function saveEditedTimetable(updatedRows) {
    const FREE_SUBJECT_ID =
      subjects.find(s => s.name.toLowerCase() === "free")?.id || null;

    const classId = editorData.classId;

    const payload = updatedRows.map(r => ({
      klass: classId,
      day_of_week: r.day,
      period_number: r.period,
      subject:
        r.subjectId !== null && r.subjectId !== ""
          ? r.subjectId
          : FREE_SUBJECT_ID,
      is_lab: r.is_lab
    }));

    console.log("Payload:", payload);

    const res = await fetch(api + "timetable/bulk/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Backend rejected payload:", error);
      alert("❌ Timetable update failed! Check console.");
      return;
    }

    const saved = await res.json();
    setTimetables(prev => ({
      ...prev,
      [classId]: saved.map(convertRow)
    }));

    setShowEditor(false);
  }






  function openView(id) {
    if (!timetables[id]) return;
    setViewerData({ classId: id, timetable: timetables[id] });
    setShowViewer(true);
  }

  function openEditor(id) {
    setEditorData({ classId: id, timetable: timetables[id] || [] });
    setShowEditor(true);
  }

  /* ---------------------------
            UI
  --------------------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
          <h3 className="text-lg font-bold">Timetable Manager</h3>

          <button
            onClick={createClass}
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold"
          >
            <PlusCircle className="w-4 h-4" /> Create Class
          </button>
        </div>

        <div className="p-6 space-y-3">
          {classes.map(cls => (
            <div
              key={cls.id}
              className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {cls.name}
                </div>
                <div className="text-xs text-gray-500">{cls.description}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openView(cls.id)}
                  className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm inline-flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openEditor(cls.id)}
                  className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm inline-flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteClass(cls.id)}
                  className="px-3 py-2 bg-red-600/20 rounded-lg hover:bg-red-600/30 text-sm inline-flex items-center gap-2 text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditor && editorData && (
        <ScheduleEditor
          classId={editorData.classId}
          initialSchedule={editorData.timetable}
          subjects={subjects}              // <-- the missing piece
          onSave={saveEditedTimetable}
          onClose={() => setShowEditor(false)}
        />
      )}


      {showViewer && viewerData && (
        <ScheduleViewer
          timetable={viewerData.timetable}
          classId={viewerData.classId}
          onClose={() => setShowViewer(false)}
        />
      )}

    </div>
  );
}
