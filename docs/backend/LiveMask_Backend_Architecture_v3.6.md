# LiveMask Backend 架构设计 v3.6

## 1. 整体定位

Backend 是 LiveMask 项目的核心业务中台，负责：
- 用户管理、订阅、支付
- 节点管理、质量评分、收益计算
- 配置下发、热更新
- 监控告警、留存预警
- 多仓库联动协调

## 2. 核心技术栈

- Go + Gin
- PostgreSQL + Redis
- Asynq（异步任务）
- HashiCorp Vault（Secret 管理）

## 3. 主要模块

- `internal/user/`
- `internal/subscription/`
- `internal/payment/`
- `internal/node/`
- `internal/recommendation/`
- `internal/retention/`
- `internal/monitoring/`
- `internal/config/`

## 4. 与其他仓库的联动

- **livemask-nodeagent**：配置下发、心跳上报、远程诊断
- **livemask-app**：配置同步、Onboarding 反馈、GEOIP 更新
- **livemask-ci-cd**：构建、测试、部署流程

## 5. 关键设计原则

- 配置驱动（避免硬编码）
- 闭环设计（所有重要流程必须有反馈）
- TASK-XXXX traceability
- 多仓库变更必须同步更新 livemask-docs

---

*详细实现请参考系统设计文档和各专项模块文档*