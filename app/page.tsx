'use client';

import { useState, useEffect } from 'react';

export default function ShieldVault() {
  const [connected, setConnected] = useState(false);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [triggerPercent, setTriggerPercent] = useState(5);
  const [hedgePercent, setHedgePercent] = useState(50);
  const [timeout, setTimeout] = useState('2hr');

  const [metrics, setMetrics] = useState({
    totalProtected: 0,
    solPrice: 0,
    protectionPnL: 0,
    fundingCost: 0.000142
  });

  const [hedgeActive, setHedgeActive] = useState(true);

  useEffect(() => {
    let start = 0;
    const targetProtected = 47.82;
    const targetPrice = 180.42;
    const targetPnL = -0.34;

    const duration = 1200;
    const steps = 60;
    const increment = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      const progress = Math.min(start / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setMetrics(prev => ({
        ...prev,
        totalProtected: targetProtected * easeOut,
        solPrice: targetPrice * easeOut,
        protectionPnL: targetPnL * easeOut
      }));

      if (progress >= 1) clearInterval(timer);
    }, increment);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hedgeActive) return;

    const ticker = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        fundingCost: prev.fundingCost + (Math.random() * 0.000003)
      }));
    }, 3000);

    return () => clearInterval(ticker);
  }, [hedgeActive]);

  const currentRule = {
    trigger: 5,
    hedge: 50,
    timeout: '2hr'
  };

  const activities = [
    { event: 'Hedge opened', time: '14:23:41', status: 'success' },
    { event: 'Price checked', time: '14:20:15', status: 'neutral' },
    { event: 'Proof generated', time: '14:18:02', status: 'success' },
    { event: 'Rule updated', time: '13:45:33', status: 'neutral' }
  ];

  const triggerPrice = metrics.solPrice * (1 - triggerPercent / 100);
  const hedgeSize = (metrics.totalProtected * hedgePercent / 100) * metrics.solPrice;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        :root {
          --base: #0A0A0F;
          --surface: #111118;
          --teal: #00FFD1;
          --amber: #FFB800;
          --text-primary: #E8E8F0;
          --text-muted: #6B6B80;
          --border: rgba(0, 255, 209, 0.15);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: var(--base);
          color: var(--text-primary);
          font-family: 'IBM Plex Mono', monospace;
          overflow-x: hidden;
        }

        .grid-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image:
            linear-gradient(rgba(0, 255, 209, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 209, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .radial-glow {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(0, 255, 209, 0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(0, 255, 209, 0.4);
          }
          50% {
            box-shadow: 0 0 16px rgba(0, 255, 209, 0.8);
          }
        }

        .animate-slide-1 { animation: fadeSlideUp 0.4s ease-out 0ms forwards; opacity: 0; }
        .animate-slide-2 { animation: fadeSlideUp 0.4s ease-out 80ms forwards; opacity: 0; }
        .animate-slide-3 { animation: fadeSlideUp 0.4s ease-out 160ms forwards; opacity: 0; }
        .animate-slide-4 { animation: fadeSlideUp 0.4s ease-out 240ms forwards; opacity: 0; }
        .animate-slide-5 { animation: fadeSlideUp 0.4s ease-out 320ms forwards; opacity: 0; }

        .pulse-dot {
          animation: pulse 2s ease-in-out infinite;
        }

        .mono {
          font-family: 'IBM Plex Mono', monospace;
        }

        .heading {
          font-family: 'Syne', sans-serif;
        }
      `}} />

      <div className="grid-bg" />
      <div className="radial-glow" />

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="w-[220px] border-r flex flex-col" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <h1 className="heading text-xl font-bold" style={{ color: 'var(--teal)' }}>SHIELDVAULT</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>SOL Protection</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'dashboard', icon: '▦', label: 'Dashboard' },
              { id: 'protection', icon: '◈', label: 'Protection' },
              { id: 'proof', icon: '✓', label: 'Proof' },
              { id: 'withdraw', icon: '↓', label: 'Withdraw' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 transition-colors"
                style={{
                  background: activeScreen === item.id ? 'rgba(0, 255, 209, 0.1)' : 'transparent',
                  color: activeScreen === item.id ? 'var(--teal)' : 'var(--text-muted)',
                  border: activeScreen === item.id ? '1px solid var(--border)' : '1px solid transparent'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setConnected(!connected)}
              className="w-full px-3 py-2 text-sm border transition-colors"
              style={{
                borderColor: connected ? 'var(--teal)' : 'var(--border)',
                color: connected ? 'var(--teal)' : 'var(--text-muted)',
                background: 'transparent'
              }}
            >
              {connected ? '● Connected' : '○ Connect Wallet'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 max-w-[1200px] mx-auto w-full">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8 animate-slide-1">
            <div>
              <h2 className="heading text-2xl font-bold">Protection Dashboard</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {connected ? '7xK...mP9q' : 'Not connected'}
              </p>
            </div>
            {connected && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: 'var(--teal)' }} />
                <span className="text-xs" style={{ color: 'var(--teal)' }}>LIVE</span>
              </div>
            )}
          </div>

          {activeScreen === 'dashboard' && connected && (
            <>
              {/* Hero Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6 animate-slide-2">
                {[
                  { label: 'Total Protected', value: metrics.totalProtected.toFixed(2), unit: 'SOL' },
                  { label: 'Current SOL Price', value: `$${metrics.solPrice.toFixed(2)}`, unit: '' },
                  { label: 'Hedge Status', value: hedgeActive ? 'ACTIVE' : 'INACTIVE', unit: '', highlight: true },
                  { label: 'Protection P&L', value: metrics.protectionPnL.toFixed(2), unit: 'SOL', negative: true }
                ].map((metric, i) => (
                  <div key={i} className="p-4 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{metric.label}</p>
                    <p className="mono text-2xl font-semibold" style={{
                      color: metric.highlight ? 'var(--teal)' : metric.negative ? 'var(--amber)' : 'var(--text-primary)'
                    }}>
                      {metric.value}
                      {metric.unit && <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>{metric.unit}</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* Protection Rule Card */}
              <div className="p-6 border mb-6 animate-slide-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading text-lg font-semibold">Active Protection Rule</h3>
                  <button
                    onClick={() => setShowRuleModal(true)}
                    className="px-4 py-1 text-sm border transition-colors"
                    style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'transparent' }}
                  >
                    EDIT
                  </button>
                </div>
                <p className="mono text-sm" style={{ color: 'var(--text-primary)' }}>
                  Triggers at <span style={{ color: 'var(--teal)' }}>-{currentRule.trigger}%</span> →
                  <span style={{ color: 'var(--teal)' }}> {currentRule.hedge}% hedge</span> →
                  <span style={{ color: 'var(--text-muted)' }}> {currentRule.timeout} timeout</span>
                </p>
              </div>

              {/* Active Hedge Panel */}
              {hedgeActive && (
                <div className="p-6 border mb-6 animate-slide-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <h3 className="heading text-lg font-semibold mb-4">Active Hedge Monitor</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Entry Price</p>
                      <p className="mono text-xl" style={{ color: 'var(--text-primary)' }}>${metrics.solPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Short Size</p>
                      <p className="mono text-xl" style={{ color: 'var(--text-primary)' }}>${hedgeSize.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Funding Cost</p>
                      <p className="mono text-xl" style={{ color: 'var(--amber)' }}>{metrics.fundingCost.toFixed(6)} SOL</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Liquidation Distance: <span style={{ color: 'var(--teal)' }}>+42.3%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="p-6 border animate-slide-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h3 className="heading text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{
                          background: activity.status === 'success' ? 'var(--teal)' : 'var(--text-muted)'
                        }} />
                        <span className="text-sm">{activity.event}</span>
                      </div>
                      <span className="mono text-xs" style={{ color: 'var(--text-muted)' }}>{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeScreen === 'protection' && connected && (
            <div className="p-6 border animate-slide-1" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="heading text-xl font-semibold mb-6">Set Protection Rule</h3>

              <div className="space-y-6">
                <div>
                  <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>
                    Trigger % <span style={{ color: 'var(--teal)' }}>{triggerPercent}%</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={triggerPercent}
                    onChange={(e) => setTriggerPercent(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>
                    Hedge % <span style={{ color: 'var(--teal)' }}>{hedgePercent}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={hedgePercent}
                    onChange={(e) => setHedgePercent(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>Timeout</label>
                  <select
                    value={timeout}
                    onChange={(e) => setTimeout(e.target.value)}
                    className="w-full p-2 border mono text-sm"
                    style={{ background: 'var(--base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option>30min</option>
                    <option>1hr</option>
                    <option>2hr</option>
                    <option>4hr</option>
                    <option>never</option>
                  </select>
                </div>

                <div className="p-4 border" style={{ background: 'var(--base)', borderColor: 'var(--border)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Live Preview</p>
                  <p className="mono text-sm" style={{ color: 'var(--text-primary)' }}>
                    If SOL drops from ${metrics.solPrice.toFixed(2)} to ${triggerPrice.toFixed(2)},
                    system opens ${hedgeSize.toFixed(2)} short on Drift
                  </p>
                  <p className="mono text-xs mt-2" style={{ color: 'var(--amber)' }}>
                    Est. funding cost: ~0.0001 SOL/hr
                  </p>
                </div>

                <button
                  className="w-full py-3 border font-semibold transition-colors"
                  style={{ borderColor: 'var(--teal)', color: 'var(--base)', background: 'var(--teal)' }}
                >
                  ACTIVATE PROTECTION
                </button>
              </div>
            </div>
          )}

          {activeScreen === 'proof' && connected && (
            <div className="p-6 border animate-slide-1" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="heading text-xl font-semibold mb-6">Proof Verification</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Rule Hash</p>
                  <p className="mono text-sm p-3 border" style={{ background: 'var(--base)', borderColor: 'var(--border)', color: 'var(--teal)' }}>
                    0x7f3a9b2c8e1d4f6a5c9b8e7d3a2f1c4b9e8d7c6a5b4f3e2d1c9b8a7f6e5d4c3b
                  </p>
                </div>

                <div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Execution Timestamp</p>
                  <p className="mono text-sm">2026-04-17 14:23:41 UTC</p>
                </div>

                <div>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Operator Signatures</p>
                  <div className="space-y-2">
                    {[
                      { addr: '9xK...7mP2', signed: true },
                      { addr: '4bN...3qR8', signed: true },
                      { addr: '2fM...9sT5', signed: false }
                    ].map((op, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 border" style={{ borderColor: 'var(--border)' }}>
                        <span style={{ color: op.signed ? 'var(--teal)' : 'var(--text-muted)' }}>
                          {op.signed ? '✓' : '○'}
                        </span>
                        <span className="mono text-sm">{op.addr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="w-full py-3 border font-semibold transition-colors mt-6"
                  style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'transparent' }}
                >
                  VERIFY ON-CHAIN
                </button>
              </div>
            </div>
          )}

          {activeScreen === 'withdraw' && connected && (
            <div className="p-6 border animate-slide-1" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="heading text-xl font-semibold mb-6">Withdraw</h3>

              <div className="space-y-6">
                <div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Current Balance</p>
                  <p className="mono text-3xl font-semibold">{metrics.totalProtected.toFixed(2)} <span className="text-lg" style={{ color: 'var(--text-muted)' }}>SOL</span></p>
                </div>

                {hedgeActive && (
                  <div className="p-4 border" style={{ background: 'var(--base)', borderColor: 'rgba(255, 184, 0, 0.3)' }}>
                    <p className="text-sm" style={{ color: 'var(--amber)' }}>
                      ⚠ Active hedge will be auto-closed. Estimated close cost: 0.003 SOL
                    </p>
                  </div>
                )}

                <button
                  className="w-full py-3 border font-semibold transition-colors"
                  style={{ borderColor: 'var(--amber)', color: 'var(--base)', background: 'var(--amber)' }}
                >
                  CONFIRM WITHDRAWAL
                </button>
              </div>
            </div>
          )}

          {!connected && (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <p className="text-xl mb-4" style={{ color: 'var(--text-muted)' }}>Connect wallet to access ShieldVault</p>
                <button
                  onClick={() => setConnected(true)}
                  className="px-6 py-3 border font-semibold transition-colors"
                  style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'transparent' }}
                >
                  CONNECT WALLET
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowRuleModal(false)}>
          <div className="p-6 border max-w-md w-full" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}>
            <h3 className="heading text-xl font-semibold mb-4">Edit Protection Rule</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Navigate to Protection tab to modify your rule settings.
            </p>
            <button
              onClick={() => {
                setShowRuleModal(false);
                setActiveScreen('protection');
              }}
              className="w-full py-2 border"
              style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'transparent' }}
            >
              GO TO PROTECTION
            </button>
          </div>
        </div>
      )}
    </>
  );
}
