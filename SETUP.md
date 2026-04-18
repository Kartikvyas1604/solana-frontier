# Setup Guide

## Prerequisites
- Rust and Anchor CLI installed
- Solana CLI installed
- Node.js 18+

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build and Deploy Program
```bash
# Build the Anchor program
npm run program:build

# Deploy to devnet (requires SOL in wallet)
npm run program:deploy
```

### 3. Start Web App
```bash
npm run dev
```

Visit http://localhost:3000

## Program Deployment

The Cipher Yield program must be deployed before using the UI:

1. Ensure you have devnet SOL: `solana airdrop 2 --url devnet`
2. Build: `npm run program:build`
3. Deploy: `npm run program:deploy`
4. Note the program ID and update if needed

## Troubleshooting

**"Program not deployed" error**: Run the deployment commands above.

**Transaction fails**: Check you have devnet SOL in your wallet.

**Build errors**: Ensure Rust/Anchor versions match `programs/cipher-yield/rust-toolchain.toml`.
