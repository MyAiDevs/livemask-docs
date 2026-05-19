# TASK-DOC-NODEAGENT-RELEASE-001 - NodeAgent Binary Release, Config Delivery and Rollback Contract

- 状态：Ready
- Owner：Docs / Backend / NodeAgent
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-nodeagent`, `livemask-admin`, `livemask-app`, `livemask-ci-cd`
- 关联里程碑：NodeAgent production operations
- 依赖：`TASK-NA-CONFIG-001`, `TASK-NODEAGENT-PROTOCOL-001`

## 1. Background

当前 NodeAgent 已具备注册、心跳、配置拉取、sing-box runtime skeleton、多协议 profile 架构和 hysteria2 profile。但生产环境还缺少：

- NodeAgent binary 版本分发。
- Backend 管理可用 release、rollout policy 和 per-node target version。
- NodeAgent 下载、校验、安装、重启、健康检查和自动回滚。
- 配置版本与 binary 版本兼容矩阵。
- Admin 可视化发布、暂停、回滚和节点版本状态。

如果没有这条链路，节点升级会依赖人工 SSH/复制文件，无法做灰度、回滚、审计，也无法保证配置和 binary 匹配。

## 2. Scope

### In Scope

- 新增跨仓库契约文档：`docs/contracts/nodeagent/NODEAGENT_RELEASE_CONFIG_ROLLBACK_CONTRACT.md`。
- 定义 Backend schema/API、NodeAgent release manager、Admin UI、App 影响、CI smoke。
- 明确 binary rollback 和 config rollback 的触发条件。
- 明确 secret、artifact、checksum、signature 安全要求。
- 登记后续 implementation TASK。

### Out of Scope

- 不实现 Backend API。
- 不实现 NodeAgent release manager。
- 不实现 Admin UI。
- 不实现 CI smoke。
- 不改任何代码仓库。

## 3. Contracts

- Main contract: `docs/contracts/nodeagent/NODEAGENT_RELEASE_CONFIG_ROLLBACK_CONTRACT.md`
- Existing config contract: `docs/contracts/api/config-center.md`
- Existing NodeAgent config task: `TASK-NA-CONFIG-001-config-sync-hot-reload.md`

## 4. Cross-Repo Impact

| 仓库 | 后续必须做什么 | 是否本任务修改 |
| --- | --- | --- |
| `livemask-backend` | release metadata schema、version check API、upgrade event API、config compatibility and rollback | 否 |
| `livemask-nodeagent` | release manager、artifact download/verify/install/rollback、LKG binary/config | 否 |
| `livemask-admin` | release/rollout UI、per-node version/config 状态、rollback 操作 | 否 |
| `livemask-app` | 只消费 node degraded/version/config 状态，不参与 binary update | 否 |
| `livemask-ci-cd` | release/rollback smoke，必须隔离 local dev runtime | 否 |
| `livemask-docs` | 新增契约和任务索引 | 是 |

## 5. Required Follow-up TASKs

| TASK | Repo | Goal |
| --- | --- | --- |
| `TASK-BACKEND-NODEAGENT-RELEASE-001` | `livemask-backend` | Release metadata schema, version check API, upgrade event API |
| `TASK-NODEAGENT-RELEASE-001` | `livemask-nodeagent` | Release manager and binary rollback |
| `TASK-BACKEND-NODEAGENT-CONFIG-ROLLBACK-001` | `livemask-backend` | Per-node config assignment and rollback publish flow |
| `TASK-ADMIN-NODEAGENT-RELEASE-001` | `livemask-admin` | Release/rollout operations UI |
| `TASK-CICD-NODEAGENT-RELEASE-001` | `livemask-ci-cd` | Release and rollback smoke |
| `TASK-APP-NODE-STATUS-002` | `livemask-app` | Safe display of rollout/degraded status when exposed |

## 6. Validation Plan

- [x] `bash scripts/check-docs.sh`
- [x] Markdown links resolve.
- [x] Task index includes the new doc task and follow-up tasks.
- [x] Contract README links the new contract.
- [x] NodeAgent README links the new contract.

## 7. Rollback

This task is docs-only. Rollback means reverting the new contract file and
index links. No runtime or local dev environment should be stopped.

## 8. Completion Evidence

- Commit: (will be committed together with other doc updates)
- Docs check: pending `scripts/check-docs.sh` run
- Task sync: pending

## 9. Contract Upgrade Log

| Date | Change | Reason |
| --- | --- | --- |
| 2026-05-18 | Status changed from Draft to Ready | Added Admin API response examples (5 endpoints), Backend error codes (3 categories, 14 codes), NodeAgent local endpoints (6), CI smoke acceptance matrix (13 cases with failure impact), rollback failure handling (6 scenarios), object storage credential boundaries (6 principles), and signing follow-up task. |
