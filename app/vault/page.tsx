"use client";

import { Card } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/format";

export default function VaultPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-text-primary mb-2">Vault Details</h1>
        <p className="text-text-secondary text-sm">Complete vault state and configuration</p>
      </div>

      <Card>
        <div className="grid grid-cols-4 gap-8 mb-8">
          <StatBlock label="Total Assets" value={formatCurrency(1250000)} />
          <StatBlock label="Total Shares" value="1,000,000" />
          <StatBlock label="Share Price" value="$1.25" />
          <StatBlock label="Peak NAV" value={formatCurrency(1300000)} />
        </div>

        <div className="border-t border-surface-border pt-6">
          <h3 className="font-display text-sm text-text-primary mb-4">Risk Parameters</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <span className="text-xs text-text-tertiary block mb-1">Max Drawdown</span>
              <span className="font-mono text-text-primary">20%</span>
            </div>
            <div>
              <span className="text-xs text-text-tertiary block mb-1">Default Hedge Ratio</span>
              <span className="font-mono text-text-primary">50%</span>
            </div>
            <div>
              <span className="text-xs text-text-tertiary block mb-1">Min Deposit</span>
              <span className="font-mono text-text-primary">$100</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-sm text-text-primary mb-4">Emergency Controls</h3>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">Pause Vault</Button>
          <Button variant="secondary" size="sm">Emergency Withdraw</Button>
        </div>
      </Card>
    </div>
  );
}
