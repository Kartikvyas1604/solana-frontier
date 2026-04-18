import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { createDepositInstruction } from "@solana-frontier/sdk";

interface DepositFormProps {
  onSuccess?: () => void;
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const lamports = BigInt(parseFloat(amount) * 1e9);
      const instruction = createDepositInstruction(publicKey, lamports);
      const transaction = new Transaction().add(instruction);

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      onSuccess?.();
      setAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-form">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (SOL)"
        disabled={loading}
      />
      <button onClick={handleDeposit} disabled={!publicKey || loading}>
        {loading ? "Processing..." : "Deposit"}
      </button>
    </div>
  );
}
