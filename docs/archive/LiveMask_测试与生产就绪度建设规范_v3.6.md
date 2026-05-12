# LiveMask 测试与生产就绪度建设规范 v3.6

**最后更新**：2026-05-10  
**优先级**：P0（强烈建议在第一阶段上线前完成基础建设）

---

## 一、总体目标

将 LiveMask 从“能跑通”提升到“可长期稳定运行在生产环境”的成熟度。

**核心原则**：
- **测试左移**：尽早发现问题
- **可观测性优先**：问题发生时能快速定位
- **灰度与回滚**：降低发布风险
- **自动化运维**：减少人工操作

---

## 二、测试策略（Testing Strategy）

### 测试金字塔

```
          E2E / Contract Tests（少量，关键路径）
               ↑
         Integration Tests（服务间、DB、外部依赖）
               ↑
      Unit Tests（大量，快速反馈）
```

**各层要求**：

| 测试类型       | 覆盖率目标 | 工具推荐                  | 执行时机          | 负责人 |
|----------------|------------|---------------------------|-------------------|--------|
| **Unit**       | > 70%      | Go test + testify         | 每次提交          | 开发者 |
| **Integration**| > 50%      | Testcontainers + pgx      | PR / CI           | 开发者 |
| **Contract**   | 核心 API   | Pact / Spring Cloud Contract | 发布前         | 后端负责人 |
| **E2E**        | 关键用户路径 | Playwright / Cypress     |  nightly + 发布前 | QA     |
| **Load**       | 峰值 3 倍  | k6 / Locust               | 发布前 + 定期     | DevOps |
| **Chaos**      | 关键服务   | Chaos Mesh                | 每月              | SRE    |

### 必须覆盖的关键路径

1. 用户订阅全生命周期（创建 → 支付 → Dunning → 取消）
2. Sponsor 节点注册 → 审核 → 上线 → 降级 → 申诉
3. 推广大使佣金计算 + 追溯调整
4. 支付回调 + 收益分账
5. 配置热更新 + 降级模式

---

## 三、生产就绪度检查清单（Production Readiness Checklist）

### 3.1 发布与灰度

- [ ] **Feature Flag 系统** 已上线（推荐 `Unleash` 或自研）
- [ ] 支持**金丝雀发布**（Canary）+ 自动回滚
- [ ] 支持**蓝绿部署**
- [ ] 发布 checklist 模板（包含测试通过、监控正常、回滚方案确认）

### 3.2 可观测性（Observability）

- [ ] **Metrics**：Prometheus + Grafana（业务指标 + 技术指标）
- [ ] **Logging**：结构化日志 + Loki / ELK
- [ ] **Tracing**：OpenTelemetry + Jaeger / Tempo（覆盖核心链路）
- [ ] **SLO 定义**：
  - API 可用性 ≥ 99.5%
  - P99 延迟 ≤ 800ms
  - 错误率 ≤ 0.5%
- [ ] **Error Budget** 看板已建立

### 3.3 安全与合规

- [ ] SAST（静态代码扫描）集成到 CI（`gosec`、`semgrep`）
- [ ] DAST（动态扫描）定期执行
- [ ] 依赖漏洞扫描（`dependabot` / `renovate`）
- [ ] 密钥管理统一使用 **Vault** 或云原生 Secret Manager
- [ ] 定期渗透测试计划（每季度或重大版本前）

### 3.4 灾备与恢复

- [ ] 数据库备份策略（每日全量 + WAL 归档）
- [ ] 跨可用区 / 跨区域备份
- [ ] 灾难恢复演练（每季度至少一次）
- [ ] Runbook 文档（常见故障处理流程）

### 3.5 容量与性能

- [ ] 容量规划模型（用户增长 vs 资源需求）
- [ ] Kubernetes HPA + Cluster Autoscaler 已配置
- [ ] 定期进行 Load Testing 并记录基线

### 3.6 运维与支持

- [ ] On-call 轮班制度 + 告警升级机制
- [ ] 统一错误码体系 + 排查手册
- [ ] 客户支持系统已上线（工单 + Telegram Bot）

---

## 四、CI/CD 增强建议

当前 CI/CD 建议增加以下 Stage：

1. **Lint + Security Scan**
2. **Unit + Integration Test**
3. **Contract Test**
4. **Build & Push Image**
5. **Deploy to Staging**
6. **E2E Test（Staging）**
7. **Manual Approval（生产）**
8. **Canary Deploy**
9. **Monitor & Auto Rollback**

---

## 五、推荐工具栈

| 领域             | 推荐工具                     | 备注 |
|------------------|------------------------------|------|
| Feature Flag     | Unleash / Flagsmith          | 开源友好 |
| 测试             | testify, Testcontainers, k6, Playwright | - |
| 可观测性         | Prometheus + Grafana + Tempo + Loki | OpenTelemetry 统一 |
| 密钥管理         | HashiCorp Vault              | 生产推荐 |
| 混沌工程         | Chaos Mesh                   | Kubernetes 友好 |
| 告警             | Alertmanager + PagerDuty / 钉钉 / Telegram | - |

---

## 六、实施路线图建议

| 阶段 | 时间     | 重点内容                           | 交付物 |
|------|----------|------------------------------------|--------|
| **Phase 1** | 第1个月 | Unit + Integration 测试 + 基础监控 | 测试覆盖率报告 + 基础 Dashboard |
| **Phase 2** | 第2个月 | Feature Flag + Canary 发布 + SLO 定义 | 发布流程规范 + SLO 看板 |
| **Phase 3** | 第3个月 | E2E + Load Testing + 灾备演练     | 完整 PRD Checklist + Runbook |
| **Phase 4** | 第4个月 | Chaos Engineering + 安全渗透测试   | 季度安全报告 |

---

**此文档为框架版**，后续可补充：
- 详细测试用例模板
- SLO 定义具体数值
- Runbook 示例
- 容量规划模型

需要我继续细化某个部分吗？