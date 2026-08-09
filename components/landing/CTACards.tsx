"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface CTACardsProps {
  isVisible?: boolean;
}

export const CTACards: React.FC<CTACardsProps> = ({ isVisible = true }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="flex flex-col md:flex-row gap-6 justify-center items-stretch w-full max-w-4xl px-2"
    >
      {/* Volunteer Card */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25)" }}
        className="flex-1 rounded-2xl p-8 bg-[#F5F0E8] text-[#2D4A2D] cursor-pointer flex flex-col justify-between transition-shadow border border-[#87A878]/20"
      >
        <Link href="/auth/signup?role=volunteer" className="flex flex-col h-full justify-between gap-6 group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 rounded-xl bg-[#87A878]/15 text-[#2D4A2D]">
                {/* Humanitarian Hand / Person SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  <path d="M12 5v14" />
                </svg>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C4A] bg-[#6B7C4A]/10 px-3 py-1 rounded-full">
                Field Duty
              </span>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-normal text-[#2D4A2D] mb-2 group-hover:text-[#6B7C4A] transition-colors">
              Join as Volunteer
            </h3>

            <p className="font-sans text-sm text-[#6B7C4A] leading-relaxed mb-4">
              Log tasks. Capture proof. Build your verified record.
            </p>

            <p className="font-sans text-xs text-[#6B7C4A]/80 bg-[#2D4A2D]/5 p-3 rounded-lg border border-[#6B7C4A]/15 leading-relaxed">
              Volunteers see their tasks, submit photo proof, and build a blockchain-verified record.
            </p>
          </div>

          <div className="pt-4 border-t border-[#87A878]/30 flex items-center justify-between">
            <span className="font-sans text-xs text-[#87A878] font-medium hover:underline">
              Already have an account? Sign in →
            </span>
          </div>
        </Link>
      </motion.div>

      {/* Coordinator Card */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.35)" }}
        className="flex-1 rounded-2xl p-8 bg-[#C4973A] text-[#F5F0E8] cursor-pointer flex flex-col justify-between transition-shadow border border-[#C4973A]/40"
      >
        <Link href="/auth/signup?role=coordinator" className="flex flex-col h-full justify-between gap-6 group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 rounded-xl bg-[#F5F0E8]/15 text-[#F5F0E8]">
                {/* Clipboard / Organization SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="m9 14 2 2 4-4" />
                </svg>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F5F0E8]/90 bg-[#F5F0E8]/20 px-3 py-1 rounded-full">
                Command & Roster
              </span>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-normal text-[#F5F0E8] mb-2 group-hover:text-white transition-colors">
              I’m a Coordinator
            </h3>

            <p className="font-sans text-sm text-[#F5F0E8]/85 leading-relaxed mb-4">
              Manage volunteers. Verify impact. Trust the roster.
            </p>

            <p className="font-sans text-xs text-[#F5F0E8]/75 bg-[#F5F0E8]/10 p-3 rounded-lg border border-[#F5F0E8]/20 leading-relaxed">
              Coordinators deploy field units, audit proof submissions, and orchestrate regional micro-relief.
            </p>
          </div>

          <div className="pt-4 border-t border-[#F5F0E8]/30 flex items-center justify-between">
            <span className="font-sans text-xs text-[#F5F0E8]/80 font-medium hover:underline">
              Already have an account? Sign in →
            </span>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default CTACards;
