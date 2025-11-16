import React, { useState } from 'react';
import { Cpu, ChevronRight, Lock, User, Users, ChevronDown } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedRole && credentials.username && credentials.password) {
      setIsLoading(true);
      setTimeout(() => {
        onLogin(selectedRole);
        setIsLoading(false);
      }, 1000);
    } else {
      console.error("Please fill in all fields, including role.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-pink-50 to-blue-50 relative overflow-hidden flex items-center justify-center p-4 font-inter">
      {/* Animated Background Elements (now in softer, theme-matching colors) */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-32 w-64 h-64 bg-rose-100/40 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      {/* Grid Pattern Overlay (subtler for the new theme) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <Cpu className="w-16 h-16 text-rose-400 animate-pulse" />
              <div className="absolute inset-0 bg-rose-400 blur-2xl opacity-50"></div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              NeuraSlot
            </h1>
          </div>
        </div>

        {/* Single Login Form Card */}
        <div className="animate-fade-in">
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Input */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Username or Email"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 bg-white/60 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-200 transition-all backdrop-blur-md"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 bg-white/60 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-200 transition-all backdrop-blur-md"
                  required
                />
              </div>

              {/* Role Select Dropdown */}
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-white/60 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-200 transition-all backdrop-blur-md appearance-none"
                  required
                >
                  <option value="" disabled className="bg-gray-100 text-gray-500">Select your role</option>
                  <option value="admin" className="bg-gray-100 text-gray-800">Admin</option>
                  <option value="faculty" className="bg-gray-100 text-gray-800">Faculty</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 bg-white/50 accent-pink-400" />
                  Remember me
                </label>
                <a href="#" className="text-pink-500 hover:text-pink-400 transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-pink-200 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Need help? <a href="#" className="text-pink-500 hover:text-pink-400 transition-colors">Contact Support</a>
              </p>
            </div>
          </div>
        </div>

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