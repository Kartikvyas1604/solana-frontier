'use client';

import { useState, useEffect } from 'react';

export default function CipherYield() {
  const [connected, setConnected] = useState(false);
  const [activeScreen, setActiveScreen] = useState('portfolio');

  const [strategyConfig, setStrategyConfig] = useState({
    drawdownTrigger: 10,
    hedgeRatio: 50,
    timeoutHours: 24,
    volatilityThreshold: 15
  });

  const [metrics, setMetrics] = useState({
    totalAUM: 0,
    solPrice: 0,
    portfolioPnL: 0,
    yieldAPY: 8.42,
    hedgeActive: false,
    fundingRate: 0.000142,
    executionLatency: 0,
    mevSavings: 0
  });

  const [operators] = useState([
    { id: '9xK...7mP2', status: 'active', lastSeen: '2s ago' },
    { id: '4bN...3qR8', status: 'active', lastSeen: '1s ago' },
    { id: '2fM...9sT5', status: 'active', lastSeen: '3s ago' }
  ]);

  const [positions, setPositions] = useState({
    kamino: 24500,
    marginfi: 18300,
    drift: 0
  });

  useEffect(() => {
    let start = 0;
    const targetAUM = 127450;
    const targetPrice = 180.42;
    const targetPnL = 2847.32;
    const duration = 600;
    const steps = 30;
    const increment = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      const progress = Math.min(start / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setMetrics(prev => ({
        ...prev,
        totalAUM: targetAUM * easeOut,
        solPrice: targetPrice * easeOut,
        portfolioPnL: targetPnL * easeOut,
        executionLatency: 2.3 + Math.random() * 0.4,
        mevSavings: 142.5 * easeOut
      }));

      if (progress >= 1) clearInterval(timer);
    }, increment);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <aside style={{ width: '200px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', borderRadius: '2px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--base)' }}>C</span>
          </div>
          <h1 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', letterSpacing: '0.5px' }}>CIPHER YIELD</h1>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRIVATE EXECUTION</p>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            { id: 'portfolio', label: 'PORTFOLIO', icon: '■' },
            { id: 'strategies', label: 'STRATEGIES', icon: '⚡' },
            { id: 'execution', label: 'EXECUTION', icon: '▶' },
            { id: 'proofs', label: 'PROOFS', icon: '✓' },
            { id: 'operators', label: 'OPERATORS', icon: '●' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              style={{
                padding: '10px 12px',
                background: activeScreen === item.id ? 'var(--accent-dim)' : 'transparent',
                border: activeScreen === item.id ? '1px solid var(--accent)' : '1px solid transparent',
                borderRadius: '4px',
                color: activeScreen === item.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 500,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                letterSpacing: '0.5px',
                transition: 'all 120ms'
              }}
            >
              <span style={{ fontSize: '10px', opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setConnected(!connected)}
            style={{
              width: '100%',
              padding: '10px',
              background: connected ? 'var(--accent-dim)' : 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: connected ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '10px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 120ms'
            }}
          >
            {connected ? '● CONNECTED' : 'CONNECT'}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div className="fade-in" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {activeScreen === 'portfolio' ? 'PORTFOLIO' :
             activeScreen === 'strategies' ? 'STRATEGIES' :
             activeScreen === 'execution' ? 'EXECUTION' :
             activeScreen === 'proofs' ? 'PROOFS' : 'OPERATORS'}
          </h2>
          {connected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>G0dc...Xhns</p>
              <div className="pulse-indicator" style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%' }} />
            </div>
          )}
        </div>

        {activeScreen === 'portfolio' && connected && (
          <>
            <div className="fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'TOTAL AUM', value: `$${metrics.totalAUM.toFixed(0)}`, unit: '' },
                { label: 'PORTFOLIO P&L', value: `+$${metrics.portfolioPnL.toFixed(2)}`, unit: '' },
                { label: 'YIELD APY', value: `${metrics.yieldAPY}%`, unit: '' },
                { label: 'MEV SAVED', value: `$${metrics.mevSavings.toFixed(2)}`, unit: '' }
              ].map((m, i) => (
                <div key={i} style={{ padding: '20px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{m.label}</p>
                  <p style={{ fontSize: '24px', fontWeight: 600, color: m.label === 'PORTFOLIO P&L' ? '#00FFB3' : 'var(--text-primary)', lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="fade-in delay-2" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>YIELD ALLOCATIONS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {[
                  { protocol: 'KAMINO', amount: positions.kamino, apy: 9.2 },
                  { protocol: 'MARGINFI', amount: positions.marginfi, apy: 7.8 },
                  { protocol: 'DRIFT HEDGE', amount: positions.drift, apy: 0 }
                ].map((item, i) => (
                  <div key={i}>
                    <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{item.protocol}</p>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', marginBottom: '4px' }}>${item.amount.toFixed(0)}</p>
                    <p style={{ fontSize: '11px', color: item.apy > 0 ? '#00FFB3' : 'var(--text-secondary)', fontWeight: 500 }}>{item.apy > 0 ? `${item.apy}% APY` : 'INACTIVE'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-in delay-3" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>RECENT ACTIVITY</h3>
              <div>
                {[
                  { event: 'Yield rebalanced', protocol: 'Kamino', time: '14:23:41', status: 'success' },
                  { event: 'Strategy evaluated', protocol: 'TEE', time: '14:20:15', status: 'neutral' },
                  { event: 'Proof generated', protocol: 'Arweave', time: '14:18:02', status: 'success' },
                  { event: 'Price sync', protocol: 'Jupiter', time: '14:15:33', status: 'neutral' }
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '1px', background: a.status === 'success' ? 'var(--accent)' : 'var(--text-secondary)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>{a.event}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>• {a.protocol}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeScreen === 'strategies' && connected && (
          <div className="fade-in" style={{ padding: '32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', maxWidth: '800px' }}>
            <div style={{ marginBottom: '32px', padding: '16px', background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '4px' }}>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>ENCRYPTED STRATEGY</p>
              <p style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.6' }}>
                Your strategy rules are encrypted and executed inside a TEE. Only execution proofs are public.
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>DRAWDOWN TRIGGER</label>
                <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{strategyConfig.drawdownTrigger}%</span>
              </div>
              <input type="range" min="5" max="30" value={strategyConfig.drawdownTrigger} onChange={(e) => setStrategyConfig({...strategyConfig, drawdownTrigger: Number(e.target.value)})} style={{ width: '100%', height: '2px', background: 'rgba(0, 212, 255, 0.2)', outline: 'none', WebkitAppearance: 'none', appearance: 'none' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px', fontWeight: 500 }}>Activate hedge when portfolio drops by this percentage</p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>HEDGE RATIO</label>
                <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{strategyConfig.hedgeRatio}%</span>
              </div>
              <input type="range" min="10" max="100" value={strategyConfig.hedgeRatio} onChange={(e) => setStrategyConfig({...strategyConfig, hedgeRatio: Number(e.target.value)})} style={{ width: '100%', height: '2px', background: 'rgba(0, 212, 255, 0.2)', outline: 'none', WebkitAppearance: 'none', appearance: 'none' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px', fontWeight: 500 }}>Percentage of AUM to hedge via Drift perpetuals</p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>VOLATILITY THRESHOLD</label>
                <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{strategyConfig.volatilityThreshold}%</span>
              </div>
              <input type="range" min="5" max="50" value={strategyConfig.volatilityThreshold} onChange={(e) => setStrategyConfig({...strategyConfig, volatilityThreshold: Number(e.target.value)})} style={{ width: '100%', height: '2px', background: 'rgba(0, 212, 255, 0.2)', outline: 'none', WebkitAppearance: 'none', appearance: 'none' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px', fontWeight: 500 }}>Increase hedge ratio during high volatility periods</p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '12px' }}>TIMEOUT DURATION</label>
              <select value={`${strategyConfig.timeoutHours}hr`} onChange={(e) => setStrategyConfig({...strategyConfig, timeoutHours: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', background: 'var(--base)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                <option value="12hr">12 hours</option>
                <option value="24hr">24 hours</option>
                <option value="48hr">48 hours</option>
                <option value="72hr">72 hours</option>
              </select>
            </div>

            <button style={{ width: '100%', padding: '14px', background: 'var(--accent)', border: 'none', borderRadius: '4px', color: 'var(--base)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.8px', transition: 'all 120ms' }}>
              ENCRYPT & DEPLOY STRATEGY
            </button>
          </div>
        )}

        {activeScreen === 'execution' && connected && (
          <>
            <div className="fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'EXEC LATENCY', value: `${metrics.executionLatency.toFixed(1)}s`, status: 'good' },
                { label: 'TEE STATUS', value: 'ACTIVE', status: 'good' },
                { label: 'LAST TRIGGER', value: '2h 14m ago', status: 'neutral' }
              ].map((m, i) => (
                <div key={i} style={{ padding: '20px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{m.label}</p>
                  <p style={{ fontSize: '20px', fontWeight: 600, color: m.status === 'good' ? 'var(--accent)' : 'var(--text-primary)', lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="fade-in delay-2" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>EXECUTION PIPELINE</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { stage: 'Price Consensus', source: 'Jupiter + Pyth', status: 'active', latency: '0.8s' },
                  { stage: 'TEE Evaluation', source: 'AWS Nitro', status: 'active', latency: '1.2s' },
                  { stage: 'Operator Validation', source: '2/3 Threshold', status: 'active', latency: '0.3s' },
                  { stage: 'Trade Execution', source: 'Drift Protocol', status: 'idle', latency: '-' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--base)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>{item.stage}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.source}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '11px', color: item.status === 'active' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>{item.status}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{item.latency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeScreen === 'proofs' && connected && (
          <div className="fade-in" style={{ padding: '32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', maxWidth: '800px' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>STRATEGY HASH</p>
              <div style={{ padding: '14px', background: 'var(--base)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-primary)', wordBreak: 'break-all', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                0x7f3a9b2c8e1d4f6a5c9b8e7d3a2f1c4b9e8d7c6a5b4f3e2d1c9b8a7f6e5d4c3b
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>LAST EXECUTION</p>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>2026-04-18 14:23:41 UTC</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>PROOF BUNDLE</p>
              <div style={{ padding: '14px', background: 'var(--base)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '8px' }}>Arweave TX: ar://Kx9m...3pQ2</p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>Contains: Price data, TEE attestation, operator signatures, execution route</p>
              </div>
            </div>

            <button style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.8px', transition: 'all 120ms' }}>
              VERIFY ON-CHAIN
            </button>
          </div>
        )}

        {activeScreen === 'operators' && connected && (
          <div className="fade-in" style={{ padding: '32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', maxWidth: '800px' }}>
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.6' }}>
                2-of-3 operator threshold ensures execution integrity. All operators must validate TEE output before execution.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>OPERATOR NETWORK (3/3 ACTIVE)</p>
              {operators.map((op, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'var(--base)', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: op.status === 'active' ? 'var(--accent)' : 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{op.id}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>{op.status}</p>
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>{op.lastSeen}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!connected && (
          <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>CONNECT WALLET TO ACCESS</p>
              <button onClick={() => setConnected(true)} style={{ padding: '14px 32px', background: 'var(--accent)', border: 'none', borderRadius: '4px', color: 'var(--base)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.8px', transition: 'all 120ms' }}>
                CONNECT
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
