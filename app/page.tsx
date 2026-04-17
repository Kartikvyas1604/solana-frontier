'use client';

import { useState, useEffect } from 'react';

export default function ShieldVault() {
  const [connected, setConnected] = useState(false);
  const [activeScreen, setActiveScreen] = useState('dashboard');
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
    const duration = 400;
    const steps = 20;
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

  const triggerPrice = metrics.solPrice * (1 - triggerPercent / 100);
  const hedgeSize = (metrics.totalProtected * hedgePercent / 100) * metrics.solPrice;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #09090b;
          color: #fafafa;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in { animation: fadeIn 300ms ease-out forwards; opacity: 0; }
        .delay-1 { animation-delay: 50ms; }
        .delay-2 { animation-delay: 100ms; }
        .delay-3 { animation-delay: 150ms; }
        .delay-4 { animation-delay: 200ms; }

        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #27272a 0%, #52525b 100%);
          border-radius: 3px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: #fafafa;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #fafafa;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .card {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 12px;
          transition: border-color 200ms;
        }

        .card:hover {
          border-color: #3f3f46;
        }

        button {
          transition: all 200ms;
        }

        button:hover {
          transform: translateY(-1px);
        }

        button:active {
          transform: translateY(0);
        }
      `}} />

      <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b' }}>
        <aside style={{ width: '280px', background: '#18181b', borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '40px 28px', borderBottom: '1px solid #27272a' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>S</span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fafafa', marginBottom: '6px' }}>ShieldVault</h1>
            <p style={{ fontSize: '13px', color: '#71717a', fontWeight: 500 }}>SOL Protection Protocol</p>
          </div>

          <nav style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '◆' },
              { id: 'protection', label: 'Protection', icon: '◈' },
              { id: 'proof', label: 'Verification', icon: '✓' },
              { id: 'withdraw', label: 'Withdraw', icon: '↓' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                style={{
                  padding: '14px 18px',
                  background: activeScreen === item.id ? '#27272a' : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  color: activeScreen === item.id ? '#fafafa' : '#71717a',
                  fontSize: '14px',
                  fontWeight: activeScreen === item.id ? 600 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '20px', borderTop: '1px solid #27272a' }}>
            <button
              onClick={() => setConnected(!connected)}
              style={{
                width: '100%',
                padding: '16px',
                background: connected ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                border: connected ? 'none' : '1px solid #3f3f46',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: connected ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              {connected ? '● Connected' : 'Connect Wallet'}
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: '56px 64px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div className="fade-in" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px', color: '#fafafa', letterSpacing: '-0.5px' }}>
              {activeScreen === 'dashboard' ? 'Dashboard' :
               activeScreen === 'protection' ? 'Protection Settings' :
               activeScreen === 'proof' ? 'Proof Verification' : 'Withdraw'}
            </h2>
            {connected && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p style={{ fontSize: '14px', color: '#71717a', fontWeight: 500 }}>7xK4...mP9q</p>
                <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }} />
              </div>
            )}
          </div>

          {activeScreen === 'dashboard' && connected && (
            <>
              <div className="fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                  { label: 'Total Protected', value: metrics.totalProtected.toFixed(2), unit: 'SOL', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
                  { label: 'SOL Price', value: `$${metrics.solPrice.toFixed(2)}`, unit: '', gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
                  { label: 'Status', value: hedgeActive ? 'Active' : 'Inactive', unit: '', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
                  { label: 'P&L', value: metrics.protectionPnL.toFixed(2), unit: 'SOL', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }
                ].map((m, i) => (
                  <div key={i} className="card" style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: m.gradient }} />
                    <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</p>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: '#fafafa', lineHeight: '1' }}>
                      {m.value}
                      {m.unit && <span style={{ fontSize: '16px', color: '#71717a', marginLeft: '6px', fontWeight: 500 }}>{m.unit}</span>}
                    </p>
                  </div>
                ))}
              </div>

              <div className="fade-in delay-2 card" style={{ padding: '32px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fafafa' }}>Active Protection Rule</h3>
                  <button
                    onClick={() => setActiveScreen('protection')}
                    style={{
                      padding: '10px 20px',
                      background: '#27272a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fafafa',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Edit Rule
                  </button>
                </div>
                <p style={{ fontSize: '15px', color: '#a1a1aa', fontWeight: 500, lineHeight: '1.6' }}>
                  Triggers at <span style={{ color: '#6366f1', fontWeight: 600 }}>-5%</span> →
                  <span style={{ color: '#6366f1', fontWeight: 600 }}> 50% hedge</span> →
                  <span style={{ color: '#71717a' }}> 2hr timeout</span>
                </p>
              </div>

              {hedgeActive && (
                <div className="fade-in delay-3 card" style={{ padding: '32px', marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '28px', color: '#fafafa' }}>Active Hedge Monitor</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                    {[
                      { label: 'Entry Price', value: `$${metrics.solPrice.toFixed(2)}`, color: '#fafafa' },
                      { label: 'Short Size', value: `$${hedgeSize.toFixed(2)}`, color: '#fafafa' },
                      { label: 'Funding Cost', value: `${metrics.fundingCost.toFixed(6)} SOL`, color: '#f59e0b' },
                      { label: 'Liquidation', value: '+42.3%', color: '#22c55e' }
                    ].map((item, i) => (
                      <div key={i}>
                        <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: item.color }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="fade-in delay-4 card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: '#fafafa' }}>Recent Activity</h3>
                <div>
                  {[
                    { event: 'Hedge opened', time: '14:23:41', status: 'success' },
                    { event: 'Price checked', time: '14:20:15', status: 'neutral' },
                    { event: 'Proof generated', time: '14:18:02', status: 'success' },
                    { event: 'Rule updated', time: '13:45:33', status: 'neutral' }
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < 3 ? '1px solid #27272a' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.status === 'success' ? '#22c55e' : '#52525b', boxShadow: a.status === 'success' ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none' }} />
                        <span style={{ fontSize: '15px', color: '#fafafa', fontWeight: 500 }}>{a.event}</span>
                      </div>
                      <span style={{ fontSize: '14px', color: '#71717a', fontWeight: 500 }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeScreen === 'protection' && connected && (
            <div className="fade-in card" style={{ padding: '48px', maxWidth: '800px' }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trigger Percentage</label>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>{triggerPercent}%</span>
                </div>
                <input type="range" min="1" max="20" value={triggerPercent} onChange={(e) => setTriggerPercent(Number(e.target.value))} />
                <p style={{ fontSize: '13px', color: '#71717a', marginTop: '14px', fontWeight: 500 }}>Hedge activates when SOL drops by this percentage</p>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hedge Percentage</label>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>{hedgePercent}%</span>
                </div>
                <input type="range" min="10" max="100" value={hedgePercent} onChange={(e) => setHedgePercent(Number(e.target.value))} />
                <p style={{ fontSize: '13px', color: '#71717a', marginTop: '14px', fontWeight: 500 }}>Percentage of portfolio to hedge via Drift short</p>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <label style={{ fontSize: '13px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '16px' }}>Timeout Duration</label>
                <select value={timeout} onChange={(e) => setTimeout(e.target.value)} style={{ width: '100%', padding: '16px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', color: '#fafafa', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                  <option>30min</option>
                  <option>1hr</option>
                  <option>2hr</option>
                  <option>4hr</option>
                  <option>never</option>
                </select>
              </div>

              <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', padding: '24px', marginBottom: '32px' }}>
                <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Preview</p>
                <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '1.7', fontWeight: 500 }}>
                  If SOL drops from <span style={{ color: '#6366f1', fontWeight: 600 }}>${metrics.solPrice.toFixed(2)}</span> to <span style={{ color: '#6366f1', fontWeight: 600 }}>${triggerPrice.toFixed(2)}</span>, system opens <span style={{ color: '#6366f1', fontWeight: 600 }}>${hedgeSize.toFixed(2)}</span> short on Drift
                </p>
                <p style={{ fontSize: '13px', color: '#f59e0b', marginTop: '14px', fontWeight: 600 }}>Est. funding cost: ~0.0001 SOL/hr</p>
              </div>

              <button style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                Activate Protection
              </button>
            </div>
          )}

          {activeScreen === 'proof' && connected && (
            <div className="fade-in card" style={{ padding: '48px', maxWidth: '800px' }}>
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rule Hash</p>
                <div style={{ padding: '20px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', fontSize: '13px', color: '#a1a1aa', wordBreak: 'break-all', fontFamily: 'monospace', fontWeight: 500 }}>
                  0x7f3a9b2c8e1d4f6a5c9b8e7d3a2f1c4b9e8d7c6a5b4f3e2d1c9b8a7f6e5d4c3b
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Execution Timestamp</p>
                <p style={{ fontSize: '16px', color: '#fafafa', fontFamily: 'monospace', fontWeight: 600 }}>2026-04-17 14:23:41 UTC</p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '20px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Operator Signatures (2/3)</p>
                {[
                  { addr: '9xK...7mP2', signed: true },
                  { addr: '4bN...3qR8', signed: true },
                  { addr: '2fM...9sT5', signed: false }
                ].map((op, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: op.signed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                      {op.signed ? '✓' : '○'}
                    </div>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#a1a1aa', fontWeight: 600 }}>{op.addr}</span>
                  </div>
                ))}
              </div>

              <button style={{ width: '100%', padding: '18px', background: '#27272a', border: 'none', borderRadius: '10px', color: '#fafafa', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                Verify On-Chain
              </button>
            </div>
          )}

          {activeScreen === 'withdraw' && connected && (
            <div className="fade-in card" style={{ padding: '48px', maxWidth: '800px' }}>
              <div style={{ marginBottom: '40px' }}>
                <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Balance</p>
                <p style={{ fontSize: '48px', fontWeight: 700, color: '#fafafa', lineHeight: '1' }}>
                  {metrics.totalProtected.toFixed(2)} <span style={{ fontSize: '24px', color: '#71717a', fontWeight: 600 }}>SOL</span>
                </p>
              </div>

              {hedgeActive && (
                <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', marginBottom: '32px' }}>
                  <p style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>⚠</span>
                    Active hedge will be auto-closed. Estimated cost: 0.003 SOL
                  </p>
                </div>
              )}

              <button style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                Confirm Withdrawal
              </button>
            </div>
          )}

          {!connected && (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '18px', color: '#71717a', marginBottom: '32px', fontWeight: 500 }}>Connect your wallet to access ShieldVault</p>
                <button onClick={() => setConnected(true)} style={{ padding: '18px 48px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                  Connect Wallet
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
