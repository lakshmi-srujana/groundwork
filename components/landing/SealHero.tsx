"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";
import { StampScene } from "./StampScene";

interface SealHeroProps {
  onSealLanded?: () => void;
}

export const SealHero: React.FC<SealHeroProps> = ({ onSealLanded }) => {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-4">
      {/* Primary Seal Logo Container */}
      <div className="relative w-[160px] h-[160px] md:w-[220px] md:h-[220px] z-10 cursor-pointer">
        <StampScene
          onSealLanded={onSealLanded}
          reducedMotion={shouldReduceMotion}
        />
      </div>

      {/* Interactive Stamp Hint Badge below Seal */}
      <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F0E8]/10 border border-[#C4973A]/30 text-[#F5F0E8]/80 text-[11px] font-sans font-medium tracking-wide shadow-xs hover:bg-[#F5F0E8]/20 hover:text-[#F5F0E8] transition-all cursor-pointer select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C4973A] animate-pulse" />
        <span>Click logo to stamp again</span>
      </div>
    </div>
  );
};

export default SealHero;
