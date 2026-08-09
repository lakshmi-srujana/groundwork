"use client";

import { motion } from "framer-motion";
import { FileBarChart2, Download, ShieldCheck, PieChart, TrendingUp, CheckSquare } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { title: "Wayanad Landslide Micro-Relief Fulfillment Audit (July 2026)", size: "4.2 MB", date: "Aug 6, 2026", status: "Verified & Sealed" },
    { title: "Silchar Flood Water & ORS Supply Ledger Summary", size: "2.8 MB", date: "Aug 5, 2026", status: "Verified & Sealed" },
    { title: "AI Vision Receipt Discrepancy & Fraud Prevention Log", size: "1.5 MB", date: "Aug 4, 2026", status: "Internal Audit" },
    { title: "Chamoli Thermal Shelter & Blanket Distribution Telemetry", size: "3.1 MB", date: "Aug 1, 2026", status: "Verified & Sealed" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-6 border-b border-[#87A878]/30"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7C4A] mb-1">
          <FileBarChart2 className="w-4 h-4 text-[#C4973A]" />
          <span>Audit-Ready Relief Documentation & AI Ledger</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
          Relief Impact Reports
        </h1>
        <p className="text-sm text-[#6B7C4A] mt-1">
          Exportable, cryptographically signed fulfillment logs and transparency metrics for humanitarian partners.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="groundwork-card p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#2D4A2D]/10 text-[#2D4A2D] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {r.status}
                </span>
                <span className="text-xs text-[#6B7C4A]">{r.date}</span>
              </div>
              <h3 className="font-serif font-semibold text-[#2D4A2D] text-base mb-1">
                {r.title}
              </h3>
              <p className="text-xs text-[#6B7C4A]">Contains geotagged telemetry, receipt hashes, and volunteer sign-offs.</p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#87A878]/20 flex items-center justify-between">
              <span className="text-xs text-[#6B7C4A] font-mono">{r.size} • PDF format</span>
              <button className="btn-gold px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Download Report
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
