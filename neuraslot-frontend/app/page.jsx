"use client";
import { useRouter } from "next/navigation";
import { Cpu } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-pink-50 to-blue-50">
      <Cpu className="w-16 h-16 text-rose-400 animate-pulse mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 mb-4">NeuraSlot</h1>

      <button
        onClick={() => router.push("/login")}
        className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl shadow hover:scale-105 transition"
      >
        Sign In
      </button>
    </div>
  );
}
