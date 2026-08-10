"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";

interface TaskCardProps {
  title: string;
  description?: string | null;
  status: string;
  due_date?: string | null;
  task_id: string;
  is_self_pledged: boolean;
  item_name?: string | null;
  quantity?: number | null;
  district?: string | null;
  ward?: string | null;
}

export default function TaskCard({
  title,
  description,
  status,
  due_date,
  task_id,
  is_self_pledged,
  item_name,
  quantity,
  district,
  ward,
}: TaskCardProps) {
  // Map DB status to StatusBadge type
  const badgeStatus: StatusType =
    status === "verified"
      ? "Verified"
      : status === "submitted"
      ? "In Progress"
      : status === "rejected"
      ? "Rejected"
      : "Pending";

  const formattedDate = due_date
    ? new Date(due_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="p-6 rounded-2xl bg-white border border-[#87A878]/30 shadow-sm hover:border-[#87A878]/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="space-y-2 flex-1 min-w-0">
        {/* Badges row */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <StatusBadge status={badgeStatus} size="sm" />
          {is_self_pledged ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#6B7C4A]/15 text-[#6B7C4A] border border-[#6B7C4A]/30 font-semibold text-[11px]">
              Self-pledged
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-[#87A878]/15 text-[#87A878] border border-[#87A878]/30 font-semibold text-[11px]">
              Assigned
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-semibold text-[#2D4A2D] truncate">
          {title}
        </h3>

        {/* Details */}
        <div className="flex items-center gap-3 text-xs text-[#6B7C4A] flex-wrap">
          {(district || ward) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {ward && `${ward}, `}{district}
            </span>
          )}
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Due: {formattedDate}
            </span>
          )}
        </div>

        {/* Item info */}
        {item_name && quantity && (
          <p className="text-xs text-[#6B7C4A]">
            Cargo:{" "}
            <span className="font-medium text-[#2D4A2D]">
              {quantity}x {item_name}
            </span>
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-[#6B7C4A] line-clamp-2">{description}</p>
        )}
      </div>

      {/* CTA */}
      {status !== "verified" && status !== "rejected" && (
        <Link
          href={`/dashboard/volunteer/submit?taskId=${task_id}`}
          className="btn-gold px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
        >
          Submit Proof
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </motion.div>
  );
}
