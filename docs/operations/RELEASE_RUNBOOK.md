# MVP Release Runbook

## 1. 发布前检查

- [ ] 所有 P0 TASK 状态为 Review 或 Done。
- [ ] `bash scripts/check-docs.sh` 通过。
- [ ] Staging migration dry run 通过。
- [ ] Redis key registry 已更新。
- [ ] Secret 和环境变量已配置。
- [ ] Dashboard 和 P0/P1 告警已启用。
- [ ] Support 话术和升级路径已准备。

## 2. 发布顺序

1. Freeze config changes。
2. 备份 PostgreSQL。
3. 执行 DB migration。
4. 部署 Backend API。
5. 部署 Worker / Outbox consumer。
6. 验证 Redis / Queue。
7. 灰度 NodeAgent。
8. 灰度 App remote config。
9. 开启支付入口 FeatureFlag。
10. 执行 smoke tests。

## 3. Smoke Tests

- [ ] GET `/healthz`
- [ ] GET client config
- [ ] GET NodeAgent config
- [ ] POST node report mock
- [ ] POST connection quality mock
- [ ] POST create payment order in sandbox
- [ ] Redis read/write check
- [ ] Outbox worker check

## 4. 回滚步骤

### API 回滚

1. 关闭相关 FeatureFlag。
2. 回滚 API 镜像。
3. 保留 DB additive migration。
4. 运行 smoke tests。

### Config 回滚

1. 恢复上一版本 `system_configs`。
2. 发布 `config.published`。
3. 观察 config rollout dashboard。

### Payment 回滚

1. 关闭支付创建入口。
2. 继续接收 Webhook 并记录审计。
3. 对异常订单人工补单或退款。

### Redis 恢复

1. 确认 Redis 可写。
2. 运行 `rebuild_node_realtime_cache`。
3. 清理 stale recommendation cache。

## 5. 事故升级

| 条件 | 等级 | Owner |
| --- | --- | --- |
| 支付成功但权益未发 | P0 | Payment / Backend |
| DB 写失败 | P0 | Backend / SRE |
| 大面积连接失败 | P0 | App / NodeAgent / Ops |
| Redis 写失败持续超过 10 分钟 | P1 | SRE |
| 配置生效率低于阈值 | P1 | Backend / Ops |

## 6. 发布后观察

- T+15 min：确认 P0 告警为 0。
- T+1 h：确认连接成功率和支付创建成功率。
- T+24 h：对账、outbox backlog、NodeAgent 补报积压。
