"use client";

import { motion } from "framer-motion";

interface StatBlockProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  mono?: boolean;
}

export function StatBlock({ label, value, change, positive, mono = true }: StatBlockProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-tertiary text-xs uppercase tracking-wider">{label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        className={`text-2xl ${mono ? "font-mono" : ""} text-text-primary`}
      >
        {value}
      </motion.span>
      {change && (
        <span className={`text-sm font-mono ${positive ? "text-accent-green" : "text-red-500"}`}>
          {change}
        </span>
      )}
    </div>
  );
}
