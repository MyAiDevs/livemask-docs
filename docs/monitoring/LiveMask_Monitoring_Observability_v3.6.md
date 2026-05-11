# LiveMask 监控与可观测性设计 v3.6

## 1. 双轨监控架构

- **自研心跳 + 上报**：NodeAgent 实时上报（用于 degraded mode、推荐反馈）
- **Prometheus + Grafana**：长期趋势、告警、SLO

## 2. 核心指标

- 节点可用率
- 推荐成功率
- 连接成功率与延迟
- Error Budget 消耗

## 3. AlertOrchestrator

重要告警自动决策：
- 可自动缓解 → 自动执行
- 需人工确认 → 创建工单 + 通知

## 4. SLO 与 Error Budget

当 Error Budget 消耗过快时，自动触发限流建议或 degraded mode。

---

*详细实现请参考系统设计文档中的监控章节*