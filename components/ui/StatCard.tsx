"use client";

import { motion } from "framer-motion";
import { Users, CheckCircle2, Clock, MapPin, ArrowUpRight, ShieldCheck } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StatCardProps {
  label: string;
  value: number;
  change: string;
  subtitle: string;
  iconName: string;
  index?: number;
}

export default function StatCard({
  label,
  value,
  change,
  subtitle,
  iconName,
  index = 0,
}: StatCardProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case "Users":
        return <Users className="w-5 h-5 text-[#2D4A2D]" />;
      case "CheckCircle2":
        return <CheckCircle2 className="w-5 h-5 text-[#2D4A2D]" />;
      case "Clock":
        return <Clock className="w-5 h-5 text-[#C4973A]" />;
      case "MapPin":
        return <MapPin className="w-5 h-5 text-[#6B7C4A]" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-[#2D4A2D]" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="groundwork-card p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C4A]">
          {label}
        </span>
        <div className="w-9 h-9 rounded-lg bg-[#F5F0E8] border border-[#87A878]/30 flex items-center justify-center">
          {getIcon(iconName)}
        </div>
      </div>

      <div>
        <div className="text-3xl font-serif font-semibold text-[#2D4A2D] tracking-tight mb-1">
          <AnimatedCounter value={value} duration={1.4 + index * 0.1} />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#87A878]/15 text-[#2D4A2D] font-medium">
            <ArrowUpRight className="w-3 h-3" />
            {change}
          </span>
          <span className="text-[#6B7C4A] truncate">{subtitle}</span>
        </div>
      </div>
    </motion.div>
  );
}
