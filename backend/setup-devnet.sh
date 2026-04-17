#!/bin/bash
set -e

echo "🚀 Setting up ShieldVault for Solana Devnet"

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "Installing Anchor..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
fi

# Set to devnet
solana config set --url devnet

# Create keys directory
mkdir -p keys

# Generate vault keypair
echo "Generating vault keypair..."
solana-keygen new --no-bip39-passphrase --outfile keys/vault-keypair.json --force

# Generate operator keypairs
echo "Generating operator keypairs..."
solana-keygen new --no-bip39-passphrase --outfile keys/operator1.json --force
solana-keygen new --no-bip39-passphrase --outfile keys/operator2.json --force
solana-keygen new --no-bip39-passphrase --outfile keys/operator3.json --force

# Airdrop SOL to vault
echo "Requesting airdrop for vault..."
VAULT_PUBKEY=$(solana-keygen pubkey keys/vault-keypair.json)
solana airdrop 2 $VAULT_PUBKEY --url devnet || echo "Airdrop may have failed, continuing..."

# Generate encryption key
echo "Generating encryption key..."
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Convert keypairs to base58 for .env
echo "Converting keypairs to base58..."
OPERATOR_1_KEY=$(cat keys/operator1.json)
OPERATOR_2_KEY=$(cat keys/operator2.json)
OPERATOR_3_KEY=$(cat keys/operator3.json)

# Create .env file
cat > .env << ENVEOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/shieldvault
REDIS_URL=redis://localhost:6379

SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_CLUSTER=devnet
VAULT_KEYPAIR_PATH=./keys/vault-keypair.json

OPERATOR_1_KEY=$OPERATOR_1_KEY
OPERATOR_2_KEY=$OPERATOR_2_KEY
OPERATOR_3_KEY=$OPERATOR_3_KEY

ENCRYPTION_KEY=$ENCRYPTION_KEY

DRIFT_ENV=devnet
PYTH_ENDPOINT=https://hermes.pyth.network
JUPITER_PRICE_API=https://price.jup.ag/v4

PORT=3000
LOG_LEVEL=info
NODE_ENV=development
ENVEOF

echo "✅ Devnet setup complete!"
echo "Vault address: $VAULT_PUBKEY"
echo ""
echo "Next steps:"
echo "1. Start PostgreSQL: docker run --name shieldvault-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=shieldvault -p 5432:5432 -d postgres:15"
echo "2. Start Redis: docker run --name shieldvault-redis -p 6379:6379 -d redis:7"
echo "3. Run migrations: npm run prisma:migrate"
echo "4. Build Anchor program: cd programs/vault && anchor build && anchor deploy"
echo "5. Start backend: npm run dev"
