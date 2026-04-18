"use client";

import { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0A0A0B] grid-overlay">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-[#666] text-sm font-mono">Performance metrics · Execution logs · Proof bundles</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="vault-card p-6 animate-fade-up">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#666] text-xs">Total Return</span>
                <span className="text-white font-mono">0.00%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666] text-xs">Sharpe Ratio</span>
                <span className="text-white font-mono">—</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666] text-xs">Win Rate</span>
                <span className="text-white font-mono">—</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666] text-xs">Avg Trade Duration</span>
                <span className="text-white font-mono">—</span>
              </div>
            </div>
          </div>

          <div className="vault-card p-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Execution Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#666] text-xs">Total Executions</span>
                <span className="text-white font-mono">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666] text-xs">Avg Latency</span>
                <span className="text-[#00D4FF] font-mono">&lt;5s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666] text-xs">Success Rate</span>
                <span className="text-white font-mono">—</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666] text-xs">MEV Saved</span>
                <span className="text-[#00D4FF] font-mono">$0.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="vault-card p-6 mb-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Execution Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1F1F1F]">
                  <th className="text-left text-[#666] text-xs uppercase tracking-wider font-mono py-3">Timestamp</th>
                  <th className="text-left text-[#666] text-xs uppercase tracking-wider font-mono py-3">Type</th>
                  <th className="text-left text-[#666] text-xs uppercase tracking-wider font-mono py-3">Strategy</th>
                  <th className="text-right text-[#666] text-xs uppercase tracking-wider font-mono py-3">Amount</th>
                  <th className="text-right text-[#666] text-xs uppercase tracking-wider font-mono py-3">Latency</th>
                  <th className="text-right text-[#666] text-xs uppercase tracking-wider font-mono py-3">Status</th>
                  <th className="text-right text-[#666] text-xs uppercase tracking-wider font-mono py-3">Proof</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="text-center text-[#666] text-xs font-mono py-12">
                    No executions recorded · Activity will appear here
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="vault-card p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Proof Bundles</h3>
          <p className="text-[#666] text-xs font-mono mb-4">
            Cryptographic verification of all executions · Stored on Arweave/IPFS
          </p>
          <div className="text-[#666] text-xs font-mono text-center py-8 border border-[#1F1F1F] rounded">
            No proof bundles generated yet
          </div>
        </div>
      </div>
    </main>
  );
}
