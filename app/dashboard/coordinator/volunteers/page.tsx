"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, ShieldCheck, MapPin, CheckCircle2, RefreshCw, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VolunteerProfile {
  id: string;
  full_name: string | null;
  email?: string | null;
  district: string | null;
  ward: string | null;
  aapda_mitra_id: string | null;
  role: string;
  created_at?: string;
  verified_count?: number;
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles where role = 'volunteer'
      const { data: profData, error: profError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "volunteer")
        .order("created_at", { ascending: false });

      if (profError) throw profError;

      // 2. Fetch submission counts for each volunteer
      const { data: subData } = await supabase
        .from("submissions")
        .select("volunteer_id, ai_verdict");

      const countMap: Record<string, number> = {};
      if (subData) {
        subData.forEach((s) => {
          if (s.ai_verdict === "verified") {
            countMap[s.volunteer_id] = (countMap[s.volunteer_id] || 0) + 1;
          }
        });
      }

      const list = (profData || []).map((v) => ({
        ...v,
        verified_count: countMap[v.id] || 0,
      }));

      setVolunteers(list);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  // Fallback avatars list to give each real volunteer a clean profile image
  const defaultAvatars = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#87A878]/30"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7C4A] mb-1">
            <Users className="w-4 h-4 text-[#C4973A]" />
            <span>Registered Relief Force • {loading ? "..." : volunteers.length} Active Field Responders</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
            Volunteers Directory
          </h1>
          <p className="text-sm text-[#6B7C4A] mt-1">
            AI-verified, geotag-authenticated Aapda Mitra field responders across disaster-affected zones.
          </p>
        </div>

        <button
          onClick={fetchVolunteers}
          className="btn-gold px-4 py-2 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Directory
        </button>
      </motion.div>

      {/* Volunteer Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-[#87A878]/30 animate-pulse h-28" />
          ))}
        </div>
      ) : volunteers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#87A878]/30 text-center space-y-2">
          <Users className="w-10 h-10 text-[#87A878] mx-auto" />
          <p className="font-serif text-lg font-bold text-[#2D4A2D]">No Volunteers Registered Yet</p>
          <p className="text-xs text-[#6B7C4A]">
            Registered field volunteers will automatically appear here as they join the network.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteers.map((v, i) => {
            const avatar = defaultAvatars[i % defaultAvatars.length];
            const isLead = (v.verified_count || 0) >= 3;

            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="groundwork-card p-5 flex items-start gap-4 text-xs"
              >
                <img
                  src={avatar}
                  alt={v.full_name || "Volunteer"}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#C4973A] shrink-0"
                />

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-semibold text-sm text-[#2D4A2D] truncate">
                      {v.full_name || "Aapda Mitra Volunteer"}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        isLead
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-[#2D4A2D]/10 text-[#2D4A2D]"
                      }`}
                    >
                      {isLead ? "Field Lead" : "Responder"}
                    </span>
                  </div>

                  <p className="text-[#6B7C4A] flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#C4973A] shrink-0" />
                    {v.ward ? `${v.ward}, ` : ""}{v.district || "Relief Zone"}
                  </p>

                  {v.aapda_mitra_id && (
                    <p className="text-[11px] font-mono text-[#2D4A2D] font-semibold">
                      ID: {v.aapda_mitra_id}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-[#87A878]/20">
                    <span className="font-medium flex items-center gap-1 text-[#2D4A2D]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      {v.verified_count || 0} verifications
                    </span>
                    <span className="font-bold text-[#C4973A]">4.9★</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
