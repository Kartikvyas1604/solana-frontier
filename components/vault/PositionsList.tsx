"use client";

import { Card } from "@/components/ui/Card";
import { ANIMATION_DELAYS } from "@/lib/constants";
import { formatCurrency, formatPercent, formatTimestamp } from "@/lib/utils/format";
import type { HedgePosition } from "@/lib/types/vault";

interface PositionsListProps {
  positions: HedgePosition[];
}

export function PositionsList({ positions }: PositionsListProps) {
  return (
    <Card delay={ANIMATION_DELAYS.card3} className="col-span-2">
      <h2 className="font-display text-lg text-text-primary mb-6">Active Positions</h2>

      {positions.length === 0 ? (
        <p className="text-text-tertiary text-sm">No active positions</p>
      ) : (
        <div className="space-y-3">
          {positions.map((position) => (
            <div
              key={position.id}
              className="bg-surface-elevated border border-surface-border rounded p-4 grid grid-cols-5 gap-4"
            >
              <div>
                <span className="text-xs text-text-tertiary block mb-1">SIZE</span>
                <span className="font-mono text-sm text-text-primary">{formatCurrency(position.size)}</span>
              </div>
              <div>
                <span className="text-xs text-text-tertiary block mb-1">ENTRY</span>
                <span className="font-mono text-sm text-text-primary">{formatCurrency(position.entryPrice)}</span>
              </div>
              <div>
                <span className="text-xs text-text-tertiary block mb-1">CURRENT</span>
                <span className="font-mono text-sm text-text-primary">{formatCurrency(position.currentPrice)}</span>
              </div>
              <div>
                <span className="text-xs text-text-tertiary block mb-1">PNL</span>
                <span className={`font-mono text-sm ${position.pnl >= 0 ? "text-accent-green" : "text-red-500"}`}>
                  {formatPercent(position.pnl)}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-tertiary block mb-1">OPENED</span>
                <span className="font-mono text-xs text-text-secondary">{formatTimestamp(position.openedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
