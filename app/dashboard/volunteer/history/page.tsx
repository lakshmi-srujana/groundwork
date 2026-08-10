"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Layers } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import HistoryEntry from "@/components/HistoryEntry";

interface Submission {
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

export default function SubmissionHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchHistory() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("submissions")
          .select(`
            *,
            tasks (
              title,
              item_name,
              quantity,
              district,
              ward
            )
          `)
          .eq("volunteer_id", user?.id || "")
          .order("submitted_at", { ascending: false });

        if (error) throw error;
        setSubmissions(data || []);
      } catch (err) {
        console.error("Error fetching submission history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#87A878]/30" />
          <div className="h-4 w-32 bg-[#87A878]/30 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2D4A2D] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#2D4A2D] text-[#F5F0E8] px-6 py-4 border-b border-[#87A878]/30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard/volunteer"
            className="flex items-center gap-2 text-xs text-[#87A878] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6">
              <Image src="/seal.png" alt="Seal" fill sizes="32px" className="object-contain" />
            </div>
            <span className="font-serif text-lg text-[#C4973A] font-bold tracking-wider">
              GROUNDWORK
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
            Submission History & Ledger Trail
          </h1>
          <p className="text-xs text-[#6B7C4A] mt-1">
            Your verified relief contributions minted onto the Groundwork immutable ledger.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-[#87A878]/30 animate-pulse h-24"
              />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#87A878]/30 p-8 space-y-3">
            <Layers className="w-10 h-10 text-[#87A878] mx-auto" />
            <p className="font-serif text-lg font-semibold text-[#2D4A2D]">
              No Submissions Yet
            </p>
            <p className="text-xs text-[#6B7C4A] max-w-sm mx-auto">
              Complete a task and submit photo telemetry to generate your immutable ledger record.
            </p>
            <Link
              href="/dashboard/volunteer"
              className="inline-block btn-gold px-5 py-2.5 text-xs font-semibold rounded-xl shadow-md mt-2"
            >
              View Active Tasks →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <HistoryEntry key={sub.id} item={sub} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
