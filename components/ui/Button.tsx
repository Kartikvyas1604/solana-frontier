"use client";

import { cn } from "@/lib/utils/format";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-mono transition-colors rounded",
        variant === "primary" && "bg-accent-cyan text-background hover:bg-accent-cyan/90",
        variant === "secondary" && "bg-surface-elevated border border-surface-border text-text-primary hover:bg-surface-elevated/80",
        variant === "ghost" && "text-text-secondary hover:text-text-primary",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
