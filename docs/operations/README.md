# Operations / DevOps 文档入口

## 1. 职责范围

Operations / DevOps 负责部署、CI/CD、监控告警、Secret 管理、灾备演练、运行手册、值班和事故响应。

## 2. 修改 Ops 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否影响部署、回滚、环境变量、Secret、数据库迁移或任务调度
- [ ] 是否影响监控指标、告警阈值、值班响应或事故流程
- [ ] 是否影响 Backend、NodeAgent、App 的运行配置
- [ ] 是否需要灰度、蓝绿发布、灾备演练或回滚验证

## 3. 必须更新文档的场景

- 环境变量、Secret、证书、密钥轮换变化
- 部署拓扑、Docker/K8s、CI/CD、迁移步骤变化
- 告警规则、SLO、Dashboard、日志字段变化
- 灾备计划、RTO/RPO、演练流程变化
- 值班、客服升级、事故响应流程变化

## 4. 完成标准

- [ ] 部署和回滚步骤可执行
- [ ] Secret 不进入仓库、日志或客户端配置
- [ ] 告警和 Dashboard 已同步更新
- [ ] 灾备或回滚验证证据已记录
- [ ] 值班和升级路径已明确

## 5. 必读文档

- `docs/operations/GITHUB_ACTIONS_RUNNER_ARCHITECTURE.md`
- `docs/operations/GITHUB_AUTOMATION_SETUP.md`
- `docs/operations/LOCAL_DEVELOPMENT_RUNTIME.md`
- `docs/operations/DOCKER_RUNTIME_DEPLOYMENT.md`
- `docs/operations/AI_TASK_SYNC_AUTOMATION.md`
- `docs/operations/LARK_REPORTING.md`
- `docs/operations/RELEASE_RUNBOOK.md`
- `docs/contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md`
- `docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`
- `docs/architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md`
- `docs/monitoring/ALERT_DASHBOARD_INDEX.md`
- `docs/data/DB_MIGRATION_PLAN.md`
- `docs/data/outbox-compensation.md`

CI/CD and DevOps tasks that trigger smoke runs, task-sync, release rollout,
runtime sync, artifact cleanup, dashboard aggregation, or scheduled validation
must check the Job Queue Usage Matrix. Production-grade triggers should create
Job Service runs through Backend gateway instead of embedding long work inside
GitHub Actions or Admin feature pages. Local dev runtime sync must remain
targeted and must not stop the long-lived local stack unless explicitly
requested.
