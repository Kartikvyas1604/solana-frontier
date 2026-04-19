"use client";

import { Card } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { ANIMATION_DELAYS } from "@/lib/constants";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

interface VaultOverviewProps {
  totalAssets: number;
  nav: number;
  drawdown: number;
  hedgeActive: boolean;
}

export function VaultOverview({ totalAssets, nav, drawdown, hedgeActive }: VaultOverviewProps) {
  return (
    <Card delay={ANIMATION_DELAYS.card1} glow className="col-span-2">
      <div className="flex items-start justify-between mb-6">
        <h2 className="font-display text-lg text-text-primary">Vault Overview</h2>
        <StatusIndicator
          status={hedgeActive ? "active" : "inactive"}
          label={hedgeActive ? "Hedge Active" : "No Hedge"}
          pulse={hedgeActive}
        />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <StatBlock label="Total Assets" value={formatCurrency(totalAssets)} />
        <StatBlock label="NAV" value={formatCurrency(nav)} />
        <StatBlock
          label="Drawdown"
          value={formatPercent(drawdown)}
          positive={drawdown > -5}
        />
      </div>
    </Card>
  );
}
