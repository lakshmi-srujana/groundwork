"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, Layers, ArrowRight, MapPin, CheckCircle2, History, Send } from "lucide-react";

export default function VolunteerDashboardPage() {
  const volunteerTasks = [
    {
      id: "task-1",
      title: "Deliver 50 Potable Water Canisters",
      location: "Ward 7, Meppadi Relief Hub",
      district: "Wayanad, Kerala",
      deadline: "Today, 5:00 PM",
      status: "In Progress",
      items: "50x 20L Water Drums",
    },
    {
      id: "task-2",
      title: "Distribute ORS & First Aid Packets",
      location: "Chooralmala Sector B Camp",
      district: "Wayanad, Kerala",
      deadline: "Today, 6:30 PM",
      status: "Pending Proof",
      items: "120 Units First Aid",
    },
    {
      id: "task-3",
      title: "Inspect Heavy-Duty Tarpaulin Drop",
      location: "Riverbank Shelter Line 4",
      district: "Wayanad, Kerala",
      deadline: "Tomorrow, 10:00 AM",
      status: "Assigned",
      items: "30x Waterproof Tarps",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2D4A2D] flex flex-col font-sans">
      {/* Forest Green Navbar with Gold Groundwork Wordmark */}
      <header className="bg-[#2D4A2D] text-[#F5F0E8] px-6 py-4 border-b border-[#87A878]/30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src="/seal.png" alt="Seal" fill className="object-contain" />
            </div>
            <Link href="/" className="font-serif text-xl font-bold tracking-widest text-[#C4973A] hover:text-[#d4a84b]">
              GROUNDWORK
            </Link>
            <span className="hidden sm:inline-block text-xs text-[#87A878] border-l border-[#87A878]/30 pl-3">
              Volunteer Field Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/dashboard/volunteer/history"
              className="flex items-center gap-1.5 text-[#87A878] hover:text-white transition-colors"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>

            <Link
              href="/dashboard/coordinator"
              className="px-3 py-1.5 rounded-lg bg-[#C4973A]/20 text-[#C4973A] border border-[#C4973A]/40 hover:bg-[#C4973A]/30 transition-colors font-semibold"
            >
              Coordinator View
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Greeting Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#87A878]/30"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7C4A] mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#87A878] animate-pulse" />
              <span>Active Duty • Wayanad Relief Zone #7</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2D4A2D]">
              Good morning, Meera.
            </h1>
            <p className="text-sm text-[#6B7C4A] mt-1">
              You have 3 active relief tasks assigned today. Capture photo telemetry to mint verified ledger records.
            </p>
          </div>

          <Link
            href="/dashboard/volunteer/submit"
            className="btn-gold px-5 py-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-md self-start md:self-auto"
          >
            <Send className="w-4 h-4" />
            Submit Proof →
          </Link>
        </motion.div>

        {/* Status Bar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#87A878]/30 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-[#2D4A2D]">12</p>
              <p className="text-xs text-[#6B7C4A] font-medium">Verified Tasks</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#87A878]/30 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-800">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-[#2D4A2D]">3</p>
              <p className="text-xs text-[#6B7C4A] font-medium">Pending Proof Review</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#87A878]/30 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#2D4A2D]/10 text-[#2D4A2D]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-[#2D4A2D]">15</p>
              <p className="text-xs text-[#6B7C4A] font-medium">On Immutable Ledger</p>
            </div>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#2D4A2D]">
              Assigned Field Tasks
            </h2>
            <span className="text-xs text-[#6B7C4A]">3 Tasks Active</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {volunteerTasks.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ y: -2 }}
                className="p-6 rounded-2xl bg-white border border-[#87A878]/30 shadow-sm hover:border-[#87A878]/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#87A878]/20 text-[#2D4A2D] font-semibold">
                      {task.status}
                    </span>
                    <span className="text-[#6B7C4A] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {task.location} ({task.district})
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#2D4A2D]">
                    {task.title}
                  </h3>

                  <p className="text-xs text-[#6B7C4A]">
                    Cargo / Payload: <span className="font-medium text-[#2D4A2D]">{task.items}</span> • Target Deadline: {task.deadline}
                  </p>
                </div>

                <Link
                  href="/dashboard/volunteer/submit"
                  className="btn-gold px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
                >
                  Submit Proof →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
