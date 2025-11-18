"use client";
import Layout from "../components/Layout";
import AdminDashboard from "./admin/dashboard/page.jsx";
import FacultyDashboard from "./faculty/dashboard/page.jsx";
import { useState } from "react";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);

  function handleLogin(role) {
    setCurrentUser(role);
  }

  function handleLogout() {
    setCurrentUser(null);
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout currentUser={currentUser} onLogout={handleLogout}>
      {currentUser === "admin" && <AdminDashboard />}
      {currentUser === "faculty" && <FacultyDashboard />}
    </Layout>
  );
}
