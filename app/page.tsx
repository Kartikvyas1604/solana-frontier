"use client";

import { VaultOverview } from "@/components/vault/VaultOverview";
import { DepositWithdraw } from "@/components/vault/DepositWithdraw";
import { PositionsList } from "@/components/vault/PositionsList";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";

export default function Home() {
  const mockVaultData = {
    totalAssets: 1250000,
    nav: 1.05,
    drawdown: -3.2,
    hedgeActive: true,
  };

  const mockPositions = [
    {
      id: "1",
      size: 50000,
      entryPrice: 142.5,
      currentPrice: 138.2,
      pnl: -3.02,
      fundingRate: 0.01,
      openedAt: Date.now() / 1000 - 3600,
      status: "active" as const,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      <VaultOverview {...mockVaultData} />
      <DepositWithdraw />
      <PositionsList positions={mockPositions} />
      <PerformanceChart />
    </div>
  );
}
