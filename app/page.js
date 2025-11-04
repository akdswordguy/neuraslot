// app/page.js
'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import LoginPage from '@/components/LoginPage';
import AdminDashboard from '@/components/AdminDashboard';
import FacultyDashboard from '@/components/FacultyDashboard';
import StudentDashboard from '@/components/StudentDashboard';

export default function Page() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (role) => {
    setCurrentUser(role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If no user is logged in, show login page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // If user is logged in, show dashboard in layout
  return (
    <Layout currentUser={currentUser} onLogout={handleLogout}>
      {currentUser === 'admin' && <AdminDashboard />}
      {currentUser === 'faculty' && <FacultyDashboard />}
      {currentUser === 'student' && <StudentDashboard />}
    </Layout>
  );
}