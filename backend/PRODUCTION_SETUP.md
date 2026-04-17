# ShieldVault Backend - Production Setup Guide

## Critical Setup Steps

### 1. Generate Operator Keypairs

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate 3 operator keypairs
solana-keygen new --no-bip39-passphrase --outfile operator1.json
solana-keygen new --no-bip39-passphrase --outfile operator2.json
solana-keygen new --no-bip39-passphrase --outfile operator3.json

# Convert to base58 for .env (you'll need to write a script or use solana-keygen pubkey)
```

### 2. Generate Encryption Key

```bash
openssl rand -hex 32
```

### 3. Create Vault Keypair

```bash
mkdir -p keys
solana-keygen new --no-bip39-passphrase --outfile keys/vault-keypair.json

# Fund it on devnet
solana airdrop 2 $(solana-keygen pubkey keys/vault-keypair.json) --url devnet
```

### 4. Database Setup

```bash
# Start PostgreSQL
docker run --name shieldvault-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=shieldvault -p 5432:5432 -d postgres:15

# Start Redis
docker run --name shieldvault-redis -p 6379:6379 -d redis:7

# Run migrations
npm run prisma:migrate
```

### 5. Deploy Anchor Program

```bash
cd programs/vault
anchor build
anchor deploy --provider.cluster devnet

# Update VAULT_PROGRAM_ID in vault.service.ts with deployed address
```

### 6. Environment Variables

```bash
cp .env.example .env
# Edit .env with real values from steps above
```

## Running in Production

### Start All Services

```bash
# Terminal 1: API Server
npm start

# Terminal 2: Price Monitor
npm run worker:price

# Terminal 3: Trigger Evaluator
npm run worker:trigger

# Terminal 4: Hedge Manager
npm run worker:hedge

# Terminal 5: Fallback Worker
npm run worker:fallback
```

### Using PM2 (Recommended)

```bash
npm install -g pm2

# Create ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Real Wallet Integration

The frontend needs to integrate with Solana wallet adapters:

```typescript
// Install in frontend
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets

// Use real wallet signatures
const signature = await wallet.signMessage(message);
```

## Production Checklist

- [ ] Real operator keypairs generated and funded
- [ ] Vault keypair created and funded
- [ ] Encryption key generated (32 bytes)
- [ ] Database running and migrated
- [ ] Redis running
- [ ] Anchor program deployed
- [ ] All environment variables set
- [ ] RPC endpoint configured (use paid RPC for production)
- [ ] Monitoring setup (logs, metrics)
- [ ] Backup strategy for database
- [ ] SSL/TLS certificates for API
- [ ] Rate limiting configured
- [ ] CORS origins restricted

## Known Limitations

1. **Wallet Connection**: Frontend needs real Solana wallet adapter integration
2. **Price Feeds**: Using public endpoints (consider paid Pyth/Jupiter for production)
3. **Drift Integration**: Requires real Drift account with margin
4. **Transaction Verification**: Basic implementation, needs enhancement for edge cases
5. **Error Recovery**: Workers need more robust error handling and alerting

## Next Steps for Production

1. Integrate real wallet adapter in frontend
2. Set up monitoring (Datadog, Sentry)
3. Configure paid RPC endpoints
4. Add health checks and alerting
5. Set up CI/CD pipeline
6. Add comprehensive integration tests
7. Security audit of smart contract
8. Load testing
