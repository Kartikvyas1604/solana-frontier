# ✅ Backend Now Integrated into Next.js

## One Command to Run Everything

```bash
npm run dev
```

That's it! Frontend + Backend run together on the same server.

## What Changed

Created Next.js API routes at `apps/web/app/api/v1/`:
- `/api/v1/health` - Health check
- `/api/v1/vault/state` - Vault state
- `/api/v1/vault/nav-history` - Price history  
- `/api/v1/proof/list` - Proof bundles
- `/api/v1/proof/[id]` - Individual proof

Updated frontend to use relative URLs (`/api/v1` instead of `http://localhost:3000/api/v1`)

## No Separate Backend Needed

The standalone `cipher-yield/backend/` directory is no longer needed. Everything is in Next.js now.

Just restart your dev server and the backend APIs will work automatically.
