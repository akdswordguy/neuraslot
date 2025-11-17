import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Users, BookOpen, Zap } from 'lucide-react';

const subjects = [
  { id: 'soft', name: 'Software Engineering', hasLab: true, teachers: ['T1', 'T2'], batches: 2 },
  { id: 'net', name: 'Computer Networks', hasLab: true, teachers: ['T3', 'T4'], batches: 2 },
  { id: 'ml', name: 'Machine Learning', hasLab: true, teachers: ['T5', 'T6'], batches: 2 },
  { id: 'dl', name: 'Deep Learning', hasLab: false, teachers: ['T7', 'T8'], batches: 2 },
  { id: 'maths', name: 'Mathematics', hasLab: false, teachers: ['T9', 'T10'], batches: 2 },
  { id: 'env', name: 'Environment Science', hasLab: false, teachers: ['T11'], batches: 2 }
];

const teachers = [
  { id: 'T1', name: 'Dr. Sharma', subject: 'Software Engineering' },
  { id: 'T2', name: 'Dr. Verma', subject: 'Software Engineering' },
  { id: 'T3', name: 'Dr. Gupta', subject: 'Computer Networks' },
  { id: 'T4', name: 'Dr. Singh', subject: 'Computer Networks' },
  { id: 'T5', name: 'Dr. Kumar', subject: 'Machine Learning' },
  { id: 'T6', name: 'Dr. Patel', subject: 'Machine Learning' },
  { id: 'T7', name: 'Dr. Rao', subject: 'Deep Learning' },
  { id: 'T8', name: 'Dr. Nair', subject: 'Deep Learning' },
  { id: 'T9', name: 'Dr. Iyer', subject: 'Mathematics' },
  { id: 'T10', name: 'Dr. Reddy', subject: 'Mathematics' },
  { id: 'T11', name: 'Dr. Joshi', subject: 'Environment Science' }
];

const labs = [
  { id: 'lab-soft', name: 'Software Lab', subject: 'Software Engineering', capacity: 40 },
  { id: 'lab-net', name: 'Networks Lab', subject: 'Computer Networks', capacity: 35 },
  { id: 'lab-ml', name: 'ML Lab', subject: 'Machine Learning', capacity: 30 }
];

export default function ConflictManager({ onClose }) {
  const [conflicts, setConflicts] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('timetables');
      if (raw) setTimetables(JSON.parse(raw));
      
      const ta = localStorage.getItem('teacherAssignments');
      if (ta) setTeacherAssignments(JSON.parse(ta));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }, []);

  useEffect(() => {
    detectConflicts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timetables, teacherAssignments]);

  function detectConflicts() {
    const found = [];

    // Check 1: Teacher assigned to multiple subjects
    const teacherSubjects = {};
    Object.entries(teacherAssignments).forEach(([subj, teacher]) => {
      if (!teacherSubjects[teacher]) teacherSubjects[teacher] = [];
      teacherSubjects[teacher].push(subj);
    });

    Object.entries(teacherSubjects).forEach(([teacherId, subjectIds]) => {
      if (subjectIds.length > 1) {
        found.push({
          id: `conflict_multi_${teacherId}`,
          type: 'Multi-Subject Assignment',
          severity: 'high',
          description: `${teacherId} assigned to ${subjectIds.join(', ')}. Each teacher should teach only one subject.`,
          resolution: 'Reassign teacher to single subject'
        });
      }
    });

    // Check 2: Lab scheduling conflicts (same batch, same day/time for different labs)
    const labsByBatchDay = {};
    timetables.forEach(t => {
      (t.timetable || []).forEach(slot => {
        if (slot.subject && subjects.find(s => s.name === slot.subject)?.hasLab) {
          const key = `${t.className}-${slot.day}`;
          if (!labsByBatchDay[key]) labsByBatchDay[key] = [];
          labsByBatchDay[key].push(slot);
        }
      });
    });

    Object.entries(labsByBatchDay).forEach(([key, slots]) => {
      if (slots.length > 1) {
        found.push({
          id: `conflict_lab_${key}`,
          type: 'Lab Overlap',
          severity: 'high',
          description: `Multiple labs scheduled for ${key}: ${slots.map(s => s.subject).join(', ')}`,
          resolution: 'Ensure only one lab per subject per batch per week'
        });
      }
    });

    // Check 3: Consecutive period requirement for labs
    timetables.forEach(t => {
      const labSlots = (t.timetable || []).filter(slot => slot.subject && subjects.find(s => s.name === slot.subject)?.hasLab);
      const bySubject = {};
      labSlots.forEach(slot => {
        if (!bySubject[slot.subject]) bySubject[slot.subject] = [];
        bySubject[slot.subject].push(slot.period);
      });

      Object.entries(bySubject).forEach(([subj, periods]) => {
        const sorted = periods.sort((a, b) => a - b);
        let hasConsecutive = false;
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i + 1] - sorted[i] === 1) {
            hasConsecutive = true;
            break;
          }
        }
        if (!hasConsecutive && periods.length > 0) {
          found.push({
            id: `conflict_consecutive_${t.id}_${subj}`,
            type: 'Lab Period Arrangement',
            severity: 'medium',
            description: `${t.className} - ${subj}: Lab periods not consecutive. Periods: ${periods.join(', ')}`,
            resolution: 'Arrange 2 consecutive periods for lab sessions'
          });
        }
      });
    });

    setConflicts(found);
  }

  function resolveConflict(conflictId) {
    // Mark as resolved (in real scenario, user would make corrections)
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-600 to-orange-500 text-white">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-bold">Conflict Manager</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">Close</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-black">High Priority</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{conflicts.filter(c => c.severity === 'high').length}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-black">Medium Priority</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{conflicts.filter(c => c.severity === 'medium').length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-black">Resolved</span>
              </div>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
          </div>

          {/* Conflict List */}
          <div>
            <h4 className="font-semibold mb-4 text-black">Detected Conflicts</h4>
            {conflicts.length === 0 ? (
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-black font-semibold">No conflicts detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conflicts.map(conflict => (
                  <div key={conflict.id} className={`p-4 rounded-xl border-l-4 ${
                    conflict.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-black">{conflict.type}</span>
                          <span className={`text-xs px-2 py-1 rounded font-bold ${
                            conflict.severity === 'high' 
                              ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300' 
                              : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
                          }`}>
                            {conflict.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-black mb-2">{conflict.description}</p>
                        <p className="text-xs text-gray-600 font-semibold">💡 {conflict.resolution}</p>
                      </div>
                      <button 
                        onClick={() => resolveConflict(conflict.id)}
                        className="ml-4 px-3 py-1 bg-orange-100 text-orange-700 rounded font-semibold text-sm hover:bg-orange-200 transition-all"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h5 className="font-semibold text-black mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Scheduling Rules
            </h5>
            <ul className="text-sm text-black space-y-1">
              <li>• Each teacher teaches only ONE subject</li>
              <li>• Lab subjects (Software, Networks, ML) require 2 consecutive periods</li>
              <li>• Only 1 lab per subject per batch per week</li>
              <li>• Free periods are allowed for breaks</li>
              <li>• Environment Science teacher (Dr. Joshi) is common for all batches</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}