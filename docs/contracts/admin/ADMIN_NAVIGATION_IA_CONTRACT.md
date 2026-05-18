# Admin Navigation Information Architecture Contract

Task: `TASK-DOC-ADMIN-NAV-IA-001`

Status: Ready

Owner: Docs / Admin

Applies to:

- `livemask-admin`
- `livemask-backend`
- `livemask-ci-cd`
- `livemask-docs`

## 1. Goal

`livemask-admin` has grown from a small configuration console into a control-plane product. The left sidebar must no longer list every feature as a flat menu item.

This contract defines a grouped, collapsible, RBAC-aware navigation model that keeps Admin usable while preserving direct route access and backend permission enforcement.

The main rule:

```text
Hide menu clutter, not permissions.
```

Frontend navigation visibility is only a usability layer. Backend RBAC remains the security boundary for every route and API.

## 2. Required Top-Level Groups

The Admin sidebar MUST use grouped navigation. Each group may contain multiple child routes, tabs, or filtered entry points.

| Group | Purpose | Default state |
| --- | --- | --- |
| Dashboard | Control-plane overview and real-time operations summary | Expanded |
| Operations | Nodes, Jobs, GeoIP, Protocol/Endpoint, Traffic, Releases | Expanded for operators |
| Content | Blog, announcements, campaigns, banners, release notes, help articles | Collapsed |
| Users & Growth | Users, roles, ambassadors, sponsors, referrals | Collapsed |
| Finance | Billing, payments, subscriptions, reconciliation | Collapsed |
| Observability | Logs, audit logs, incidents, metrics, node latest logs | Collapsed |
| System | Config Center, feature flags, settings, integrations | Collapsed |

When a group has no visible child item after RBAC filtering, the group MUST be hidden.

## 3. Route Grouping Matrix

| Group | Primary route | Child entries / tabs | Required read permission |
| --- | --- | --- | --- |
| Dashboard | `/admin` | Overview, Traffic map, Operations health, Incidents | authenticated admin audience |
| Operations | `/admin/nodes` | Nodes, Node detail, Traffic, Protocol & Endpoint, GeoIP, Releases | route-specific |
| Operations / Jobs | `/admin/jobs` | Definitions, Runs, Schedules, Events | `jobs:read` |
| Operations / Protocol & Endpoint | `/admin/protocol-endpoints` | Templates, Assignments, Rollouts, Rollback | `protocol_template:read` or `node:read` |
| Operations / GeoIP | `/admin/geoip` | Databases, Sources, Update jobs, Rollout events | `geoip:read` |
| Operations / Traffic | `/admin/traffic` | Country flows, Region health, Node flow drilldown | `node:read` |
| Operations / Releases | `/admin/nodeagent/releases` | Releases, Rollouts, Events, Rollback | `node:read` |
| Content | `/admin/content` | All content, Blog, Announcements, Campaigns, App banners, Release notes | `content:read` |
| Users & Growth | `/admin/users` | Users, roles, sessions, devices, account actions | `user:read` |
| Users & Growth | `/admin/ambassadors` | Sponsor ambassadors, promotion ambassadors, commissions | future `growth:read` or `user:read` |
| Finance | `/admin/billing` | Plans, subscriptions, payments, refunds, reconciliation | `payment:read` |
| Observability | `/admin/logs` | Logs, Audit logs, Metrics, Incidents, Node latest logs | route-specific |
| Observability / Logs | `/admin/logs` | Global log search, node logs, job logs, payment logs | `logs:read` |
| Observability / Audit | `/admin/audit-logs` | Login logs, operation logs, job audit, payment audit | `audit:read` |
| Observability / Metrics | `/admin/metrics` | Backend, Job Service, NodeAgent, App-safe metrics | `metrics:read` |
| System | `/admin/config` | Config Center, version history, publish, rollback | `config:read` |
| System | `/admin/feature-flags` | Feature flags and targeting rules | `config:read` |
| System | `/admin/settings` | Admin settings, integrations, environment metadata | admin / super_admin or future `settings:read` |

Routes not implemented yet SHOULD still be documented in the IA contract but MUST NOT appear as enabled menu links until the corresponding page exists.

## 4. Required Consolidation Rules

The Admin implementation MUST consolidate related pages instead of adding one sidebar entry per feature.

| Existing / planned surface | Required IA treatment |
| --- | --- |
| Content, Blog, Announcements, Campaigns, App banners | One `Content` entry with tabs or filters by `content_type` |
| GeoIP Databases, GeoIP Sources, GeoIP update jobs, GeoIP events | One `GeoIP` entry with `Databases`, `Sources`, `Jobs`, `Events` tabs |
| Jobs definitions, job runs, schedules, retry/cancel | One `Jobs` entry with `Definitions`, `Runs`, `Schedules`, `Events` tabs |
| Protocol templates, endpoint assignments, rollout status | One `Protocol & Endpoint` entry with tabs |
| Logs, audit logs, incidents, metrics | One `Observability` group with separate child entries |
| NodeAgent release metadata, rollout, rollback events | Prefer `Releases` under Operations; node-specific status also appears in Node detail |
| Dashboard traffic map, country flows, region health | Dashboard summary plus `Traffic` drilldown under Operations |

Feature pages MAY show shortcuts to related tabs, but MUST NOT duplicate generic scheduler, job run, audit-log, or metrics navigation.

## 5. Sidebar Behavior Requirements

The sidebar MUST support:

- Collapsible groups.
- Active route auto-expands its group.
- Active child is highlighted.
- Collapsed group state persisted in `localStorage`.
- Direct deep links continue to work even when the group was previously collapsed.
- Search or quick switcher is optional, not MVP.
- Favorites / recents are optional, not MVP.
- Mobile layout uses the same groups inside a drawer or sheet.
- Sidebar labels must not wrap awkwardly or overflow their item containers.

The sidebar MUST NOT:

- Use hidden menu state as a permission boundary.
- Create separate top-level entries for every tab.
- Link directly to a raw Job Service, NodeAgent, Prometheus, database, or object storage endpoint.
- Show disabled future links without clear disabled styling.

## 6. RBAC Visibility Rules

Menu filtering rules:

1. Child item is visible only when the current admin identity has the route's read permission or a documented fallback role.
2. Group is visible only when at least one child item is visible.
3. Write-only actions MUST NOT make a menu item visible if read permission is missing.
4. `admin` / `super_admin` fallback is allowed only while Backend permission payloads are incomplete, and the code MUST mark it with a TODO.
5. Route components MUST still enforce permission checks even if the menu is hidden.

Recommended permission mapping:

| Item | Permission |
| --- | --- |
| Nodes | `node:read` |
| Jobs | `jobs:read` |
| Protocol & Endpoint | `protocol_template:read` or `node:read` |
| GeoIP | `geoip:read` |
| Content | `content:read` |
| Users | `user:read` |
| Billing / Payments | `payment:read` |
| Logs | `logs:read` |
| Audit Logs | `audit:read` |
| Metrics | `metrics:read` |
| Config Center | `config:read` |

## 7. Design Requirements

Admin navigation must remain operational and dense. It is not a marketing surface.

Implementation requirements:

- Use existing Admin design tokens and shadcn/lucide patterns.
- Use lucide icons for groups and key child entries.
- Keep group headers compact.
- Keep route labels short.
- Use tooltips for icon-only collapsed mode.
- Preserve keyboard navigation and focus states.
- Avoid cards inside the sidebar.
- Avoid decorative gradients, hero layouts, or large empty blocks.

Suggested icon mapping:

| Group | Suggested lucide icon |
| --- | --- |
| Dashboard | `LayoutDashboard` |
| Operations | `Network` or `Activity` |
| Content | `Newspaper` |
| Users & Growth | `Users` |
| Finance | `CreditCard` |
| Observability | `ChartNoAxesCombined` or `Activity` |
| System | `Settings` |

## 8. Backend Impact

Backend does not need to know sidebar grouping, but it MUST keep permission payloads complete enough for Admin to make menu visibility decisions.

Backend follow-up requirements:

- Ensure admin auth response includes all effective permissions for the user.
- Add missing read permissions before Admin menu items rely on them.
- Keep API-level RBAC as the final enforcement layer.
- Audit denied access for sensitive routes where applicable.

## 9. CI/CD Impact

CI/CD should add a lightweight Admin navigation smoke after implementation:

- Login as `admin`.
- Verify `/admin` loads and visible sidebar groups are present.
- Verify direct links for existing routes still return non-404.
- Verify a low-privilege user does not see restricted groups.
- Verify hidden route still returns 403 or Access Denied if accessed directly.

Future task: `TASK-CICD-ADMIN-NAV-IA-001`.

## 10. Cursor Implementation Rules

Cursor must follow these rules when implementing `TASK-ADMIN-NAV-IA-001` in `livemask-admin`:

1. Do not remove existing route pages only to simplify navigation.
2. Preserve existing deep links and redirects.
3. Refactor sidebar data into a typed navigation model, not scattered JSX arrays.
4. Put group and item permission logic in one helper module.
5. Add tests for RBAC filtering, active route matching, collapsed state, and group visibility.
6. Do not call raw `fetch()` from navigation-related API code.
7. Do not add generic trigger buttons to feature pages when the action belongs in Job Center.
8. Keep Admin design aligned with `docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md`.

## 11. Follow-Up Tasks

| TASK | Repo | Scope |
| --- | --- | --- |
| `TASK-ADMIN-NAV-IA-001` | `livemask-admin` | Implement grouped collapsible RBAC-aware sidebar and mobile drawer |
| `TASK-BACKEND-ADMIN-PERMISSIONS-001` | `livemask-backend` | Ensure admin auth payload exposes all effective read permissions |
| `TASK-CICD-ADMIN-NAV-IA-001` | `livemask-ci-cd` | Add Admin navigation smoke for groups, direct links, and RBAC hidden routes |

## 12. Completion Criteria

- Admin sidebar has no flat, ever-growing top-level feature list.
- Groups collapse and persist state.
- Active route auto-expands the correct group.
- RBAC filtering hides inaccessible children and empty groups.
- Existing direct URLs keep working.
- Feature pages use tabs/filters for sub-surfaces instead of new sidebar entries.
- Tests cover the navigation model.
- Build passes.
- Local dev runtime is not stopped during verification.
