# TASK Workspace

> 每个跨仓库任务都应该有独立任务单。大里程碑表负责排期，任务单负责闭环证据。

> **⚠️ 2026-05-20 — Process Violation Record (retained)**
> Website dev (`livemask-website`) 曾出现手工 merge `task/*` 到 `dev` 的历史记录
> （参见 `dc48f1f`、`1ff9190` 等直接 merge task branch 到 dev 的 commit）。
> 根据 `dev-merge-guard.sh` 规则（`livemask-ci-cd/scripts/dev-merge-guard.sh`），
> 所有 task 分支合并到 `dev` 必须通过 guard 脚本执行。
>
> **Remediation**: `TASK-WEBSITE-HELP-ARTICLE-001` (commit `93f3cab`) was merged
> to `dev` via integration branch through `dev-merge-guard.sh` (merge commit
> `9ce1a88`), proving the guard workflow is now properly in use.
>
> 后续所有补救任务必须使用 `dev-merge-guard.sh` 进行合并。禁止直接 git merge task/* → dev。

> **CI/CD Smoke Script Discovery Rule**
> CI/CD 任务不得假设聊天中出现的脚本名已经存在。写入前必须先列出现有
> `scripts/*.sh` 和相关 workflow，明确选择“增强现有脚本”或“新建脚本”。
> 如果建议脚本（例如 `scripts/admin-control-plane-smoke.sh`）不存在，任务说明和完成报告
> 必须写明 `MISSING -> created`，或者改为增强现有分域脚本
> （如 `system-settings-smoke.sh`、`jobs-smoke.sh`、`protocol-capability-smoke.sh`、
> `release-control-smoke.sh`）。`scripts/smoke.sh` / workflow 不得引用不存在的路径。

> **Completion Report Intake Rule**
> 每次 `livemask-docs` 窗口收到 Cursor / Codex / 人工完成报告后，必须读取任务台账、
> MVP 计划、相关 TASK、contracts、handoff 和已有 GitHub Issue；审核 dev merge、
> `origin/dev`、验证证据和跨仓库影响；更新 docs 台账和 Issue；总结已完成/未完成模块；
> 主动分配下一批 Cursor 任务。如果现有任务清单没有下一步但项目仍未落地，必须扫描
> 项目文档和任务状态，创建新的 `TASK-*.md`，更新台账后再派发任务。
> 任务状态快照必须同步到 `docs/development/task-state-ledger.json`；新的 Cursor 任务
> 必须使用 `docs/development/CURSOR_TASK_BRIEF_TEMPLATE.md`。
> Codex 调度窗口的角色、同步/异步工作方式和禁区记录在
> `docs/development/CODEX_TASK_DISPATCHER_ROLE.md`。
> 任意 AI 工具进入项目的第一入口是
> `docs/development/AI_PROJECT_STATUS_ONBOARDING.md`，不要依赖本地记忆或聊天历史。

## 0. 多窗口同步要求

所有 Cursor / Codex / 人工开发窗口完成任务后，必须同步提交 TASK 记录。
同步不是可选项。

每个完成报告必须至少包含：

- `TASK ID`
- 仓库 / 分支 / commit
- 已完成内容
- 测试与验证
- 文档 / 契约变更
- 跨端影响和已解锁窗口
- 仍阻塞窗口和解除条件
- 风险 / 待办 / 后续 TASK

文档同步规则：

| 情况 | 必须更新 |
| --- | --- |
| 新增跨仓库需求 | 新建 `docs/development/tasks/TASK-*.md`，必要时新增 contract 和 handoff。 |
| 完成实现任务 | 更新独立 TASK 或完成报告，并同步 `MVP_IMPLEMENTATION_PLAN.md` 当前状态快照。 |
| 改 API / DB / event / config / permission | 更新对应 `docs/contracts/**` 和 impacted repo README / handoff。 |
| 解锁其它仓库 | 在完成报告和 `MVP_IMPLEMENTATION_PLAN.md` 中写明 unlocked / blocked repo。 |
| CI/CD smoke 从 SKIP 变 PASS | 更新 `MVP_IMPLEMENTATION_PLAN.md` 和对应 CI/CD handoff。 |

`MVP_IMPLEMENTATION_PLAN.md` 是总任务视图；本目录的独立 TASK 文件是闭环证据。
两者必须保持一致。

## 1. 命名规则

```text
TASK-<DOMAIN>-<NUMBER>-<short-title>.md
```

示例：

- `TASK-DOC-001-doc-closure.md`
- `TASK-NA-CONFIG-001-config-manager-contract.md`
- `TASK-BE-FLAG-001-targeting-rules.md`

## 2. 生命周期

```text
Draft -> Ready -> In Progress -> Review -> Done
                    |              |
                    v              v
                 Blocked        Follow-up TASK
```

## 3. Done 标准

任务不能只靠“代码已改”完成。必须同时满足：

- 需求范围明确
- 跨仓库影响明确
- 契约更新完成
- 实现和测试完成
- 验证证据记录
- 回滚策略明确
- 未完成项有后续 TASK

## 4. 模板

复制 [TASK-TEMPLATE.md](TASK-TEMPLATE.md) 创建新任务。

当前样例：[TASK-DOC-001-doc-closure.md](TASK-DOC-001-doc-closure.md)。

## MVP P0/P1 任务

### 治理 / Batch 任务

- [TASK-CICD-CLOSED-LOOP-BATCH-001.md](TASK-CICD-CLOSED-LOOP-BATCH-001.md) — ⚠️ partial / evidence_missing
- [TASK-DOCS-GOVERNANCE-SYNC-BATCH-001.md](TASK-DOCS-GOVERNANCE-SYNC-BATCH-001.md) — ⚠️ partial / evidence_missing
- [TASK-CICD-DEV-MERGE-GUARD-001.md](TASK-CICD-DEV-MERGE-GUARD-001.md) — ✅ Done (dev evidence present)
- [TASK-CICD-DEV-MERGE-GUARD-PATH-SPACES-001.md](TASK-CICD-DEV-MERGE-GUARD-PATH-SPACES-001.md) — ✅ Completed (dev evidence present)
- [TASK-CICD-WORKSPACE-PATH-MIGRATION-001.md](TASK-CICD-WORKSPACE-PATH-MIGRATION-001.md) — ✅ Completed (CI/CD scripts enforce `~/Developer/LiveMask` workspace)
- [TASK-DOCS-CURSORRULES-DOCS-SYNC-BOUNDARY-001.md](TASK-DOCS-CURSORRULES-DOCS-SYNC-BOUNDARY-001.md) — Ready (docs ledger ownership rule)
- [TASK-DOCS-NATURAL-LANGUAGE-TASK-INTAKE-001.md](TASK-DOCS-NATURAL-LANGUAGE-TASK-INTAKE-001.md) — Ready (plain text request -> TASK intake -> docs handoff)
- [TASK-DOCS-COMPLETION-REPORT-DISPATCH-GOVERNANCE-001.md](TASK-DOCS-COMPLETION-REPORT-DISPATCH-GOVERNANCE-001.md) — ✅ Completed (completion report intake -> Issue sync -> module summary -> next Cursor task dispatch)
- [TASK-DOCS-AI-PROJECT-STATUS-ONBOARDING-001.md](TASK-DOCS-AI-PROJECT-STATUS-ONBOARDING-001.md) — ✅ Completed (repo-native AI project status onboarding)
- [TASK-DOCS-TASK-STATE-LEDGER-001.md](TASK-DOCS-TASK-STATE-LEDGER-001.md) — ✅ Completed (machine-readable task state snapshot + validation)
- [TASK-DOCS-CODEX-DISPATCHER-ROLE-001.md](TASK-DOCS-CODEX-DISPATCHER-ROLE-001.md) — ✅ Completed (Codex dispatcher role and sync/async workflow)
- [TASK-DOCS-CURSOR-BRIEF-TEMPLATE-001.md](TASK-DOCS-CURSOR-BRIEF-TEMPLATE-001.md) — ✅ Completed (standard next Cursor task brief)
- [TASK-CICD-TASK-RECONCILER-001.md](TASK-CICD-TASK-RECONCILER-001.md) — ✅ Completed (lightweight ledger reconciliation check)
- [TASK-CICD-ISSUE-SYNC-STRICT-001.md](TASK-CICD-ISSUE-SYNC-STRICT-001.md) — ✅ Completed (cross-repo Issue lookup/update by TASK ID)
- [TASK-CICD-ISSUE-SYNC-STRICT-FIX-001.md](TASK-CICD-ISSUE-SYNC-STRICT-FIX-001.md) — ✅ Completed (harden strict Issue sync gate, staging warning mode, workflow YAML/help/JSON fixes)
- [TASK-DOCS-AUTO-AUDIT-CENTER-001.md](TASK-DOCS-AUTO-AUDIT-CENTER-001.md) — ✅ Completed (offline gate/warning/suggestion audit center with JSON report)
- [TASK-CICD-ISSUE-CLOSE-GUARD-001.md](TASK-CICD-ISSUE-CLOSE-GUARD-001.md) — ✅ Completed (guarded Issue close/reopen automation)
- [TASK-DOCS-GOVERNANCE-REMOTE-AUDIT-001.md](TASK-DOCS-GOVERNANCE-REMOTE-AUDIT-001.md) — ✅ Completed (optional GitHub Issue / Actions / remote ref audit)
- [TASK-DOCS-CHILD-REPO-AI-RULE-SYNC-001.md](TASK-DOCS-CHILD-REPO-AI-RULE-SYNC-001.md) — ✅ Completed (sync governance rules into child repo AI/Cursor rules)
- [TASK-DOCS-LEASE-REGISTRY-001.md](TASK-DOCS-LEASE-REGISTRY-001.md) — ✅ Completed (file-backed active lease registry and collision checks)
- [TASK-DOCS-CICD-SMOKE-SCRIPT-DISCOVERY-001.md](TASK-DOCS-CICD-SMOKE-SCRIPT-DISCOVERY-001.md) — ✅ Completed (CI/CD must discover scripts before wiring smoke)
- [TASK-DOC-NAT-SHARING-GUARD-001.md](TASK-DOC-NAT-SHARING-GUARD-001.md) — Ready (NAT/device-as-router abuse guard contract and follow-up tasks)
- [TASK-DOCS-APP-ANDROID-FIRST-VALIDATION-001.md](TASK-DOCS-APP-ANDROID-FIRST-VALIDATION-001.md) — ✅ Completed (AppClient feature validation is Android-first; iOS deferred hardening)
- [TASK-APP-ANDROID-FUNCTIONAL-VALIDATION-001.md](TASK-APP-ANDROID-FUNCTIONAL-VALIDATION-001.md) — ✅ Completed (Android-primary AppClient functional validation)
- [TASK-DOCS-APP-RUNTIME-CLOSED-LOOP-VALIDATION-001.md](TASK-DOCS-APP-RUNTIME-CLOSED-LOOP-VALIDATION-001.md) — ✅ Completed (App feature tasks require runtime logs and Backend/NodeAgent/JobService closed-loop evidence)
- [TASK-BACKEND-SWAGGER-API-DOCS-001.md](TASK-BACKEND-SWAGGER-API-DOCS-001.md) — ✅ Completed (`9de2f14`, Backend OpenAPI JSON/YAML + drift gate)
- [TASK-ADMIN-SWAGGER-API-DOCS-UI-001.md](TASK-ADMIN-SWAGGER-API-DOCS-UI-001.md) — ✅ Completed (`656d4d9`, Admin-authenticated Swagger UI using Backend OpenAPI JSON)
- [TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001.md](TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001.md) — ✅ Completed (`a4231cb`, Admin route/build diagnostics prove backend proxy 404)
- [TASK-BACKEND-OPENAPI-RUNTIME-ROUTE-FIX-001.md](TASK-BACKEND-OPENAPI-RUNTIME-ROUTE-FIX-001.md) — Ready (Backend runtime `/openapi.json` and `/openapi.yaml` must return 200)
- [TASK-CICD-OPENAPI-DRIFT-CHECK-001.md](TASK-CICD-OPENAPI-DRIFT-CHECK-001.md) — ✅ Completed (`c5f628a`, CI/CD OpenAPI drift validation)

### 跨仓库实现任务

| TASK | 当前状态 | Dev Merge Evidence | Remote dev ref |
|------|---------|------------------|---------------|
| [TASK-APP-INTEGRITY-RECONCILE-001.md](TASK-APP-INTEGRITY-RECONCILE-001.md) | ✅ Completed (dev-contained, not all-platform) | ✅ `0bf40ee` (via guard) | ✅ `origin/dev` |
| [TASK-BACKEND-USER-GROWTH-REVENUE-001.md](TASK-BACKEND-USER-GROWTH-REVENUE-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-ADMIN-USER-GROWTH-REVENUE-001.md](TASK-ADMIN-USER-GROWTH-REVENUE-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-ADMIN-GROWTH-NOTIFICATION-REGRESSION-001.md](TASK-ADMIN-GROWTH-NOTIFICATION-REGRESSION-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-WEBSITE-REFERRAL-LANDING-001.md](TASK-WEBSITE-REFERRAL-LANDING-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001.md](TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001.md) | ✅ completed (remediated via TASK-WEBSITE-HELP-ARTICLE-001) | ❌ original not merged | ❌ original not merged |
| [TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001.md](TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-APP-RELEASE-CHECK-REGRESSION-001.md](TASK-APP-RELEASE-CHECK-REGRESSION-001.md) | ✅ dev-contained (verified by TASK-APP-INTEGRITY-RECONCILE-001) | ⚠️ platform blockers retained | ⚠️ platform blockers retained |
| [TASK-BACKEND-APP-RELEASE-LATEST-001.md](TASK-BACKEND-APP-RELEASE-LATEST-001.md) | ✅ Completed / reconciled | ✅ via `TASK-BACKEND-DEV-RECONCILE-001` | ✅ `1c1ebf4` |
| [TASK-ADMIN-APP-RELEASE-001.md](TASK-ADMIN-APP-RELEASE-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-ADMIN-RELEASE-CONTROL-IA-001.md](TASK-ADMIN-RELEASE-CONTROL-IA-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-ADMIN-SENTRY-SETTINGS-RECONCILE-001.md](TASK-ADMIN-SENTRY-SETTINGS-RECONCILE-001.md) | ✅ Completed | ✅ `d355242` (via guard) | ✅ `e541485` |
| [TASK-ADMIN-NODEAGENT-RELEASE-UI-001.md](TASK-ADMIN-NODEAGENT-RELEASE-UI-001.md) | ✅ Completed | ✅ `e67c4c7` (via guard) | ✅ `e541485` |
| [TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001.md](TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001.md) | ✅ Completed / reconciled | ✅ `68f04ac` (via guard) | ✅ `68f04ac` |
| [TASK-ADMIN-PROTOCOL-CAPABILITY-UI-001.md](TASK-ADMIN-PROTOCOL-CAPABILITY-UI-001.md) | ✅ Completed (CI/CD smoke follow-up retained) | ✅ `3b95111` (via guard) | ✅ `e541485` |
| [TASK-ADMIN-JOB-CENTER-UI-001.md](TASK-ADMIN-JOB-CENTER-UI-001.md) | ✅ Completed (Backend API/smoke follow-up retained) | ✅ `99d7360` (via guard) | ✅ `e541485` |
| [TASK-ADMIN-SYSTEM-SETTINGS-UI-001.md](TASK-ADMIN-SYSTEM-SETTINGS-UI-001.md) | ✅ Completed (Backend API/smoke follow-up retained) | ✅ `e541485` (via guard) | ✅ `e541485` |
| [TASK-ADMIN-TEST-EXPANSION-001.md](TASK-ADMIN-TEST-EXPANSION-001.md) | ✅ Completed | ✅ `0698238` (via guard) | ✅ `0698238` |
| [TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-001.md](TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-001.md) | ✅ Completed (runtime fixed by follow-up) | ✅ `63dcdaa` + runtime fix `1f630f0` | ✅ `1f630f0` |
| [TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-RUNTIME-FIX-001.md](TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-RUNTIME-FIX-001.md) | ✅ Completed | ✅ `1f630f0` (via guard) | ✅ `1f630f0` |
| [TASK-CICD-LOCAL-RUNTIME-WORKSPACE-MOUNT-FIX-001.md](TASK-CICD-LOCAL-RUNTIME-WORKSPACE-MOUNT-FIX-001.md) | ✅ Completed | ✅ `ea69ee9` (via guard) | ✅ `ea69ee9` |
| [TASK-BACKEND-PROTOCOL-SCHEMA-MIGRATION-FIX-001.md](TASK-BACKEND-PROTOCOL-SCHEMA-MIGRATION-FIX-001.md) | ✅ Completed | ✅ `2e5fda9` (via guard) | ✅ `2e5fda9` |
| [TASK-APP-ANDROID-FUNCTIONAL-VALIDATION-001.md](TASK-APP-ANDROID-FUNCTIONAL-VALIDATION-001.md) | ✅ Completed (Android-primary) | ✅ `374f6d7` (validation merge) | ✅ `origin/dev` (`374f6d7`) |
| [TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001.md](TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001.md) | ✅ Completed | ✅ `5ce5c6c` (via guard) | ✅ `5ce5c6c` |
| [TASK-APP-IOS-CODESIGN-ENV-001.md](TASK-APP-IOS-CODESIGN-ENV-001.md) | ⚠️ Partial — simulator PASS via safe workdir, device signing BLOCKED | ✅ `a5243cd` (via guard) | ✅ `a5243cd` |
| [TASK-JOBS-GROWTH-SETTLEMENT-001.md](TASK-JOBS-GROWTH-SETTLEMENT-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-JOBS-APP-RELEASE-001.md](TASK-JOBS-APP-RELEASE-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001.md](TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001.md) | ⚠️ partial / evidence_missing | ❌ missing | ❌ missing |
| [TASK-WEBSITE-HELP-ARTICLE-001.md](TASK-WEBSITE-HELP-ARTICLE-001.md) | ✅ completed | ✅ `9ce1a88` (via guard) | ✅ `origin/dev` |
| [TASK-BACKEND-DEV-RECONCILE-001.md](TASK-BACKEND-DEV-RECONCILE-001.md) | ✅ Completed | ✅ Backend reconcile evidence received | ✅ `1c1ebf4` |

### Docs 契约任务

| TASK | 当前状态 | Dev Merge Evidence | Remote dev ref |
|------|---------|------------------|---------------|
| [TASK-DOC-PROTOCOL-001](TASK-DOC-PROTOCOL-001-nodeagent-multi-protocol-extension-arch.md) | Draft | N/A (Draft) | N/A |
| [TASK-DOC-PROTOCOL-STABILITY-GATE-001](TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md) | Ready | N/A (Ready — docs-only) | N/A |
| [TASK-DOC-NODEAGENT-RELEASE-001](TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md) | Ready | N/A (Ready — docs-only) | N/A |
| [TASK-DOC-GEOIP-SYNC-001](TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md) | Ready | N/A (Ready — docs-only) | N/A |
| [TASK-VPN-CONFIG-001](TASK-VPN-CONFIG-001-real-connect-config-contract.md) | Draft | N/A (Draft) | N/A |
| [TASK-INFRA-001](TASK-INFRA-001-mvp-health-ci-smoke-closed-loop.md) | Done | ✅ `2c3e66d` on dev | `origin/dev` |
| [TASK-INFRA-002](TASK-INFRA-002-ai-task-sync-and-auto-marking.md) | Ready | N/A (Ready — docs-only) | N/A |
| [TASK-DOC-USER-GROWTH-REVENUE-001](TASK-DOC-USER-GROWTH-REVENUE-001-user-growth-revenue-contract.md) | Ready | N/A (Ready — docs-only) | N/A |
| [TASK-DOC-GROWTH-REWARD-NOTIFICATION-001](TASK-DOC-GROWTH-REWARD-NOTIFICATION-001-login-earnings-incentive.md) | Ready | N/A (Ready — docs-only) | N/A |
| [TASK-DOC-001](TASK-DOC-001-doc-closure.md) | Done | ✅ docs commits on dev | `origin/dev` |

### 其他任务（未在 Docs 中核验）

- [TASK-P0-03-config-center.md](TASK-P0-03-config-center.md)
- [TASK-ADMIN-001-config-center-management-ui.md](TASK-ADMIN-001-config-center-management-ui.md)
- [TASK-APP-001-remote-config-cache-fallback.md](TASK-APP-001-remote-config-cache-fallback.md)
- [TASK-NA-CONFIG-001-config-sync-hot-reload.md](TASK-NA-CONFIG-001-config-sync-hot-reload.md)
- [TASK-AUTH-001-account-auth-rbac-closed-loop.md](TASK-AUTH-001-account-auth-rbac-closed-loop.md)
- [TASK-P1-01-usdt-payment.md](TASK-P1-01-usdt-payment.md)
- [TASK-P1-05-config-hot-reload.md](TASK-P1-05-config-hot-reload.md)
- [TASK-P2-05-node-recommendation.md](TASK-P2-05-node-recommendation.md)
- [TASK-P3-01-connection-quality-report.md](TASK-P3-01-connection-quality-report.md)
- [TASK-P3-02-quick-feedback.md](TASK-P3-02-quick-feedback.md)
- [TASK-P5-03-monitoring-alerting.md](TASK-P5-03-monitoring-alerting.md)
- [TASK-P5-04-deploy-runbook.md](TASK-P5-04-deploy-runbook.md)
- [TASK-NODEAGENT-OBSERVABILITY-UPLOAD-202-FIX-001.md](TASK-NODEAGENT-OBSERVABILITY-UPLOAD-202-FIX-001.md)
- [TASK-BACKEND-NODE-DETAIL-REAL-DATA-001.md](TASK-BACKEND-NODE-DETAIL-REAL-DATA-001.md) — ✅ completed for logs/metrics at Backend dev ref `1c1ebf4`; protocol capability wiring completed separately at Backend dev ref `68f04ac`
- [TASK-BACKEND-I18N-001] — ❌ MISSING / next phase (no message_key/i18n error on dev)
- [TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001](TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001.md) — ✅ completed / reconciled at Backend dev ref `68f04ac`

> 🔒 TASK-JOBS-SENTRY-CONFIG-SUPPORT-001: closed/no-op. Task branch was zero commits (HEAD == dev divergence point). Sentry exception handling is owned by Backend (`TASK-BACKEND-SENTRY-SUMMARY-001`) via Sentry webhook summary, not Job Service. No implementation needed.

> ✅ TASK-JOBS-OBSERVABILITY-INGEST-001: Pass (Reconciled). `observability_log_ingest` executor implemented on `livemask-job-service`. Reconciled via `task/TASK-JOBS-OBSERVABILITY-INGEST-001-reconcile` (`1f999c3`), merged `fad4982` on `dev`, pushed `origin/dev`. Validation: `go test ./... -count=1` PASS, `go vet ./...` PASS, `go build ./cmd/job-service` PASS, `git diff --check` PASS.

## 下一阶段任务

- [TASK-DOC-HYSTERIA2-CONTRACT-001] — Hysteria2 连接配置跨仓库契约（当前任务）
- [TASK-DOC-NAT-SHARING-GUARD-001](TASK-DOC-NAT-SHARING-GUARD-001.md) — 防止客户端设备作为 NAT/路由器共享 VPN 的跨仓库安全契约
- TASK-BACKEND-NAT-SHARING-GUARD-001 — Backend session risk policy、Admin API、warn/throttle/revoke
- TASK-NODEAGENT-NAT-SHARING-GUARD-001 — NodeAgent aggregate counters、redacted risk events、enforcement hooks
- TASK-APP-NAT-SHARING-GUARD-001 — App native runtime no-sharing posture、warning UI、Sentry redaction
- TASK-ADMIN-NAT-SHARING-GUARD-001 — Admin settings/risk event UI
- TASK-CICD-NAT-SHARING-GUARD-001 — NAT sharing guard smoke + privacy leak scan
- TASK-NODEAGENT-HYSTERIA2-001 — NodeAgent 端 hysteria2 ProtocolProfile 实现（Render / Validate / HealthCheck / Endpoint / Redact）
- TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001 — Backend 端 hysteria2 connect_config 生成 + profile dispatch + skeleton fallback
- TASK-ADMIN-ENDPOINT-002 — Admin endpoint editor hysteria2 字段支持
- TASK-APP-CONNECT-PROFILE-001 — App 端 profile_type=hysteria2 解析 + skeleton 占位态展示
- TASK-CICD-PROTOCOL-SMOKE-001 — CI smoke 验证 endpoint registration → connect_config hysteria2
- TASK-APP-ANDROID-ENGINE-HYSTERIA2-001 — Android VpnService hysteria2 原生引擎集成
- TASK-APP-IOS-PACKET-TUNNEL-HYSTERIA2-001 — iOS/macOS PacketTunnelProvider hysteria2 适配

## Protocol Endpoint Stability Gate (TASK-DOC-PROTOCOL-STABILITY-GATE-001)

NodeAgent 多协议多端点进入实现前必须先通过稳定性门禁。这个任务把
Protocol Template、Template Version、Assignment、Rollback、Backend-owned
reconnect hint、Admin Node Detail 真接口、QA/CI 验证矩阵收敛为统一规则。

核心结论：

- NodeAgent 不直接通知 App；NodeAgent 只上报 Backend。
- Backend 是 App reconnect hint 和 connect_config eligibility 的唯一权威。
- Job Service 负责灰度 wave、per-node lock、failure threshold 和 rollback。
- Admin Node List / Node Detail 不得继续隐藏 demo data；每个字段必须有
  Backend API 或明确 mock marker。
- App 先收到 hint，再拉取新 connect_config，再进行无感/低感重连。

后续任务：

| TASK | Repo | Scope |
| --- | --- | --- |
| [TASK-BACKEND-PROTOCOL-STABILITY-001.md](TASK-BACKEND-PROTOCOL-STABILITY-001.md) | livemask-backend | Real Admin/Internal APIs, eligibility, reconnect hint authority, node detail data — ✅ Completed |
| [TASK-BACKEND-PROTOCOL-LKG-ROLLBACK-API-001.md](TASK-BACKEND-PROTOCOL-LKG-ROLLBACK-API-001.md) | livemask-backend | Real LKG/rollback fields for protocol template, eligibility, assignment list/detail APIs — ✅ Completed (`9a06111`) |
| [TASK-NODEAGENT-PROTOCOL-STABILITY-001.md](TASK-NODEAGENT-PROTOCOL-STABILITY-001.md) | livemask-nodeagent | Assignment LKG, rollback, readiness, event retry, metrics/logs — ✅ Completed (`0fa3e9c`) |
| [TASK-ADMIN-PROTOCOL-STABILITY-001.md](TASK-ADMIN-PROTOCOL-STABILITY-001.md) | livemask-admin | Replace node detail demo data and implement template/assignment UI plus LKG/rollback observability — ✅ Completed (latest `986dc9c`, original `823f4fe`) |
| [TASK-ADMIN-PROTOCOL-LKG-MOCK-RETIRE-001.md](TASK-ADMIN-PROTOCOL-LKG-MOCK-RETIRE-001.md) | livemask-admin | Cut Admin LKG/rollback UI over to real Backend fields and isolate mock fallback — ✅ Completed (`4b46435`) |
| [TASK-BACKEND-RECONNECT-HINT-RUNTIME-001.md](TASK-BACKEND-RECONNECT-HINT-RUNTIME-001.md) | livemask-backend | App-auth reconnect runtime APIs for connect config re-fetch and safe reconnect hints — ✅ Completed (`1442e64`) |
| [TASK-APP-RECONNECT-STABILITY-001.md](TASK-APP-RECONNECT-STABILITY-001.md) | livemask-app | Verify real reconnect hints, polling, and unsupported protocol safety — ✅ Completed (latest `5a433f9`, original `17e83c9`) |
| [TASK-APP-RECONNECT-RUNTIME-REAL-BACKEND-001.md](TASK-APP-RECONNECT-RUNTIME-REAL-BACKEND-001.md) | livemask-app | Cut App reconnect runtime to real Backend endpoints and Android-first validate — ✅ Completed (`e797875`) |
| [TASK-JOBS-PROTOCOL-STABILITY-001.md](TASK-JOBS-PROTOCOL-STABILITY-001.md) | livemask-job-service | Harden rollout/rollback executor — ✅ Completed (`16d9ba0`) |
| [TASK-CICD-PROTOCOL-STABILITY-001.md](TASK-CICD-PROTOCOL-STABILITY-001.md) | livemask-ci-cd | Turn protocol smoke SKIP to PASS and add stability checks — ✅ Completed (`d721677`) |
| [TASK-CICD-PROTOCOL-LKG-ROLLBACK-SMOKE-001.md](TASK-CICD-PROTOCOL-LKG-ROLLBACK-SMOKE-001.md) | livemask-ci-cd | Add protocol LKG/rollback API assertions to runtime smoke — ✅ Completed (`c7842e8`) |
| [TASK-CICD-RECONNECT-HINT-RUNTIME-SMOKE-001.md](TASK-CICD-RECONNECT-HINT-RUNTIME-SMOKE-001.md) | livemask-ci-cd | Add reconnect hint runtime smoke for App-facing Backend endpoints — ✅ Completed (`c5f628a`) |
| [TASK-DOCS-PROTOCOL-LKG-COMPLETION-SYNC-001.md](TASK-DOCS-PROTOCOL-LKG-COMPLETION-SYNC-001.md) | livemask-docs | Sync Admin/CICD protocol LKG completion evidence into task ledger — ✅ Completed |

## NodeAgent Speedtest & Bandwidth Capacity

| TASK | Repo | Scope |
| --- | --- | --- |
| [TASK-DOC-NODEAGENT-SPEEDTEST-BANDWIDTH-001.md](TASK-DOC-NODEAGENT-SPEEDTEST-BANDWIDTH-001.md) | livemask-docs | Contract and cross-repo task split for NodeAgent speedtest and 90% bandwidth cap — Ready |
| [TASK-NODEAGENT-SPEEDTEST-BANDWIDTH-001.md](TASK-NODEAGENT-SPEEDTEST-BANDWIDTH-001.md) | livemask-nodeagent | Local speedtest runner, LKG capacity, Backend report upload, self bandwidth cap — Ready |
| [TASK-BACKEND-NODE-SPEEDTEST-BANDWIDTH-001.md](TASK-BACKEND-NODE-SPEEDTEST-BANDWIDTH-001.md) | livemask-backend | Persist reports/capacity, Admin APIs, executor API, 90% cap enforcement — Ready |
| [TASK-JOBS-NODEAGENT-SPEEDTEST-SCHEDULE-001.md](TASK-JOBS-NODEAGENT-SPEEDTEST-SCHEDULE-001.md) | livemask-job-service | Scheduled/manual speedtest job definitions and Backend executor calls — Ready |
| [TASK-ADMIN-NODE-SPEEDTEST-BANDWIDTH-001.md](TASK-ADMIN-NODE-SPEEDTEST-BANDWIDTH-001.md) | livemask-admin | Node Detail speedtest/capacity UI and manual run action — Ready |
| [TASK-CICD-NODEAGENT-SPEEDTEST-BANDWIDTH-001.md](TASK-CICD-NODEAGENT-SPEEDTEST-BANDWIDTH-001.md) | livemask-ci-cd | Runtime smoke for report upload, 90% cap, Job Service trigger, Admin APIs — Ready |

## CI/CD Closed-Loop Smoke Batch (TASK-CICD-CLOSED-LOOP-BATCH-001)

完整的 CI/CD 验收闭环，覆盖 6 个功能域的端到端 smoke 验证：

| 子任务 | 脚本 | 验证范围 |
|--------|------|----------|
| TASK-CICD-DASHBOARD-001 | `dashboard-smoke.sh` | 仪表盘 traffic/countries/bandwidth/top-users/mock/empty-error |
| TASK-CICD-SYSTEM-SETTINGS-SCHEDULER-001 | `system-settings-smoke.sh` | 系统设置 CRUD、Schedule CRUD、secret leak scan |
| TASK-CICD-APP-RELEASE-001 | `app-release-smoke.sh` | 应用发布 artifact/publish/check/pause/resume/revoke、Website 下载、storage secret scan |
| TASK-CICD-OBSERVABILITY-SMOKE-001 | `observability-smoke.sh` | NodeAgent logs → Backend → JobService → DB → Admin、Sentry/Payment/Notification logs |
| TASK-CICD-I18N-001 | `i18n-smoke.sh` | Backend message_key、Admin zh-CN、Website hreflang/sitemap、App localization |
| TASK-CICD-JOBS-HARDENING-001 | `jobs-hardening-smoke.sh` | Queue lease/retry/backoff/dead-letter/duplicate lock/run events/secret leak |
| TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-001 | existing domain scripts | Admin settings/jobs/protocol/release/sentry route/API regression |

集成入口: `scripts/smoke.sh` + `.github/workflows/staging-smoke.yml`。

> **状态**: `scripts/smoke.sh` 已集成全部 6 个脚本。Backend/Admin 实现对应 API 端点后，smoke 从 SKIP 切换为 PASS。

## Docs Governance Sync Batch (TASK-DOCS-GOVERNANCE-SYNC-BATCH-001)

`TASK-CICD-CLOSED-LOOP-BATCH-001` 的治理补齐任务。它不实现运行时代码，
只确保 Cursor 多窗口、PR review 和 CI/CD smoke 的文档入口一致。

| 缺口 | 修复产物 | 状态 |
| --- | --- | --- |
| Contract index | `docs/contracts/contract-index.md` + `docs/contracts/README.md` | Ready |
| Missing Cursor handoffs | `DASHBOARD-CICD-CURSOR_HANDOFF.md`, `JOBS-HARDENING-CICD-CURSOR_HANDOFF.md`, `I18N-CICD-CURSOR_HANDOFF.md`, `CICD-SENTRY-OBSERVABILITY-CURSOR_HANDOFF.md` | Ready |
| Tasks / MVP plan linkage | `docs/development/tasks/README.md`, `docs/development/MVP_IMPLEMENTATION_PLAN.md` | Ready |
| Auth/RBAC permission index | `docs/contracts/api/auth-rbac.md` | Ready |

PR order:

1. `livemask-docs` PR for governance sync.
2. `livemask-backend` / `livemask-admin` implementation PRs.
3. `livemask-ci-cd` PR for smoke scripts, referencing the docs PR.

## NodeAgent 发布、配置与回滚任务

- [TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md](TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md) — NodeAgent binary 分发、配置下发、灰度、健康门禁和回滚契约
- TASK-BACKEND-NODEAGENT-RELEASE-001 — Backend release metadata schema、version check API、upgrade event API
- TASK-NODEAGENT-RELEASE-001 — NodeAgent release manager、artifact download/verify/install/rollback
- TASK-BACKEND-NODEAGENT-CONFIG-ROLLBACK-001 — Backend per-node config assignment、schema compatibility、rollback publish flow
- TASK-ADMIN-NODEAGENT-RELEASE-001 — Admin release/rollout UI、per-node version/config 状态和 rollback 操作
- TASK-CICD-NODEAGENT-RELEASE-001 — CI smoke 验证 release 和 rollback 流程
- TASK-APP-NODE-STATUS-002 — App 安全展示 node rollout/degraded 状态（仅当 Backend 暴露安全字段）

## GeoIP 数据库更新、NodeAgent 同步与 App 增量同步任务

- [TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md](TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md) — Backend 定时更新 GeoIP DB、NodeAgent 同步 verified artifact、App 增量同步 package、校验、LKG 和回滚契约
- TASK-BACKEND-GEOIP-001 — Backend source registry、scheduled update job、artifact metadata、NodeAgent check/event APIs、App manifest/event APIs ✅
- TASK-BACKEND-GEOIP-SOURCE-002 — Backend source hardening、storage abstraction、manifest signature、rate limit、delta fallback skeleton ✅
- TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001 — Backend MaxMind tar.gz decompression + .mmdb extraction
- TASK-NODEAGENT-GEOIP-001 — NodeAgent GeoIP sync manager、verifier、local LKG、rollback ✅
- TASK-NODEAGENT-GEOIP-002 — NodeAgent event retry queue
- TASK-NODEAGENT-GEOIP-003 — NodeAgent manifest signature verify + key rotation
- TASK-NODEAGENT-GEOIP-004 — NodeAgent delta package apply
- TASK-NODEAGENT-GEOIP-005 — NodeAgent lookup engine
- TASK-NODEAGENT-GEOIP-006 — NodeAgent heartbeat contract extension
- TASK-NODEAGENT-GEOIP-007 — NodeAgent compatibility gate
- TASK-NODEAGENT-GEOIP-008 — NodeAgent runtime config integration
- TASK-APP-GEOIP-001 — App GeoIP manifest client、delta/full package sync、cache、LKG、fallback ✅ (dev-contained, verified TASK-APP-INTEGRITY-RECONCILE-001)
- TASK-APP-GEOIP-LOOKUP-001 — App GeoIP lookup engine ✅ (dev-contained, verified TASK-APP-INTEGRITY-RECONCILE-001)
- TASK-ADMIN-GEOIP-001 — Admin GeoIP source/database/rollout UI ✅
- TASK-CICD-GEOIP-001 — GeoIP update and rollback smoke ✅
- TASK-CICD-GEOIP-HARDENING-002 — CI/CD signature/rate-limit/delta-fallback/source-hardening smoke
- TASK-APP-NODE-REGION-001 — App 使用 Backend 字段和本地 GeoIP cache 安全展示 region/degraded 状态 ✅ (dev-contained, verified TASK-APP-INTEGRITY-RECONCILE-001)
- [TASK-DOC-GEOIP-CONTRACT-002] — GeoIP source hardening 契约（本文档）

## App Integrity Reconcile 后续任务

| TASK | Repo | Scope | Status |
| --- | --- | --- | --- |
| [TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001.md](TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001.md) | `livemask-app` | Fix sentry_flutter Kotlin JVM target compatibility for Android debug/release builds | ✅ Completed (`5ce5c6c`) |
| [TASK-APP-IOS-CODESIGN-ENV-001.md](TASK-APP-IOS-CODESIGN-ENV-001.md) | `livemask-app` | Resolve Sequoia xattr/codesign and signing Identity for iOS builds | ⚠️ Partial (`a5243cd`) — simulator safe workdir PASS, device signing BLOCKED |
| TASK-APP-IOS-DEVICE-SIGNING-001 | `livemask-app` / CI-CD | Configure Apple Developer Team ID, signing identity, provisioning profiles, and physical-device validation | Proposed |
| TASK-APP-ANDROID-RELEASE-SIGNING-001 | `livemask-app` / CI-CD | Configure real Android release signing keys; current release build passes with debug signing config | Proposed |
| [TASK-CICD-DEV-MERGE-GUARD-PATH-SPACES-001.md](TASK-CICD-DEV-MERGE-GUARD-PATH-SPACES-001.md) | `livemask-ci-cd` | Fix dev-merge-guard.sh path handling for spaces in "New project 2" directory name | ✅ Completed |
| [TASK-CICD-WORKSPACE-PATH-MIGRATION-001.md](TASK-CICD-WORKSPACE-PATH-MIGRATION-001.md) | `livemask-ci-cd` / all repos | Move all local LiveMask repos to `~/Developer/LiveMask`; update rules/scripts/runbooks to reject old workspace edits | ✅ Completed |
| TASK-DOCS-WORKSPACE-RULES-SYNC-001 | `livemask-docs` / all runtime repos | Mirror CI/CD workspace pre-check and old-path ban into every repo `.cursorrules` | Proposed |

## Content System（统一内容系统）任务

> 替代旧 `Blog / SEO 内容系统任务`。旧任务 `TASK-DOC-BLOG-SEO-001` 已合并升级为 `TASK-DOC-CONTENT-001`，旧 `TASK-BACKEND-BLOG-001` 等已重新编排。

- [TASK-DOC-CONTENT-001-content-system-contract.md](TASK-DOC-CONTENT-001-content-system-contract.md) — 统一 Content System 契约：content_items 模型、6 种内容类型、App API、Admin API、跳转规则
- TASK-BACKEND-CONTENT-001 — Backend 统一 content_items schema + Public Blog API + App Content API
- TASK-BACKEND-ADMIN-CONTENT-001 — Backend Admin Content CRUD API
- TASK-WEBSITE-BLOG-002 — Website Blog real API integration
- TASK-ADMIN-CONTENT-001 — Admin Content Management UI（管理所有 6 种 content_type）
- TASK-APP-CONTENT-FEED-001 — App 公告/活动/banner feed
- TASK-CICD-CONTENT-SEO-001 — Blog SEO + App content smoke
