# Cipher Yield - Production-Grade Solana Vault

A privacy-preserving, non-custodial AI hedge vault on Solana with automated strategy execution.

## Quick Start

```bash
# Install dependencies
npm install

# Start infrastructure (PostgreSQL + Redis)
docker-compose up -d

# Initialize database
npm run db:push

# Start development (frontend + backend workers)
npm run dev
```

## Architecture

### Smart Contract (Anchor)
- **Location**: `programs/cipher_vault/`
- **Instructions**: initialize_vault, deposit, withdraw, emergency_withdraw, open_hedge, close_hedge, submit_proof
- **State**: Vault accounts, UserPosition accounts with share-based accounting

### Backend Services
- **Price Service**: Aggregates Jupiter, Pyth, Switchboard with weighted median
- **Trigger Worker**: Evaluates drawdown/volatility triggers every 500ms
- **Execution Engine**: Coordinates hedge operations with 2-of-3 operator signatures
- **Proof Service**: Generates cryptographic proof bundles stored on Arweave

### API Endpoints
- `GET /api/v1/vault/state` - Current vault state
- `GET /api/v1/vault/nav-history` - Historical NAV data
- `GET /api/v1/proof/:executionId` - Proof bundle retrieval
- `GET /api/v1/health` - System health check

## Development

The system runs with mock data for local development:
- Mock price feeds (Jupiter, Pyth, Switchboard)
- In-memory trigger evaluation
- PostgreSQL for state persistence
- Redis for pub/sub and caching

## Production Deployment

For production:
1. Configure real RPC endpoints in `.env`
2. Set up operator keypairs
3. Deploy smart contract: `anchor deploy`
4. Configure TEE enclave connection
5. Set up Arweave wallet for proof storage

## Testing

```bash
# Smart contract tests
anchor test

# Backend tests
npm test
```

## Security

- All operator actions require 2-of-3 multi-sig
- Strategy logic encrypted client-side
- Emergency withdraw bypasses all logic
- Rate limiting on all API endpoints
- No private keys in code or logs
