# Drift Protocol Integration Guide

## Overview

ShieldVault uses Drift Protocol to execute SOL-PERP short positions for hedging. This guide covers setup and configuration.

---

## Prerequisites

1. **Drift Account Setup**
   - Visit https://app.drift.trade
   - Connect wallet (same wallet as vault keypair)
   - Switch to devnet
   - Create a Drift account

2. **Fund Drift Account**
   - Deposit USDC as collateral
   - Minimum recommended: $100 USDC for testing
   - Get devnet USDC from faucet: https://spl-token-faucet.com

---

## Configuration

### Environment Variables

Add to `backend/.env`:

```bash
# Drift Protocol
DRIFT_ENV=devnet
DRIFT_ACCOUNT_ADDRESS=<your_drift_account_pubkey>
```

### Initialize Drift Service

The Drift service auto-initializes on first use. To manually initialize:

```typescript
import { driftService } from './modules/hedge/drift.service';

await driftService.initialize();
```

---

## How It Works

### Opening a Short Position

When a protection rule triggers:

1. **Trigger Evaluator** detects price drop
2. **Operator Service** collects 2-of-3 approvals
3. **Hedge Service** calls Drift to open short
4. **Drift Service** executes market order on SOL-PERP

```typescript
const result = await driftService.openShortPosition(
  sizeSOL: 1.5,        // Amount of SOL to short
  slippageBps: 50      // 0.5% slippage tolerance
);
```

### Closing a Position

Positions close automatically on:
- Price recovery (SOL returns to reference price)
- Timeout (configured in protection rule)
- Manual withdrawal

```typescript
const result = await driftService.closePosition(marketIndex);
```

### Position Monitoring

Real-time position state:

```typescript
const state = await driftService.getPositionState(marketIndex);
// Returns: { size, entryPrice, unrealizedPnl, fundingPaid }
```

---

## Market Index Reference

Drift uses market indices to identify perpetual markets:

- `0` = SOL-PERP
- `1` = BTC-PERP
- `2` = ETH-PERP

ShieldVault currently only uses SOL-PERP (index 0).

---

## Error Handling

The Drift service uses Result types for safety:

```typescript
const result = await driftService.openShortPosition(1.0, 50);

if (!result.ok) {
  // Handle error
  console.error(result.error.message);
  
  if (result.error.message === 'INSUFFICIENT_MARGIN') {
    // Need more collateral in Drift account
  }
}
```

Common errors:
- `INSUFFICIENT_MARGIN` - Not enough collateral
- `Drift client not initialized` - Call initialize() first
- `Max retry attempts reached` - RPC issues, check connection

---

## Retry Logic

All Drift operations retry up to 3 times with 1-second delays:
- Handles transient RPC failures
- Exponential backoff not needed for devnet
- Logs each attempt for debugging

---

## Funding Rates

Drift charges funding rates for perpetual positions:

```typescript
const fundingCost = await driftService.getFundingCost(marketIndex);
// Returns total funding paid in USDC
```

Funding rates:
- Typically 0.01% - 0.05% per 8 hours
- Paid continuously while position is open
- Tracked in `HedgePosition.fundingPaidTotal`

---

## Testing on Devnet

### 1. Setup Drift Account

```bash
# Get devnet USDC
# Visit: https://spl-token-faucet.com
# Mint USDC to your wallet

# Deposit to Drift
# Visit: https://app.drift.trade
# Connect wallet, switch to devnet, deposit USDC
```

### 2. Test Opening Position

```bash
# Start backend
cd backend
npm run dev

# Trigger a hedge (via API or worker)
curl -X POST http://localhost:3000/api/hedge/test \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "YOUR_WALLET", "sizeSOL": 0.1}'
```

### 3. Monitor Position

```bash
# Check Drift UI
https://app.drift.trade/overview

# Or via API
curl http://localhost:3000/api/hedge/active/YOUR_WALLET
```

### 4. Close Position

```bash
curl -X POST http://localhost:3000/api/hedge/close \
  -H "Content-Type: application/json" \
  -H "X-Wallet-Signature: YOUR_SIGNATURE" \
  -H "X-Wallet-Message: YOUR_MESSAGE" \
  -d '{"walletAddress": "YOUR_WALLET"}'
```

---

## Production Considerations

### Mainnet Deployment

1. **Update Environment**
   ```bash
   DRIFT_ENV=mainnet-beta
   SOLANA_RPC_URL=<paid_rpc_endpoint>
   ```

2. **Collateral Requirements**
   - Minimum: $1,000 USDC
   - Recommended: $10,000+ for production
   - Maintain 150%+ collateralization ratio

3. **Risk Management**
   - Set max position size limits
   - Monitor liquidation risk
   - Track funding rate costs
   - Implement circuit breakers

### Monitoring

Add alerts for:
- Low collateral warnings
- High funding rate spikes
- Position liquidation risk
- Failed hedge executions

```typescript
// Example: Check collateral health
const freeCollateral = driftClient.getUser().getFreeCollateral();
if (freeCollateral < MINIMUM_THRESHOLD) {
  // Alert: Need to add collateral
}
```

---

## Drift SDK Reference

Full documentation: https://docs.drift.trade

Key concepts:
- **User Account**: Your Drift trading account
- **Collateral**: USDC deposited for margin
- **Free Collateral**: Available for new positions
- **Leverage**: Up to 10x on SOL-PERP
- **Liquidation**: Occurs at ~90% collateral usage

---

## Troubleshooting

### "Drift client not initialized"
```bash
# Ensure initialize() is called before operations
await driftService.initialize();
```

### "Insufficient margin"
```bash
# Check free collateral
const user = driftClient.getUser();
const free = user.getFreeCollateral();
console.log('Free collateral:', free.toString());

# Add more USDC to Drift account
```

### "Position not found"
```bash
# Verify position exists
const position = driftClient.getUser().getPerpPosition(0);
console.log('Position:', position);
```

### RPC Rate Limits
```bash
# Use paid RPC for production
# Recommended: Helius, QuickNode, Triton
SOLANA_RPC_URL=https://your-paid-rpc-endpoint.com
```

---

**Status**: ✅ Drift Protocol integration complete. Ready for devnet testing.
