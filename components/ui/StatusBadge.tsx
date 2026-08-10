import React from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export type StatusType = "Verified" | "Pending" | "Rejected" | "In Progress" | "verified" | "pending" | "rejected" | "flagged";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let bgStyle = "";
  let textStyle = "";
  let borderStyle = "";
  let Icon = Clock;
  let label: string = status;

  if (normalized === "verified") {
    bgStyle = "bg-[#2D4A2D]/10";
    textStyle = "text-[#2D4A2D]";
    borderStyle = "border-[#2D4A2D]/30";
    Icon = CheckCircle2;
    label = "Verified";
  } else if (normalized === "pending") {
    bgStyle = "bg-[#C4973A]/15";
    textStyle = "text-[#A37824]";
    borderStyle = "border-[#C4973A]/40";
    Icon = Clock;
    label = "Pending";
  } else if (normalized === "rejected") {
    bgStyle = "bg-rose-100";
    textStyle = "text-rose-800";
    borderStyle = "border-rose-300";
    Icon = XCircle;
    label = "Rejected";
  } else if (normalized === "in progress") {
    bgStyle = "bg-[#6B7C4A]/15";
    textStyle = "text-[#6B7C4A]";
    borderStyle = "border-[#6B7C4A]/40";
    Icon = RefreshCw;
    label = "In Progress";
  } else if (normalized === "flagged") {
    bgStyle = "bg-amber-100";
    textStyle = "text-amber-800";
    borderStyle = "border-amber-300";
    Icon = AlertCircle;
    label = "AI Flagged";
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bgStyle} ${textStyle} ${borderStyle} ${padding} ${className}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{label}</span>
    </span>
  );
}
