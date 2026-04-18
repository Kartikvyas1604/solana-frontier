# ✅ Backend Integrated into Next.js

## Single Command Setup

```bash
npm run dev
```

That's it! Frontend + Backend now run together.

## What Was Done

Created Next.js API routes in `apps/web/app/api/v1/`:
- `/api/v1/health` - Health check
- `/api/v1/vault/state` - Vault state
- `/api/v1/vault/nav-history` - Price history
- `/api/v1/proof/list` - Proof bundles
- `/api/v1/proof/[executionId]` - Individual proof

Updated frontend to use relative URLs (`/api/v1` instead of external server).

## No Separate Backend Server

The standalone `cipher-yield/backend/` is no longer needed. Everything runs in Next.js.

Restart `npm run dev` and the dashboard will show "ONLINE" status indicators.
