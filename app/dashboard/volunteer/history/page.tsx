"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, CheckCircle2, ShieldCheck, MapPin, Clock } from "lucide-react";

export default function SubmissionHistoryPage() {
  const historyItems = [
    {
      id: "HIST-01",
      task: "50 Potable Water Drums",
      date: "Today, 14:18 IST",
      location: "Meppadi Ward 7",
      status: "AI Verified (98%)",
      txHash: "0x89f...31a",
    },
    {
      id: "HIST-02",
      task: "120 Emergency ORS Packs",
      date: "Yesterday, 16:40 IST",
      location: "Chooralmala Camp",
      status: "AI Verified (99%)",
      txHash: "0x4b2...89c",
    },
    {
      id: "HIST-03",
      task: "30 Heavy Tarpaulin Sheets",
      date: "3 days ago",
      location: "Silchar Hub",
      status: "AI Verified (95%)",
      txHash: "0x71a...94f",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2D4A2D] flex flex-col font-sans">
      <header className="bg-[#2D4A2D] text-[#F5F0E8] px-6 py-4 border-b border-[#87A878]/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard/volunteer"
            className="flex items-center gap-2 text-xs text-[#87A878] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Volunteer Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6">
              <Image src="/seal.png" alt="Seal" fill className="object-contain" />
            </div>
            <span className="font-serif text-lg text-[#C4973A] font-bold">GROUNDWORK</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
            Submission History & Ledger Trail
          </h1>
          <p className="text-xs text-[#6B7C4A] mt-1">
            Your verified relief contributions minted onto the Groundwork immutable ledger.
          </p>
        </div>

        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-[#87A878]/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {item.status}
                  </span>
                  <span className="text-[#6B7C4A] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#2D4A2D]">
                  {item.task}
                </h3>
                <p className="text-xs text-[#6B7C4A] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.location}
                </p>
              </div>

              <div className="text-right text-xs font-mono bg-[#2D4A2D]/5 p-2.5 rounded-lg border border-[#87A878]/20 self-start sm:self-auto">
                <span className="text-[#6B7C4A] block text-[10px]">Ledger Block Tx</span>
                <span className="text-[#2D4A2D] font-bold">{item.txHash}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
