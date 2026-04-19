"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatTimestamp } from "@/lib/utils/format";

export default function ProofsPage() {
  const mockProofs = [
    {
      id: "1",
      executionId: "exec_7f3a9c2d",
      timestamp: Date.now() / 1000 - 1800,
      action: "Open Hedge",
      priceData: [
        { asset: "SOL", price: 142.5, source: "Jupiter" },
        { asset: "SOL", price: 142.48, source: "Pyth" },
      ],
      operatorSignatures: 3,
      arweaveUrl: "https://arweave.net/tx123",
    },
    {
      id: "2",
      executionId: "exec_4b8e1f9a",
      timestamp: Date.now() / 1000 - 7200,
      action: "Close Hedge",
      priceData: [
        { asset: "SOL", price: 138.2, source: "Jupiter" },
        { asset: "SOL", price: 138.15, source: "Pyth" },
      ],
      operatorSignatures: 3,
      arweaveUrl: "https://arweave.net/tx456",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-text-primary mb-2">Proof Bundles</h1>
        <p className="text-text-secondary text-sm">Cryptographic verification of all executions</p>
      </div>

      <div className="space-y-4">
        {mockProofs.map((proof) => (
          <Card key={proof.id}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-display text-lg text-text-primary mb-1">{proof.action}</h3>
                <span className="text-xs text-text-tertiary">{formatTimestamp(proof.timestamp)}</span>
              </div>
              <Button variant="secondary" size="sm">View on Arweave</Button>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">Execution ID</span>
                <code className="font-mono text-sm text-text-primary bg-surface-elevated px-3 py-1.5 rounded border border-surface-border">
                  {proof.executionId}
                </code>
              </div>

              <div>
                <span className="text-xs text-text-tertiary uppercase tracking-wider block mb-3">Price Data</span>
                <div className="space-y-2">
                  {proof.priceData.map((data, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-surface-elevated border border-surface-border rounded px-4 py-2">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm text-text-primary">{data.asset}</span>
                        <span className="text-xs text-text-tertiary">{data.source}</span>
                      </div>
                      <span className="font-mono text-sm text-text-primary">${data.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-surface-border">
                <div>
                  <span className="text-xs text-text-tertiary block mb-1">Operator Signatures</span>
                  <span className="font-mono text-sm text-accent-green">{proof.operatorSignatures}/3 Verified</span>
                </div>
                <a
                  href={proof.arweaveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-cyan hover:underline font-mono"
                >
                  {proof.arweaveUrl}
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
