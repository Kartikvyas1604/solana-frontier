# ShieldVault - Complete Deployment Guide

## Real Solana Devnet Integration

This guide walks you through deploying ShieldVault with real wallet connections, live price feeds, and Drift Protocol integration on Solana devnet.

---

## Prerequisites

- Node.js 18+ and npm
- Solana CLI tools
- Anchor CLI (for smart contract deployment)
- Docker and Docker Compose
- A Solana wallet (Phantom, Solflare, etc.)

---

## Step 1: Infrastructure Setup

Start PostgreSQL and Redis:

```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

---

## Step 2: Generate Solana Keypairs

Run the automated setup script:

```bash
chmod +x setup-devnet.sh
./setup-devnet.sh
```

This script will:
- Install Solana CLI and Anchor (if needed)
- Generate vault keypair
- Generate 3 operator keypairs
- Request devnet SOL airdrop
- Create backend/.env with all keys

**Important**: The script creates `backend/keys/` directory with sensitive keypairs. Never commit these to git.

---

## Step 3: Deploy Anchor Smart Contract

```bash
cd programs/vault
anchor build
anchor deploy --provider.cluster devnet
```

Copy the deployed program ID from the output. You'll need it for the next step.

---

## Step 4: Configure Environment Variables

### Backend (.env already created by setup script)

Verify `backend/.env` contains:
- `DATABASE_URL`
- `REDIS_URL`
- `SOLANA_RPC_URL`
- `VAULT_KEYPAIR_PATH`
- `OPERATOR_1_KEY`, `OPERATOR_2_KEY`, `OPERATOR_3_KEY`
- `ENCRYPTION_KEY`

### Frontend

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_VAULT_ADDRESS=<YOUR_DEPLOYED_PROGRAM_ID>
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

Replace `<YOUR_DEPLOYED_PROGRAM_ID>` with the program ID from Step 3.

---

## Step 5: Setup Database

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

---

## Step 6: Start Backend Services

### Option A: Development (separate terminals)

Terminal 1 - API Server:
```bash
cd backend
npm run dev
```

Terminal 2 - Price Monitor:
```bash
cd backend
npm run worker:price
```

Terminal 3 - Trigger Evaluator:
```bash
cd backend
npm run worker:trigger
```

Terminal 4 - Hedge Manager:
```bash
cd backend
npm run worker:hedge
```

Terminal 5 - Fallback Worker:
```bash
cd backend
npm run worker:fallback
```

### Option B: Production (PM2)

```bash
cd backend
npm run build
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Monitor services:
```bash
pm2 status
pm2 logs
```

---

## Step 7: Start Frontend

```bash
npm run dev
```

Open http://localhost:3001 in your browser.

---

## Step 8: Connect Wallet & Test

1. **Connect Wallet**: Click "Connect Wallet" and select Phantom/Solflare
2. **Deposit SOL**: Navigate to Deposit tab, enter amount (e.g., 0.1 SOL), confirm transaction
3. **Set Protection Rule**: Go to Protection tab, configure trigger %, hedge %, timeout
4. **Monitor**: Dashboard shows real-time price, vault balance, active hedges

---

## Real Integration Features

### ✅ Implemented

- **Real Wallet Connection**: Solana Wallet Adapter with Phantom/Solflare support
- **Live Price Feeds**: Dual-source consensus (Pyth + Jupiter) with 0.5% deviation check
- **On-Chain Transactions**: Real SOL transfers verified on devnet
- **Encrypted Rules**: AES-256-GCM encryption for protection policies
- **2-of-3 Operator Approval**: Ed25519 signature verification
- **Database Persistence**: PostgreSQL with Prisma ORM
- **Worker Architecture**: BullMQ job queues for async processing
- **Proof Generation**: Cryptographic execution proofs

### 🔄 Requires Configuration

- **Drift Protocol Integration**: Needs Drift account setup with margin
  - Create Drift account: https://app.drift.trade
  - Fund with devnet USDC
  - Update `DRIFT_ACCOUNT_ADDRESS` in backend/.env

---

## API Endpoints

All endpoints available at `http://localhost:3000/api`:

- `POST /vault/deposit` - Verify and record deposit
- `POST /vault/withdraw` - Process withdrawal
- `GET /vault/state/:wallet` - Get vault balance
- `POST /policy/create` - Create protection rule
- `GET /policy/:wallet` - Get active policy
- `GET /price/current` - Current SOL price
- `GET /hedge/active/:wallet` - Active hedge position
- `POST /hedge/close` - Manually close hedge

---

## Monitoring & Debugging

### Check Backend Health
```bash
curl http://localhost:3000/api/price/current
```

### View Logs
```bash
# PM2
pm2 logs shieldvault-api

# Development
# Check terminal output
```

### Database Inspection
```bash
cd backend
npx prisma studio
```

### Redis Inspection
```bash
redis-cli
> KEYS *
> GET price:current
```

---

## Security Checklist

- [ ] Keypairs stored securely (not in git)
- [ ] `.env` files added to `.gitignore`
- [ ] Operator keys have sufficient SOL for signatures
- [ ] Vault keypair funded with devnet SOL
- [ ] RPC rate limits configured
- [ ] CORS origins restricted in production
- [ ] Database backups configured
- [ ] SSL/TLS for API in production

---

## Troubleshooting

### "Wallet not connected"
- Ensure wallet extension is installed
- Check browser console for errors
- Verify devnet is selected in wallet

### "Transaction failed"
- Check wallet has sufficient SOL for fees
- Verify RPC endpoint is responsive
- Check backend logs for errors

### "Price consensus failed"
- Pyth/Jupiter APIs may be rate-limited
- Check backend worker logs
- Verify network connectivity

### "Operator approval timeout"
- Ensure operator keypairs are valid
- Check operator keys have SOL for signatures
- Verify backend workers are running

---

## Production Deployment

For mainnet deployment:

1. Use paid RPC endpoints (Helius, QuickNode)
2. Deploy to production infrastructure (AWS, GCP)
3. Enable monitoring (Datadog, Sentry)
4. Set up alerting for worker failures
5. Configure automated backups
6. Security audit smart contract
7. Load testing
8. Update `SOLANA_CLUSTER=mainnet-beta`

---

## Support

- Backend issues: Check `backend/PRODUCTION_SETUP.md`
- Smart contract: See `programs/vault/README.md`
- General questions: Open GitHub issue

---

**Status**: ✅ Real devnet integration complete. All hardcoded data removed. Production-ready architecture.
