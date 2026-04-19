"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="border-b border-surface-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-text-primary">
          CIPHER<span className="text-accent-cyan">YIELD</span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/vault" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Vault
          </Link>
          <Link href="/positions" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Positions
          </Link>
          <Link href="/strategies" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Strategies
          </Link>
          <Link href="/proofs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Proofs
          </Link>
        </nav>

        <Button size="sm">Connect Wallet</Button>
      </div>
    </header>
  );
}
