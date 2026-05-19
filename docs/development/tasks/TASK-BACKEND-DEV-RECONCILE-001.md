# TASK-BACKEND-DEV-RECONCILE-001 — Backend Dev 补救追踪

> Owner: Backend / Docs
> Repo: `livemask-backend` (primary), `livemask-docs` (tracking)
> Created: 2026-05-20
> Status: OPEN

## 1. Background

本轮 Backend dev 状态核验发现以下任务虽然文档曾标记为 completed / verified，
但实际在 `origin/dev` 上不存在对应的 endpoint、route wiring 或实现。
必须由 Backend 窗口统一补救并验证后，才能重新升级状态。

## 2. 受影响的 TASK

| TASK | 当前状态 | 问题 | 补救要求 |
| --- | --- | --- | --- |
| TASK-BACKEND-APP-RELEASE-LATEST-001 | ❌ MISSING | `GET /api/v1/app/releases/latest` endpoint 存在 task branch 但从未合并到 dev，不在 `origin/dev` 上运行 | (1) 在 dev 上恢复或重新发布 endpoint (2) guard merge 到 dev (3) 提供 dev merge commit + validation + remote ref |
| TASK-BACKEND-NODE-DETAIL-REAL-DATA-001 | ⚠️ PARTIAL | 三个端点 handler 已实现但 route 未接入 Backend main router: `/nodes/{node_id}/logs`, `/nodes/{node_id}/metrics-summary`, `/protocol/nodes/{node_id}/capabilities` | (1) 将三个 handler route 接入 main router (2) 确认权限中间件正确 (3) 用真实 node_id 验证 200 / NODE_NOT_FOUND 404 / PERMISSION_DENIED 403 |
| TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001 | ❌ MISSING | Capability wiring 代码存在 task branch 但未确认在 dev 上 live；不允许使用 verified 标签 | (1) 确认 `nodeService.SetCapabilityProcessor` 和 `connectService.SetCapabilityProvider` 在 dev 上生效 (2) 验证 node 4877168a... 有 capability rows (3) guard merge + validation |
| TASK-BACKEND-I18N-001 | ❌ MISSING / next phase | dev 上无 `message_key` 或 i18n error response 实现 | 作为后续阶段，本次 reconcile 不强制要求实现 |

## 3. 补救步骤

- [ ] **Step 1 (Backend):** Backend 窗口逐项确认上表中每个 TASK 的缺失项。
- [ ] **Step 2 (Backend):** 对每个需要修复的任务，将代码合并到 dev 并通过 guard。
- [ ] **Step 3 (Backend):** 提供每个任务的 dev merge commit + `origin/dev` ref + validation 证据。
- [ ] **Step 4 (Docs):** Docs 窗口在收到证据后，将对应任务状态升级为 Completed / Verified。
- [ ] **Step 5 (Docs):** 从本 TASK 中勾除已完成的子项。

## 5. 验证标准

每个子任务必须满足：

1. 端点/功能在 dev 上可访问且返回正确响应。
2. 对应 handler 的 `go test` / `go vet` / `go build` 在 dev 上通过。
3. dev merge commit 已推送 `origin/dev`。
4. Git tag 或 commit hash 可供 docs 引用。

## 4. Cross-Repo Impact

| 仓库 | 影响 |
| --- | --- |
| `livemask-website` | `/download` 和 release-control smoke 需要 `TASK-BACKEND-APP-RELEASE-LATEST-001` 修复后才能跑真实集成 |
| `livemask-admin` | Admin Node Detail 需要三个 backend route 修复后才能显示真实数据 |
| `livemask-ci-cd` | 对应 smoke 需要 Backend 端点 live 后才能 pass |
| `livemask-docs` | 本 TASK 维护核验状态和补救进度 |

## 6. Follow-up

- 所有子项修复完成后，关闭本 TASK。
- 如果 Backend dev 无法修复某子项，需在下面注明原因并记录为 BLOCKED。
