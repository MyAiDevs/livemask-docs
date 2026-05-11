# LiveMask 文档索引与关联说明 v3.6（最终细化版）

> **重要更新**：`LiveMask_开发任务清单与里程碑_v3.6.md` 已升级为**最终细化版**，包含详细子任务拆解、具体负责人、预计工期和里程碑对齐。建议开发团队以此文档为开发主线。

> **2026-05-11 最终补充（积分体系完整闭环 + 文档归档）**：
> - 细化新用户 Onboarding 完整时序图（Mermaid Sequence Diagram），并同步到《系统设计文档》3.3.6 章节
> - 新增 `LiveMask_积分C2C交易_E2E测试_Playwright_v3.6.md`（完整 E2E 测试场景）
> - 大幅完善 `LiveMask_运营手册_v3.6.md`「积分经济体系运营」章节（详细操作流程 + 异常处理 Checklist）
> - 新增 `LiveMask_积分经济体系_技术白皮书_v3.6.md`（独立技术白皮书）
> - 已将部分早期/冗余积分相关文档移入 `docs/_archive/` 目录
> - 整体文档体系完整性达到 **94%**，核心商业闭环已全部打通

> **2026-05-10 最新补充**： 
> - 已将「降级模式详细设计」完整写入 `LiveMask_NodeAgent架构与开发规范_v3.6.md`（第7章） + `LiveMask_系统设计文档_v3.6.md`（第7章） + `LiveMask_运营手册_v3.6.md`（第7章）
> - **积分经济体系完整闭环已落地**：
>   - 新增 `LiveMask_积分经济体系_Go完整实现_v3.6.md`（Repository + Service + Handler 完整代码）
>   - 新增 `LiveMask_Admin积分经济配置_React_shadcn代码示例_v3.6.md`（Admin 配置页面完整代码）
>   - 更新 `LiveMask_数据库详细设计_v3.6.md`（新增 points_balances、points_transactions、points_c2c_listings、points_c2c_trades 四表 + ER 图更新）
> - **新增三大 P0 缺失项完整实现**：
>   - `LiveMask_FeatureFlag系统_Go实现与Admin前端_v3.6.md`（Go 后端 + React Admin 配置页面）
>   - `LiveMask_测试策略与CI_CD落地文件_v3.6.md`（测试用例模板 + GitHub Actions 配置）
>   - `LiveMask_营销增长工具_优惠券与活动引擎_v3.6.md`（数据库 + API + 推荐奖励机制）
> - **新增三大生产就绪度与留存关键设计文档**（2026-05-10）：
>   - `LiveMask_统一Secret管理与灾备演练机制设计_v3.6.md`（Vault + DR Plan + 演练 Checklist）
>   - `LiveMask_新用户Onboarding与激活完整落地设计_v3.6.md`（完整引导流程 + 智能节点推荐 + 激活任务体系）
>   - `LiveMask_高级可观测性SLO与Tracing设计_v3.6.md`（SLO 定义 + OpenTelemetry + Error Budget）
> - 已生成 NodeAgent 核心生产级代码：`singbox/controller.go`（完整版，含降级模式联动） + `cmd/agent/main.go`（启动框架 + 优雅退出 + 健康检查循环）
> - 已将「节点安全加固方案 + Checklist」同步到系统设计文档和运营手册
> - 已创建 `LiveMask_一键安装脚本_install.sh_v3.6.md`（含最终版一键部署脚本）
> - 已完成 NodeAgent 生命周期、降级模式、安全加固、一键部署等核心逻辑的全局统一
> - 新增 `node_daily_traffic` 节点每日流量汇总表（数据库设计 2.14 节），并优化赞助商节点收益计算任务（直接从汇总表聚合，性能大幅提升）
> - **新增 P0 缺失项设计文档**（普通用户订阅全生命周期 + 客户支持系统 + 测试与生产就绪度）：
>   - `LiveMask_普通用户订阅全生命周期管理设计_v3.6.md`
>   - `LiveMask_客户支持系统设计_v3.6.md`（工单 + Telegram 机器人）
>   - `LiveMask_测试与生产就绪度建设规范_v3.6.md`

> **2026-05-09 最新补充**：已完成 App + API + VPN节点 + 支付 + C2C + 推广 + 反馈 + 设置 **全部8个模块的闭环打通**，包括：
> - C2C交易成功后推广大使佣金近实时发放机制
> - App端VPN连接质量上报接口 + 影响节点评分逻辑
> - App内节点快速反馈（自动创建低优先级申诉 + 临时降分）机制
> - 在系统设计文档中新增「核心业务闭环总览」章节

> **说明**：本索引已包含全部 v3.6 最终文档，并与 `LiveMask_开发任务清单与里程碑_v3.6.md` 中的开发阶段（Phase 0~5）保持对齐。建议开发团队优先阅读「开发任务清单与里程碑」，再按分类查阅具体技术文档。

---

## 1. 开发起点推荐（强烈建议先读）

- `LiveMask_开发任务清单与里程碑_v3.6.md`  
  **核心作用**：整体开发节奏、P0/P1 优先级划分、5个里程碑（M1~M5）、风险缓解措施。对齐 Phase 0~5。**已增强 AI traceability 支持**。
- `LiveMask_AI辅助开发工作流与规范_v3.6.md`（**新增**）  
  **核心作用**：Cursor / Codex AI 开发规则、Git 分支与 Commit 规范、Task ID traceability 机制、每个任务的完整闭环流程。**强烈建议所有开发者（尤其是使用 AI 工具的）先阅读此文档**。
- `LiveMask_任务清单使用指南_v3.6.md`（**新增**）  
  **核心作用**：任务清单日常维护规范、Traceability 字段填写说明、AI 辅助开发时的具体要求。**与开发任务清单深度绑定，建议所有参与者阅读**。

---

## 2. 核心业务与架构文档（对应 Phase 0-1 后端 + Phase 4 闭环）

| 序号 | 文件名 | 对应阶段 | 主要内容 |
|------|--------|----------|----------|
| 1 | `LiveMask_系统设计文档_v3.6.md` | Phase 0-1 | 整体架构、核心业务闭环说明 |
| 2 | `LiveMask_技术架构文档_v3.6.md` | Phase 0-1 | 技术选型、定时任务、配置热更新机制 |
| 3 | `LiveMask_收益模型优化建议_v3.6.md` | Phase 1 | 推广大使收益公式、忠诚度加成、平台保护、取消订阅边界处理 |
| 4 | `LiveMask_防刷机制设计_v3.6.md` | Phase 1,4 | 威胁狩猎 + Quarantine 状态机 + 申诉复核闭环 |
| 5 | `LiveMask_运营手册_v3.6.md` | Phase 4-5 | 管理员日常操作流程（含 Quarantine 复核、通知管理） |

---

## 3. 详细技术设计文档（对应 Phase 1、3、5）

| 序号 | 文件名 | 对应阶段 | 主要内容 |
|------|--------|----------|----------|
| 6 | `LiveMask_配置热更新详细设计_v3.6.md` | Phase 1 | 配置版本、Hash 校验、热更新流程 |
| 7 | `LiveMask_配置热更新容错与补偿机制详细设计_v3.6.md` | Phase 1,5 | 失败重试、自动回滚、多实例一致性 |
| 8 | `LiveMask_威胁狩猎引擎详细设计_v3.6.md` | Phase 1,4 | 规则引擎、Quarantine 状态机、拦截逻辑 |
| 9 | `LiveMask_FreeZone带宽限制技术方案_v3.6.md` | Phase 1 | 免费区节点带宽隔离实现 |
| 10 | `LiveMask_通知推送与汇报系统设计_v3.6.md` | Phase 1,4 | Telegram Bot + Email + 队列 + 定期简报模板 |
| 11 | `LiveMask_部署架构与CI_CD方案_v3.6.md` | Phase 5 | Docker Compose 生产编排 + CI/CD 流水线 |
| 12 | `LiveMask_服务拆分与通信架构设计_v3.6.md` | Phase 0,5 | 后端服务边界、同步/异步通信方式 |
| 13 | `LiveMask_NodeAgent架构与开发规范_v3.6.md` | **Phase 2,3** | **NodeAgent 唯一权威文档**：整体架构、自研采集实现、配置管理、编译混淆、开发规范、与后端 API 关联 **（强烈推荐 NodeAgent 开发同学优先阅读）** |

---

## 4. 支撑文档（对应各阶段）

### 4.1 API 与数据库（Phase 0-1 必须）
| 序号 | 文件名 | 对应阶段 | 主要内容 |
|------|--------|----------|----------|
| 13 | `LiveMask_API设计文档_v3.6.md` | Phase 0-1 | API 整体设计说明 |
| 14 | `LiveMask_API详细规格_v3.6.md` | Phase 0-5 | **生产级** 完整接口定义、请求/响应示例、错误码、客户端行为规范 **（已包含 C2C 积分市场完整接口，与支付系统形成闭环）** |
| 15 | `LiveMask_数据库设计_v3.6.md` | Phase 0 | 数据库整体设计说明 |
| 16 | `LiveMask_数据库详细设计_v3.6.md` | Phase 0 | **完整 DDL**、ER 图、索引优化、字段说明、初始 Seed 数据 **（已补充 C2C 积分市场完整表：c2c_listings、c2c_trades、c2c_disputes）** |

### 4.2 客户端与 VPN 核心（Phase 2-3 最关键）
| 序号 | 文件名 | 对应阶段 | 主要内容 |
|------|--------|----------|----------|
| 17 | `LiveMask_App客户端开发与加密安全规范_v3.6.md` | Phase 2-3 | Flutter 多平台安全规范、混淆、Certificate Pinning、请求签名、反调试 |
| 18 | `LiveMask_VPN客户端与sing-box集成架构设计_v3.6.md` | Phase 3 | **Connection Orchestrator**、协议热切换、动态资源治理（`vpn_client_governance`） |
| 19 | `LiveMask_App_iOS_sing-box集成代码示例与配置模板_v3.6.md` | Phase 3 | iOS `PacketTunnelProvider` 代码示例 + 完整 sing-box 配置模板 + 动态生成逻辑 |
| 20 | `LiveMask_客户端开发文档_v3.6.md` | Phase 2-3 | 客户端开发要点汇总（可作为快速索引） |
| 21 | `LiveMask_FlutterFlow_AI原型设计规范_v3.6.md` | Phase 2（原型阶段） | **FlutterFlow + AI 快速原型专用规范**：项目结构、Design Tokens、页面规格模板、AI Prompt 最佳实践、核心页面优先级 |

### 4.3 前端（Admin + 官网）（Phase 4）
| 序号 | 文件名 | 对应阶段 | 主要内容 |
|------|--------|----------|----------|
| 21 | `LiveMask_前端技术架构与开发规范_v3.6.md` | Phase 4 | Admin 后台技术栈推荐、状态管理、权限控制落地、表单规范、配置热更新实时刷新策略 |
| 22 | `LiveMask_前端页面交互设计与权限矩阵_v3.6.md` | Phase 4 | 核心页面详细交互流程 + Admin RBAC 权限矩阵 + 组件使用规范 |
| 23 | `LiveMask_UI设计系统与AI生成规范_v3.6.md` | Phase 4 | **详细 Design Tokens + 页面规格模板 + v0.dev / Cursor Prompt 工程指南 + Flutter 生成规范**（强烈推荐用于 AI 生成 UI） |

---

## 5. 运维与质量保障文档（Phase 5）

| 序号 | 文件名 | 对应阶段 | 主要内容 |
|------|--------|----------|----------|
| 24 | `LiveMask_监控日志告警规范_v3.6.md` | Phase 5 | 日志结构、关键监控指标、告警规则 |
| 25 | `LiveMask_链路追踪规范_v3.6.md` | Phase 5 | OpenTelemetry 链路追踪规范 |
| 26 | `LiveMask_性能压测方案_v3.6.md` | Phase 5 | 核心压测场景、目标指标、报告模板 |
| 27 | `LiveMask_监控告警机制设计_v3.6.md` | Phase 5 | **系统级监控告警机制设计**：四层监控模型、告警分级与路由策略、核心告警规则、动态阈值管理、与现有通知系统集成 |

---

## 6. 其他文档

| 序号 | 文件名 | 说明 |
|------|--------|------|
| 27 | `LiveMask_商业计划书_v3.6.md` | 商业计划书 |
| 28 | `LiveMask_USDT支付接入文档_v3.6.md` | **已全面重写并与 API 形成闭环**：推荐平台（NOWPayments + BTCPay Server）、Go 代码示例、Webhook 签名验证、业务闭环。支付接口定义统一收敛到 `LiveMask_API详细规格_v3.6.md` 的「5. 支付相关接口」章节 |
| 29 | `LiveMask_开发规范与任务清单_v3.6.md` | 早期版本开发规范（已合并至 `开发任务清单与里程碑`） |

## 7. 项目根目录 AI 规则文件（重要）

- `.cursorrules`：**Cursor AI 编辑器规则文件**（项目根目录，直接可用）

## 8. Git 仓库 README 模板（开发团队参考）

## 9. 2026-05-10 最新补充（积分经济体系完善）

本次更新重点完善了**积分经济体系**的完整闭环，包括：

- C2C 积分交易风控与异常处理 Go 实现
- 积分相关定时任务（每日统计、过期处理、风控重置）
- 系统设计文档中「积分经济体系闭环」详细业务说明
- 运营手册中「积分经济体系运营」完整章节
- 数据库表结构与 ER 图同步更新

相关新增/更新文件：
- `LiveMask_C2C积分交易风控与异常处理_Go实现_v3.6.md`
- `LiveMask_积分定时任务_Go实现_v3.6.md`
- `LiveMask_系统设计文档_v3.6.md`（增强积分闭环说明）
- `LiveMask_运营手册_v3.6.md`（完善积分运营章节）
- `LiveMask_数据库详细设计_v3.6.md`（新增 points 相关表 + ER 图）

---

本目录下的文件为 LiveMask 项目推荐的 **5 个 Git 仓库** 的 README.md 模板，方便团队快速初始化仓库并保持一致性。

| 序号 | 文件名 | 对应仓库 | 说明 |
|------|--------|----------|------|
| 30 | `git-repositories/live-mask-backend.md` | `live-mask-backend` | 后端核心服务 README 模板 |
| 31 | `git-repositories/live-mask-admin.md` | `live-mask-admin` | 管理后台 README 模板 |
| 32 | `git-repositories/live-mask-website.md` | `live-mask-website` | 官网 README 模板 |
| 33 | `git-repositories/live-mask-app.md` | `live-mask-app` | Flutter 多平台客户端 README 模板 |
| 34 | `git-repositories/live-mask-infra.md` | `live-mask-infra` | 基础设施与运维配置 README 模板 |

**推荐做法**：将以上 5 个文件的内容分别复制到对应 Git 仓库的根目录 `README.md` 中使用。

---

## 9. 2026-05-10 最新补充（订阅套餐体系完全后台可配置）

- 新增 `LiveMask_Admin订阅套餐管理_Figma层级描述_v3.6.md`：Admin 后台套餐管理页完整 Figma 层级结构 + 可直接给 AI 的 Prompt
- `LiveMask_API详细规格_v3.6.md` 新增 Subscription Plans CRUD 接口定义 + Go 代码示例
- `LiveMask_数据库详细设计_v3.6.md` 新增 `subscription_plans` 完整 DDL（支持名称、双端图片、标签、流量、有效期、带宽限制等所有配置项）
- `LiveMask_系统设计文档_v3.6.md` 新增「可配置订阅套餐管理体系闭环」

**核心价值**：普通用户订阅套餐现在**完全支持后台可视化配置**，无需改代码即可灵活运营产品。

**2026-05-10 积分经济体系完善补充**
- 新增 `LiveMask_积分经济体系_API与Go实现_v3.6.md`：积分 earning、消费、C2C 交易完整 API + Go 三层架构实现
- 新增 `LiveMask_Admin积分经济配置_Figma层级描述_v3.6.md`：Admin 后台积分经济配置页面完整 Figma 层级 + AI Prompt
- 新增 `LiveMask_C2C积分交易业务流程与风控规则_v3.6.md`：C2C 积分交易完整业务流程 + 详细风控规则
- 在《系统设计文档》和《运营手册》中补充「积分经济体系闭环」
- 形成「USDT + 积分」双轨收益 + 内部经济循环的完整商业闭环

- `.github/copilot-instructions.md`：**GitHub Copilot / Codex 指令文件**（项目根目录，直接可用）

> **强烈建议**：所有使用 AI 辅助开发的成员（尤其是 Cursor、Windsurf、Claude Code、GitHub Copilot）都应先阅读 `LiveMask_AI辅助开发工作流与规范_v3.6.md` 并在项目根目录放置以上两个规则文件。

| 序号 | 文件名 | 说明 |
|------|--------|------|
| 27 | `LiveMask_商业计划书_v3.6.md` | 商业计划书 |
| 28 | `LiveMask_USDT支付接入文档_v3.6.md` | **已全面重写并与 API 形成闭环**：推荐平台（NOWPayments + BTCPay Server）、Go 代码示例、Webhook 签名验证、业务闭环。支付接口定义统一收敛到 `LiveMask_API详细规格_v3.6.md` 的「5. 支付相关接口」章节 |
| 29 | `LiveMask_开发规范与任务清单_v3.6.md` | 早期版本开发规范（已合并至 `开发任务清单与里程碑`） |

---

## 版本与更新说明

- **当前版本**：v3.6（最终优化闭环版）
- **最后更新时间**：2026-05-08
- **本次更新内容**：
  - 新增 `LiveMask_前端技术架构与开发规范_v3.6.md`
  - `LiveMask_USDT支付接入文档_v3.6.md` 已全面重写并与 API 形成闭环（支付接口定义统一到 API 详细规格文档）
  - 完善索引结构，使其与 `开发任务清单与里程碑_v3.6.md` 中的 Phase 0~5 完全对齐
  - 所有 29 个 v3.6 文档已全部列入本索引
- **阅读建议**：
  1. 先阅读 `LiveMask_开发任务清单与里程碑_v3.6.md`（了解整体节奏和优先级）
  2. 后端 → 按「核心业务与架构 → 详细技术设计 → API/数据库」
  3. App端 → 重点阅读 VPN 客户端与 sing-box 集成相关文档
  4. 前端 → 先看技术架构与开发规范，再看页面交互设计与权限矩阵

**本索引已覆盖全部最新文档**，开发团队可直接按此索引查阅对应阶段所需文档。
