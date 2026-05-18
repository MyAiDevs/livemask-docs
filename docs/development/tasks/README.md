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
