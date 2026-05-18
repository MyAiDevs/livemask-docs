# TASK Workspace

> 每个跨仓库任务都应该有独立任务单。大里程碑表负责排期，任务单负责闭环证据。

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

- [TASK-DOC-PROTOCOL-001-nodeagent-multi-protocol-extension-arch.md](TASK-DOC-PROTOCOL-001-nodeagent-multi-protocol-extension-arch.md)
- [TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md](TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md)
- [TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md](TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md)
- [TASK-VPN-CONFIG-001-real-connect-config-contract.md](TASK-VPN-CONFIG-001-real-connect-config-contract.md)
- [TASK-INFRA-001-mvp-health-ci-smoke-closed-loop.md](TASK-INFRA-001-mvp-health-ci-smoke-closed-loop.md)
- [TASK-INFRA-002-ai-task-sync-and-auto-marking.md](TASK-INFRA-002-ai-task-sync-and-auto-marking.md)
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

## 下一阶段任务

- [TASK-DOC-HYSTERIA2-CONTRACT-001] — Hysteria2 连接配置跨仓库契约（当前任务）
- TASK-NODEAGENT-HYSTERIA2-001 — NodeAgent 端 hysteria2 ProtocolProfile 实现（Render / Validate / HealthCheck / Endpoint / Redact）
- TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001 — Backend 端 hysteria2 connect_config 生成 + profile dispatch + skeleton fallback
- TASK-ADMIN-ENDPOINT-002 — Admin endpoint editor hysteria2 字段支持
- TASK-APP-CONNECT-PROFILE-001 — App 端 profile_type=hysteria2 解析 + skeleton 占位态展示
- TASK-CICD-PROTOCOL-SMOKE-001 — CI smoke 验证 endpoint registration → connect_config hysteria2
- TASK-APP-ANDROID-ENGINE-HYSTERIA2-001 — Android VpnService hysteria2 原生引擎集成
- TASK-APP-IOS-PACKET-TUNNEL-HYSTERIA2-001 — iOS/macOS PacketTunnelProvider hysteria2 适配

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
- TASK-APP-GEOIP-001 — App GeoIP manifest client、delta/full package sync、cache、LKG、fallback ✅
- TASK-APP-GEOIP-LOOKUP-001 — App GeoIP lookup engine
- TASK-ADMIN-GEOIP-001 — Admin GeoIP source/database/rollout UI ✅
- TASK-CICD-GEOIP-001 — GeoIP update and rollback smoke ✅
- TASK-CICD-GEOIP-HARDENING-002 — CI/CD signature/rate-limit/delta-fallback/source-hardening smoke
- TASK-APP-NODE-REGION-001 — App 使用 Backend 字段和本地 GeoIP cache 安全展示 region/degraded 状态
- [TASK-DOC-GEOIP-CONTRACT-002] — GeoIP source hardening 契约（本文档）

## Content System（统一内容系统）任务

> 替代旧 `Blog / SEO 内容系统任务`。旧任务 `TASK-DOC-BLOG-SEO-001` 已合并升级为 `TASK-DOC-CONTENT-001`，旧 `TASK-BACKEND-BLOG-001` 等已重新编排。

- [TASK-DOC-CONTENT-001-content-system-contract.md](TASK-DOC-CONTENT-001-content-system-contract.md) — 统一 Content System 契约：content_items 模型、6 种内容类型、App API、Admin API、跳转规则
- TASK-BACKEND-CONTENT-001 — Backend 统一 content_items schema + Public Blog API + App Content API
- TASK-BACKEND-ADMIN-CONTENT-001 — Backend Admin Content CRUD API
- TASK-WEBSITE-BLOG-002 — Website Blog real API integration
- TASK-ADMIN-CONTENT-001 — Admin Content Management UI（管理所有 6 种 content_type）
- TASK-APP-CONTENT-FEED-001 — App 公告/活动/banner feed
- TASK-CICD-CONTENT-SEO-001 — Blog SEO + App content smoke
