"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Lock, User, Users, Phone, BookOpen, ChevronDown } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    username: "", email: "", password: "",
    first_name: "", last_name: "",
    contact_number: "", faculty_id_number: "",
    subject_id: "",
    role: "faculty"
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/scheduling/subjects/")
      .then(res => res.json())
      .then(setSubjects)
      .catch(console.error);
  }, []);

  const update = (field, val) =>
    setFormData(prev => ({ ...prev, [field]: val }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isAdmin = formData.role === "admin";

    const sendData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      contact_number: formData.contact_number,
      faculty_id_number: isAdmin ? null : formData.faculty_id_number,
      subject: isAdmin ? null : formData.subject_id,
      is_staff: true,
      is_superuser: isAdmin
    };

    try {
      const res = await fetch("http://localhost:8000/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(JSON.stringify(data));

      alert("Account created! Please login.");
      router.push("/login");

    } catch (err) {
      alert("Registration error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-pink-50 to-blue-50 p-4">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 max-w-lg w-full shadow-2xl">

        <div className="text-center mb-8">
          <Cpu className="w-14 h-14 mx-auto text-rose-400 animate-pulse" />
          <h2 className="text-3xl font-bold text-gray-800 mt-4">Registration</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">

          <Input icon={User} placeholder="Username"
            onChange={(e)=>update("username",e.target.value)} />

          <Input icon={User} type="email" placeholder="Email"
            onChange={(e)=>update("email",e.target.value)} />

          <Input icon={Lock} type="password" placeholder="Password"
            onChange={(e)=>update("password",e.target.value)} />

          <Input icon={User} placeholder="First Name"
            onChange={(e)=>update("first_name",e.target.value)} />

          <Input icon={User} placeholder="Last Name"
            onChange={(e)=>update("last_name",e.target.value)} />

          <Input icon={Phone} placeholder="Contact Number"
            onChange={(e)=>update("contact_number",e.target.value)} />

          {/* Role Dropdown */}
          <div className="relative">
            <Users className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
            <select
              className="w-full pl-12 pr-10 py-4 bg-white/60 border rounded-xl text-black"
              value={formData.role}
              onChange={(e)=>update("role",e.target.value)}
            >
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-500" />
          </div>

          {/* Conditional faculty fields */}
          {formData.role === "faculty" && (
            <>
              <Input icon={Users} placeholder="Faculty ID Number"
                onChange={(e)=>update("faculty_id_number",e.target.value)} />

              <div className="relative">
                <BookOpen className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                <select
                  className="w-full pl-12 pr-10 py-4 bg-white/60 border rounded-xl text-black"
                  value={formData.subject_id}
                  onChange={(e) => update("subject_id", Number(e.target.value))}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s =>
                    <option key={s.id} value={s.id}>{s.name}</option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-500" />
              </div>
            </>
          )}

          <button className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl font-semibold">
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?
          <span onClick={() => router.push("/login")}
            className="text-pink-500 cursor-pointer ml-1">Sign in</span>
        </p>

      </div>
    </div>
  );
}

function Input({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
      <input
        {...props}
        className="w-full pl-12 pr-6 py-4 rounded-xl bg-white/60 border placeholder:text-black text-black"
        required
      />
    </div>
  );
}
