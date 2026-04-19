"use client";

import { Card } from "@/components/ui/Card";
import { ANIMATION_DELAYS } from "@/lib/constants";

export function PerformanceChart() {
  return (
    <Card delay={ANIMATION_DELAYS.card4} className="col-span-2">
      <h2 className="font-display text-lg text-text-primary mb-6">Performance</h2>

      <div className="h-64 flex items-center justify-center border border-surface-border rounded bg-surface-elevated/50">
        <span className="text-text-tertiary text-sm">Chart placeholder</span>
      </div>
    </Card>
  );
}
