// AdminDashboard.jsx
import React, { useState } from 'react';
import { Calendar, Users, BookOpen, Home, AlertCircle, Zap, Download, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const [harmonyScore, setHarmonyScore] = useState(85);

  const stats = [
    { label: 'Total Labs', value: '24', icon: Home, color: 'from-violet-500 to-purple-500', change: '+2' },
    { label: 'Active Faculty', value: '156', icon: Users, color: 'from-blue-500 to-cyan-500', change: '+8' },
    { label: 'Student Batches', value: '42', icon: BookOpen, color: 'from-cyan-500 to-teal-500', change: '+5' },
    { label: 'This Week', value: '328', icon: Calendar, color: 'from-orange-500 to-red-500', change: '+12' }
  ];

  const conflicts = [
    { id: 1, type: 'Faculty Clash', desc: 'Dr. Smith assigned to Lab-A and Lab-B at 10:00 AM', severity: 'high' },
    { id: 2, type: 'Room Overlap', desc: 'Batch CS-3A and CS-3B both in Lab-5 at 2:00 PM', severity: 'medium' },
    { id: 3, type: 'Equipment Issue', desc: 'Lab-7 GPU shortage for AI batch session', severity: 'low' }
  ];

  const recentActivity = [
    { action: 'Schedule Generated', time: '2 mins ago', user: 'System' },
    { action: 'Lab-A Capacity Updated', time: '15 mins ago', user: 'Admin' },
    { action: 'New Faculty Added', time: '1 hour ago', user: 'Admin' },
    { action: 'Exam Slots Created', time: '2 hours ago', user: 'System' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Admin Control Center</h1>
          <p className="text-white/90">Complete system oversight and management</p>
        </div>
        <BarChart3 className="absolute right-8 bottom-8 w-32 h-32 text-white/10" />
      </div>

      {/* Smart Harmony Engine */}
      <div className="relative bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 rounded-3xl p-8 overflow-hidden border border-violet-500/30 shadow-2xl shadow-violet-500/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
                <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50"></div>
              </div>
              <h2 className="text-2xl font-bold text-white">Smart Harmony Engine™</h2>
            </div>
            <div className={`px-6 py-3 rounded-full font-bold text-lg ${
              harmonyScore >= 80 
                ? 'bg-green-500/20 text-green-400 shadow-lg shadow-green-500/50' 
                : harmonyScore >= 60 
                ? 'bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/50' 
                : 'bg-red-500/20 text-red-400 shadow-lg shadow-red-500/50'
            }`}>
              {harmonyScore}% Balanced
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-gray-400 text-sm mb-2">Lab Utilization</p>
              <p className="text-3xl font-bold text-white mb-3">87%</p>
              <div className="w-full bg-gray-700/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-3 rounded-full shadow-lg shadow-violet-500/50 transition-all" style={{ width: '87%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-gray-400 text-sm mb-2">Faculty Load Balance</p>
              <p className="text-3xl font-bold text-white mb-3">72%</p>
              <div className="w-full bg-gray-700/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full shadow-lg shadow-blue-500/50 transition-all" style={{ width: '72%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-gray-400 text-sm mb-2">Batch Coverage</p>
              <p className="text-3xl font-bold text-white mb-3">94%</p>
              <div className="w-full bg-gray-700/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-cyan-500 to-teal-500 h-3 rounded-full shadow-lg shadow-cyan-500/50 transition-all" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-4 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all transform hover:scale-105 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Auto-Optimize Schedule
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/20 transition-all">
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 hover:-translate-y-1">
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
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Active Conflicts</h3>
            <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
              {conflicts.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {conflicts.map(conflict => (
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
                <button className="text-sm text-violet-600 dark:text-violet-400 mt-3 hover:underline font-semibold">
                  Resolve Now →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time} • by {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="p-6 bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all transform hover:scale-105">
            <Calendar className="w-8 h-8 mb-3" />
            Generate New Schedule
          </button>
          <button className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105">
            <Users className="w-8 h-8 mb-3" />
            Manage Labs & Faculty
          </button>
          <button className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-105">
            <BookOpen className="w-8 h-8 mb-3" />
            Create Exam Slots
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex gap-4">
        <button className="flex-1 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl font-semibold text-gray-900 dark:text-white hover:shadow-xl transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export PDF Report
        </button>
        <button className="flex-1 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl font-semibold text-gray-900 dark:text-white hover:shadow-xl transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export Excel
        </button>
        <button className="flex-1 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl font-semibold text-gray-900 dark:text-white hover:shadow-xl transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export ICS
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;