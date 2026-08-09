"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, UserCheck, ArrowRight, Lock, Mail, ChevronLeft } from "lucide-react";

export default function SigninPage() {
  const router = useRouter();
  const [role, setRole] = useState<"coordinator" | "volunteer">("coordinator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "coordinator") {
      router.push("/dashboard/coordinator");
    } else {
      router.push("/dashboard/volunteer");
    }
  };

  return (
    <main className="min-h-screen bg-[#2D4A2D] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#F5F0E8] text-[#2D4A2D] rounded-2xl shadow-2xl border border-[#87A878]/30 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-[#2D4A2D] p-6 text-center text-[#F5F0E8] relative">
          <Link
            href="/"
            className="absolute top-4 left-4 text-xs text-[#87A878] hover:text-white flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Landing
          </Link>
          <div className="w-14 h-14 mx-auto mb-2 relative">
            <Image
              src="/seal.png"
              alt="Groundwork Seal"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wide">
            GROUNDWORK SIGN IN
          </h1>
          <p className="text-xs text-[#87A878] mt-1">
            Access your relief dashboard
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Role Toggle Selector */}
          <div className="flex bg-[#2D4A2D]/10 p-1 rounded-xl border border-[#87A878]/20">
            <button
              type="button"
              onClick={() => setRole("coordinator")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                role === "coordinator"
                  ? "bg-[#C4973A] text-[#F5F0E8] shadow-md"
                  : "text-[#6B7C4A] hover:text-[#2D4A2D]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Coordinator
            </button>

            <button
              type="button"
              onClick={() => setRole("volunteer")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                role === "volunteer"
                  ? "bg-[#2D4A2D] text-[#F5F0E8] shadow-md"
                  : "text-[#6B7C4A] hover:text-[#2D4A2D]"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Volunteer
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#6B7C4A] font-medium mb-1.5">
                Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                  placeholder={role === "coordinator" ? "coordinator@groundwork.org" : "volunteer@groundwork.org"}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#6B7C4A] font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] ${
                role === "coordinator"
                  ? "bg-[#C4973A] hover:bg-[#B0852E]"
                  : "bg-[#2D4A2D] hover:bg-[#1E331E]"
              }`}
            >
              Sign In to {role === "coordinator" ? "Coordinator Matrix" : "Volunteer Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Direct Links */}
          <div className="pt-4 border-t border-[#87A878]/30 flex flex-col gap-2 text-center text-xs">
            <div className="flex gap-2">
              <Link
                href="/dashboard/coordinator"
                className="flex-1 py-2 px-2 rounded-lg bg-[#C4973A]/15 text-[#C4973A] hover:bg-[#C4973A]/25 border border-[#C4973A]/30 font-semibold transition-colors text-[11px]"
              >
                Go to Coordinator Matrix →
              </Link>
              <Link
                href="/dashboard/volunteer"
                className="flex-1 py-2 px-2 rounded-lg bg-[#2D4A2D]/10 text-[#2D4A2D] hover:bg-[#2D4A2D]/20 border border-[#2D4A2D]/30 font-semibold transition-colors text-[11px]"
              >
                Go to Volunteer Dashboard →
              </Link>
            </div>
            <div className="mt-2">
              <Link href="/auth/signup" className="text-[#6B7C4A] hover:underline font-medium">
                Don’t have an account? Sign up here →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
