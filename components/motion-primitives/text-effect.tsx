"use client";
import React from "react";

interface TextEffectProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  preset?: string;
  delay?: number;
  duration?: number;
  as?: keyof JSX.IntrinsicElements;
  per?: string;
}

const TextEffect: React.FC<TextEffectProps> = ({ text, children, className, as: Tag = "span" }) => {
  return <Tag className={className}>{text ?? children}</Tag>;
};

export default TextEffect;
