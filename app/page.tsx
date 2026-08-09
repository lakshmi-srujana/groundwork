"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TextEffect from "@/components/motion-primitives/text-effect";
import TerrainBackground from "@/components/landing/TerrainBackground";
import SealHero from "@/components/landing/SealHero";
import CTACards from "@/components/landing/CTACards";
import StatsBar from "@/components/landing/StatsBar";

export default function Home() {
  const shouldReduceMotion = Boolean(useReducedMotion());
  // Step 1: Seal, Step 2: Wordmark, Step 3: Tagline, Step 4: CTAs, Step 5: Stats
  const [step, setStep] = useState<number>(1);

  // If reduced motion is preferred, jump straight to step 5 immediately
  useEffect(() => {
    if (shouldReduceMotion) {
      setStep(5);
    }
  }, [shouldReduceMotion]);

  const handleSealLanded = () => {
    if (!shouldReduceMotion && step < 2) {
      setStep(2);
    }
  };

  const handleWordmarkComplete = () => {
    if (!shouldReduceMotion && step < 3) {
      setStep(3);
      // Stagger tagline to CTAs to Stats
      setTimeout(() => {
        setStep(4);
        setTimeout(() => {
          setStep(5);
        }, 300);
      }, 400);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[#2D4A2D] text-[#F5F0E8] flex flex-col justify-between items-center overflow-x-hidden selection:bg-[#C4973A] selection:text-[#2D4A2D]">
      {/* Topographic Contour Lines Overlay */}
      <TerrainBackground />

      {/* Main Centered Section */}
      <section className="relative z-10 w-full max-w-5xl flex-1 flex flex-col justify-center items-center px-6 py-10 md:py-16 text-center gap-6 md:gap-8 my-auto">
        
        {/* Step 1: Seal Hero */}
        <SealHero onSealLanded={handleSealLanded} />

        {/* Step 2: Wordmark Header */}
        <div className="min-h-[60px] md:min-h-[80px] flex items-center justify-center">
          {(step >= 2 || shouldReduceMotion) && (
            <TextEffect
              as="h1"
              per="char"
              preset="fade"
              duration={0.35}
              onAnimationComplete={handleWordmarkComplete}
              className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-widest text-[#F5F0E8] font-normal uppercase select-none drop-shadow-md"
            >
              GROUNDWORK
            </TextEffect>
          )}
        </div>

        {/* Step 3: Tagline */}
        <div className="min-h-[28px] -mt-2 md:-mt-4">
          {(step >= 3 || shouldReduceMotion) && (
            <motion.p
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-sans text-base sm:text-lg md:text-xl text-[#87A878] font-medium tracking-wide"
            >
              Because showing up should count.
            </motion.p>
          )}
        </div>

        {/* Step 4: Staggered Role CTA Cards */}
        <div className="w-full flex justify-center mt-2">
          {(step >= 4 || shouldReduceMotion) && (
            <CTACards isVisible={step >= 4 || shouldReduceMotion} />
          )}
        </div>

        {/* Step 5: Stats Bar */}
        {(step >= 5 || shouldReduceMotion) && (
          <StatsBar isVisible={step >= 5 || shouldReduceMotion} />
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 pb-6 text-center">
        <p className="font-sans text-xs text-[#F5F0E8]/40 tracking-wider">
          © Groundwork 2026
        </p>
      </footer>
    </main>
  );
}
