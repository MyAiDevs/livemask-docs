# LiveMask 部署架构与 CI/CD 方案 v3.6

## 1. 整体部署架构（重要说明）

**重要原则**：
- **客户端 App**（Flutter 多平台）**不纳入 docker-compose 管理**，独立构建、加密混淆后分发。
- **所有后端服务 + 官网** 统一采用 **Docker Compose** 部署（包括 API 服务、Worker、PostgreSQL、Redis、官网静态/服务等）。
- sing-box 节点可通过独立 compose 文件或 Ansible 管理。

### 1.1 推荐架构（生产环境）
- **Docker Compose**（主力推荐，简单可靠）
- 可选升级为 **Kubernetes**（当节点数量 > 50 或需要强自动扩缩容时）
- 核心组件：
  - **API Gateway**：Nginx / Traefik / Kong（处理 TLS、限流、认证）
  - **Backend Services**：Go 服务（可水平扩展）
    - `api-server`：处理客户端和后台请求
    - `worker`：处理定时任务、佣金计算、通知发送、威胁狩猎
  - **sing-box 节点**：独立部署在全球多个地区（香港、日本、新加坡、美国等）
  - **Database**：PostgreSQL（主从或云托管，如 AWS RDS / Supabase）
  - **Cache & Queue**：Redis Cluster（配置 + 队列 + 限流）
  - **Object Storage**：S3 / MinIO（日志、报表导出、GeoIP 数据库）

### 1.2 服务拆分建议（Docker Compose 为主）
- `livemask-api`：对外 API + 后台管理
- `livemask-worker`：后台任务（UpdateAffiliateLoyaltyStats、ScheduledReportGenerator、ThreatHuntingScheduler 等）
- `livemask-notifier`：专门处理通知发送（可独立扩展）
- `livemask-website`：官网（Nginx + 静态文件或简单 Go 服务）
- `sing-box`：每个节点独立运行（可使用独立 compose 文件管理）

**注意**：客户端 App 的构建、混淆、签名、分发流程**完全独立**，详见《LiveMask_App客户端开发与加密安全规范_v3.6.md》。

## 2. CI/CD 流程（推荐 GitHub Actions）

### 2.1 流水线阶段
1. **Build**：编译 Go 二进制 + Docker 镜像构建
2. **Test**：单元测试 + 集成测试 + 安全扫描（Trivy / Snyk）
3. **Security Scan**：依赖漏洞扫描、代码静态分析
4. **Push Image**：推送到 Harbor / ECR / Docker Hub
5. **Deploy to Staging**：自动部署到 Staging 环境
6. **E2E Test**：自动化端到端测试（关键流程）
7. **Manual Approval**（生产）
8. **Deploy to Production**：Blue-Green 或 Canary 部署
9. **Post-deploy Verification**：健康检查 + 关键指标监控

### 2.2 推荐工具链
- **CI**：GitHub Actions / GitLab CI
- **CD**：ArgoCD（GitOps 推荐）或 Flux
- **镜像仓库**：Harbor（自建）或 AWS ECR
- **Secrets 管理**：Kubernetes Secrets + External Secrets Operator（推荐）或 Vault
- **监控**：Prometheus + Grafana + Alertmanager

## 3. 部署策略

### 3.1 Backend 服务
- **Rolling Update**（默认）
- **Blue-Green Deployment**：适合重大版本更新（零停机）
- **Canary Deployment**：新版本先放 5% → 20% → 100% 流量（推荐用于生产）

### 3.2 sing-box 节点
- 使用 Ansible / Terraform 管理节点配置
- 节点配置通过后端 API 下发（Reality 配置、带宽限制等）
- 支持节点优雅重启和配置热更新

## 4. 密钥与配置管理
- 所有敏感信息（数据库密码、Telegram Bot Token、JWT Secret 等）**严禁**硬编码
- 推荐使用：
  - Kubernetes External Secrets Operator + AWS Secrets Manager / Vault
  - 或 Doppler / Infisical（更简单）
- 配置中心使用 `system_configs` 表 + Redis 缓存

## 5. 监控与可观测性
- **Metrics**：Prometheus + Grafana
- **Logs**：Loki 或 ELK
- **Tracing**：OpenTelemetry + Jaeger / Tempo
- **关键告警**：已在《监控日志告警规范》定义

## 6. 备份与灾难恢复
- PostgreSQL：每日全量 + WAL 归档（PITR）
- Redis：定期 RDB + AOF
- sing-box 配置：版本控制 + 自动备份
- 灾难恢复 RTO < 1 小时，RPO < 15 分钟（生产目标）

---

**本方案已同步到系统设计和技术架构文档中。**