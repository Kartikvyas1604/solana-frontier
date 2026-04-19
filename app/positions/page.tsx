"use client";

import { Card } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatPercent, formatTimestamp } from "@/lib/utils/format";

export default function PositionsPage() {
  const mockPositions = [
    {
      id: "1",
      asset: "SOL-PERP",
      size: 50000,
      entryPrice: 142.5,
      currentPrice: 138.2,
      pnl: -3.02,
      fundingRate: 0.01,
      openedAt: Date.now() / 1000 - 3600,
      status: "active" as const,
    },
    {
      id: "2",
      asset: "SOL-PERP",
      size: 25000,
      entryPrice: 155.0,
      currentPrice: 138.2,
      pnl: -10.84,
      fundingRate: 0.01,
      openedAt: Date.now() / 1000 - 7200,
      status: "active" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-text-primary mb-2">Positions</h1>
        <p className="text-text-secondary text-sm">Active hedge positions and history</p>
      </div>

      <div className="space-y-4">
        {mockPositions.map((position) => (
          <Card key={position.id}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-display text-lg text-text-primary mb-1">{position.asset}</h3>
                <StatusIndicator status={position.status} label="Active" pulse />
              </div>
              <Button variant="secondary" size="sm">Close Position</Button>
            </div>

            <div className="grid grid-cols-5 gap-6">
              <div>
                <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">Size</span>
                <span className="font-mono text-text-primary">{formatCurrency(position.size)}</span>
              </div>
              <div>
                <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">Entry Price</span>
                <span className="font-mono text-text-primary">{formatCurrency(position.entryPrice)}</span>
              </div>
              <div>
                <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">Current Price</span>
                <span className="font-mono text-text-primary">{formatCurrency(position.currentPrice)}</span>
              </div>
              <div>
                <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">PNL</span>
                <span className={`font-mono ${position.pnl >= 0 ? "text-accent-green" : "text-red-500"}`}>
                  {formatPercent(position.pnl)}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">Opened</span>
                <span className="font-mono text-xs text-text-secondary">{formatTimestamp(position.openedAt)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-surface-border">
              <div className="flex items-center gap-8">
                <div>
                  <span className="text-xs text-text-tertiary block mb-1">Funding Rate</span>
                  <span className="font-mono text-sm text-text-primary">{formatPercent(position.fundingRate)}</span>
                </div>
                <div>
                  <span className="text-xs text-text-tertiary block mb-1">Liquidation Price</span>
                  <span className="font-mono text-sm text-text-primary">{formatCurrency(position.entryPrice * 0.7)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
