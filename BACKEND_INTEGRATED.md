# ✅ Backend Integrated into Next.js

The backend is now part of your Next.js app. Everything runs together with one command:

```bash
npm run dev
```

## What Changed

- Created Next.js API routes at `apps/web/app/api/v1/`
- Backend endpoints now served by Next.js:
  - `/api/v1/health` - Health check
  - `/api/v1/vault/state` - Vault state
  - `/api/v1/vault/nav-history` - Price history
  - `/api/v1/proof/list` - Proof bundles
  - `/api/v1/proof/[id]` - Individual proof

- Updated frontend to use relative URLs (`/api/v1` instead of `http://localhost:3000/api/v1`)

## No Separate Backend Server Needed

The standalone backend in `cipher-yield/backend/` is no longer needed. Everything runs in Next.js now.

Just run `npm run dev` from the root and both frontend + backend work together.
