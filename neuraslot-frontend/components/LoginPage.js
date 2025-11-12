// LoginPage.jsx
import React, { useState } from 'react';
import { Shield, BookOpen, Users, Cpu, ChevronRight, Lock, User } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { 
      id: 'admin', 
      name: 'Admin', 
      icon: Shield, 
      color: 'from-red-500 via-orange-500 to-yellow-500', 
      desc: 'Full system control & management',
      gradient: 'from-red-500/20 to-orange-500/20'
    },
    { 
      id: 'faculty', 
      name: 'Faculty', 
      icon: BookOpen, 
      color: 'from-violet-500 via-purple-500 to-pink-500', 
      desc: 'Manage schedules & availability',
      gradient: 'from-violet-500/20 to-purple-500/20'
    },
    
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedRole && credentials.username && credentials.password) {
      setIsLoading(true);
      // Simulate login delay
      setTimeout(() => {
        onLogin(selectedRole);
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <Cpu className="w-16 h-16 text-violet-400 animate-pulse" />
              <div className="absolute inset-0 bg-violet-400 blur-2xl opacity-50"></div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              NeuraSlot
            </h1>
          </div>
         
        </div>

        {!selectedRole ? (
          /* Role Selection */
          <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-white/20"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${role.color} rounded-3xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-3 group-hover:scale-105 transition-transform">
                      {role.name}
                    </h3>
                    
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors mb-6">
                      {role.desc}
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 text-violet-400 group-hover:text-white transition-colors font-semibold">
                      Continue
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 rounded-3xl`}></div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Login Form */
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
              >
                ← Back to role selection
              </button>
              
              <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${roles.find(r => r.id === selectedRole)?.color} rounded-2xl flex items-center justify-center shadow-2xl`}>
                  {React.createElement(roles.find(r => r.id === selectedRole)?.icon, { className: "w-10 h-10 text-white" })}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login
                </h2>
                <p className="text-gray-400">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Username Input */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Username or Email"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50 transition-all backdrop-blur-xl"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50 transition-all backdrop-blur-xl"
                    required
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5" />
                    Remember me
                  </label>
                  <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-400 text-sm">
                  Need help? <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Contact Support</a>
                </p>
              </div>
            </div>

            
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 NeuraSlot. All rights reserved.</p>
          <p className="mt-2">Built with Next.js • Powered by AI</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;