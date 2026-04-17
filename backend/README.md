# ShieldVault Backend

Production-ready Node.js TypeScript backend for non-custodial SOL protection vault.

## Architecture

- **Fastify** API server with wallet signature auth
- **PostgreSQL** + Prisma for data persistence
- **Redis** + BullMQ for job queues and caching
- **Solana** on-chain vault program (Anchor)
- **Drift Protocol** for SOL-PERP hedging
- **Pyth + Jupiter** dual-source price consensus

## Setup

```bash
# Install dependencies
npm install

# Setup database
cp .env.example .env
# Edit .env with your configuration

# Run Prisma migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Build Anchor program
cd programs/vault
anchor build
anchor deploy

# Start services
npm run dev
```

## Services

- **Price Monitor** - Polls Pyth/Jupiter every 2-3s
- **Trigger Evaluator** - Checks rules every 5s
- **Hedge Manager** - Processes hedge open/close jobs
- **Fallback Worker** - Handles stuck/timeout hedges

## API Endpoints

### Vault
- `POST /api/vault/deposit` - Deposit SOL
- `POST /api/vault/withdraw` - Withdraw SOL
- `GET /api/vault/state/:walletAddress` - Get vault state

### Policy
- `POST /api/policy/create` - Create protection rule
- `GET /api/policy/:walletAddress` - Get active rule
- `DELETE /api/policy/:walletAddress` - Deactivate rule

### Price
- `GET /api/price/current` - Current consensus price
- `GET /api/price/history` - Price history

### Hedge
- `GET /api/hedge/active/:walletAddress` - Active hedge
- `GET /api/hedge/history/:walletAddress` - Hedge history
- `POST /api/hedge/close` - Manual close

### Proof
- `GET /api/proof/:hedgePositionId` - Get proof bundle
- `POST /api/proof/verify` - Verify proof

### Audit
- `GET /api/audit/:walletAddress` - Audit logs

## Security

- AES-256-GCM encryption for rules
- 2-of-3 operator approval system
- Wallet signature authentication
- Rate limiting (100 req/min per wallet)
- No private keys in logs

## Testing

```bash
npm test
```

## Production Deployment

1. Set `SOLANA_CLUSTER=mainnet-beta`
2. Set `DRIFT_ENV=mainnet-beta`
3. Configure production RPC endpoints
4. Set strong `ENCRYPTION_KEY`
5. Deploy Anchor program to mainnet
6. Start all workers as separate processes
