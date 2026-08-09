"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatsBarProps {
  isVisible?: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ isVisible = true }) => {
  return (
    <>
      <style>{`
        @keyframes goldBorderPulse {
          0%, 100% {
            border-color: rgba(196, 151, 58, 0.5);
            box-shadow: 0 0 0 0 rgba(196, 151, 58, 0.3);
          }
          50% {
            border-color: rgba(196, 151, 58, 1);
            box-shadow: 0 0 16px 3px rgba(196, 151, 58, 0.55);
          }
        }
        .animate-gold-pulse {
          animation: goldBorderPulse 2s infinite ease-in-out;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-6 md:mt-10 flex flex-wrap justify-center items-center gap-3 md:gap-4 max-w-4xl"
      >
        {/* Pill 1 */}
        <div className="px-4 py-2 rounded-full bg-[#6B7C4A]/20 border border-[#6B7C4A]/40 backdrop-blur-sm text-[#F5F0E8] font-sans text-xs md:text-sm font-medium tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#87A878]"></span>
          1,00,000+ Volunteers Trained
        </div>

        {/* Pill 2 */}
        <div className="px-4 py-2 rounded-full bg-[#6B7C4A]/20 border border-[#6B7C4A]/40 backdrop-blur-sm text-[#F5F0E8] font-sans text-xs md:text-sm font-medium tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#87A878]"></span>
          350 Disaster-Prone Districts
        </div>

        {/* Pill 3 - Gold Pulsing Tension Badge */}
        <div className="px-4 py-2 rounded-full bg-[#6B7C4A]/25 border-2 border-[#C4973A] animate-gold-pulse backdrop-blur-sm text-[#F5F0E8] font-sans text-xs md:text-sm font-semibold tracking-wide flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C4973A] animate-ping opacity-75"></span>
          0 Verified Records Exist
        </div>
      </motion.div>
    </>
  );
};

export default StatsBar;
