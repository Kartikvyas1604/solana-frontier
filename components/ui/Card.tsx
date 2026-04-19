"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/format";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glow?: boolean;
}

export function Card({ children, className, delay = 0, glow = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={cn(
        "relative bg-surface border border-surface-border rounded p-6",
        glow && "before:absolute before:inset-0 before:rounded before:bg-gradient-radial before:from-accent-cyan/5 before:to-transparent before:blur-xl before:-z-10",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
