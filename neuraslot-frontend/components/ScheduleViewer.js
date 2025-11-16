import React from 'react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periodTimes = ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM'];

export default function ScheduleViewer({ timetable = [], className = '', onClose }) {
  // transform into map by day->period
  const map = {};
  timetable.forEach(item => {
    map[`${item.day}-${item.period}`] = item;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
          <h3 className="text-lg font-bold">View Timetable — {className}</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            Close
          </button>
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
                        const cell = map[key] || {};
                        return (
                          <td key={key} className="px-3 py-2 align-top">
                            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{cell.subject || '-'}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">{cell.lab || ''}</div>
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
