# TASK-DOC-GEOIP-SYNC-001 - GeoIP Database Update, NodeAgent Sync and App Incremental Sync Contract

- 状态：Ready
- Owner：Docs / Backend / NodeAgent / App / DevOps
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-nodeagent`, `livemask-admin`, `livemask-app`, `livemask-ci-cd`
- 关联里程碑：Node recommendation / traffic analytics / production operations
- 依赖：`TASK-P0-03-config-center`, `TASK-NA-CONFIG-001`

## 1. Background

现有文档只在流量聚合和系统设计中提到 MaxMind GeoLite2，但没有定义：

- Backend 如何定时更新 GeoIP DB。
- GeoIP DB artifact 如何校验、版本化、发布和回滚。
- NodeAgent 是否需要从 Backend 同步 GeoIP DB。
- App 是否需要从 Backend 增量同步轻量 GeoIP / region package。
- Admin 如何查看 GeoIP DB 版本和回滚。
- App 是否需要感知 GeoIP DB 状态。

因此需要新增跨仓库契约，避免后续各仓库自行实现。

## 2. Scope

### In Scope

- 新增 `docs/contracts/geoip/GEOIP_DATABASE_SYNC_CONTRACT.md`。
- 定义 Backend 定时更新任务、schema、NodeAgent check/event API。
- 定义 NodeAgent GeoIP sync manager、local LKG、rollback。
- 定义 App GeoIP manifest/event API、delta/full package sync、cache、LKG、fallback。
- 定义 Admin / App / CI/CD 影响。
- 记录 1-3 个免费/开放友好的 GeoIP 数据源候选。

### Out of Scope

- 不实现 Backend 定时任务。
- 不实现 NodeAgent sync module。
- 不实现 Admin UI。
- 不实现 App GeoIP sync module。
- 不改 CI/CD smoke。

## 3. Contracts

- Main contract: `docs/contracts/geoip/GEOIP_DATABASE_SYNC_CONTRACT.md`
- Existing daily aggregation doc: `docs/monitoring/LiveMask_daily_country_traffic_每日聚合任务_v3.6.md`
- Existing config sync doc: `docs/nodeagent/LiveMask_NodeAgent_Config_Sync_with_Backend_v3.6.md`

## 4. Cross-Repo Impact

| 仓库 | 后续必须做什么 | 是否本任务修改 |
| --- | --- | --- |
| `livemask-backend` | GeoIP source registry、scheduled update、artifact metadata、NodeAgent check/event APIs、App manifest/event APIs | 否 |
| `livemask-nodeagent` | GeoIP downloader/verifier/local store/LKG/rollback/status | 否 |
| `livemask-admin` | GeoIP source/database/rollout UI 和 rollback 操作 | 否 |
| `livemask-app` | GeoIP manifest client、delta/full package sync、cache、LKG、region fallback | 否 |
| `livemask-ci-cd` | GeoIP smoke with good/bad fixture DB | 否 |
| `livemask-docs` | 新增契约与索引 | 是 |

## 5. Follow-up TASKs

| TASK | Repo | Goal |
| --- | --- | --- |
| `TASK-BACKEND-GEOIP-001` | `livemask-backend` | Source registry, scheduled update job, artifact metadata, NodeAgent check/event APIs, App manifest/event APIs |
| `TASK-NODEAGENT-GEOIP-001` | `livemask-nodeagent` | GeoIP sync manager, verifier, local LKG, rollback |
| `TASK-APP-GEOIP-001` | `livemask-app` | App GeoIP manifest client, delta/full package sync, cache, LKG, fallback |
| `TASK-ADMIN-GEOIP-001` | `livemask-admin` | GeoIP source/database/rollout UI |
| `TASK-CICD-GEOIP-001` | `livemask-ci-cd` | GeoIP update and rollback smoke |
| `TASK-APP-NODE-REGION-001` | `livemask-app` | Safe region/degraded display using Backend fields and local GeoIP cache |

## 6. Validation Plan

- `bash scripts/check-docs.sh`
- Markdown links resolve.
- Task index includes GeoIP contract and follow-up tasks.
- Contract README links the new contract.
- NodeAgent README and App design docs link or reference the new contract.

## 7. Rollback

Docs-only task. Rollback means reverting the contract file and index links.
No runtime or local dev environment should be stopped.

## 8. Completion Evidence

- Commit:
- Docs check:
- Task sync:
