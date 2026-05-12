# LiveMask 监控日志告警规范 v3.6

## 1. 日志规范

### 1.1 日志格式
统一使用 **结构化 JSON 日志**，便于 ELK / Loki 等系统采集和查询。

**推荐字段**：
```json
{
  "timestamp": "2026-05-08T18:00:00.123Z",
  "level": "INFO",
  "service": "affiliate-service",
  "trace_id": "abc123def456",
  "user_id": "uuid",
  "ambassador_id": "uuid",
  "node_id": "uuid",
  "action": "calculate_commission",
  "message": "佣金计算完成",
  "duration_ms": 12,
  "error_code": null,
  "extra": {}
}
```

### 1.2 日志级别
- **ERROR**: 必须告警的错误（配置更新失败、佣金计算异常、数据库连接失败等）
- **WARN**: 需要关注但不一定立即处理（Quarantine 命中率异常、配置回滚等）
- **INFO**: 正常业务流程记录
- **DEBUG**: 开发调试使用，生产环境默认关闭

### 1.3 必须记录的关键操作
- 配置热更新成功/失败
- 威胁狩猎命中 + Quarantine 创建
- 申诉复核操作（approve/reject/extend）
- 推广大使 Tier 变更
- 佣金计算（带 trace_id）
- 用户忠诚度等级变更
- Free Zone 带宽限制触发

## 2. 关键监控指标（Prometheus + Grafana）

### 2.1 业务指标
- 推广大使佣金计算成功率 / 耗时 P99
- 威胁狩猎命中率 + Quarantine 误判率
- 免费区带宽使用率
- C2C 交易量 + 平台补贴金额
- 配置热更新成功率 + 回滚次数

### 2.2 技术指标
- API 延迟 P50 / P99（按接口分组）
- 数据库连接池使用率
- Redis 内存使用率 + 命令延迟
- 后台定时任务执行成功率 + 耗时
- 配置拉取失败率

### 2.3 告警规则（建议）

| 告警名称 | 条件 | 严重程度 | 处理建议 |
|----------|------|----------|----------|
| 配置更新失败率过高 | 5分钟内失败率 > 5% | P0 | 立即检查 Config Service |
| Quarantine 误判率过高 | 24小时内驳回率 > 30% | P1 | 检查狩猎规则合理性 |
| 免费区带宽持续饱和 | 持续 10 分钟超过 90% | P1 | 检查是否需要扩容或调整节点 |
| 佣金计算失败 | 5分钟内出现失败 | P0 | 检查 Affiliate Service 日志 |
| 配置回滚次数过多 | 1小时内回滚 > 3 次 | P1 | 检查配置变更是否合理 |

## 3. 链路追踪（Tracing）
- 推荐使用 OpenTelemetry
- 关键链路：客户端拉取配置 → Config Service → Redis → 应用配置
- 关键链路：佣金计算（Affiliate Service → User Service → 忠诚度服务）
- 所有 trace 必须包含 `trace_id`，方便问题排查

## 4. 日志与监控接入建议
- 后端服务统一使用结构化日志库（zap / zerolog 等）
- 客户端重要操作也记录结构化日志（尤其是配置更新和安全相关操作）
- 推荐使用 Prometheus + Grafana + Loki 技术栈
- 重要告警必须接入企业微信 / 钉钉 / 短信
