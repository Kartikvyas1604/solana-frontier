"use client";

import dynamic from "next/dynamic";
import { DepositForm, WithdrawForm } from "@solana-frontier/ui";

const WalletConnect = dynamic(
  () => import("@solana-frontier/ui").then((mod) => mod.WalletConnect),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Cipher Yield Vault</h1>
          <p className="text-slate-300 text-lg">Secure yield generation on Solana</p>
        </div>

        <div className="flex justify-center mb-12">
          <WalletConnect />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-2xl">
            <h2 className="text-3xl font-semibold text-white mb-6">Deposit</h2>
            <DepositForm onSuccess={() => console.log("Deposit successful")} />
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-2xl">
            <h2 className="text-3xl font-semibold text-white mb-6">Withdraw</h2>
            <WithdrawForm onSuccess={() => console.log("Withdraw successful")} />
          </div>
        </div>
      </div>
    </main>
  );
}
