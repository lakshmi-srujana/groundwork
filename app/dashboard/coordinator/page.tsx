"use client";

import { OVERVIEW_STATS, RECENT_ACTIVITIES } from "@/lib/dummyData";
import StatCard from "@/components/ui/StatCard";
import ActivityFeed from "@/components/ui/ActivityFeed";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, ArrowUpRight, Sparkles, Filter, RefreshCw, Send } from "lucide-react";
import Link from "next/link";

export default function CoordinatorOverviewPage() {
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
            <span className="w-2 h-2 rounded-full bg-[#C4973A] animate-ping" />
            <span>AI-Verified Micro-Relief Network • Wayanad & Northeast Disaster Operations</span>
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
            Review 38 Pending Proofs
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

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {OVERVIEW_STATS.map((stat, idx) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            subtitle={stat.subtitle}
            iconName={stat.iconName}
            index={idx}
          />
        ))}
      </div>

      {/* Main Grid: Activity Feed + District Response Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activity Feed (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          <ActivityFeed activities={RECENT_ACTIVITIES} />
        </div>

        {/* Right Column: AI Alert & District Summary Cards */}
        <div className="space-y-6">
          {/* Urgent AI Clearance Alert Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="groundwork-card p-5 bg-gradient-to-br from-white via-amber-50/40 to-white border-amber-300/60"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                AI Duplicate Warning
              </span>
              <span className="text-[11px] text-[#6B7C4A]">22m ago</span>
            </div>

            <h4 className="font-serif font-semibold text-[#2D4A2D] text-base mb-1">
              Hailakandi Receipt Anomaly
            </h4>
            <p className="text-xs text-[#2D4A2D]/80 leading-relaxed mb-4">
              AI Vision detected potential duplicate image submission for 100x Rice Ration Bags. Manual verification recommended.
            </p>

            <Link
              href="/dashboard/coordinator/verification"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-[#2D4A2D] text-white hover:bg-[#1E331E] transition-colors"
            >
              Inspect Anomaly Queue
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
                { name: "Wayanad (Meppadi / Chooralmala)", status: "Critical", activeVolunteers: 412, progress: 84 },
                { name: "Cachar & Silchar Hub", status: "High", activeVolunteers: 320, progress: 76 },
                { name: "Jorhat (Majuli Sector)", status: "High", activeVolunteers: 184, progress: 92 },
                { name: "Chamoli (High Altitude)", status: "Normal", activeVolunteers: 142, progress: 96 },
                { name: "Malappuram Bypass", status: "Normal", activeVolunteers: 226, progress: 100 },
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

                  {/* Progress Bar */}
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
