---
last_updated: 2026-05-16T17:05:27Z
---

# Architecture Design

## System Overview
Single-page React application serving as an admin dashboard for the LiveMask backend system. Uses client-side routing with mock data to demonstrate all management views.

## Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- shadcn/ui + Tailwind CSS (UI components & styling)
- Recharts (data visualization)
- React Router (client-side routing)
- TanStack Query (data fetching infrastructure)

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Layout | Sidebar navigation, dark theme shell | src/components/DashboardLayout.tsx |
| Dashboard | Overview metrics, charts, events | src/pages/Index.tsx |
| Users | User management table with filters | src/pages/UsersPage.tsx |
| Nodes | Node health cards with status indicators | src/pages/NodesPage.tsx |
| Payments | Payment order tracking table | src/pages/PaymentsPage.tsx |
| Config | Config registry with version/hash | src/pages/ConfigPage.tsx |
| Audit Logs | Audit trail table with action filtering | src/pages/AuditLogsPage.tsx |
| Feedback | Feedback queue with priority/status | src/pages/FeedbackPage.tsx |
| Mock Data | All demo data and type definitions | src/lib/mock-data.ts |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dark theme only | CSS variables in index.css | Admin dashboards benefit from dark UI for extended use |
| Mock data | Static TypeScript objects | MVP without backend dependency |
| Recharts | Area + Bar charts | Lightweight, React-native charting |
| Single layout component | DashboardLayout wrapper | Consistent sidebar across all pages |

## File Tree Plan
```
src/
├── App.tsx (routing)
├── index.css (dark theme variables)
├── components/
│   └── DashboardLayout.tsx
├── lib/
│   └── mock-data.ts
└── pages/
    ├── Index.tsx
    ├── UsersPage.tsx
    ├── NodesPage.tsx
    ├── PaymentsPage.tsx
    ├── ConfigPage.tsx
    ├── AuditLogsPage.tsx
    └── FeedbackPage.tsx
```

## Implementation Guide
All pages wrap content in DashboardLayout for consistent navigation. Mock data is centralized in lib/mock-data.ts with TypeScript interfaces for type safety. Charts use Recharts with custom dark theme tooltip styling.

