// FacultyDashboard.jsx
import React, { useState } from 'react';
import { Clock, BookOpen, CheckCircle, Download, Bell, Calendar, MapPin, Users, TrendingUp } from 'lucide-react';

const FacultyDashboard = () => {
  const [selectedWeek, setSelectedWeek] = useState('current');

  const todaySchedule = [
    { time: '09:00 AM', lab: 'Lab-A', batch: 'CS-3A', subject: 'Data Structures Lab', duration: '2 hrs', status: 'ongoing' },
    { time: '11:00 AM', lab: 'Lab-C', batch: 'CS-3B', subject: 'Web Development Lab', duration: '2 hrs', status: 'upcoming' },
    { time: '02:00 PM', lab: 'Lab-B', batch: 'CS-4A', subject: 'Machine Learning Lab', duration: '3 hrs', status: 'upcoming' }
  ];

  const weeklySchedule = [
    { day: 'Monday', sessions: 3, hours: 7 },
    { day: 'Tuesday', sessions: 2, hours: 5 },
    { day: 'Wednesday', sessions: 4, hours: 9 },
    { day: 'Thursday', sessions: 2, hours: 5 },
    { day: 'Friday', sessions: 3, hours: 7 }
  ];

  const upcomingExams = [
    { date: 'Nov 15, 2025', subject: 'Data Structures Lab Exam', batch: 'CS-3A', lab: 'Lab-A', time: '10:00 AM' },
    { date: 'Nov 22, 2025', subject: 'Web Development Lab Exam', batch: 'CS-3B', lab: 'Lab-C', time: '02:00 PM' }
  ];

  const notifications = [
    { message: 'Lab-A schedule changed for tomorrow', time: '10 mins ago', type: 'warning' },
    { message: 'New batch CS-5A assigned to you', time: '1 hour ago', type: 'info' },
    { message: 'Exam slots confirmed for next week', time: '3 hours ago', type: 'success' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Faculty Welcome Card */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, Dr. Smith!</h1>
            <p className="text-white/90 text-lg">You have 3 lab sessions today • 18 hours this week</p>
          </div>
          <BookOpen className="w-32 h-32 text-white/20" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-violet-500/50 transition-all transform hover:scale-105">
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-white/80 text-sm mb-1">This Week</p>
          <p className="text-3xl font-bold">18 hrs</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-white/80 text-sm mb-1">Batches</p>
          <p className="text-3xl font-bold">6</p>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105">
          <BookOpen className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-white/80 text-sm mb-1">Total Sessions</p>
          <p className="text-3xl font-bold">14</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-105">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-white/80 text-sm mb-1">Completion</p>
          <p className="text-3xl font-bold">92%</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Lab Schedule</h2>
          <button className="px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-all font-semibold flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="space-y-4">
          {todaySchedule.map((session, idx) => (
            <div key={idx} className="group relative bg-gradient-to-r from-violet-50 via-purple-50 to-blue-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 p-6 rounded-2xl border-l-4 border-violet-500 hover:shadow-xl hover:shadow-violet-500/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      session.status === 'ongoing' 
                        ? 'bg-green-500' 
                        : 'bg-violet-500'
                    } shadow-lg`}>
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{session.time}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        session.status === 'ongoing' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {session.status === 'ongoing' ? 'ONGOING' : 'UPCOMING'}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{session.subject}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {session.lab}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Batch {session.batch}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.duration}
                      </span>
                    </div>
                  </div>
                </div>
                
                <CheckCircle className={`w-10 h-10 transition-all ${
                  session.status === 'ongoing' 
                    ? 'text-green-500 opacity-100' 
                    : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Overview & Availability */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Stats */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Weekly Overview</h3>
          
          <div className="space-y-4">
            {weeklySchedule.map((day, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-24 font-semibold text-gray-900 dark:text-white">{day.day}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{day.sessions} sessions</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{day.hours} hrs</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-violet-500 to-purple-500 h-3 rounded-full shadow-lg shadow-violet-500/50 transition-all" 
                      style={{ width: `${(day.hours / 9) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Lab Hours</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">18 / 20</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Utilization</p>
                <p className="text-3xl font-bold text-green-500">90%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Management */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Availability</h3>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Current Status</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 dark:text-green-400 font-bold">Available</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Preferred Lab</p>
              <p className="text-gray-600 dark:text-gray-400">Lab-A, Lab-C</p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Working Hours</p>
              <p className="text-gray-600 dark:text-gray-400">9:00 AM - 5:00 PM</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all transform hover:scale-105">
              Update Schedule Preferences
            </button>
            <button className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
              Request Time-Off
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Exams & Notifications */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Lab Exams</h3>
          </div>
          
          <div className="space-y-4">
            {upcomingExams.map((exam, idx) => (
              <div key={idx} className="p-5 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-1">{exam.date}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{exam.subject}</p>
                  </div>
                  <Bell className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{exam.lab}</span>
                  <span>•</span>
                  <span>Batch {exam.batch}</span>
                  <span>•</span>
                  <span>{exam.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h3>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {notifications.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div key={idx} className={`p-4 rounded-xl border-l-4 ${
                notif.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                notif.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                'bg-green-50 dark:bg-green-900/20 border-green-500'
              } hover:shadow-lg transition-all`}>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">{notif.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{notif.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;