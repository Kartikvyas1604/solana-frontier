# Deployment Instructions

The Anchor program needs to be built and deployed before the UI will work.

## Issue
The build is failing due to Solana toolchain configuration. This is a common issue with Anchor/Solana setup.

## Quick Fix

You need to deploy the program manually:

```bash
# Navigate to program directory
cd /Users/0xkartikvyas/Project/solana-frontier/programs/cipher-yield

# Ensure you have devnet SOL
solana airdrop 2 --url devnet

# Build and deploy
anchor build
anchor deploy --provider.cluster devnet
```

## Alternative: Use Localnet for Testing

For immediate testing without deployment issues:

```bash
# Start local validator
solana-test-validator

# In another terminal, deploy locally
cd programs/cipher-yield
anchor build
anchor deploy --provider.cluster localnet
```

Then update the web app to use localnet in `apps/web/app/layout.tsx`:
```typescript
const endpoint = "http://localhost:8899";
```

## Current Status

- ✅ Monorepo structure complete
- ✅ Anchor program code written (modular architecture)
- ✅ SDK package with transaction builders
- ✅ UI components with wallet integration
- ✅ Web app with modern styling
- ⏳ Program deployment needed

Once deployed, the UI will work end-to-end for deposits and withdrawals.
