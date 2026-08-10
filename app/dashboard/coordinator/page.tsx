"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LiveStats {
  totalVolunteers: number;
  totalTasks: number;
  pendingTasks: number;
  verifiedTasks: number;
  onLedgerSubmissions: number;
}

interface RecentActivity {
  id: string;
  submitted_at: string;
  ai_verdict: string | null;
  ai_confidence: number | null;
  blockchain_tx_hash: string | null;
  tasks?: { title: string; district: string } | null;
  profiles?: { full_name: string | null } | null;
}

export default function CoordinatorOverviewPage() {
  const [stats, setStats] = useState<LiveStats>({
    totalVolunteers: 0,
    totalTasks: 0,
    pendingTasks: 0,
    verifiedTasks: 0,
    onLedgerSubmissions: 0,
  });

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Total volunteers
      const { count: volCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "volunteer");

      // 2. Task stats
      const { count: totalTaskCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true });

      const { count: pendingTaskCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: verifiedTaskCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "verified");

      // 3. Submissions on ledger
      const { count: ledgerCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("blockchain_status", "written");

      setStats({
        totalVolunteers: volCount || 0,
        totalTasks: totalTaskCount || 0,
        pendingTasks: pendingTaskCount || 0,
        verifiedTasks: verifiedTaskCount || 0,
        onLedgerSubmissions: ledgerCount || 0,
      });

      // 4. Fetch recent submission activity
      const { data: subData } = await supabase
        .from("submissions")
        .select(`
          id,
          submitted_at,
          ai_verdict,
          ai_confidence,
          blockchain_tx_hash,
          tasks ( title, district ),
          profiles:volunteer_id ( full_name )
        `)
        .order("submitted_at", { ascending: false })
        .limit(6);

      if (subData) {
        setActivities(subData as any);
      }
    } catch (err) {
      console.error("Error fetching coordinator stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Realtime subscriptions
  useEffect(() => {
    const tasksChannel = supabase
      .channel("coordinator-tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchDashboardData()
      )
      .subscribe();

    const subsChannel = supabase
      .channel("coordinator-subs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(subsChannel);
    };
  }, [fetchDashboardData]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#87A878]/30"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7C4A] mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C4973A] animate-pulse" />
            <span>AI-Verified Micro-Relief Network • Live Operational Matrix</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2D4A2D]">
            Coordinator Command Matrix
          </h1>
          <p className="text-sm text-[#6B7C4A] mt-1 max-w-2xl">
            Real-time verification telemetry, volunteer task dispatching, and field supply compliance across disaster-affected zones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/coordinator/verification"
            className="btn-gold px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Review Pending Proofs ({stats.pendingTasks})
          </Link>
          <Link
            href="/dashboard/coordinator/tasks"
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#2D4A2D] text-white hover:bg-[#1E331E] transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-[#C4973A]" />
            Dispatch New Task
          </Link>
        </div>
      </motion.div>

      {/* 4 Stat Cards Grid — Powered by Live Supabase Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Volunteers */}
        <div className="groundwork-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7C4A] font-medium">Active Volunteers</span>
            <div className="p-2 rounded-lg bg-[#2D4A2D]/10 text-[#2D4A2D]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#2D4A2D]">
            {loading ? "..." : stats.totalVolunteers}
          </p>
          <p className="text-[11px] text-[#6B7C4A]">Aapda Mitra Registered</p>
        </div>

        {/* Card 2: Total Tasks */}
        <div className="groundwork-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7C4A] font-medium">Field Tasks</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#2D4A2D]">
            {loading ? "..." : stats.totalTasks}
          </p>
          <p className="text-[11px] text-[#6B7C4A]">
            {stats.pendingTasks} Pending • {stats.verifiedTasks} Verified
          </p>
        </div>

        {/* Card 3: AI Verified Tasks */}
        <div className="groundwork-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7C4A] font-medium">Verified Fulfillments</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#2D4A2D]">
            {loading ? "..." : stats.verifiedTasks}
          </p>
          <p className="text-[11px] text-emerald-800 font-medium">Gemini AI Cleared</p>
        </div>

        {/* Card 4: Polygon Ledger Records */}
        <div className="groundwork-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7C4A] font-medium">Polygon Ledger</span>
            <div className="p-2 rounded-lg bg-[#8B5E3C]/15 text-[#8B5E3C]">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#2D4A2D]">
            {loading ? "..." : stats.onLedgerSubmissions}
          </p>
          <p className="text-[11px] text-[#6B7C4A]">Minted Transactions ⛓</p>
        </div>
      </div>

      {/* Main Grid: Live Activity Feed + District Response Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#2D4A2D]">
              Live Proof Telemetry Feed
            </h3>
            <button
              onClick={() => fetchDashboardData()}
              className="text-xs text-[#87A878] hover:text-[#2D4A2D] flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-[#87A878]/30 animate-pulse h-16" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#87A878]/30 text-center text-xs text-[#6B7C4A]">
              No verification submissions received yet. Live telemetry feed will appear here as volunteers submit proof.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-xl bg-white border border-[#87A878]/30 shadow-sm flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          act.ai_verdict === "verified"
                            ? "bg-emerald-100 text-emerald-800"
                            : act.ai_verdict === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {act.ai_verdict ? act.ai_verdict.toUpperCase() : "PENDING"}
                      </span>
                      <span className="text-[#6B7C4A]">
                        {act.profiles?.full_name || "Volunteer"}
                      </span>
                    </div>

                    <p className="font-semibold text-[#2D4A2D]">
                      {act.tasks?.title || "Relief Task Fulfillment"}
                    </p>

                    <p className="text-[11px] text-[#6B7C4A]">
                      {act.tasks?.district || "Relief Zone"} • AI Confidence:{" "}
                      {act.ai_confidence ? `${(act.ai_confidence * 100).toFixed(0)}%` : "N/A"}
                    </p>
                  </div>

                  {act.blockchain_tx_hash && (
                    <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] shrink-0">
                      ⛓ Minted
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Alert & District Summary Cards */}
        <div className="space-y-6">
          {/* Urgent AI Clearance Alert Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="groundwork-card p-5 bg-gradient-to-br from-white via-amber-50/40 to-white border-amber-300/60"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                AI Duplicate Warning
              </span>
              <span className="text-[11px] text-[#6B7C4A]">Active Guard</span>
            </div>

            <h4 className="font-serif font-semibold text-[#2D4A2D] text-base mb-1">
              Anomaly Defense Active
            </h4>
            <p className="text-xs text-[#2D4A2D]/80 leading-relaxed mb-4">
              Gemini Vision AI checks all proof submissions for recycled imagery, missing payload items, or facial mismatch before writing to Polygon ledger.
            </p>

            <Link
              href="/dashboard/coordinator/verification"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-[#2D4A2D] text-white hover:bg-[#1E331E] transition-colors"
            >
              Inspect Verification Queue
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C4973A]" />
            </Link>
          </motion.div>

          {/* Active Relief Sectors */}
          <div className="groundwork-card p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#87A878]/20">
              <h3 className="font-serif text-base font-semibold text-[#2D4A2D]">
                Active Relief Sectors
              </h3>
              <span className="text-xs text-[#6B7C4A]">14 Districts</span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: "Wayanad (Meppadi / Chooralmala)", status: "Critical", activeVolunteers: stats.totalVolunteers || 12, progress: 84 },
                { name: "Cachar & Silchar Hub", status: "High", activeVolunteers: 32, progress: 76 },
                { name: "Jorhat (Majuli Sector)", status: "High", activeVolunteers: 18, progress: 92 },
                { name: "Chamoli (High Altitude)", status: "Normal", activeVolunteers: 14, progress: 96 },
              ].map((sector) => (
                <div key={sector.name} className="p-2.5 rounded-lg bg-[#F5F0E8]/70 border border-[#87A878]/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2D4A2D]">{sector.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sector.status === "Critical"
                          ? "bg-rose-100 text-rose-800"
                          : sector.status === "High"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {sector.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7C4A]">
                    <span>{sector.activeVolunteers} active volunteers</span>
                    <span>{sector.progress}% fulfilled</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#87A878]/30 overflow-hidden">
                    <div
                      className="h-full bg-[#2D4A2D] rounded-full"
                      style={{ width: `${sector.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
