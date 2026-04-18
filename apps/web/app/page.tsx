"use client";

import dynamic from "next/dynamic";
import { DepositForm, WithdrawForm } from "@solana-frontier/ui";
import { useState, useEffect } from "react";

const WalletConnect = dynamic(
  () => import("@solana-frontier/ui").then((mod) => mod.WalletConnect),
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0B] grid-overlay">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12 animate-fade-up" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">CIPHER YIELD</h1>
            {mounted && <WalletConnect />}
          </div>
          <p className="text-[#666] text-sm font-mono">
            Private execution infrastructure · Non-custodial vault · MEV-protected
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="stat-block">
            <div className="text-[#666] text-xs uppercase tracking-wider mb-1">TVL</div>
            <div className="text-white text-xl font-mono">$0.00</div>
          </div>
          <div className="stat-block">
            <div className="text-[#666] text-xs uppercase tracking-wider mb-1">APY</div>
            <div className="text-white text-xl font-mono">—</div>
          </div>
          <div className="stat-block">
            <div className="text-[#666] text-xs uppercase tracking-wider mb-1">Hedge Status</div>
            <div className="flex items-center gap-2">
              <div className="status-indicator"></div>
              <span className="text-white text-sm font-mono">INACTIVE</span>
            </div>
          </div>
          <div className="stat-block">
            <div className="text-[#666] text-xs uppercase tracking-wider mb-1">Execution</div>
            <div className="text-[#00D4FF] text-xl font-mono">&lt;5s</div>
          </div>
        </div>

        {/* Main Vault Interface */}
        <div className="grid grid-cols-2 gap-6">
          <div className="vault-card p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">DEPOSIT</h2>
              <span className="text-[#666] text-xs font-mono">VAULT SHARES</span>
            </div>
            <DepositForm onSuccess={() => console.log("Deposit successful")} />
            <div className="mt-4 pt-4 border-t border-[#1F1F1F]">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#666]">Your Balance</span>
                <span className="text-white">0.00 SOL</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#666]">Your Shares</span>
                <span className="text-white">0</span>
              </div>
            </div>
          </div>

          <div className="vault-card p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">WITHDRAW</h2>
              <span className="text-[#666] text-xs font-mono">BURN SHARES</span>
            </div>
            <WithdrawForm onSuccess={() => console.log("Withdraw successful")} />
            <div className="mt-4 pt-4 border-t border-[#1F1F1F]">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#666]">Withdrawable</span>
                <span className="text-white">0.00 SOL</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#666]">Exit Fee</span>
                <span className="text-white">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Status */}
        <div className="vault-card p-6 mt-6 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Strategy Execution Log
          </h3>
          <div className="text-[#666] text-xs font-mono text-center py-8">
            No executions yet · Deploy program to activate
          </div>
        </div>
      </div>
    </main>
  );
}
