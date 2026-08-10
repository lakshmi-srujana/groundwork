"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, UserCheck, ArrowRight, Lock, Mail, ChevronLeft, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";

function SigninFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramRole = searchParams.get("role");
  const initialRole = paramRole === "volunteer" ? "volunteer" : "coordinator";
  const [role, setRole] = useState<"coordinator" | "volunteer">(initialRole);

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "coordinator" || r === "volunteer") {
      setRole(r);
    }
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "info"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Query profiles table for actual user role in database
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const actualRole = profile?.role || data.user.user_metadata?.role || "volunteer";

        // ROLE VALIDATION & AUTO-TAB SWITCH:
        // Stay strictly on this signin screen without triggering redirects to landing page.
        // If selected tab doesn't match account role, switch the tab on screen & show helpful message.
        if (role !== actualRole) {
          setRole(actualRole as "coordinator" | "volunteer");
          const roleLabel = actualRole === "coordinator" ? "Coordinator" : "Volunteer";
          setNotice({
            type: "info",
            message: `Account is registered as a ${roleLabel}. Switched to the ${roleLabel} portal tab — click Sign In again to proceed.`,
          });
          setLoading(false);
          return;
        }

        // Role matches selected tab — proceed to dashboard
        if (actualRole === "coordinator") {
          window.location.href = "/dashboard/coordinator";
        } else {
          window.location.href = "/dashboard/volunteer";
        }
      }
    } catch (err: any) {
      console.error(err);
      setNotice({
        type: "error",
        message: err.message || "Invalid email or password. Please check your credentials.",
      });
    } finally {
      setLoading(false);
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
            sizes="56px"
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
            onClick={() => {
              setRole("coordinator");
              setNotice(null);
            }}
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
            onClick={() => {
              setRole("volunteer");
              setNotice(null);
            }}
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

        {notice && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 border ${
              notice.type === "error"
                ? "bg-rose-100 border-rose-300 text-rose-800"
                : "bg-amber-100 border-amber-300 text-amber-900"
            }`}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{notice.message}</span>
          </div>
        )}

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
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] disabled:opacity-50 ${
              role === "coordinator"
                ? "bg-[#C4973A] hover:bg-[#B0852E]"
                : "bg-[#2D4A2D] hover:bg-[#1E331E]"
            }`}
          >
            {loading ? "Signing in..." : `Sign In to ${role === "coordinator" ? "Coordinator Matrix" : "Volunteer Dashboard"}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Clean Auth Navigation */}
        <div className="pt-4 border-t border-[#87A878]/30 text-center text-xs">
          <Link href={`/auth/signup?role=${role}`} className="text-[#6B7C4A] hover:underline font-medium">
            Don’t have an account? Sign up here →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <main className="min-h-screen bg-[#2D4A2D] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-sm">Loading Groundwork Auth...</div>}>
        <SigninFormContent />
      </Suspense>
    </main>
  );
}
