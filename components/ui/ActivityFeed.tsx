"use client";

import { motion } from "framer-motion";
import { ActivityItem } from "@/lib/dummyData";
import StatusBadge from "./StatusBadge";
import { Camera, Send, ShieldAlert, CheckCheck, MapPin } from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActionIcon = (category: string) => {
    switch (category) {
      case "photo_proof":
        return <Camera className="w-3.5 h-3.5 text-[#2D4A2D]" />;
      case "dispatch":
        return <Send className="w-3.5 h-3.5 text-[#6B7C4A]" />;
      case "flag":
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />;
      default:
        return <CheckCheck className="w-3.5 h-3.5 text-[#2D4A2D]" />;
    }
  };

  return (
    <div className="groundwork-card p-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#87A878]/20">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[#2D4A2D]">
            Live Relief Feed
          </h3>
          <p className="text-xs text-[#6B7C4A]">Real-time field updates from active units</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#87A878]/20 text-xs text-[#2D4A2D] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          Live Stream
        </span>
      </div>

      <div className="space-y-4">
        {activities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-[#F5F0E8]/70 transition-colors border border-transparent hover:border-[#87A878]/20"
          >
            {/* Volunteer Avatar with Badge */}
            <div className="relative flex-shrink-0">
              <img
                src={item.volunteerAvatar}
                alt={item.volunteerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-xs border border-[#87A878]/30 flex items-center justify-center">
                {getActionIcon(item.taskCategory)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-[#2D4A2D] truncate">
                  {item.volunteerName}
                </h4>
                <span className="text-[11px] text-[#6B7C4A] flex-shrink-0">
                  {item.timestamp}
                </span>
              </div>

              <p className="text-xs text-[#2D4A2D]/80 leading-relaxed mt-0.5">
                {item.action}
              </p>

              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="inline-flex items-center gap-1 text-[#6B7C4A]">
                  <MapPin className="w-3 h-3 text-[#C4973A]" />
                  {item.location}, <strong className="text-[#2D4A2D]">{item.district}</strong>
                </span>

                {item.confidenceScore && (
                  <span className="inline-flex items-center text-[11px] text-[#6B7C4A] bg-white px-2 py-0.5 rounded border border-[#87A878]/30">
                    AI Match: <span className="font-semibold ml-1 text-[#2D4A2D]">{item.confidenceScore}%</span>
                  </span>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0 self-center">
              <StatusBadge status={item.status} size="sm" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
