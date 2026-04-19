"use client";

import { useState, useEffect } from "react";
import type { VaultState } from "@/lib/types/vault";

export function useVaultData() {
  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        setLoading(true);
        // Mock data - replace with actual API call
        const mockData: VaultState = {
          totalAssets: 1250000,
          totalShares: 1000000,
          nav: 1.25,
          peakNav: 1.30,
          drawdown: -3.85,
          lastUpdate: Date.now() / 1000,
        };
        setVaultState(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch vault data");
      } finally {
        setLoading(false);
      }
    };

    fetchVaultData();
    const interval = setInterval(fetchVaultData, 10000);
    return () => clearInterval(interval);
  }, []);

  return { vaultState, loading, error };
}
