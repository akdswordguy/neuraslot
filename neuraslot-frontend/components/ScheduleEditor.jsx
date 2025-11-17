import React, { useState } from 'react';
import { X, Save, Edit3, Trash2 } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periodTimes = [
  '08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM',
  '12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM'
];

export default function ScheduleEditor({
  initialSchedule = [],
  subjects = [],
  classId,
  onSave,
  onClose
}) {

  const init = {};
  initialSchedule.forEach(item => {
    const dayName = days[item.day - 1];
    const key = `${dayName}-${item.period}`;
    init[key] = item;
  });

  const [cells, setCells] = useState(() => {
    const out = {};
    days.forEach((day, dIdx) => {
      for (let p = 1; p <= 8; p++) {
        const key = `${day}-${p}`;
        out[key] = init[key] || {
          id: null,
          day: dIdx + 1,
          period: p,
          subjectId: null,
          is_lab: false,
          klass: classId
        };
      }
    });
    return out;
  });

  function updateCell(dayIndex, period, field, value) {
    const key = `${days[dayIndex - 1]}-${period}`;
    setCells(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  }

  function freeSlot(dayIndex, period) {
    const key = `${days[dayIndex - 1]}-${period}`;
    setCells(prev => ({
      ...prev,
      [key]: { ...prev[key], subjectId: null, is_lab: false }
    }));
  }

  function handleSave() {
    const arr = Object.values(cells).map(c => ({
      ...c,
      subjectId: c.subjectId || null
    }));
    arr.sort((a, b) => (a.day === b.day ? a.period - b.period : a.day - b.day));
    onSave(arr);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border overflow-hidden">
        
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white">
          <div className="flex items-center gap-3">
            <Edit3 className="w-5 h-5" />
            <h3 className="text-lg font-bold">Edit Timetable</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold"
            >
              <Save className="w-4 h-4" /> Save All
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Period</th>
                {days.map(day => (
                  <th key={day} className="px-3 py-2 text-left font-semibold">{day}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 8 }).map((_, idx) => {
                const p = idx + 1;

                return (
                  <tr key={p} className="align-top">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-sm">Period {p}</div>
                      <div className="text-xs text-gray-500">{periodTimes[idx]}</div>
                    </td>

                    {days.map((day, dIdx) => {
                      const key = `${day}-${p}`;
                      const cell = cells[key];

                      return (
                        <td key={key} className="px-3 py-2">
                          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-2 border space-y-2">
                            
                            <select
                              value={cell.subjectId || ''}
                              onChange={e => updateCell(dIdx + 1, p, 'subjectId',
                                e.target.value === '' ? null : Number(e.target.value)
                              )}
                              className="w-full text-sm bg-transparent outline-none"
                            >
                              <option value="">FREE</option>
                              {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>

                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={cell.is_lab}
                                onChange={e =>
                                  updateCell(dIdx + 1, p, 'is_lab', e.target.checked)
                                }
                              />
                              Lab
                            </label>

                            <button
                              onClick={() => freeSlot(dIdx + 1, p)}
                              className="text-[10px] text-red-600 underline hover:text-red-800"
                            >
                              Free Slot
                            </button>

                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
