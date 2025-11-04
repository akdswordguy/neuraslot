// StudentDashboard.jsx
import React, { useState } from 'react';
import { Calendar, Download, Bell, Users, Clock, MapPin, BookOpen, AlertCircle, Star, TrendingUp } from 'lucide-react';

const StudentDashboard = () => {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  const weeklyTimetable = [
    { day: 'Monday', time: '09:00 AM', lab: 'Lab-A', subject: 'Data Structures Lab', faculty: 'Dr. Smith', duration: '2 hrs' },
    { day: 'Monday', time: '02:00 PM', lab: 'Lab-C', subject: 'Web Development Lab', faculty: 'Dr. Johnson', duration: '2 hrs' },
    { day: 'Wednesday', time: '11:00 AM', lab: 'Lab-B', subject: 'AI & ML Lab', faculty: 'Dr. Kumar', duration: '3 hrs' },
    { day: 'Thursday', time: '10:00 AM', lab: 'Lab-A', subject: 'Database Lab', faculty: 'Dr. Patel', duration: '2 hrs' },
    { day: 'Friday', time: '01:00 PM', lab: 'Lab-D', subject: 'Computer Networks Lab', faculty: 'Dr. Wilson', duration: '2 hrs' }
  ];

  const upcomingExams = [
    { date: 'Nov 15', day: 'Friday', subject: 'Data Structures Lab Exam', lab: 'Lab-A', time: '10:00 AM', duration: '3 hrs' },
    { date: 'Nov 22', day: 'Friday', subject: 'Web Development Lab Exam', lab: 'Lab-C', time: '02:00 PM', duration: '3 hrs' },
    { date: 'Dec 01', day: 'Sunday', subject: 'AI & ML Lab Exam', lab: 'Lab-B', time: '09:00 AM', duration: '4 hrs' }
  ];

  const notifications = [
    { message: 'Lab-A schedule changed to 10:00 AM tomorrow', time: '5 mins ago', type: 'warning', read: false },
    { message: 'New assignment uploaded for Web Development Lab', time: '1 hour ago', type: 'info', read: false },
    { message: 'Data Structures Lab exam date confirmed', time: '3 hours ago', type: 'success', read: true }
  ];

  const attendance = {
    present: 42,
    total: 45,
    percentage: 93
  };

  const labProgress = [
    { subject: 'Data Structures', completed: 8, total: 10, percentage: 80 },
    { subject: 'Web Development', completed: 7, total: 10, percentage: 70 },
    { subject: 'AI & ML', completed: 6, total: 10, percentage: 60 },
    { subject: 'Database', completed: 9, total: 10, percentage: 90 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Student Info Header */}
      <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/30">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">CS-3A Batch</h1>
                <p className="text-white/90">Student ID: AM.SC.U4CSE23XXX</p>
              </div>
            </div>
            <p className="text-white/90 text-lg">Your personalized lab schedule & progress tracker</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
              <p className="text-white/80 text-sm mb-1">Attendance</p>
              <p className="text-4xl font-bold">{attendance.percentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105">
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-white/80 text-sm mb-1">This Week</p>
          <p className="text-3xl font-bold">5 Labs</p>
        </div>
        
        <div className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-violet-500/50 transition-all transform hover:scale-105">
          <BookOpen className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-white/80 text-sm mb-1">Subjects</p>
          <p className="text-3xl font-bold">5</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-105">
          <AlertCircle className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-white/80 text-sm mb-1">Exams Due</p>
          <p className="text-3xl font-bold">3</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-green-500/50 transition-all transform hover:scale-105">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-white/80 text-sm mb-1">Progress</p>
          <p className="text-3xl font-bold">75%</p>
        </div>
      </div>

      {/* This Week's Lab Schedule */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">This Week's Lab Schedule</h2>
          <div className="flex gap-3">
            <button 
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                viewMode === 'week' 
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                viewMode === 'month' 
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Month
            </button>
            <button className="px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-all font-semibold flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {weeklyTimetable.map((item, idx) => (
            <div key={idx} className="group flex items-center gap-4 p-5 bg-gradient-to-r from-cyan-50 via-blue-50 to-violet-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 rounded-2xl border border-cyan-200 dark:border-cyan-800 hover:shadow-xl hover:shadow-cyan-500/20 transition-all">
              <div className="flex-shrink-0 w-24 text-center bg-white dark:bg-slate-900 rounded-xl p-3 shadow-md">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{item.day}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{item.time}</p>
              </div>
              
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{item.subject}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {item.lab}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {item.faculty}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {item.duration}
                  </span>
                </div>
              </div>
              
              <Calendar className="w-6 h-6 text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Exams & Notifications */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Lab Exams */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Lab Exams</h3>
          </div>
          
          <div className="space-y-4">
            {upcomingExams.map((exam, idx) => (
              <div key={idx} className="p-5 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{exam.date}</span>
                      <span className="text-xs bg-orange-200 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-bold">
                        {exam.day}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{exam.subject}</p>
                  </div>
                  <Bell className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>{exam.lab}</span>
                  <span>•</span>
                  <span>{exam.time}</span>
                  <span>•</span>
                  <span>{exam.duration}</span>
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
              {notifications.filter(n => !n.read).length}
            </span>
          </div>
          
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div key={idx} className={`p-4 rounded-xl border-l-4 ${
                notif.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                notif.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                'bg-green-50 dark:bg-green-900/20 border-green-500'
              } ${!notif.read ? 'shadow-lg' : 'opacity-70'} hover:shadow-lg transition-all`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{notif.time}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            View All Notifications
          </button>
        </div>
      </div>

      {/* Lab Progress & Attendance */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Lab Progress */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Lab Progress</h3>
          
          <div className="space-y-5">
            {labProgress.map((lab, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{lab.subject}</span>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {lab.completed}/{lab.total} sessions
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full shadow-lg transition-all ${
                      lab.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-teal-500 shadow-green-500/50' :
                      lab.percentage >= 60 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/50' :
                      'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/50'
                    }`}
                    style={{ width: `${lab.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance & Quick Actions */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Attendance Overview</h3>
          
          <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6 mb-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Total Attendance</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{attendance.percentage}%</p>
              </div>
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                <Star className="w-10 h-10 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {attendance.present} out of {attendance.total} labs attended
            </p>
          </div>

          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              View Full Calendar
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download Schedule (ICS)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;