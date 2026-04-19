"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { formatPercent } from "@/lib/utils/format";

export default function StrategiesPage() {
  const mockStrategy = {
    id: "1",
    name: "Conservative Hedge",
    ruleHash: "0x7a3f...9c2d",
    drawdownThreshold: 10,
    hedgeRatio: 50,
    timeLimit: 24,
    status: "active" as const,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-text-primary mb-2">Strategies</h1>
          <p className="text-text-secondary text-sm">Configure automated risk rules</p>
        </div>
        <Button>Create Strategy</Button>
      </div>

      <Card>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-display text-lg text-text-primary mb-2">{mockStrategy.name}</h3>
            <StatusIndicator status={mockStrategy.status} label="Active" pulse />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Edit</Button>
            <Button variant="secondary" size="sm">Deactivate</Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">Rule Hash</span>
            <code className="font-mono text-sm text-text-primary bg-surface-elevated px-3 py-1.5 rounded border border-surface-border">
              {mockStrategy.ruleHash}
            </code>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">Drawdown Threshold</span>
              <span className="font-mono text-text-primary">{formatPercent(mockStrategy.drawdownThreshold)}</span>
            </div>
            <div>
              <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">Hedge Ratio</span>
              <span className="font-mono text-text-primary">{mockStrategy.hedgeRatio}%</span>
            </div>
            <div>
              <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">Time Limit</span>
              <span className="font-mono text-text-primary">{mockStrategy.timeLimit}h</span>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-border">
            <h4 className="text-sm text-text-primary mb-3">Trigger Conditions</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                <span className="text-text-secondary">If drawdown exceeds {formatPercent(mockStrategy.drawdownThreshold)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                <span className="text-text-secondary">Open {mockStrategy.hedgeRatio}% short position</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                <span className="text-text-secondary">Close after {mockStrategy.timeLimit} hours or recovery</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-sm text-text-primary mb-4">Create New Strategy</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">
              Strategy Name
            </label>
            <input
              type="text"
              placeholder="e.g., Aggressive Hedge"
              className="w-full bg-surface-elevated border border-surface-border rounded px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">
                Drawdown %
              </label>
              <input
                type="number"
                placeholder="10"
                className="w-full bg-surface-elevated border border-surface-border rounded px-4 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">
                Hedge Ratio %
              </label>
              <input
                type="number"
                placeholder="50"
                className="w-full bg-surface-elevated border border-surface-border rounded px-4 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div>
              <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">
                Time Limit (h)
              </label>
              <input
                type="number"
                placeholder="24"
                className="w-full bg-surface-elevated border border-surface-border rounded px-4 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>
          <Button className="w-full">Deploy Strategy</Button>
        </div>
      </Card>
    </div>
  );
}
