"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface TextEffectProps {
  children: string;
  className?: string;
  per?: "char" | "word";
  preset?: "fade" | "fade-in-blur" | "slide";
  delay?: number;
  duration?: number;
  onAnimationComplete?: () => void;
  as?: React.ElementType;
}

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  className = "",
  per = "char",
  preset = "fade",
  delay = 0,
  duration = 0.35,
  onAnimationComplete,
  as: Component = "h1",
}) => {
  const words = children.split(" ");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: per === "char" ? 0.045 : 0.12,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: preset === "slide" ? 12 : 0,
      filter: preset === "fade-in-blur" ? "blur(6px)" : "none",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  const Tag = Component as any;

  return (
    <Tag className={className}>
      <motion.span
        className="inline-block"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onAnimationComplete={onAnimationComplete}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => (
              <motion.span
                key={charIndex}
                variants={itemVariants}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
};

export default TextEffect;
