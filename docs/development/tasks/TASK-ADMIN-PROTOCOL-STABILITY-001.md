# TASK-ADMIN-PROTOCOL-STABILITY-001 — Admin Protocol Stability UI

> Status: Completed
> Repository: livemask-admin
> Environment: dev-local

## 1. Background

Protocol stability requires operators to create protocol templates, create
assignments, inspect node capabilities, and observe rollout/rollback state from
Backend APIs. Admin must not rely on hardcoded demo data for protocol stability
operations.

This task implements the Admin-side protocol stability UI and real-first API
client additions.

## 2. Implemented Scope

| Area | Change |
| --- | --- |
| Types | Added `CreateTemplateRequest`, `UpdateTemplateRequest`, `CreateAssignmentRequest`, `TemplateListQueryParams`, and `AssignmentListQueryParams`. |
| API client | Added `createTemplate`, `updateTemplate`, and `createAssignment`; list APIs now forward query filters. |
| Hooks | Added `useCreateTemplate`, `useUpdateTemplate`, `useCreateAssignment`; node protocol capabilities refetch every 30 seconds. |
| Consolidation | Removed old protocol endpoint API/hook files and merged functionality into the protocol template API/hook surface. |
| Node Detail | Updated imports from `use-protocol-endpoint` to `use-protocol-template`. |
| New pages | Added `/admin/protocol-templates/new` and `/admin/protocol-assignments/new`. |
| List pages | Added new template/assignment buttons and fixed template status filtering. |
| Mock data | Expanded `MOCK_NODE_CAPABILITIES` to the full `ProtocolEndpointCapability` type. |

## 3. Admin Routes

| Route | Purpose |
| --- | --- |
| `/admin/protocol-templates/new` | Create protocol template form with name, protocol, transport, and JSON profile config. |
| `/admin/protocol-assignments/new` | Create assignment form with template selection, node selector, and rollout policy. |
| `/admin/protocol-templates` | Protocol template list with create entrypoint and filters. |
| `/admin/protocol-assignments` | Protocol assignment list with create entrypoint and filters. |
| `/admin/nodes/{node_id}` | Node detail uses the unified protocol template hook for capability data. |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Admin UI expects create/update template APIs, create assignment API, filtered list APIs, and node capability endpoint. |
| `livemask-nodeagent` | Node capability display becomes useful once NodeAgent reports real assignment/readiness data. |
| `livemask-app` | No direct UI dependency; App reconnect stability depends on Backend hint flow. |
| `livemask-ci-cd` | Protocol stability smoke can validate Admin API/UI integration once Backend endpoints are deployed. |
| `livemask-docs` | Records Admin protocol stability completion and remaining Backend integration dependencies. |

## 5. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-ADMIN-PROTOCOL-STABILITY-001` |
| Task branch commit | `08f1b3f`; latest incremental task commit `c988b63` |
| Dev merge commit | `823f4fe`; latest incremental dev merge `986dc9c` |
| Remote dev ref | `origin/dev` (`986dc9c`) |
| Validation | `npx vitest run` PASS (168 tests), `npx next build` PASS; latest validation also built 55 routes |
| Diff size | 11 files changed, +1106 / -107 lines |

## 6. Remaining Backend Dependencies

- `POST /admin/api/v1/protocol-templates`
- `PUT /admin/api/v1/protocol-templates/{id}`
- `POST /admin/api/v1/protocol-rollouts`
- Filtered list endpoints for protocol templates and assignments.
- `GET /admin/api/v1/protocol/nodes/{node_id}/capabilities`

## 7. Done Criteria

- [x] Protocol template create page exists.
- [x] Protocol assignment create page exists.
- [x] Real-first Admin API client includes create/update actions.
- [x] Node detail uses the unified protocol template capability hook.
- [x] Tests and build pass on merged `dev`.
- [x] Remaining Backend dependencies are explicitly recorded.

## 8. Incremental Update: LKG / Rollback UI

Latest Admin dev merge `986dc9c` extends this completed task with explicit
LKG and rollback observability in the protocol stability UI.

| Area | Change |
| --- | --- |
| Types | Added `lkg_version`, `lkg_at`, assignment `lkg_info`, rollback fields, `LKGInfo`, `RollbackInfo`, and `ASSIGNMENT_EVENT_TYPES` metadata. |
| Mock data | Added LKG values to mock templates, enriched capability eligibility, and generated realistic assignment event timelines. |
| Assignment detail | Added LKG/rollback status card, event icons/badges, metadata display, rolled-back header badge, and rollback warning banner. |
| Template detail | Added LKG badges, eligibility/LKG cards, LKG-highlighted version history, and rollback dialog LKG recommendation. |

Evidence:

| Field | Value |
| --- | --- |
| Task branch commit | `c988b63` |
| Dev merge commit | `986dc9c` |
| Remote dev ref | `origin/dev` (`986dc9c`) |
| Validation | `npx vitest run` PASS (168/168), `npx next build` PASS (55 routes) |

Backend real-data dependency resolved by
`TASK-BACKEND-PROTOCOL-LKG-ROLLBACK-API-001` at Backend dev merge `9a06111`.
Admin can now remove mock LKG/rollback fallback and validate those sections
against real protocol template, eligibility, and assignment APIs.
