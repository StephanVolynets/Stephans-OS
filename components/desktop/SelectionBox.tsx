"use client";

import { motion } from "framer-motion";
import { createSelectionStyles } from "@/lib/selection";

interface SelectionBoxProps {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function SelectionBox({
  startX,
  startY,
  currentX,
  currentY,
}: SelectionBoxProps) {
  const styles = createSelectionStyles(startX, startY, currentX, currentY);

  return (
    <motion.div
      className="absolute border border-primary/50 bg-primary/10 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      style={{
        ...styles,
        willChange: "left, top, width, height",
      }}
    />
  );
}