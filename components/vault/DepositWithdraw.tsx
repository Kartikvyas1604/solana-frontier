"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ANIMATION_DELAYS } from "@/lib/constants";

export function DepositWithdraw() {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

  return (
    <Card delay={ANIMATION_DELAYS.card2}>
      <h2 className="font-display text-lg text-text-primary mb-6">
        {mode === "deposit" ? "Deposit" : "Withdraw"}
      </h2>

      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === "deposit" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setMode("deposit")}
          className="flex-1"
        >
          Deposit
        </Button>
        <Button
          variant={mode === "withdraw" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setMode("withdraw")}
          className="flex-1"
        >
          Withdraw
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">
            Amount (USDC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-surface-elevated border border-surface-border rounded px-4 py-3 font-mono text-text-primary focus:outline-none focus:border-accent-cyan"
          />
        </div>

        <Button variant="primary" className="w-full">
          {mode === "deposit" ? "Deposit" : "Withdraw"}
        </Button>
      </div>
    </Card>
  );
}
