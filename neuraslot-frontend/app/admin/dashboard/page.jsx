"use client";
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  BookOpen,
  Home,
  AlertCircle,
  BarChart3,
  Download,
  Flame,
  RefreshCw
} from 'lucide-react';
import dynamic from 'next/dynamic';
import AnimatedList from '../../AnimatedList_admin';

const ExamSlotCreator = dynamic(() => import('../../../components/ExamSlotCreator'), { ssr: false });
const ScheduleEditor = dynamic(() => import('../../../components/ScheduleEditor'), { ssr: false });
const ScheduleManager = dynamic(() => import('../../../components/ScheduleManager'), { ssr: false });
const FacultyManager = dynamic(() => import('../../../components/FacultyManager'), { ssr: false });
const LabExamScheduler = dynamic(() => import('../../../components/LabExamScheduler'), { ssr: false });

const AdminDashboard = () => {
  const [harmonyScore, setHarmonyScore] = useState(85); // still unused, but fine
  const [showEditor, setShowEditor] = useState(false);
  const [editorSchedule, setEditorSchedule] = useState(null);
  const [showManager, setShowManager] = useState(false);
  const [showFacultyManager, setShowFacultyManager] = useState(false);
  const [showExamCreator, setShowExamCreator] = useState(false);
  const [showLabExamScheduler, setShowLabExamScheduler] = useState(false);

  // stats state (dynamic, filled from backend)
  const [stats, setStats] = useState([
    {
      key: 'totalLabs',
      label: 'Total Labs',
      value: 0,
      icon: Home,
      color: 'from-pink-400 to-rose-400',
      change: ''
    },
    {
      key: 'activeFaculty',
      label: 'Active Faculty',
      value: 0,
      icon: Users,
      color: 'from-blue-300 to-purple-300',
      change: ''
    },
    {
      key: 'studentClasses',
      label: 'Student Classes',
      value: 0,
      icon: BookOpen,
      color: 'from-purple-300 to-pink-300',
      change: ''
    },
    {
      key: 'freeSlots',
      label: 'Free Slots',
      value: 0,
      icon: Calendar,
      color: 'from-rose-300 to-orange-300',
      change: ''
    }
  ]);

  // DYNAMIC CONFLICTS (from API)
  const [dynamicConflicts, setDynamicConflicts] = useState([]);
  const [conflictError, setConflictError] = useState(null);
  const [loadingConflicts, setLoadingConflicts] = useState(false);

  // Recent activity
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityError, setActivityError] = useState(null);

  // ---------- FETCH STATS FROM BACKEND ----------
  useEffect(() => {
    async function fetchStats() {
      try {
        const [ttRes, usersRes, classesRes] = await Promise.all([
          fetch('http://localhost:8000/api/scheduling/timetable/'),
          fetch('http://localhost:8000/api/users/'),
          fetch('http://localhost:8000/api/scheduling/classes/')
        ]);

        if (!ttRes.ok || !usersRes.ok || !classesRes.ok) {
          console.error('Stats fetch failed', {
            timetableStatus: ttRes.status,
            usersStatus: usersRes.status,
            classesStatus: classesRes.status
          });
          return;
        }

        const [timetable, users, classes] = await Promise.all([
          ttRes.json(),
          usersRes.json(),
          classesRes.json()
        ]);

        const totalLabs = timetable.filter((t) => t.is_lab === true).length;
        const freeSlots = timetable.filter((t) => t.subject == null).length;
        const activeFaculty = users.filter((u) => u.is_staff).length;
        const studentClasses = classes.length;

        setStats((prev) =>
          prev.map((s) => {
            switch (s.key) {
              case 'totalLabs':
                return { ...s, value: totalLabs };
              case 'activeFaculty':
                return { ...s, value: activeFaculty };
              case 'studentClasses':
                return { ...s, value: studentClasses };
              case 'freeSlots':
                return { ...s, value: freeSlots };
              default:
                return s;
            }
          })
        );
      } catch (err) {
        console.error('Error loading stats', err);
      }
    }

    fetchStats();
  }, []);


    // ---------- FETCH CONFLICTS FROM API (NEW) ----------
    const fetchConflicts = async () => {
      setLoadingConflicts(true);
      setConflictError(null);
      try {
        // Try to fetch from API first
        const res = await fetch('http://localhost:8000/api/scheduling/conflicts/');
        
        if (res.ok) {
          const data = await res.json();
          setDynamicConflicts(data);
        } else {
          // API endpoint doesn't exist yet, use fallback
          console.warn('Conflicts API not available, using fallback detection');
          generateConflictsFromTimetables();
        }
      } catch (err) {
        console.error('Conflict fetch error:', err);
        // Fallback: Generate conflicts by analyzing timetables
        generateConflictsFromTimetables();
      } finally {
        setLoadingConflicts(false);
      }
    };

    // Generate conflicts by analyzing timetables (fallback)
    const generateConflictsFromTimetables = async () => {
      try {
        const ttRes = await fetch('http://localhost:8000/api/scheduling/timetable/');
        if (!ttRes.ok) throw new Error('Failed to fetch timetables');

        const timetables = await ttRes.json();
        const generatedConflicts = [];

        // Check for non-consecutive lab periods
        timetables.forEach((tt) => {
          const labSlots = tt.timetable?.filter(slot => slot.is_lab) || [];
          const byDay = {};

          labSlots.forEach(slot => {
            if (!byDay[slot.day]) byDay[slot.day] = [];
            byDay[slot.day].push(slot.period);
          });

          Object.entries(byDay).forEach(([day, periods]) => {
            if (periods.length > 1) {
              const sorted = periods.sort((a, b) => a - b);
              let isConsecutive = false;
              for (let i = 0; i < sorted.length - 1; i++) {
                if (sorted[i + 1] - sorted[i] === 1) {
                  isConsecutive = true;
                  break;
                }
              }
              if (!isConsecutive) {
                generatedConflicts.push({
                  id: `lab_consecutive_${tt.className}_${day}`,
                  type: 'Non-Consecutive Lab Periods',
                  desc: `${tt.className} has lab periods on ${day} that are not consecutive: ${periods.join(', ')}`,
                  severity: 'medium',
                  source: 'timetable_analysis'
                });
              }
            }
          });
        });

        setDynamicConflicts(generatedConflicts);
      } catch (err) {
        console.error('Fallback conflict generation failed:', err);
        setConflictError('Failed to load conflicts');
      }
    };

    // Fetch conflicts on mount
    useEffect(() => {
      fetchConflicts();
    }, []);

  // ---------- FETCH RECENT ACTIVITY ----------
  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch('http://localhost:8000/api/scheduling/activity/');
        if (!res.ok) {
          throw new Error('Failed to load activity log');
        }

        const data = await res.json();
        setRecentActivity(data);
      } catch (err) {
        console.error('Activity fetch failed', err);
        setActivityError(err.message || 'Failed to load activity');
      }
    }

    fetchActivity();
  }, []);

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200 bg-gradient-to-br from-gray-100 via-pink-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-slate-950"
      style={{ overflowY: 'auto', maxHeight: '100vh' }}
    >
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-purple-400 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Admin Control Center</h1>
        </div>
          <button
            onClick={() => {
              localStorage.clear();
              // If you want backend logout:
              fetch("http://localhost:8000/api/users/logout/", { method: "POST" }).catch(() => {});
              location.href = "/login"; // hard redirect so state is wiped instantly
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 
                      backdrop-blur-md text-white rounded-xl 
                      font-semibold text-sm transition-all"
          >
            Logout
          </button>
        <BarChart3 className="absolute right-8 bottom-8 w-32 h-32 text-white/10" />
      </div>

      {/* Modals */}
      {showEditor && (
        <ScheduleEditor
          initialSchedule={editorSchedule}
          onClose={() => setShowEditor(false)}
          onSave={(arr) => {
            try {
              localStorage.setItem('generatedTimetable', JSON.stringify(arr));
              setShowEditor(false);
              console.log('Timetable saved and published to students.');
            } catch (err) {
              console.error('Failed to save timetable', err);
            }
          }}
        />
      )}
      {showManager && <ScheduleManager onClose={() => setShowManager(false)} />}
      {showFacultyManager && <FacultyManager onClose={() => setShowFacultyManager(false)} />}
      {showExamCreator && <ExamSlotCreator onClose={() => setShowExamCreator(false)} />}
      {showLabExamScheduler && <LabExamScheduler onClose={() => setShowLabExamScheduler(false)} />}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key || idx}
              className="group relative bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-pink-200/50 dark:hover:shadow-pink-900/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg`}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">
                {stat.label}
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              {stat.change && (
                <span className="text-green-500 text-sm font-semibold">
                  {stat.change} this week
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Conflicts & Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Dynamic Conflicts from API */}
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Active Conflicts
            </h3>
            <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
              {dynamicConflicts.length}
            </span>
            <button
              onClick={() => fetchConflicts()}
              disabled={loadingConflicts}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
              title="Refresh conflicts"
            >
              <RefreshCw 
                className={`w-5 h-5 ${loadingConflicts ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>

          {conflictError && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{conflictError}</p>
            </div>
          )}

          {loadingConflicts ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading conflicts...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {dynamicConflicts.length === 0 ? (
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 text-center">
                  <p className="text-green-700 dark:text-green-300 font-semibold">
                    ✓ No conflicts detected
                  </p>
                </div>
              ) : (
                dynamicConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`p-4 rounded-xl border-l-4 transition-all ${
                      conflict.severity === 'high'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : conflict.severity === 'medium'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    } hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">
                          {conflict.type}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {conflict.desc}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                          conflict.severity === 'high'
                            ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300'
                            : conflict.severity === 'medium'
                            ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
                            : 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {conflict.severity.toUpperCase()}
                      </span>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>

          {activityError ? (
            <div className="text-sm text-red-500">{activityError}</div>
          ) : recentActivity.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No recent activity.
            </div>
          ) : (
            <>
              {(() => {
                const formattedItems = recentActivity.map(a => ({
                  id: a.id,
                  label: a.description || 'No description',
                  timestamp: a.timestamp,
                  entity: a.entity,
                  action: a.action
                }));

                return (
                  <AnimatedList
                    items={formattedItems.map(item =>
                      `${item.label}`
                    )}
                    onItemSelect={(label, index) => {
                      const selected = formattedItems[index];
                      console.log('Selected:', selected);
                    }}
                    showGradients={true}
                    enableArrowNavigation={true}
                    displayScrollbar={true}
                  />
                );
              })()}
            </>
          )}
        </div>
      </div>



      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowManager(true)}
            className="p-6 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-pink-200 transition-all transform hover:scale-105"
          >
            <Calendar className="w-8 h-8 mb-3" />
            Timetable Manager
          </button>
          <button
            onClick={() => setShowFacultyManager(true)}
            className="p-6 bg-gradient-to-br from-purple-400 to-blue-400 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-purple-200 transition-all transform hover:scale-105"
          >
            <Users className="w-8 h-8 mb-3" />
            Manage Faculty
          </button>

          <button
            onClick={() => setShowLabExamScheduler(true)}
            className="p-6 bg-gradient-to-br from-rose-400 to-orange-300 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-rose-200 transition-all transform hover:scale-105"
          >
            <Flame className="w-8 h-8 mb-3" />
            Schedule Lab Exams
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
