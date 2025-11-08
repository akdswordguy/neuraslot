import React, { useState } from 'react';
import { X, Save, Edit3 } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periodTimes = ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM'];

export default function ScheduleEditor({ initialSchedule = [], onSave, onClose }) {
  // transform initialSchedule (array) into a map by day->period for easy editing
  const mapInit = {};
  initialSchedule.forEach(item => {
    mapInit[`${item.day}-${item.period}`] = { ...item };
  });

  const [cells, setCells] = useState(() => {
    const out = {};
    days.forEach((day, dIdx) => {
      for (let p = 1; p <= 8; p++) {
        const key = `${day}-${p}`;
        out[key] = mapInit[key] || { day, period: p, time: periodTimes[p - 1], subject: '', lab: '', faculty: '' };
      }
    });
    return out;
  });

  function updateCell(day, period, field, value) {
    const key = `${day}-${period}`;
    setCells(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  function handleSave() {
    const arr = [];
    Object.keys(cells).forEach(k => arr.push(cells[k]));
    // maintain stable order: days then period
    arr.sort((a, b) => {
      const da = days.indexOf(a.day);
      const db = days.indexOf(b.day);
      if (da !== db) return da - db;
      return a.period - b.period;
    });
    onSave && onSave(arr);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
          <div className="flex items-center gap-3">
            <Edit3 className="w-6 h-6" />
            <h3 className="text-lg font-bold">Schedule Creator — Edit Timetable</h3>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-auto">
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
                      <td className="px-3 py-2 align-top">
                        <div className="text-sm font-semibold">Period {p}</div>
                        <div className="text-xs text-gray-500">{periodTimes[idx]}</div>
                      </td>
                      {days.map(day => {
                        const key = `${day}-${p}`;
                        const cell = cells[key];
                        return (
                          <td key={key} className="px-3 py-2 align-top">
                            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
                              <input
                                value={cell.subject}
                                onChange={e => updateCell(day, p, 'subject', e.target.value)}
                                placeholder="Subject"
                                className="w-full text-sm bg-transparent outline-none placeholder-gray-400 text-gray-900 dark:text-white font-medium"
                              />
                              <input
                                value={cell.lab}
                                onChange={e => updateCell(day, p, 'lab', e.target.value)}
                                placeholder="Lab"
                                className="w-full mt-1 text-xs bg-transparent outline-none placeholder-gray-400 text-gray-600 dark:text-gray-300"
                              />
                              <input
                                value={cell.faculty}
                                onChange={e => updateCell(day, p, 'faculty', e.target.value)}
                                placeholder="Faculty"
                                className="w-full mt-1 text-xs bg-transparent outline-none placeholder-gray-400 text-gray-600 dark:text-gray-300"
                              />
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
    </div>
  );
}
