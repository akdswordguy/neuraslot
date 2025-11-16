// Layout.jsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Cpu, Bell, Settings, LogOut, Moon, Sun, Home, BarChart3, Calendar, User, ChevronDown } from 'lucide-react';

const Layout = ({ children, currentUser, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const notifications = [
    { id: 1, message: 'New schedule generated', time: '5 mins ago', unread: true },
    { id: 2, message: 'Lab-A capacity updated', time: '1 hour ago', unread: true },
    { id: 3, message: 'Exam slots confirmed', time: '2 hours ago', unread: false }
  ];

  const userInfo = {
    admin: { name: 'Admin User', email: 'admin@neuraslot.edu', avatar: '👤' },
    faculty: { name: 'Dr. Smith', email: 'smith@neuraslot.edu', avatar: '👨‍🏫' },
    
  };

  const navLinks = {
    admin: [
      { name: 'Dashboard', icon: Home, href: '#' },
      
      { name: 'Schedule', icon: Calendar, href: '#' },
      
    ],
    faculty: [
      { name: 'Dashboard', icon: Home, href: '#' },
      { name: 'My Schedule', icon: Calendar, href: '#' },
     
    ],
    
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-slate-950' 
        : 'bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50'
    }`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-1/4 left-1/3 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-violet-500/10 border-b border-gray-200/50 dark:border-gray-700/50' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Cpu className={`w-8 h-8 ${scrolled ? 'text-violet-600' : 'text-violet-400'} animate-pulse`} />
                <div className="absolute inset-0 bg-violet-500 blur-xl opacity-50"></div>
              </div>
              <span className={`text-2xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent`}>
                NeuraSlot
              </span>
              <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold ${
                currentUser === 'admin' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                currentUser === 'faculty' ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400' :
                'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
              }`}>
                {currentUser?.toUpperCase()}
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks[currentUser]?.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <a 
                    key={idx}
                    href={link.href}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </a>
                );
              })}
            </div>

            {/* Right Side Icons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full hover:bg-violet-100 dark:hover:bg-slate-800 transition-all"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-violet-600" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 rounded-full hover:bg-violet-100 dark:hover:bg-slate-800 transition-all"
                >
                  <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Notifications</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-3 rounded-xl ${notif.unread ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-gray-50 dark:bg-gray-900/20'} hover:shadow-md transition-all`}>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-violet-100 dark:hover:bg-slate-800 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {userInfo[currentUser]?.avatar}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl">
                        {userInfo[currentUser]?.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{userInfo[currentUser]?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{userInfo[currentUser]?.email}</p>
                      </div>
                    </div>
                    
                  </div>
                )}
              </div>

              {/* Logout Button (Alternative) */}
              <button 
                onClick={onLogout} 
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-full hover:shadow-lg hover:shadow-violet-500/50 transition-all transform hover:scale-105 font-semibold"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-slate-800 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              {navLinks[currentUser]?.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <a 
                    key={idx}
                    href={link.href}
                    className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-xl transition-all font-medium"
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </a>
                );
              })}
              <button 
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-xl transition-all font-medium"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="relative pt-20">
        {children}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Layout;