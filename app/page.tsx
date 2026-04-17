'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useShieldVault } from '@/hooks/useShieldVault';

export default function ShieldVault() {
  const { connected } = useWallet();
  const {
    walletAddress,
    vaultState,
    priceData,
    activeHedge,
    policy,
    loading,
    deposit,
    withdraw,
    createPolicy,
    closeHedge,
  } = useShieldVault();

  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [triggerPercent, setTriggerPercent] = useState(5);
  const [hedgePercent, setHedgePercent] = useState(50);
  const [timeout, setTimeout] = useState(120);
  const [depositAmount, setDepositAmount] = useState('');

  const totalProtected = vaultState?.solAmount || 0;
  const solPrice = priceData?.consensusPrice || 0;
  const hedgeActive = !!activeHedge;
  const protectionPnL = activeHedge?.realizedPnl || 0;
  const fundingCost = activeHedge?.fundingPaidTotal || 0;

  const triggerPrice = solPrice * (1 - triggerPercent / 100);
  const hedgeSize = (totalProtected * hedgePercent / 100) * solPrice;

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    try {
      await deposit(Number(depositAmount));
      setDepositAmount('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleWithdraw = async () => {
    if (!vaultState?.shares) return;
    try {
      await withdraw(vaultState.shares);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      await createPolicy({
        triggerPercent,
        hedgePercent,
        timeoutMinutes: timeout,
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCloseHedge = async () => {
    try {
      await closeHedge();
    } catch (error: any) {
      alert(error.message);
    }
  };

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

        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wallet-adapter-button {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
          border: none !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          padding: 16px !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
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
              { id: 'deposit', label: 'Deposit', icon: '↑' },
              { id: 'protection', label: 'Protection', icon: '◈' },
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
            <WalletMultiButton style={{ width: '100%' }} />
          </div>
        </aside>

        <main style={{ flex: 1, padding: '56px 64px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div className="fade-in" style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px', color: '#fafafa', letterSpacing: '-0.5px' }}>
              {activeScreen === 'dashboard' ? 'Dashboard' :
               activeScreen === 'deposit' ? 'Deposit SOL' :
               activeScreen === 'protection' ? 'Protection Settings' : 'Withdraw'}
            </h2>
            {connected && walletAddress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p style={{ fontSize: '14px', color: '#71717a', fontWeight: 500 }}>
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </p>
                <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }} />
              </div>
            )}
          </div>

          {activeScreen === 'dashboard' && connected && (
            <>
              <div className="fade-in delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                  { label: 'Total Protected', value: totalProtected.toFixed(2), unit: 'SOL', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
                  { label: 'SOL Price', value: `$${solPrice.toFixed(2)}`, unit: '', gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
                  { label: 'Status', value: hedgeActive ? 'Active' : 'Inactive', unit: '', gradient: hedgeActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #52525b 0%, #3f3f46 100%)' },
                  { label: 'P&L', value: protectionPnL.toFixed(4), unit: 'SOL', gradient: protectionPnL >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }
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

              {policy && (
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
                    Triggers at <span style={{ color: '#6366f1', fontWeight: 600 }}>-{policy.triggerPercent}%</span> →
                    <span style={{ color: '#6366f1', fontWeight: 600 }}> {policy.hedgePercent}% hedge</span> →
                    <span style={{ color: '#71717a' }}> {policy.timeoutMinutes}min timeout</span>
                  </p>
                </div>
              )}

              {hedgeActive && activeHedge && (
                <div className="fade-in delay-3 card" style={{ padding: '32px', marginBottom: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fafafa' }}>Active Hedge Monitor</h3>
                    <button
                      onClick={handleCloseHedge}
                      disabled={loading}
                      style={{
                        padding: '10px 20px',
                        background: '#ef4444',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {loading ? 'Closing...' : 'Close Hedge'}
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                    {[
                      { label: 'Entry Price', value: `$${activeHedge.entryPrice?.toFixed(2) || '0.00'}`, color: '#fafafa' },
                      { label: 'Short Size', value: `${activeHedge.shortSizeSol?.toFixed(2) || '0.00'} SOL`, color: '#fafafa' },
                      { label: 'Funding Cost', value: `${fundingCost.toFixed(6)} SOL`, color: '#f59e0b' },
                      { label: 'Status', value: activeHedge.status || 'OPEN', color: '#22c55e' }
                    ].map((item, i) => (
                      <div key={i}>
                        <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: item.color }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeScreen === 'deposit' && connected && (
            <div className="fade-in card" style={{ padding: '48px', maxWidth: '800px' }}>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '13px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '16px' }}>
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#fafafa',
                    fontSize: '24px',
                    fontWeight: 600
                  }}
                />
              </div>

              <button
                onClick={handleDeposit}
                disabled={loading || !depositAmount}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                {loading ? 'Processing...' : 'Deposit SOL'}
              </button>
            </div>
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
                <label style={{ fontSize: '13px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '16px' }}>Timeout Duration (minutes)</label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#fafafa',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                />
              </div>

              <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', padding: '24px', marginBottom: '32px' }}>
                <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Preview</p>
                <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '1.7', fontWeight: 500 }}>
                  If SOL drops from <span style={{ color: '#6366f1', fontWeight: 600 }}>${solPrice.toFixed(2)}</span> to <span style={{ color: '#6366f1', fontWeight: 600 }}>${triggerPrice.toFixed(2)}</span>, system opens <span style={{ color: '#6366f1', fontWeight: 600 }}>${hedgeSize.toFixed(2)}</span> short on Drift
                </p>
              </div>

              <button
                onClick={handleCreatePolicy}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                {loading ? 'Activating...' : 'Activate Protection'}
              </button>
            </div>
          )}

          {activeScreen === 'withdraw' && connected && (
            <div className="fade-in card" style={{ padding: '48px', maxWidth: '800px' }}>
              <div style={{ marginBottom: '40px' }}>
                <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Balance</p>
                <p style={{ fontSize: '48px', fontWeight: 700, color: '#fafafa', lineHeight: '1' }}>
                  {totalProtected.toFixed(2)} <span style={{ fontSize: '24px', color: '#71717a', fontWeight: 600 }}>SOL</span>
                </p>
              </div>

              {hedgeActive && (
                <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', marginBottom: '32px' }}>
                  <p style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>⚠</span>
                    Active hedge will be auto-closed before withdrawal
                  </p>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={loading || totalProtected === 0}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                {loading ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          )}

          {!connected && (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '18px', color: '#71717a', marginBottom: '32px', fontWeight: 500 }}>Connect your wallet to access ShieldVault</p>
                <WalletMultiButton />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
