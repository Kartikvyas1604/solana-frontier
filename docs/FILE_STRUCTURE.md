# Cipher Yield - Production File Structure

```
cipher-yield/
├── apps/
│   └── web/                          # Next.js frontend
│       ├── app/
│       │   ├── (dashboard)/          # Dashboard routes group
│       │   │   ├── page.tsx          # Main dashboard
│       │   │   ├── vault/page.tsx    # Vault operations
│       │   │   ├── strategies/page.tsx
│       │   │   ├── positions/page.tsx
│       │   │   └── analytics/page.tsx
│       │   ├── layout.tsx            # Root layout with providers
│       │   └── globals.css           # Global styles
│       ├── components/
│       │   ├── layout/
│       │   │   └── Navigation.tsx    # Top nav
│       │   ├── dashboard/            # Dashboard-specific components
│       │   ├── vault/                # Vault-specific components
│       │   └── shared/               # Shared UI components
│       ├── lib/
│       │   ├── hooks/                # Custom React hooks
│       │   ├── utils/                # Utility functions
│       │   └── constants.ts          # App constants
│       └── public/                   # Static assets
│
├── packages/
│   ├── sdk/                          # TypeScript SDK
│   │   ├── src/
│   │   │   ├── instructions/         # Transaction builders
│   │   │   ├── accounts/             # Account utilities
│   │   │   ├── types/                # Type definitions
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                           # Component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── wallet/           # Wallet components
│   │   │   │   ├── forms/            # Form components
│   │   │   │   └── primitives/       # Base components
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                       # Shared configuration
│       ├── tsconfig.base.json
│       ├── eslint-preset.js
│       └── prettier.config.js
│
├── programs/
│   └── cipher-yield/                 # Anchor program
│       ├── programs/cipher-yield/src/
│       │   ├── instructions/         # Instruction handlers
│       │   ├── state/                # State definitions
│       │   ├── errors.rs             # Error types
│       │   └── lib.rs                # Program entry
│       ├── tests/                    # Integration tests
│       └── Anchor.toml
│
├── docs/                             # Documentation
│   ├── architecture/
│   ├── api/
│   └── guides/
│
└── scripts/                          # Build/deploy scripts
    ├── deploy.sh
    └── test.sh
```

## Key Improvements

**Route Organization:**
- Group related pages in `(dashboard)` folder
- Cleaner URL structure
- Better code organization

**Component Structure:**
- Organized by feature/domain
- Shared components separated
- Clear hierarchy

**SDK Organization:**
- Separated by concern (instructions, accounts, types)
- Easier to navigate and maintain

**Documentation:**
- Centralized in `/docs`
- Organized by topic

This structure scales to unicorn-level complexity while remaining navigable.
