# TASK-DOC-ADMIN-NAV-IA-001 — Admin Navigation Information Architecture Contract

- 状态：Done
- Owner：Docs / Admin
- 创建日期：2026-05-18
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-admin`, `livemask-backend`, `livemask-ci-cd`
- 关联里程碑：Admin Control Plane / Job Center / Observability

## 1. Background

`livemask-admin` 已经包含 Dashboard、Nodes、Jobs、GeoIP、Protocol templates、Content、Users、Logs、Metrics、Config、Finance、releases 和后续增长模块。左侧菜单如果继续平铺增长，会变成低效的功能清单。

本任务定义一个跨仓库契约，用于把 Admin sidebar 收敛为分组、可折叠、RBAC-aware 的信息架构。

## 2. Scope

### In Scope

Create and publish:

- `docs/contracts/admin/ADMIN_NAVIGATION_IA_CONTRACT.md`

Update indexes:

- `docs/admin/README.md`
- `docs/contracts/README.md`
- `docs/development/tasks/README.md`
- `docs/development/MVP_IMPLEMENTATION_PLAN.md`

### Out of Scope

- 不修改 `livemask-admin` 代码。
- 不修改 Backend 权限实现。
- 不新增 CI/CD smoke 脚本。

## 3. Contracts

The contract must define:

- Required top-level Admin navigation groups.
- Which existing and planned routes belong under each group.
- Which pages must become tabs or filtered views instead of new top-level sidebar items.
- RBAC visibility rules.
- Sidebar behavior requirements: collapsible groups, active route expansion, localStorage persistence, mobile drawer parity.
- Backend permission payload impact.
- CI/CD smoke requirements.
- Cursor implementation rules for `livemask-admin`.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | 新增 Admin Navigation IA contract 和任务索引 | 是 | `bash scripts/check-docs.sh` |
| `livemask-admin` | 后续按 contract 实现 grouped sidebar / mobile drawer / RBAC filtering | 后续任务 | `TASK-ADMIN-NAV-IA-001` |
| `livemask-backend` | 后续补齐 admin auth payload effective permissions | 后续任务 | `TASK-BACKEND-ADMIN-PERMISSIONS-001` |
| `livemask-ci-cd` | 后续增加 Admin nav smoke | 后续任务 | `TASK-CICD-ADMIN-NAV-IA-001` |
| `livemask-app` | 无直接影响 | 否 | N/A |
| `livemask-nodeagent` | 无直接影响 | 否 | N/A |

## 5. Required Navigation Groups

- Dashboard
- Operations
- Content
- Users & Growth
- Finance
- Observability
- System

## 6. Follow-Up Tasks

| TASK | Repo | Purpose |
| --- | --- | --- |
| `TASK-ADMIN-NAV-IA-001` | `livemask-admin` | Implement grouped collapsible RBAC-aware sidebar and mobile drawer |
| `TASK-BACKEND-ADMIN-PERMISSIONS-001` | `livemask-backend` | Ensure admin auth payload exposes all effective read permissions |
| `TASK-CICD-ADMIN-NAV-IA-001` | `livemask-ci-cd` | Add Admin nav smoke for groups, direct links, and RBAC-hidden routes |

## 7. Validation

Run:

```bash
bash scripts/check-docs.sh
```

## 8. Completion Report Requirements

Completion report must include:

- Added and modified docs.
- Navigation groups defined.
- Follow-up tasks created.
- Docs check result.
- Local dev runtime status.
- Confirmation that unrelated working tree files were not committed.

## 9. Local Dev Runtime

This is a docs-only task. Do not run `docker compose down`, `scripts/local-dev.sh stop`, or any local runtime shutdown command.
