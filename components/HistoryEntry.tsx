"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Database,
  ExternalLink,
  Cpu,
  UserCheck,
  PackageCheck,
  Calendar,
} from "lucide-react";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";

interface SubmissionHistoryItem {
  id: string;
  submitted_at: string;
  photo_url?: string | null;
  ipfs_cid?: string | null;
  geolocation?: { lat: number; lng: number } | null;
  face_detected?: boolean;
  ai_verdict?: string | null;
  ai_confidence?: number | null;
  ai_notes?: string | null;
  blockchain_tx_hash?: string | null;
  blockchain_status?: string | null;
  tasks?: {
    title: string;
    item_name: string | null;
    quantity: number | null;
    district: string;
    ward: string | null;
  } | null;
}

export default function HistoryEntry({ item }: { item: SubmissionHistoryItem }) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = item.submitted_at
    ? new Date(item.submitted_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  const badgeStatus: StatusType =
    item.ai_verdict === "verified"
      ? "Verified"
      : item.ai_verdict === "rejected"
      ? "Rejected"
      : "Pending";

  return (
    <div className="rounded-2xl bg-white border border-[#87A878]/30 shadow-sm overflow-hidden transition-all">
      {/* Header Summary Row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F5F0E8]/40 transition-colors"
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <StatusBadge status={badgeStatus} size="sm" />
            <span className="text-[#6B7C4A] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          <h3 className="font-serif text-lg font-semibold text-[#2D4A2D] truncate">
            {item.tasks?.title || "Fulfillment Proof Submission"}
          </h3>

          <p className="text-xs text-[#6B7C4A] truncate">
            {item.tasks?.ward && `${item.tasks.ward}, `}
            {item.tasks?.district || "Relief Zone"}
            {item.tasks?.item_name &&
              ` • ${item.tasks.quantity}x ${item.tasks.item_name}`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {item.blockchain_tx_hash && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-[11px] hidden sm:inline-block">
              ⛓ On Ledger
            </span>
          )}
          <button className="p-1 rounded-lg text-[#6B7C4A]">
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#87A878]/20 bg-[#F5F0E8]/30 p-5 space-y-4 text-xs"
          >
            {/* Image Preview & AI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {item.photo_url && (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#87A878]/40 bg-black">
                  <img
                    src={item.photo_url}
                    alt="Proof Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`space-y-3 ${
                  item.photo_url ? "sm:col-span-2" : "sm:col-span-3"
                }`}
              >
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-white border border-[#87A878]/30 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#2D4A2D]" />
                    <div>
                      <p className="font-semibold text-[#2D4A2D]">Face Status</p>
                      <p className="text-[11px] text-[#6B7C4A]">
                        {item.face_detected ? "Detected" : "Not detected"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#87A878]/30 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-[#2D4A2D]" />
                    <div>
                      <p className="font-semibold text-[#2D4A2D]">AI Confidence</p>
                      <p className="text-[11px] text-[#6B7C4A]">
                        {item.ai_confidence
                          ? `${(item.ai_confidence * 100).toFixed(0)}%`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Notes */}
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
              </div>
            </div>

            {/* IPFS & Polygon Hash Links */}
            <div className="space-y-2 pt-2 border-t border-[#87A878]/20">
              {item.ipfs_cid && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#87A878]/30 font-mono text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    <Database className="w-3.5 h-3.5 text-[#87A878] shrink-0" />
                    <span className="truncate">CID: {item.ipfs_cid}</span>
                  </div>
                  {item.photo_url && (
                    <a
                      href={item.photo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#C4973A] hover:underline flex items-center gap-1 font-sans font-medium text-[11px] shrink-0 ml-2"
                    >
                      IPFS Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {item.blockchain_tx_hash && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    <span>⛓</span>
                    <span className="truncate">Tx: {item.blockchain_tx_hash}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-sans font-bold text-[10px] uppercase shrink-0 ml-2">
                    Verified Ledger
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
