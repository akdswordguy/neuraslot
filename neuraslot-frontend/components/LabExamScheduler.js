import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Clock, Users, Calendar as CalendarIcon } from 'lucide-react';

export default function LabExamScheduler({ onClose }) {
  const [timetables, setTimetables] = useState({});
  const [assignments, setAssignments] = useState({});
  const [selectedLabSubject, setSelectedLabSubject] = useState(null);
  const [selectedExamDate, setSelectedExamDate] = useState(null);
  const [examSchedule, setExamSchedule] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [rescheduleSuggestions, setRescheduleSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalizedExams, setFinalizedExams] = useState([]);

  const labSubjects = [
    { id: 'soft', name: 'Software Engineering Lab', batches: 2 },
    { id: 'net', name: 'Computer Networks Lab', batches: 2 },
    { id: 'ml', name: 'Machine Learning Lab', batches: 2 }
  ];

  const classNames = ['A', 'B', 'C', 'D'];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    try {
      const raw = localStorage.getItem('timetables');
      if (raw) {
        const ttArray = JSON.parse(raw);
        // Convert array format to keyed format for easy lookup
        const ttMap = {};
        ttArray.forEach(item => {
          ttMap[item.className] = item.timetable;
        });
        setTimetables(ttMap);
      }
      
      const asgn = localStorage.getItem('facultyAssignments');
      if (asgn) {
        setAssignments(JSON.parse(asgn));
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }, []);

  // Find all lab slots for a given subject across all classes
  const findLabSlots = (subjectId) => {
    const slots = [];
    
    // Map subject IDs to their full lab names
    const subjectMap = {
      'soft': 'Software Lab',
      'net': 'Computer Networks Lab',
      'ml': 'Machine Learning Lab'
    };
    
    const searchTerm = subjectMap[subjectId];
    if (!searchTerm) return slots;
    
    classNames.forEach(className => {
      const key = `S1 CSE ${className}`;
      const schedule = timetables[key];
      
      if (schedule && Array.isArray(schedule)) {
        schedule.forEach((slot, idx) => {
          // Check if slot is a lab and matches subject exactly
          if (slot.subject === searchTerm) {
            const dayIdx = days.indexOf(slot.day);
            slots.push({
              class: className,
              day: slot.day,
              dayIdx: dayIdx,
              period: slot.period,
              subject: slot.subject,
              lab: slot.lab
            });
          }
        });
      }
    });

    return slots;
  };

  // Detect conflicts at a given time slot across other classes
  const detectConflictsAtSlot = (day, period, period2, excludeClass = null) => {
    const conflicts = [];

    classNames.forEach(className => {
      if (excludeClass && className === excludeClass) return;

      const key = `S1 CSE ${className}`;
      const schedule = timetables[key];

      if (schedule && Array.isArray(schedule)) {
        schedule.forEach(slot => {
          // Check if this slot is on the same day and one of the lab periods
          if (slot.day === day && (slot.period === period || slot.period === period2)) {
            // Only flag if it's not a free period
            if (slot.subject && slot.subject !== 'Free') {
              conflicts.push({
                class: className,
                day: slot.day,
                period: slot.period,
                subject: slot.subject || slot.subjectId
              });
            }
          }
        });
      }
    });

    return conflicts;
  };

  // Analyze and find best slot
  const analyzeLabExamSlot = () => {
    if (!selectedLabSubject || !selectedExamDate) {
      alert('Please select both subject and date');
      return;
    }

    setIsAnalyzing(true);
    let labSlots = findLabSlots(selectedLabSubject);

    // Filter slots by selected date
    labSlots = labSlots.filter(slot => slot.day === selectedExamDate);

    if (labSlots.length === 0) {
      alert(`No lab slots found for ${selectedExamDate}`);
      setIsAnalyzing(false);
      return;
    }

    // Score each slot based on conflict count
    const scoredSlots = labSlots.map(slot => {
      // Since labs are 2 consecutive periods, find period2
      const period2 = slot.period + 1;
      const conflictList = detectConflictsAtSlot(
        slot.day,
        slot.period,
        period2,
        slot.class
      );

      return {
        ...slot,
        period2: period2,
        conflictCount: conflictList.length,
        conflicts: conflictList
      };
    });

    // Find least conflicted slot
    const bestSlot = scoredSlots.reduce((prev, curr) =>
      curr.conflictCount < prev.conflictCount ? curr : prev
    );

    setExamSchedule(bestSlot);
    setConflicts(bestSlot.conflicts);

    // Generate reschedule suggestions for Math and Environment (1-credit subjects)
    const suggestions = [];
    const scheduledSubjects = new Set();

    bestSlot.conflicts.forEach(conflict => {
      const conflictKey = `${conflict.subject}::${conflict.class}`;
      
      // Only suggest for 1-credit subjects
      if ((conflict.subject === 'Maths' || conflict.subject === 'Environment') && 
          !scheduledSubjects.has(conflictKey)) {
        
        scheduledSubjects.add(conflictKey);
        
        // Find free slots to reschedule
        const freeSlots = findFreeSlotsForClass(conflict.class);
        if (freeSlots.length > 0) {
          suggestions.push({
            subject: conflict.subject,
            class: conflict.class,
            currentDay: conflict.day,
            currentPeriod: conflict.period,
            suggestedSlot: freeSlots[0],
            reason: 'Low-impact rescheduling to accommodate lab exam'
          });
        }
      }
    });

    setRescheduleSuggestions(suggestions);
    setIsAnalyzing(false);
  };

  // Find free slots for a specific class
  const findFreeSlotsForClass = (className) => {
    const key = `S1 CSE ${className}`;
    const schedule = timetables[key];
    const freeSlots = [];

    if (schedule && Array.isArray(schedule)) {
      schedule.forEach((slot, idx) => {
        if (slot.subject === 'Free') {
          const dayIdx = days.indexOf(slot.day);
          freeSlots.push({
            class: className,
            day: slot.day,
            period: slot.period,
            dayIdx: dayIdx,
            periodIdx: idx
          });
        }
      });
    }

    return freeSlots;
  };

  // Finalize exam schedule
  const finalizeExam = () => {
    if (!examSchedule) return;

    const newExam = {
      id: `exam-${Date.now()}`,
      subject: examSchedule.subject,
      classes: classNames.join(', '),
      day: examSchedule.day,
      period: `${examSchedule.period}-${examSchedule.period2}`,
      room: 'Tejas lab',
      scheduledAt: new Date().toLocaleString(),
      status: 'Scheduled',
      rescheduledSubjects: rescheduleSuggestions.length
    };

    setFinalizedExams([...finalizedExams, newExam]);

    // Save to localStorage
    try {
      const existing = localStorage.getItem('labExamSchedules') || '[]';
      const exams = JSON.parse(existing);
      exams.push(newExam);
      localStorage.setItem('labExamSchedules', JSON.stringify(exams));
    } catch (e) {
      console.error('Failed to save exam schedule', e);
    }

    // Reset
    setExamSchedule(null);
    setConflicts([]);
    setRescheduleSuggestions([]);
    setSelectedLabSubject(null);
    setSelectedExamDate(null);

    alert(`Lab Exam scheduled for ${newExam.subject} on ${newExam.day}, Periods ${newExam.period}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Lab Exam Scheduler</h2>
            <p className="text-white/90 text-sm">Schedule lab exams for entire CSE (Classes A, B, C, D)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Select Lab Subject */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Step 1: Select Lab Subject
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {labSubjects.map(lab => (
                <button
                  key={lab.id}
                  onClick={() => {
                    setSelectedLabSubject(lab.id);
                    setExamSchedule(null);
                    setConflicts([]);
                    setRescheduleSuggestions([]);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedLabSubject === lab.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{lab.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lab.batches} batches</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Exam Date */}
          {selectedLabSubject && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Step 2: Select Exam Date
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedExamDate(day);
                      setExamSchedule(null);
                      setConflicts([]);
                      setRescheduleSuggestions([]);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                      selectedExamDate === day
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200'
                        : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-blue-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Analyze Slots */}
          {selectedLabSubject && selectedExamDate && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-500" />
                Step 3: Analyze Exam Slots
              </h3>
              <button
                onClick={analyzeLabExamSlot}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Find Best Slot'}
              </button>
            </div>
          )}

          {/* Step 4: Review Best Slot */}
          {examSchedule && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-300 dark:border-green-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Step 3: Best Exam Slot Found
              </h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subject</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{examSchedule.subject}</p>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Day</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{examSchedule.day}</p>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Periods</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{examSchedule.period}-{examSchedule.period2}</p>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conflicts</p>
                  <p className={`text-lg font-bold ${conflicts.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {conflicts.length}
                  </p>
                </div>
              </div>

              {/* Conflicts List */}
              {conflicts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-red-900 dark:text-red-300 mb-2">⚠️ Detected Conflicts:</p>
                  <ul className="space-y-2">
                    {conflicts.map((conf, idx) => (
                      <li key={idx} className="text-sm text-red-800 dark:text-red-200">
                        • Class {conf.class} - {conf.subject} on {conf.day}, Period {conf.period}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reschedule Suggestions */}
              {rescheduleSuggestions.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-300 mb-3">💡 Reschedule Suggestions (Low-impact):</p>
                  <div className="space-y-3">
                    {rescheduleSuggestions.map((sugg, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-700 p-3 rounded border-l-4 border-yellow-500">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {sugg.subject} - Class {sugg.class}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Move from {sugg.currentDay} Period {sugg.currentPeriod} to {sugg.suggestedSlot.day} Period {sugg.suggestedSlot.period}
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">{sugg.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Finalized Exams */}
          {finalizedExams.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Scheduled Lab Exams ({finalizedExams.length})
              </h3>
              <div className="space-y-3">
                {finalizedExams.map(exam => (
                  <div key={exam.id} className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{exam.subject}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {exam.day} • Periods {exam.period}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Location: {exam.room} • Classes: {exam.classes}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-semibold rounded-full">
                        {exam.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition-all"
          >
            Close
          </button>
          {examSchedule && (
            <button
              onClick={finalizeExam}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Finalize & Schedule Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
