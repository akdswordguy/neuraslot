"use client";
import React, { useState, useEffect } from "react";
import {
  Clock,
  BookOpen,
  CheckCircle,
  Download,
  Bell,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Home,
} from "lucide-react";

import AnimatedList from "../../AnimatedList_faculty";

const FacultyDashboard = () => {
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [user, setUser] = useState(null);

  const [selectedClass, setSelectedClass] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [subjectLookup, setSubjectLookup] = useState({});
  const [classes, setClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [stats, setStats] = useState([
    {
      key: "totalLabs",
      label: "Total Labs",
      value: 0,
      icon: BookOpen,
      color: "from-pink-400 to-rose-400",
    },
    {
      key: "activeFaculty",
      label: "Active Faculty",
      value: 0,
      icon: Users,
      color: "from-blue-300 to-purple-300",
    },
    {
      key: "studentClasses",
      label: "Student Classes",
      value: 0,
      icon: Home,
      color: "from-purple-300 to-pink-300",
    },
    {
      key: "freeSlots",
      label: "Free Slots",
      value: 0,
      icon: Calendar,
      color: "from-rose-300 to-orange-300",
    },
  ]);

  const [weeklyStats, setWeeklyStats] = useState([]);

  // Grab user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        console.error("Failed to parse stored user");
      }
    }
  }, []);

  // Fixed period timings
  const PERIOD_TIMINGS = [
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "01:00", end: "02:00" },
    { start: "02:00", end: "03:00" },
    { start: "03:00", end: "04:00" },
    { start: "04:00", end: "05:00" },
    { start: "05:00", end: "06:00" },
  ];

  const currentDay = new Date().getDay();
  const backendDay = currentDay === 0 ? 7 : currentDay;

  // ---------- SUBJECT-WEEKLY STATS (per subject, dropdown) ----------
  useEffect(() => {
    if (!selectedSubject) {
      setWeeklyStats([]);
      return;
    }

    async function fetchSubjectWeekly() {
      try {
        const res = await fetch(
          "http://localhost:8000/api/scheduling/timetable/"
        );
        if (!res.ok) throw new Error("Failed weekly data");
        const data = await res.json();

        const week = {
          1: { day: "Monday", sessions: 0, hours: 0 },
          2: { day: "Tuesday", sessions: 0, hours: 0 },
          3: { day: "Wednesday", sessions: 0, hours: 0 },
          4: { day: "Thursday", sessions: 0, hours: 0 },
          5: { day: "Friday", sessions: 0, hours: 0 },
          6: { day: "Saturday", sessions: 0, hours: 0 },
          7: { day: "Sunday", sessions: 0, hours: 0 },
        };

        const filtered = data.filter((t) => t.subject === selectedSubject);

        filtered.forEach((item) => {
          const timing = PERIOD_TIMINGS[item.period_number - 1];
          if (!timing) return;

          const [sh, sm] = timing.start.split(":").map(Number);
          const [eh, em] = timing.end.split(":").map(Number);
          const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;

          week[item.day_of_week].sessions += 1;
          week[item.day_of_week].hours += hours;
        });

        setWeeklyStats(Object.values(week));
      } catch (err) {
        console.error("Weekly data load failed:", err);
        setWeeklyStats([]);
      }
    }

    fetchSubjectWeekly();
  }, [selectedSubject]);

  // ---------- TODAY'S SCHEDULE (by selected class) ----------
  useEffect(() => {
    async function fetchSchedule() {
      if (!selectedClass) return;
      setLoadingSchedule(true);
      setScheduleError(null);

      try {
        const res = await fetch(
          `http://localhost:8000/api/scheduling/timetable/${selectedClass}/get_class_timetable/`
        );
        if (!res.ok) throw new Error("Failed to load timetable");
        const data = await res.json();

        const todays = data.filter((item) => item.day_of_week === backendDay);

        const formatted = todays.map((item) => {
          const timing = PERIOD_TIMINGS[item.period_number - 1];
          if (!timing) {
            return {
              ...item,
              time: "Unknown time",
              status: "upcoming",
              lab: item.is_lab ? "Lab" : "Classroom",
            };
          }

          const getMin = (t) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
          };

          const now = new Date();
          const nowMin = now.getHours() * 60 + now.getMinutes();
          const startMin = getMin(timing.start);
          const endMin = getMin(timing.end);

          let status = "upcoming";
          if (nowMin >= startMin && nowMin < endMin) status = "ongoing";
          else if (nowMin > endMin) status = "completed";

          return {
            ...item,
            time: `${timing.start} - ${timing.end}`,
            status,
            lab: item.is_lab ? "Lab" : "Classroom",
          };
        });

        setTodaySchedule(formatted);
      } catch (err) {
        setScheduleError(err.message);
      } finally {
        setLoadingSchedule(false);
      }
    }

    fetchSchedule();
  }, [selectedClass, backendDay, PERIOD_TIMINGS]);

  // ---------- SUBJECTS ----------
  useEffect(() => {
    fetch("http://localhost:8000/api/scheduling/subjects/")
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data);
        const lookup = {};
        data.forEach((s) => (lookup[s.id] = s.name));
        setSubjectLookup(lookup);
      })
      .catch((err) => console.error("Subject fetch failed", err));
  }, []);

  // ---------- CLASSES ----------
  useEffect(() => {
    fetch("http://localhost:8000/api/scheduling/classes/")
      .then((res) => res.json())
      .then(setClasses)
      .catch((err) => console.error("Failed loading classes", err));
  }, []);

  // ---------- TOP STATS ----------
  useEffect(() => {
    async function fetchStats() {
      try {
        const [ttRes, usersRes, classesRes] = await Promise.all([
          fetch("http://localhost:8000/api/scheduling/timetable/"),
          fetch("http://localhost:8000/api/users/"),
          fetch("http://localhost:8000/api/scheduling/classes/"),
        ]);

        if (!ttRes.ok || !usersRes.ok || !classesRes.ok) {
          console.error("Stats fetch failed", {
            timetableStatus: ttRes.status,
            usersStatus: usersRes.status,
            classesStatus: classesRes.status,
          });
          return;
        }

        const [timetable, users, classes] = await Promise.all([
          ttRes.json(),
          usersRes.json(),
          classesRes.json(),
        ]);

        const totalLabs = timetable.filter((t) => t.is_lab).length;
        const freeSlots = timetable.filter((t) => !t.subject).length;
        const activeFaculty = users.filter((u) => u.is_staff).length;
        const studentClasses = classes.length;

        setStats((prev) =>
          prev.map((s) => {
            switch (s.key) {
              case "totalLabs":
                return { ...s, value: totalLabs };
              case "activeFaculty":
                return { ...s, value: activeFaculty };
              case "studentClasses":
                return { ...s, value: studentClasses };
              case "freeSlots":
                return { ...s, value: freeSlots };
              default:
                return s;
            }
          })
        );
      } catch (err) {
        console.error("Error loading stats", err);
      }
    }

    fetchStats();
  }, []);

  // ---------- FREE SLOTS ----------
  const [freeSlots, setFreeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    async function fetchFreeSlots() {
      try {
        const res = await fetch(
          "http://localhost:8000/api/scheduling/timetable/"
        );
        const data = await res.json();
        const free = data.filter((t) => !t.subject);
        setFreeSlots(free);
      } catch (err) {
        console.error("Error fetching free slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchFreeSlots();
  }, []);

  // ⭐ UPDATED: book slot with selected subject, update backend + UI
  const handleBookSlot = async (slot) => {
    if (!selectedSubject) {
      alert("Please select a subject before booking.");
      return;
    }

    if (!selectedClass) {
      alert("Select class first.");
      return;
    }

    const timingDate = new Date();
    timingDate.setDate(
      timingDate.getDate() + ((slot.day_of_week + 7 - currentDay) % 7)
    );

    const formattedDate = timingDate.toISOString().split("T")[0];

    try {
      const res = await fetch("http://localhost:8000/api/scheduling/request-booking/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          class_id: selectedClass,
          subject_id: selectedSubject,
          date: formattedDate,
          period_number: slot.period_number
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      alert("Booking request submitted! Waiting for admin approval.");
      
      // remove requested slot from list
      setFreeSlots(prev => prev.filter(s => s.id !== slot.id));

    } catch (err) {
      console.error("Booking failed:", err);
      alert(err.message);
    }
  };



  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  const handleOpenBooking = (slot) => {
    setActiveSlot(slot);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!activeSlot) return;
    if (!selectedClass) return alert("Choose class first");
    if (!selectedSubject) return alert("Choose subject first");

    try {
      const res = await fetch(
        `http://localhost:8000/api/scheduling/timetable/${activeSlot.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            class_id: selectedClass,
            subject_id: selectedSubject,
            is_lab: true
          })
        }
      );

      if (!res.ok) throw new Error("Failed to update timetable");

      alert("Slot booked successfully!");

      setFreeSlots(prev => prev.filter(s => s.id !== activeSlot.id));
      setShowBookingModal(false);
      setActiveSlot(null);

    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };


  const upcomingExams = [
    {
      date: "Nov 15, 2025",
      subject: "Data Structures Lab Exam",
      batch: "CS-3A",
      lab: "Lab-A",
      time: "10:00 AM",
    },
    {
      date: "Nov 22, 2025",
      subject: "Web Development Lab Exam",
      batch: "CS-3B",
      lab: "Lab-C",
      time: "02:00 PM",
    },
  ];

  const notifications = [
    {
      message: "Lab-A schedule changed for tomorrow",
      time: "10 mins ago",
      type: "warning",
    },
    {
      message: "New batch CS-5A assigned to you",
      time: "1 hour ago",
      type: "info",
    },
    {
      message: "Exam slots confirmed for next week",
      time: "3 hours ago",
      type: "success",
    },
  ];

  


  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-gray-800 dark:text-gray-200 bg-gradient-to-br from-gray-100 via-pink-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-slate-950 font-inter"
      style={{ overflowY: "auto", maxHeight: "100vh" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-purple-400 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

        <div className="relative z-10 flex items-center justify-between">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.first_name || user?.username || "Faculty"}!
          </h1>

          <button
            onClick={() => {
              localStorage.clear();
              fetch("http://localhost:8000/api/users/logout/", {
                method: "POST",
              }).catch(() => {});
              location.href = "/login";
            }}
            className="px-4 py-2 bg-white/20 hover:bg白/30 backdrop-blur-md text-white rounded-xl font-semibold text-sm transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Top stats */}
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
            </div>
          );
        })}
      </div>

      {/* Today schedule */}
      <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Today’s Lab Schedule
          </h2>
          <select
            className="px-3 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl font-semibold"
            value={selectedClass || ""}
            onChange={(e) => setSelectedClass(Number(e.target.value))}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || `Class ${c.id}`}
              </option>
            ))}
          </select>
        </div>

        {loadingSchedule ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading schedule...
          </p>
        ) : scheduleError ? (
          <p className="text-sm text-red-500">{scheduleError}</p>
        ) : selectedClass && todaySchedule.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No scheduled labs today.
          </p>
        ) : (
          <div className="space-y-4">
            {todaySchedule.map((session, idx) => (
              <div
                key={idx}
                className="group relative bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 p-6 rounded-2xl border-l-4 border-rose-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      {session.time}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {session.subject || "No Subject"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.lab} • Period {session.period_number}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      session.status === "ongoing"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : session.status === "completed"
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-600"
                        : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {session.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly overview + availability */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subject weekly stats */}
        <div>
          <select
            className="px-3 py-2 bg-purple-200 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl font-semibold"
            value={selectedSubject || ""}
            onChange={(e) =>
              setSelectedSubject(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl mt-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Weekly Subject Overview
            </h3>

            {weeklyStats.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a subject to view statistics
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  {weeklyStats.map((day, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-24 font-semibold text-gray-900 dark:text-white">
                        {day.day}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {day.sessions} sessions
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {day.hours.toFixed(1)} hrs
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full shadow-lg transition-all"
                            style={{
                              width: `${Math.min(
                                (day.hours / 6) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Total Hours
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {weeklyStats
                          .reduce((a, b) => a + b.hours, 0)
                          .toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

          <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Slots
            </h3>

            {loadingSlots ? (
              <p className="text-gray-500 dark:text-gray-400">Loading free slots...</p>
            ) : freeSlots.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No free slots found.</p>
            ) : (
            <AnimatedList
              items={freeSlots}
              renderItem={(slot) => {
                const timing = PERIOD_TIMINGS[slot.period_number - 1];
                return (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow hover:shadow-lg transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][slot.day_of_week - 1]}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Period {slot.period_number} • {timing.start} - {timing.end}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenBooking(slot)}
                        className="px-3 py-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-xl font-semibold text-xs hover:scale-105 transition-all"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                );
              }}
            />

            )}
          </div>

      </div>

      {/* Upcoming exams + notifications */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-rose-500" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upcoming Lab Exams
            </h3>
          </div>

          <div className="space-y-4">
            {upcomingExams.map((exam, idx) => (
              <div
                key={idx}
                className="p-5 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border border-rose-200 dark:border-rose-800 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">
                      {exam.date}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {exam.subject}
                    </p>
                  </div>
                  <Bell className="w-5 h-5 text-rose-500" />
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
      </div>
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-[350px] shadow-2xl border border-gray-300 dark:border-gray-700 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirm Slot Booking
            </h3>

            <div className="mb-4">
              <label className="text-sm font-semibold">Select Class</label>
              <select
                className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                value={selectedClass || ""}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
              >
                <option value="">Select</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold">Select Subject</label>
              <select
                className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                value={selectedSubject || ""}
                onChange={(e) => setSelectedSubject(Number(e.target.value))}
              >
                <option value="">Select</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setActiveSlot(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmBooking}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold"
              >
                Book Slot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyDashboard;
