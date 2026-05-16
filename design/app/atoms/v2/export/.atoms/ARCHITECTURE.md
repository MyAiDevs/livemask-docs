# Architecture Design

## System Overview
LiveMask is a full-stack web application with React frontend and Atoms Cloud backend. The frontend provides a mobile-first VPN management interface with connection simulation, node selection, subscription management, and diagnostics.

## Tech Stack
- Frontend: React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS
- Backend: Atoms Cloud (Auth, Database, Edge Functions)
- State: React hooks + React Query
- SDK: @metagptx/web-sdk for auth and entity access

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Auth | Login/signup via Atoms Cloud | lib/api.ts, pages/AuthCallback.tsx |
| Home | Connection status, connect/disconnect | pages/Home.tsx |
| Nodes | Node listing, search, filter, favorites | pages/Nodes.tsx |
| Plan | Subscription display, upgrade | pages/Plan.tsx |
| Profile | Settings, security, diagnostics link | pages/Profile.tsx |
| Onboarding | 3-step intro flow | pages/Onboarding.tsx |
| Splash | Launch screen with config check | pages/Splash.tsx |
| Diagnostics | Issue reporting | pages/Diagnostics.tsx |
| Components | Shared UI components | components/livemask/* |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | React hooks + context | Simple enough for MVP, no Redux needed |
| Connection simulation | Client-side state machine | No real VPN backend, simulate states |
| Bottom navigation | Custom component | 4-tab layout per design spec |

## File Tree Plan
```
src/
├── App.tsx
├── pages/
│   ├── Index.tsx (redirects to Splash)
│   ├── Splash.tsx
│   ├── Onboarding.tsx
│   ├── Home.tsx
│   ├── Nodes.tsx
│   ├── Plan.tsx
│   ├── Profile.tsx
│   └── Diagnostics.tsx
├── components/
│   └── livemask/
│       ├── BottomNav.tsx
│       ├── ConnectionStatus.tsx
│       └── NodeCard.tsx
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── connection-store.ts
└── index.css
```

## Implementation Guide
1. Update CSS variables for deep teal theme
2. Build shared components (BottomNav, ConnectionStatus, NodeCard)
3. Build all pages following the screen specs
4. Wire up routing with bottom navigation
5. Integrate with Atoms Cloud for auth, nodes, subscriptions, diagnostics