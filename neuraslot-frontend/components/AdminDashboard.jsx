import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, Home, AlertCircle, Zap, Download, BarChart3, Flame } from 'lucide-react';
import dynamic from 'next/dynamic';

const ScheduleEditor = dynamic(() => import('./ScheduleEditor'), { ssr: false });
const ScheduleManager = dynamic(() => import('./ScheduleManager'), { ssr: false });
const FacultyManager = dynamic(() => import('./FacultyManager'), { ssr: false });
const ExamSlotCreator = dynamic(() => import('./ExamSlotCreator'), { ssr: false });
const LabExamScheduler = dynamic(() => import('./LabExamScheduler'), { ssr: false });

const AdminDashboard = () => {
  const [harmonyScore, setHarmonyScore] = useState(85);
  const [showEditor, setShowEditor] = useState(false);
  const [editorSchedule, setEditorSchedule] = useState(null);
  const [showManager, setShowManager] = useState(false);
  const [showFacultyManager, setShowFacultyManager] = useState(false);
  const [showExamCreator, setShowExamCreator] = useState(false);
  const [showLabExamScheduler, setShowLabExamScheduler] = useState(false);

  // Updated stats with new theme colors
  const stats = [
    { label: 'Total Labs', value: '24', icon: Home, color: 'from-pink-400 to-rose-400', change: '+2' },
    { label: 'Active Faculty', value: '156', icon: Users, color: 'from-blue-300 to-purple-300', change: '+8' },
    { label: 'Free Slots', value: '328', icon: Calendar, color: 'from-rose-300 to-orange-300', change: '+12' }
  ];

  const conflicts = [
    { id: 1, type: 'Faculty Clash', desc: 'Dr. Smith assigned to Lab-A and Lab-B at 10:00 AM', severity: 'high' },
    { id: 2, type: 'Room Overlap', desc: 'Batch CS-3A and CS-3B both in Lab-5 at 2:00 PM', severity: 'medium' },
    { id: 3, type: 'Equipment Issue', desc: 'Lab-7 GPU shortage for AI batch session', severity: 'low' }
  ];

 


  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/scheduling/activity/")
      .then(r => r.json())
      .then(data => setRecentActivity(data))
      .catch(() => console.error("Activity fetch failed"));
  }, []);

  return (
    // Applied the new theme's base background and text colors
    <div 
      className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200 bg-gradient-to-br from-gray-100 via-pink-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-slate-950" 
      style={{overflowY: 'auto', maxHeight: '100vh'}}
    >
      {/* Admin Header - Updated to new theme gradient */}
      <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-purple-400 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Admin Control Center</h1>
          <p className="text-white/90">Complete system oversight and management</p>
        </div>
        <BarChart3 className="absolute right-8 bottom-8 w-32 h-32 text-white/10" />
      </div>


      {/* Schedule Editor Modal (lazy-loaded) */}
      {showEditor && (
        <ScheduleEditor
          initialSchedule={editorSchedule}
          onClose={() => setShowEditor(false)}
          onSave={(arr) => {
            try {
              localStorage.setItem('generatedTimetable', JSON.stringify(arr));
              setShowEditor(false);
              // Replaced alert with console.log
              console.log('Timetable saved and published to students.');
            } catch (err) {
              console.error('Failed to save timetable', err);
              // Removed alert
            }
          }}
        />
      )}
      {showManager && (
        <ScheduleManager onClose={() => setShowManager(false)} />
      )}
      {showFacultyManager && (
        <FacultyManager onClose={() => setShowFacultyManager(false)} />
      )}
      {showExamCreator && (
        <ExamSlotCreator onClose={() => setShowExamCreator(false)} />
      )}
      {showLabExamScheduler && (
        <LabExamScheduler onClose={() => setShowLabExamScheduler(false)} />
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            // Updated card style to match LoginPage (white/70) and new hover shadow
            <div key={idx} className="group relative bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-pink-200/50 dark:hover:shadow-pink-900/50 transition-all duration-300 hover:-translate-y-1">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">{stat.label}</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <span className="text-green-500 text-sm font-semibold">{stat.change} this week</span>
            </div>
          );
        })}
      </div>

      {/* Conflicts & Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Conflicts */}
        {/* Updated card style */}
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Active Conflicts</h3>
            <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
              {conflicts.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {conflicts.map(conflict => (
              // Kept semantic colors (red/yellow/blue) as they convey meaning
              <div key={conflict.id} className={`p-4 rounded-xl border-l-4 ${
                conflict.severity === 'high' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                  : conflict.severity === 'medium'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
              } hover:shadow-lg transition-all`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{conflict.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{conflict.desc}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    conflict.severity === 'high' ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300' :
                    conflict.severity === 'medium' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                    'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                  }`}>
                    {conflict.severity.toUpperCase()}
                  </span>
                </div>
                {/* Updated "Resolve" button text to match theme */}
                <button className="text-sm text-pink-600 dark:text-pink-400 mt-3 hover:underline font-semibold">
                  Resolve Now →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <div className="flex-1">
                  <p className="font-semibold">{a.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(a.timestamp).toLocaleString()} • {a.user_name}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        {/* Updated button gradients and shadows */}
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setShowManager(true);
            }}
            className="p-6 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-pink-200 transition-all transform hover:scale-105"
          >
            <Calendar className="w-8 h-8 mb-3" />
            Timetable Manager
          </button>
          <button onClick={() => setShowFacultyManager(true)} className="p-6 bg-gradient-to-br from-purple-400 to-blue-400 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-purple-200 transition-all transform hover:scale-105">
            <Users className="w-8 h-8 mb-3" />
            Manage Faculty
          </button>
          
          <button onClick={() => setShowLabExamScheduler(true)} className="p-6 bg-gradient-to-br from-rose-400 to-orange-300 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-rose-200 transition-all transform hover:scale-105">
            <Flame className="w-8 h-8 mb-3" />
            Schedule Lab Exams
          </button>
        </div>
      </div>

      

      {/* Export Options */}
      {/* Updated export button styles */}
      <div className="flex gap-4">
        <button className="flex-1 p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl font-semibold text-gray-900 dark:text-white hover:shadow-lg hover:shadow-gray-300/50 dark:hover:shadow-black/50 hover:border-gray-300 dark:hover:border-gray-600 hover:text-pink-600 dark:hover:text-pink-400 transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export PDF Report
        </button>
        <button className="flex-1 p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl font-semibold text-gray-900 dark:text-white hover:shadow-lg hover:shadow-gray-300/50 dark:hover:shadow-black/50 hover:border-gray-300 dark:hover:border-gray-600 hover:text-pink-600 dark:hover:text-pink-400 transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export Excel
        </button>
        <button className="flex-1 p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl font-semibold text-gray-900 dark:text-white hover:shadow-lg hover:shadow-gray-300/50 dark:hover:shadow-black/50 hover:border-gray-300 dark:hover:border-gray-600 hover:text-pink-600 dark:hover:text-pink-400 transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export ICS
        </button>
      </div>
    </div>
    
  );
};

export default AdminDashboard;