"use client";

import { WalletConnect, DepositForm, WithdrawForm } from "@solana-frontier/ui";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Cipher Yield Vault</h1>

        <div className="mb-8">
          <WalletConnect />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Deposit</h2>
            <DepositForm onSuccess={() => console.log("Deposit successful")} />
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Withdraw</h2>
            <WithdrawForm onSuccess={() => console.log("Withdraw successful")} />
          </div>
        </div>
      </div>
    </main>
  );
}
