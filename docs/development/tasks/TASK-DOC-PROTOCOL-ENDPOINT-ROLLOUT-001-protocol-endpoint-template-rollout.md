# TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001 - Protocol & Endpoint Template Rollout Contract

- 状态：Ready
- Owner：Docs / Backend / Job Service / NodeAgent / Admin / App / CI-CD
- 创建日期：2026-05-18
- 目标完成日期：2026-05-18
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-job-service`, `livemask-nodeagent`, `livemask-app`, `livemask-admin`, `livemask-ci-cd`
- 关联里程碑：MVP Operational Control Plane / Protocol Extension

## 1. Background

LiveMask is building a multi-protocol VPN platform. The NodeAgent protocol
extension architecture defines `ProtocolProfile` as a plugin interface. The
Hysteria2 contract defines the first real extension protocol's field and secret
boundaries.

However, there is no cross-repo contract for:

1. How protocol **templates** are defined, versioned, and stored.
2. How templates are **assigned** to nodes by region, capability, or tags.
3. How assignments are **rolled out** in staged waves through Job Service.
4. How NodeAgent **applies** a protocol assignment.
5. How the App **learns** about protocol/endpoint changes and reconnects.

This task fills that gap by defining two new contracts and updating the task
tracking.

## 2. Scope

### In Scope

- Define `PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md` covering:
  - Template data model, version model, assignment model, rollout event model.
  - 15 built-in seed templates with idempotent seeding rules.
  - Secret boundary (safe fields whitelist, forbidden fields).
  - Node selection rules (region, tags, capabilities, health, agent version).
  - Job Service rollout rules (waves, health gates, auto-pause).
  - NodeAgent assignment pull API and event report API.
  - Backend connect_config reconciliation.
  - Admin UI requirements, CI/CD smoke matrix, rollback strategy.
- Define `CLIENT_RECONNECT_HINT_CONTRACT.md` covering:
  - NodeAgent does not notify App directly.
  - NodeAgent -> Backend event -> Backend -> App realtime hint.
  - App graceful reconnect behavior.
  - ACK/event reporting and fallback polling mode.
  - Security boundaries.
- Create this task document.
- Update all README indexes in `livemask-docs`.

### Out of Scope

- Implementation of Backend template CRUD APIs.
- Implementation of Job Service protocol rollout executor.
- Implementation of NodeAgent assignment pull client.
- Implementation of App reconnect hint handler.
- Implementation of Admin template/assignment UI.
- Adding protocols beyond those listed in seed templates.

## 3. Contracts

- [Protocol & Endpoint Template Contract](../../contracts/protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md)
- [Client Reconnect Hint Contract](../../contracts/realtime/CLIENT_RECONNECT_HINT_CONTRACT.md)

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | Template CRUD, node selector resolver, secret boundary enforcement, connect_config reconciliation, reconnect hint generation. | 后续 `TASK-BACKEND-PROTOCOL-TEMPLATE-001`, `TASK-BACKEND-PROTOCOL-ROLLOUT-001`, `TASK-BACKEND-RECONNECT-HINT-001` | Contract compliance, CI smoke |
| `livemask-job-service` | Protocol rollout/rollback executor: wave orchestration, per-node queue, error threshold. | 后续 `TASK-JOBS-PROTOCOL-ROLLOUT-001` | Worker unit tests, integration smoke |
| `livemask-nodeagent` | Assignment pull client, apply sequence (Validate/Render/HealthCheck), event reporter. | 后续 `TASK-NODEAGENT-PROTOCOL-ASSIGNMENT-001` | NodeAgent integration test |
| `livemask-app` | Reconnect hint receiver, graceful disconnect, connect_config refresh, ACK reporting. | 后续 `TASK-APP-RECONNECT-HINT-001` | App integration test |
| `livemask-admin` | Template management, assignment creation, rollout progress view, rollback action. | 后续 `TASK-ADMIN-PROTOCOL-TEMPLATE-001` | Admin build + UI smoke |
| `livemask-ci-cd` | Seed template, CRUD, rollout, rollback, reconnect hint smoke tests. | 后续 `TASK-CICD-PROTOCOL-TEMPLATE-001`, `TASK-CICD-RECONNECT-HINT-001` | `bash scripts/jobs-smoke.sh` |
| `livemask-docs` | New contracts + task + README updates. | 当前任务 | `bash scripts/check-docs.sh` |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Owner | Docs | Protocol rollout must support 15 seed templates, staged waves, and App graceful reconnect. | No existing contract for template assignment and rollout. |
| 2 | Docs | Backend | Template data model, seed templates, secret boundary, node selector, connect_config reconciliation contract. | Missing implementation tasks registered. |
| 3 | Docs | Job Service | Rollout wave model, per-node queue, error threshold, auto-pause, rollback. | Missing implementation tasks registered. |
| 4 | Docs | NodeAgent | Assignment pull API, apply sequence, event report API. | Missing implementation tasks registered. |
| 5 | Docs | App | Reconnect hint contract: NodeAgent does not notify App, Backend -> App hint, graceful reconnect, ACK. | Missing implementation tasks registered. |
| 6 | Docs | Admin | Template management, assignment UI, rollout progress, rollback. | Missing implementation tasks registered. |
| 7 | Docs / All | CI-CD | Smoke matrix for seed templates, CRUD, rollout, rollback, reconnect hint. | Missing implementation tasks registered. |

## 6. Implementation Plan

- [x] Create `docs/contracts/protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md`.
- [x] Create `docs/contracts/realtime/CLIENT_RECONNECT_HINT_CONTRACT.md`.
- [x] Create `docs/development/tasks/TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001-protocol-endpoint-template-rollout.md`.
- [x] Link from `docs/contracts/README.md`.
- [x] Link from `docs/backend/README.md`.
- [x] Link from `docs/nodeagent/README.md`.
- [x] Link from `docs/admin/README.md`.
- [x] Link from `docs/app/README.md`.
- [x] Link from `docs/operations/README.md`.
- [x] Link from `docs/development/tasks/README.md`.
- [x] Link from `docs/development/MVP_IMPLEMENTATION_PLAN.md`.
- [x] Link from `docs/README.md`.
- [ ] Backend implements `TASK-BACKEND-PROTOCOL-TEMPLATE-001`.
- [ ] Backend implements `TASK-BACKEND-PROTOCOL-ROLLOUT-001`.
- [ ] Backend implements `TASK-BACKEND-RECONNECT-HINT-001`.
- [ ] Job Service implements `TASK-JOBS-PROTOCOL-ROLLOUT-001`.
- [ ] NodeAgent implements `TASK-NODEAGENT-PROTOCOL-ASSIGNMENT-001`.
- [ ] App implements `TASK-APP-RECONNECT-HINT-001`.
- [ ] Admin implements `TASK-ADMIN-PROTOCOL-TEMPLATE-001`.
- [ ] CI/CD implements `TASK-CICD-PROTOCOL-TEMPLATE-001` and `TASK-CICD-RECONNECT-HINT-001`.

## 7. Validation Plan

- [x] Contract checks with `bash scripts/check-docs.sh`.
- [ ] Backend template CRUD unit tests in follow-up task.
- [ ] Job Service rollout executor unit/integration tests in follow-up task.
- [ ] NodeAgent assignment pull integration tests in follow-up task.
- [ ] App reconnect hint integration tests in follow-up task.
- [ ] Admin build/UI tests in follow-up task.
- [ ] CI/CD smoke in follow-up task.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Seed template divergence across environments | Inconsistent protocol profiles | Idempotent seeding with config_hash comparison, migration-based updates | Backend |
| Secret leakage in NodeAgent assignment response | Credential compromise | Backend resolves secret_refs per-node, Admin and App never see resolved secrets | Backend |
| Reconnect hint storm during large rollout | App battery drain, user confusion | Rate limit 1 hint per 60 seconds per session, batch hints by wave | Backend |
| App ignores reconnect hint | Stale connection persists | Fallback polling, connect_config TTL expiry forces fresh pull | App |
| Rollback health check fails | Node stuck in failed state | Admin manual override, operator intervention documented | Admin |

## 9. Rollback

- 回滚触发条件：契约方向被产品或架构否定。
- 回滚步骤：
  1. Revert the three new documents and all README links.
  2. Delete task entry from `docs/development/tasks/README.md`.
  3. Update MVP plan to remove references.
- 回滚验证：`bash scripts/check-docs.sh`.

## 10. Completion Evidence

- PR: TBD
- Commit: TBD
- Test output: `bash scripts/check-docs.sh`
- Screenshots / logs: N/A
- 文档链接：
  - [Protocol & Endpoint Template Contract](../../contracts/protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md)
  - [Client Reconnect Hint Contract](../../contracts/realtime/CLIENT_RECONNECT_HINT_CONTRACT.md)
- Dashboard / alert: N/A
- Product / support note: Seed templates define the initial protocol lineup.

## 11. Follow-up

- `TASK-BACKEND-PROTOCOL-TEMPLATE-001` — Backend template CRUD, seed migration, node selector resolver
- `TASK-BACKEND-PROTOCOL-ROLLOUT-001` — Backend internal API for Job Service worker assignment resolution
- `TASK-JOBS-PROTOCOL-ROLLOUT-001` — Job Service protocol rollout executor
- `TASK-NODEAGENT-PROTOCOL-ASSIGNMENT-001` — NodeAgent assignment pull, apply, event report
- `TASK-ADMIN-PROTOCOL-TEMPLATE-001` — Admin template and assignment UI
- `TASK-BACKEND-RECONNECT-HINT-001` — Backend reconnect hint generation
- `TASK-APP-RECONNECT-HINT-001` — App reconnect hint receiver
- `TASK-CICD-PROTOCOL-TEMPLATE-001` — Protocol template and rollout smoke
- `TASK-CICD-RECONNECT-HINT-001` — Reconnect hint smoke
