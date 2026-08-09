"use client";

import { useState } from "react";
import { INITIAL_VERIFICATION_QUEUE, VerificationSubmission } from "@/lib/dummyData";
import VerificationCard from "@/components/ui/VerificationCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ShieldCheck, Sparkles, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default function VerificationQueuePage() {
  const [queue, setQueue] = useState<VerificationSubmission[]>(INITIAL_VERIFICATION_QUEUE);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleApprove = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Verified" } : item))
    );
  };

  const handleReject = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Rejected" } : item))
    );
  };

  const filteredQueue = queue.filter((item) => {
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Pending" && item.status === "Pending") ||
      (activeFilter === "Verified" && item.status === "Verified") ||
      (activeFilter === "Rejected" && item.status === "Rejected") ||
      (activeFilter === "Flagged" && item.aiConfidenceScore < 80);

    const matchesSearch =
      item.volunteerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.taskType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.wardOrZone.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = queue.filter((i) => i.status === "Pending").length;
  const verifiedCount = queue.filter((i) => i.status === "Verified").length;
  const rejectedCount = queue.filter((i) => i.status === "Rejected").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#87A878]/30"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C4973A] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#2D4A2D]" />
            <span>AI Geotag & Receipt Verification Engine</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
            Verification Queue
          </h1>
          <p className="text-sm text-[#6B7C4A] mt-1">
            Review volunteer proof of micro-relief distribution before final ledger clearance and distribution confirmation.
          </p>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-[#C4973A]/15 text-[#A37824] border border-[#C4973A]/40 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {pendingCount} Pending
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-[#2D4A2D]/10 text-[#2D4A2D] border border-[#2D4A2D]/30 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4A2D]" />
            {verifiedCount} Verified
          </span>
        </div>
      </motion.div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#87A878]/30 shadow-xs">
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "All", label: `All (${queue.length})` },
            { id: "Pending", label: `Pending (${pendingCount})` },
            { id: "Verified", label: `Verified (${verifiedCount})` },
            { id: "Rejected", label: `Rejected (${rejectedCount})` },
            { id: "Flagged", label: "Low AI Score (<80%)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? "bg-[#2D4A2D] text-white shadow-xs"
                  : "bg-[#F5F0E8] text-[#6B7C4A] hover:text-[#2D4A2D] hover:bg-[#87A878]/20"
              }`}
            >
              {tab.id === "Flagged" && (
                <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-500" />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#6B7C4A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search volunteer, district, task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-[#87A878]/40 bg-[#F5F0E8]/50 focus:bg-white focus:outline-none focus:border-[#2D4A2D] text-[#2D4A2D] placeholder-[#6B7C4A]"
          />
        </div>
      </div>

      {/* Grid of Verification Cards */}
      {filteredQueue.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredQueue.map((item, idx) => (
              <VerificationCard
                key={item.id}
                submission={item}
                index={idx}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="groundwork-card p-12 text-center text-[#6B7C4A]">
          <Sparkles className="w-8 h-8 text-[#C4973A] mx-auto mb-2 opacity-80" />
          <h3 className="font-serif text-lg font-semibold text-[#2D4A2D]">
            No Submissions Found
          </h3>
          <p className="text-xs mt-1">Try resetting search query or switching active tab filter.</p>
          <button
            onClick={() => {
              setActiveFilter("All");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold btn-gold inline-flex items-center gap-1.5"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
