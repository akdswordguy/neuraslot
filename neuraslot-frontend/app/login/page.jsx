"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, ChevronRight, Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/users/login/", {
        method: "POST",
        credentials: "include", // critical for SessionAuth
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid username or password");
      }

      // Store only user info, cookie stays in browser automatically
      localStorage.setItem("user", JSON.stringify(data.user));

      const { is_superuser, is_staff } = data.user;

      if (is_superuser) {
        router.push("/admin/dashboard");
      } else if (is_staff) {
        router.push("/faculty/dashboard");
      } else {
        alert("Unauthorized");
        localStorage.clear();
      }

    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-pink-50 to-blue-50 px-4">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <Cpu className="w-14 h-14 mx-auto text-rose-400 animate-pulse" />
          <h1 className="text-4xl font-bold mt-4 bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
            NeuraSlot
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            icon={User}
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
          />

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 
                       text-white rounded-xl flex items-center justify-center gap-2 font-semibold"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white 
                                rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          No account?
          <span
            onClick={() => router.push("/register")}
            className="text-pink-500 cursor-pointer hover:text-pink-400"
          >
            {" "}Register
          </span>
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
        className="w-full pl-12 pr-6 py-4 rounded-xl bg-white/60 border
                 placeholder:text-black text-black focus:ring-2 focus:ring-pink-200"
        required
      />
    </div>
  );
}
