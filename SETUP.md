# Cipher Yield - Complete Setup

## Frontend (Current Repository)

The frontend is fully functional and works with on-chain Solana data.

```bash
npm install
npm run dev
```

Visit `http://localhost:3001` (or whatever port Next.js assigns)

## Backend (Optional - Provides Additional Features)

The backend adds:
- Real-time price feeds from multiple oracles
- Execution logs and proof bundles
- System health monitoring

### Backend is currently in: `/Users/0xkartikvyas/Project/solana-frontier/cipher-yield/`

If you want to run the backend:

```bash
# Navigate to backend
cd /path/to/cipher-yield/backend

# Already done: npm install

# Set up environment
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Option 1: Use Docker for PostgreSQL + Redis
npm run docker:up
npm run prisma:migrate
npm run dev

# Option 2: Use existing PostgreSQL + Redis
# Update .env with your database URLs
npm run prisma:migrate
npm run dev
```

Backend will run on `http://localhost:3000`

## Current Status

✅ Frontend working perfectly with on-chain data
✅ Backend dependencies installed
⏳ Backend needs database setup to run

The UI gracefully handles missing backend - you'll see "OFFLINE" indicators for backend-dependent features.
