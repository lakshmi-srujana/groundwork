"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Database,
  ExternalLink,
  Cpu,
  UserCheck,
  PackageCheck,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";

interface SubmissionQueueItem {
  id: string;
  submitted_at: string;
  photo_url?: string | null;
  photo_base64?: string | null;
  ipfs_cid?: string | null;
  geolocation?: { lat: number; lng: number } | null;
  face_detected?: boolean;
  ai_verdict?: string | null;
  ai_confidence?: number | null;
  ai_notes?: string | null;
  blockchain_tx_hash?: string | null;
  blockchain_status?: string | null;
  task_id: string;
  volunteer_id: string;
  tasks?: {
    title: string;
    item_name: string | null;
    quantity: number | null;
    district: string;
    ward: string | null;
  } | null;
  profiles?: {
    full_name: string | null;
    aapda_mitra_id: string | null;
  } | null;
}

export default function VerificationQueuePage() {
  const [queue, setQueue] = useState<SubmissionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          *,
          tasks ( id, title, item_name, quantity, district, ward ),
          profiles:volunteer_id ( full_name, aapda_mitra_id )
        `)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setQueue(data || []);
    } catch (err) {
      console.error("Error fetching verification queue:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("coordinator-verification-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => fetchQueue()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQueue]);

  // Approve submission
  const handleApprove = async (item: SubmissionQueueItem) => {
    setActionLoading(item.id);
    try {
      // Update submission AI verdict & status
      await supabase
        .from("submissions")
        .update({ ai_verdict: "verified" })
        .eq("id", item.id);

      // Update task status
      await supabase
        .from("tasks")
        .update({ status: "verified" })
        .eq("id", item.task_id);

      // Write to blockchain if not yet written
      if (item.blockchain_status !== "written") {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const bcRes = await fetch(`${backendUrl}/write-blockchain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            volunteer_id: item.volunteer_id,
            task_id: item.task_id,
            ipfs_cid: item.ipfs_cid || "bafybeig-mock",
            verdict: "verified",
          }),
        });

        if (bcRes.ok) {
          const bcData = await bcRes.json();
          await supabase
            .from("submissions")
            .update({
              blockchain_tx_hash: bcData.tx_hash,
              blockchain_status: "written",
            })
            .eq("id", item.id);
        }
      }

      fetchQueue();
    } catch (err) {
      console.error("Error approving submission:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject submission
  const handleReject = async (item: SubmissionQueueItem) => {
    setActionLoading(item.id);
    try {
      await supabase
        .from("submissions")
        .update({ ai_verdict: "rejected" })
        .eq("id", item.id);

      await supabase
        .from("tasks")
        .update({ status: "rejected" })
        .eq("id", item.task_id);

      fetchQueue();
    } catch (err) {
      console.error("Error rejecting submission:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredQueue = queue.filter((item) => {
    const verdict = item.ai_verdict?.toLowerCase() || "pending";
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Pending" && verdict === "uncertain") ||
      (activeFilter === "Verified" && verdict === "verified") ||
      (activeFilter === "Rejected" && verdict === "rejected") ||
      (activeFilter === "Flagged" && (item.ai_confidence || 1) < 0.8);

    const matchesSearch =
      (item.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tasks?.district || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tasks?.title || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = queue.filter((i) => i.ai_verdict === "uncertain" || !i.ai_verdict).length;
  const verifiedCount = queue.filter((i) => i.ai_verdict === "verified").length;
  const rejectedCount = queue.filter((i) => i.ai_verdict === "rejected").length;

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
            <span>AI Geotag & Telemetry Review Queue</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
            Verification & Audit Queue
          </h1>
          <p className="text-sm text-[#6B7C4A] mt-1">
            Inspect AI Vision telemetry results, review proof imagery, and authorize Polygon blockchain ledger minting.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="btn-gold px-4 py-2 text-xs font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Queue
        </button>
      </motion.div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-[#2D4A2D]/10 p-1 rounded-xl border border-[#87A878]/20 text-xs font-medium">
          {["All", "Pending", "Verified", "Rejected", "Flagged"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === filter
                  ? "bg-[#2D4A2D] text-white shadow-sm font-semibold"
                  : "text-[#6B7C4A] hover:text-[#2D4A2D]"
              }`}
            >
              {filter}
              {filter === "Pending" && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#C4973A] text-white text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 text-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7C4A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search volunteer, district..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#87A878]/40 bg-white text-[#2D4A2D] focus:outline-none focus:border-[#2D4A2D]"
          />
        </div>
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-[#87A878]/30 animate-pulse h-32" />
          ))}
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#87A878]/30 p-8 space-y-2 text-xs text-[#6B7C4A]">
          <ShieldCheck className="w-10 h-10 text-[#87A878] mx-auto" />
          <p className="font-semibold text-sm text-[#2D4A2D]">No Submissions in Queue</p>
          <p>No proof submissions match your current filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueue.map((item) => {
            const badgeStatus: StatusType =
              item.ai_verdict === "verified"
                ? "Verified"
                : item.ai_verdict === "rejected"
                ? "Rejected"
                : "Pending";

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-[#87A878]/30 shadow-sm space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={badgeStatus} size="sm" />
                      <span className="font-semibold text-[#2D4A2D]">
                        {item.profiles?.full_name || "Volunteer"}
                      </span>
                      {item.profiles?.aapda_mitra_id && (
                        <span className="text-[#6B7C4A] font-mono text-[11px]">
                          ({item.profiles.aapda_mitra_id})
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#2D4A2D]">
                      {item.tasks?.title || "Relief Task Fulfillment"}
                    </h3>
                    <p className="text-[#6B7C4A]">
                      {item.tasks?.ward && `${item.tasks.ward}, `}
                      {item.tasks?.district || "Disaster Zone"}
                      {item.tasks?.item_name &&
                        ` • ${item.tasks.quantity}x ${item.tasks.item_name}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {item.ai_verdict !== "verified" && (
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={actionLoading === item.id}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {actionLoading === item.id ? "Processing..." : "Approve & Mint"}
                      </button>
                    )}
                    {item.ai_verdict !== "rejected" && (
                      <button
                        onClick={() => handleReject(item)}
                        disabled={actionLoading === item.id}
                        className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#87A878]/20">
                  {(() => {
                    const imgSrc = item.photo_base64
                      ? `data:image/jpeg;base64,${item.photo_base64}`
                      : item.photo_url && !item.photo_url.startsWith("ipfs://") && item.photo_url !== "#"
                      ? item.photo_url
                      : null;
                    return imgSrc ? (
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#2D4A2D]/10 border border-[#87A878]/30">
                        <img
                          src={imgSrc}
                          alt="Proof Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#2D4A2D]/10 border border-[#87A878]/30 flex items-center justify-center">
                        <p className="text-[11px] text-[#6B7C4A] text-center px-2">No proof image stored</p>
                      </div>
                    );
                  })()}

                  <div className={`space-y-3 ${(item.photo_base64 || item.photo_url) ? "md:col-span-2" : "md:col-span-3"}`}>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-[#F5F0E8]/50 border border-[#87A878]/20 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#2D4A2D]" />
                        <div>
                          <p className="font-semibold text-[#2D4A2D]">Face Status</p>
                          <p className="text-[11px] text-[#6B7C4A]">
                            {item.face_detected ? "Confirmed present" : "No face in frame"}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F5F0E8]/50 border border-[#87A878]/20 flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-[#2D4A2D]" />
                        <div>
                          <p className="font-semibold text-[#2D4A2D]">AI Vision Score</p>
                          <p className="text-[11px] text-[#6B7C4A]">
                            {item.ai_confidence
                              ? `${(item.ai_confidence * 100).toFixed(0)}% Confidence`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {item.ai_notes && (
                      <div className="p-3 rounded-xl bg-[#2D4A2D]/5 border border-[#87A878]/20 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[#2D4A2D]">
                          <Cpu className="w-3.5 h-3.5 text-[#C4973A]" />
                          <span>Gemini Vision AI Analysis</span>
                        </div>
                        <p className="text-[#6B7C4A] text-[11px] leading-relaxed">
                          {item.ai_notes}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                      {item.ipfs_cid && (
                        <span className="px-2.5 py-1 rounded bg-[#2D4A2D]/5 border border-[#87A878]/20 text-[#2D4A2D] flex items-center gap-1 truncate">
                          <Database className="w-3 h-3 text-[#87A878]" />
                          IPFS: {item.ipfs_cid}
                        </span>
                      )}
                      {item.blockchain_tx_hash && (
                        <span className="px-2.5 py-1 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold">
                          ⛓ Polygon Tx: {item.blockchain_tx_hash}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
