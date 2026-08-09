"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, ArrowRight, Lock, MapPin, Mail, User, ChevronLeft } from "lucide-react";

function SignupFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialRole = searchParams.get("role") === "coordinator" ? "coordinator" : "volunteer";
  const [role, setRole] = useState<"volunteer" | "coordinator">(initialRole);

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "coordinator" || r === "volunteer") {
      setRole(r);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    fullName: role === "coordinator" ? "Dr. Aris Thorne" : "Meera R.",
    email: role === "coordinator" ? "aris.thorne@groundwork.org" : "meera.r@groundwork.org",
    district: role === "coordinator" ? "Wayanad Sector Command" : "Meppadi Ward 7",
    accessKey: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "coordinator") {
      router.push("/dashboard/coordinator");
    } else {
      router.push("/dashboard/volunteer");
    }
  };

  return (
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
          GROUNDWORK
        </h1>
        <p className="text-xs text-[#87A878] mt-1">
          AI-Verified Disaster Micro-Relief Network
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Role Toggle Selector */}
        <div className="flex bg-[#2D4A2D]/10 p-1 rounded-xl border border-[#87A878]/20">
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
        </div>

        {/* Informational Role Note */}
        <div className="text-xs p-3.5 rounded-xl bg-[#2D4A2D]/5 border border-[#87A878]/30 flex items-start gap-2.5">
          {role === "coordinator" ? (
            <>
              <ShieldCheck className="w-4 h-4 text-[#C4973A] shrink-0 mt-0.5" />
              <p className="text-[#2D4A2D]">
                Coordinators oversee regional dispatch, review AI image verifications, and deploy field tasks across 350 disaster-prone districts.
              </p>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 text-[#87A878] shrink-0 mt-0.5" />
              <p className="text-[#2D4A2D]">
                Volunteers accept micro-relief tasks, submit geotagged photo proof, and build an immutable blockchain record.
              </p>
            </>
          )}
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#6B7C4A] font-medium mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#6B7C4A] font-medium mb-1.5">
              Email / ID Tag
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                placeholder="name@groundwork.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#6B7C4A] font-medium mb-1.5">
              District / Operation Zone
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                placeholder="e.g. Wayanad, Kerala"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#6B7C4A] font-medium mb-1.5">
              Access Key / PIN (Optional for Demo)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#6B7C4A]" />
              <input
                type="password"
                value={formData.accessKey}
                onChange={(e) => setFormData({ ...formData, accessKey: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] ${
              role === "coordinator"
                ? "bg-[#C4973A] hover:bg-[#B0852E] text-white"
                : "bg-[#2D4A2D] hover:bg-[#1E331E] text-white"
            }`}
          >
            Enter {role === "coordinator" ? "Coordinator Console" : "Volunteer Portal"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-4 border-t border-[#87A878]/30 flex flex-col gap-2 text-center text-xs">
          <p className="text-[#6B7C4A]">Direct Demo Shortcuts:</p>
          <div className="flex gap-2">
            <Link
              href="/dashboard/coordinator"
              className="flex-1 py-2 px-2 rounded-lg bg-[#C4973A]/15 text-[#C4973A] hover:bg-[#C4973A]/25 border border-[#C4973A]/30 font-semibold transition-colors text-[11px]"
            >
              Open Coordinator Matrix →
            </Link>
            <Link
              href="/dashboard/volunteer"
              className="flex-1 py-2 px-2 rounded-lg bg-[#2D4A2D]/10 text-[#2D4A2D] hover:bg-[#2D4A2D]/20 border border-[#2D4A2D]/30 font-semibold transition-colors text-[11px]"
            >
              Open Volunteer Portal →
            </Link>
          </div>
          <div className="mt-2">
            <Link href="/auth/signin" className="text-[#6B7C4A] hover:underline font-medium">
              Already registered? Sign in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#2D4A2D] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-sm">Loading Groundwork Auth...</div>}>
        <SignupFormContent />
      </Suspense>
    </main>
  );
}
