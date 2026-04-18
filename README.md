# Solana Frontier - Production Monorepo

Clean, modular Solana dApp with Anchor smart contracts, TypeScript SDK, and reusable React components.

## Structure

```
solana-frontier/
├── programs/cipher-yield/    # Anchor program (modular: instructions/state/errors)
├── packages/
│   ├── sdk/                  # TypeScript client (instructions, PDAs, types)
│   ├── ui/                   # React components (WalletConnect, forms)
│   └── config/               # Shared tooling (tsconfig, eslint)
└── apps/web/                 # Next.js frontend
```

## Quick Start

```bash
npm install
npm run build
npm run program:build
npm run dev
```

## Commands

```bash
npm run program:build    # Build Anchor program
npm run program:test     # Run program tests
npm run program:deploy   # Deploy to devnet
npm run dev             # Start web app
```

## Architecture

**Program** (`programs/cipher-yield/`):
- `instructions/` - initialize, deposit, withdraw handlers
- `state/` - Vault and UserAccount definitions
- `errors.rs` - Custom error types

**SDK** (`packages/sdk/`):
- Transaction builders for all instructions
- PDA derivation utilities
- TypeScript types matching on-chain state

**UI** (`packages/ui/`):
- WalletConnect component
- DepositForm and WithdrawForm
- Reusable across apps

**Web** (`apps/web/`):
- Next.js app with wallet provider
- Uses SDK and UI packages

## Security

- Transactions require wallet approval
- Default cluster: devnet
- Simulation before every send
- No private keys in code
