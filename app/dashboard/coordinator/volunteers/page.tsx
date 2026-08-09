"use client";

import { motion } from "framer-motion";
import { Users, ShieldCheck, MapPin, Award, CheckCircle2 } from "lucide-react";

export default function VolunteersPage() {
  const volunteers = [
    { name: "Meera R.", location: "Wayanad (Meppadi)", verified: 48, rating: "4.95 ★", badge: "Field Lead", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" },
    { name: "Rajesh Kumar", location: "Cachar (Silchar)", verified: 92, rating: "4.98 ★", badge: "Senior Responder", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
    { name: "Priya Nair", location: "Wayanad (Chooralmala)", verified: 34, rating: "4.89 ★", badge: "Medical Lead", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150" },
    { name: "Suresh Patel", location: "Jorhat (Majuli)", verified: 61, rating: "4.92 ★", badge: "Logistics Specialist", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
    { name: "Tenzin Dorjee", location: "Chamoli (Joshimath)", verified: 29, rating: "4.90 ★", badge: "Alpine Rescue", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150" },
    { name: "Amina Begum", location: "Silchar Hub", verified: 55, rating: "4.96 ★", badge: "Pediatric Relief", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-6 border-b border-[#87A878]/30"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7C4A] mb-1">
          <Users className="w-4 h-4 text-[#C4973A]" />
          <span>Registered Relief Force • 1,284 Volunteers</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#2D4A2D]">
          Volunteers Directory
        </h1>
        <p className="text-sm text-[#6B7C4A] mt-1">
          AI-verified, geotag-authenticated field responders across India's active disaster units.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {volunteers.map((v, i) => (
          <motion.div
            key={v.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="groundwork-card p-5 flex items-center gap-4"
          >
            <img
              src={v.avatar}
              alt={v.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#C4973A]"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[#2D4A2D]">{v.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#2D4A2D]/10 text-[#2D4A2D] font-bold">
                  {v.badge}
                </span>
              </div>
              <p className="text-xs text-[#6B7C4A] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#C4973A]" />
                {v.location}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#2D4A2D]">
                <span className="font-medium flex items-center gap-1 text-[#2D4A2D]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4A2D]" />
                  {v.verified} verifications
                </span>
                <span className="font-bold text-[#C4973A]">{v.rating}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
