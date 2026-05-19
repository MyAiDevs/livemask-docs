# TASK-BACKEND-DEV-RECONCILE-001 — Backend Dev 补救追踪

> Owner: Backend / Docs
> Repo: `livemask-backend` (primary), `livemask-docs` (tracking)
> Created: 2026-05-20
> Status: Completed
> Backend remote dev ref: `1c1ebf4`
> Completed: 2026-05-20

## 1. Background

本轮 Backend dev 状态核验发现以下任务虽然文档曾标记为 completed / verified，
但实际在 `origin/dev` 上不存在对应的 endpoint、route wiring 或实现。
必须由 Backend 窗口统一补救并验证后，才能重新升级状态。

2026-05-20 Backend 补救窗口已完成本 TASK 范围内的 dev 修复并推送
`livemask-backend` remote dev ref `1c1ebf4`。本次完成项包括：

- `TASK-BACKEND-GEOIP-TEST-SIGNATURE-FIX-001`：GeoIP 测试签名修复。
- `TASK-BACKEND-APP-RELEASE-LATEST-001-RECONCILE`：恢复
  `GET /api/v1/app/releases/latest`。
- `TASK-BACKEND-NODE-DETAIL-REAL-DATA-001-RECONCILE`：接通
  `/admin/api/v1/nodes/{id}/logs` 和
  `/admin/api/v1/nodes/{id}/metrics-summary`。

Backend 验证：

```text
go test ./... -count=1 PASS
go vet ./... PASS
go build ./... PASS
git diff --check PASS
```

以下任务仍为 blocker，不随本 TASK 关闭：

- `TASK-BACKEND-I18N-001`

2026-05-20 后续补救：`TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001`
已由 Backend 窗口独立完成并合入 `origin/dev`，remote dev ref `68f04ac`。

## 2. 受影响的 TASK

| TASK | 当前状态 | 问题 | 补救要求 |
| --- | --- | --- | --- |
| TASK-BACKEND-APP-RELEASE-LATEST-001 | ✅ Completed | `GET /api/v1/app/releases/latest` 已恢复到 Backend dev；remote dev ref `1c1ebf4` | Website/downloads 可进入真实 Backend 集成 smoke |
| TASK-BACKEND-NODE-DETAIL-REAL-DATA-001 | ✅ Completed | `/admin/api/v1/nodes/{id}/logs` 和 `/admin/api/v1/nodes/{id}/metrics-summary` 已接通；protocol capability wiring 后续已由 `TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001` 完成 | Admin Node Detail logs/metrics/capabilities 可进入真实集成 smoke |
| TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001 | ✅ Completed / reconciled | Capability heartbeat ingest、DB persistence、Admin read APIs 已合入 Backend dev；remote dev ref `68f04ac` | CI/CD 增加 protocol capability smoke；rollout eligibility/gating 另行跟踪 |
| TASK-BACKEND-I18N-001 | ❌ MISSING / next phase | dev 上无 `message_key` 或 i18n error response 实现 | 仍为后续 blocker，本次 reconcile 不关闭 |

## 3. 补救步骤

- [x] **Step 1 (Backend):** Backend 窗口逐项确认上表中每个 TASK 的缺失项。
- [x] **Step 2 (Backend):** 对本次补救范围内的任务，将代码合并到 dev 并通过 guard。
- [x] **Step 3 (Backend):** 提供 dev ref `1c1ebf4` 和 validation 证据。
- [x] **Step 4 (Docs):** Docs 窗口在收到证据后，将对应任务状态升级为 Completed / Verified。
- [x] **Step 5 (Docs):** 从本 TASK 中勾除已完成的子项。

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
| `livemask-admin` | Admin Node Detail logs/metrics/protocol capabilities 已解除 Backend route blocker；rollout gating 仍为后续 protocol stability 任务 |
| `livemask-ci-cd` | 对应 smoke 需要 Backend 端点 live 后才能 pass |
| `livemask-docs` | 本 TASK 维护核验状态和补救进度 |

## 6. Follow-up

- 本 TASK 已关闭，引用 Backend remote dev ref `1c1ebf4`。
- `TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001` 已独立关闭，引用 Backend remote dev ref `68f04ac`。
- `TASK-BACKEND-I18N-001` 继续保持 blocker / next phase。
