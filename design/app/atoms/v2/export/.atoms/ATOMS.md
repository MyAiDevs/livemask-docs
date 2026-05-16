# Project Context

## Project Overview
LiveMask - A premium privacy VPN and secure network access web app. Features connection management, node selection, subscription plans, diagnostics, and user settings. Built with React + shadcn/ui + Atoms Cloud backend.

## Key Decisions
| Date | Decision | By | Rationale |
|------|----------|-----|-----------|
| 2026-05-14 | Use Atoms Cloud backend | Alex | Auth, database, CRUD needed for subscriptions, nodes, diagnostics |
| 2026-05-14 | Deep teal/cyan-green primary color | Alex | Per design brief - premium network utility feel |
| 2026-05-14 | Mobile-first responsive web layout | Alex | Design brief targets mobile VPN app experience |
| 2026-05-14 | Bottom tab navigation (4 tabs) | Alex | Home, Nodes, Plan, Profile per design spec |

## Constraints
- Color Palette: Primary deep teal (#0D9488), Success green (#22C55E), Warning amber (#F59E0B), Danger red (#EF4444), Surface off-white (#F8FAFC), Ink near-black (#0F172A), Muted gray (#94A3B8)
- Typography: System font stack, large status text on Home, compact technical details
- Card radius: 8px maximum
- No hacker/cyberpunk/neon aesthetics
- Privacy by design: never show browsing history, domains, destination IPs
- Mobile-first layout with bottom navigation