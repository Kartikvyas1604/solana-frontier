"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/format";

interface StatusIndicatorProps {
  status: "active" | "inactive" | "pending";
  label: string;
  pulse?: boolean;
}

export function StatusIndicator({ status, label, pulse = false }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={pulse ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
        className={cn(
          "w-2 h-2 rounded-full",
          status === "active" && "bg-accent-green",
          status === "inactive" && "bg-text-tertiary",
          status === "pending" && "bg-accent-cyan"
        )}
      />
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}
