# LiveMask Documentation

> Central documentation, AI development rules, and multi-repository collaboration hub.

---

## Multi-Window Development with AI Editors

当你使用 **Cursor / Windsurf / VS Code + Copilot** 同时打开多个仓库进行开发时，请先阅读以下内容。

### 必读文档

- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - 多仓库 + 多窗口开发完整操作指南
- [ai-rules/v3.7/MultiWindow_Development_Rules_Summary_v3.7.md](ai-rules/v3.7/MultiWindow_Development_Rules_Summary_v3.7.md) - 多窗口开发核心规则汇总
- [LiveMask_系统设计文档_v3.6.md](LiveMask_系统设计文档_v3.6.md) - 当前架构基线
- [LiveMask_开发任务清单与里程碑_v3.6.md](LiveMask_开发任务清单与里程碑_v3.6.md) - TASK 与里程碑登记入口

### 核心原则

- 所有变更必须关联同一个 `TASK-XXXX`
- 修改 Backend / Payment / 核心服务时，必须主动分析对 NodeAgent 和 App 的影响
- 配置变更必须先在 `livemask-docs` 中记录影响范围
- API、配置、事件、错误码、状态机变化必须先更新 [docs/contracts/](docs/contracts/README.md)
- App Client → NodeAgent → API → Database / Redis 链路变化必须对照 [docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md](docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md)
- 非 MVP 模块进入开发前必须对照 [docs/architecture/future-chains/README.md](docs/architecture/future-chains/README.md)
- 跨仓库任务必须在 [docs/development/tasks/](docs/development/tasks/README.md) 建立独立任务单
- 跨角色任务必须按 [docs/development/ROLE_HANDOFF_CHAINS.md](docs/development/ROLE_HANDOFF_CHAINS.md) 记录交接证据、阻断条件和回流路径
- 关键代码注释必须包含 `TASK-XXXX`
- 修改后必须检查其他仓库是否需要同步更新
- 完成前必须执行闭环验证清单

---

## 按角色快速导航

| 角色 | 建议优先阅读 |
| --- | --- |
| Backend 开发者 | [docs/backend/README.md](docs/backend/README.md), [ai-rules/v3.7/04-Multi-Repo-Linkage.md](ai-rules/v3.7/04-Multi-Repo-Linkage.md) |
| NodeAgent 开发者 | [docs/nodeagent/README.md](docs/nodeagent/README.md), [ai-rules/v3.7/04-Multi-Repo-Linkage.md](ai-rules/v3.7/04-Multi-Repo-Linkage.md) |
| App 开发者 | [docs/app/README.md](docs/app/README.md), [ai-rules/v3.7/04-Multi-Repo-Linkage.md](ai-rules/v3.7/04-Multi-Repo-Linkage.md) |
| Database / Redis 开发者 | [docs/data/README.md](docs/data/README.md), [docs/contracts/data-consistency.md](docs/contracts/data-consistency.md) |
| Admin / Frontend 开发者 | [docs/admin/README.md](docs/admin/README.md), [docs/contracts/README.md](docs/contracts/README.md) |
| Payment 开发者 | [docs/payment/README.md](docs/payment/README.md), [docs/contracts/state-machines.md](docs/contracts/state-machines.md) |
| Ops / DevOps | [docs/operations/README.md](docs/operations/README.md), [docs/development/RISK_REGISTER.md](docs/development/RISK_REGISTER.md) |
| Monitoring / SRE | [docs/monitoring/README.md](docs/monitoring/README.md), [docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md](docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md) |
| QA | [docs/qa/README.md](docs/qa/README.md), [docs/development/DEFINITION_OF_DONE.md](docs/development/DEFINITION_OF_DONE.md) |
| Product | [docs/product/README.md](docs/product/README.md), [docs/development/tasks/README.md](docs/development/tasks/README.md) |
| Support / Business Ops | [docs/support/README.md](docs/support/README.md), [docs/product/README.md](docs/product/README.md) |
| 使用 AI 辅助开发 | [ai-rules/v3.7/](ai-rules/v3.7/), [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |

---

## Core Rules

所有开发者和 AI 辅助必须遵守以下核心规则：

- [00 - Core Principles](ai-rules/v3.7/00-Core-Principles.md)
- [02 - Closed-Loop Validation Checklist](ai-rules/v3.7/02-Closed-Loop-Validation.md)
- [04 - Multi-Repo Linkage](ai-rules/v3.7/04-Multi-Repo-Linkage.md)
- [13 - Multi-Repo Development](ai-rules/v3.7/13-Multi-Repo-Development.md)
- [14 - Code Comment Traceability](ai-rules/v3.7/14-Code-Comment-Traceability.md)
- [15 - MultiWindow Consistency Checklist](ai-rules/v3.7/15-MultiWindow-Consistency-Checklist.md)

---

## Repository Structure

```text
livemask-docs/
├── README.md
├── LiveMask_系统设计文档_v3.6.md
├── LiveMask_开发任务清单与里程碑_v3.6.md
├── ai-rules/
│   └── v3.7/
├── docs/
│   ├── DEVELOPMENT.md
│   ├── app/
│   ├── backend/
│   ├── development/
│   └── nodeagent/
└── templates/
```

---

## Getting Started

```bash
git submodule add git@github.com:sammytan/livemask-docs.git docs
git submodule update --init --recursive
```

如果当前项目不能使用 SSH，可改用 HTTPS：

```bash
git submodule add https://github.com/sammytan/livemask-docs.git docs
```

---

## Contribution

所有变更必须关联 `TASK-XXXX`。跨仓库变更请先在 `livemask-docs` 中记录影响范围，并在完成前更新闭环验证结果。

提交前建议执行：

```bash
bash scripts/check-docs.sh
```
