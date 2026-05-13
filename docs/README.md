# LiveMask 项目文档库（v3.7 完整版）

> **重要**：多仓库 + 多窗口 AI 开发请优先阅读 [DEVELOPMENT.md](./DEVELOPMENT.md)

本目录包含 LiveMask 项目所有核心详细文档，已按功能模块分类整理。

## 目录结构

- **architecture/** — 系统架构、数据库设计、技术架构
- **contracts/** — API、配置、事件、错误码、状态机契约
- **development/** — 开发规范、任务清单、测试策略、AI开发规则
- **nodeagent/** — NodeAgent 架构、代码示例、一键安装脚本
- **app/** — 多平台客户端开发与安全规范
- **backend/** — 后端架构、FeatureFlag、C2C 积分实现
- **operations/** — 运营手册、SOP、SEO、客户支持
- **business/** — 收益模型、推广大使、营销工具
- **payment/** — 支付系统设计与接入
- **monitoring/** — 监控、可观测性、WebSocket、流量统计
- **retention/** — 留存预警与 Onboarding 系统
- **security/** — 威胁情报、Secret 管理
- **admin/** — 管理后台 Figma 描述与 React 代码示例
- **qa/** — 测试策略、验收证据、发布质量门禁
- **product/** — 需求范围、验收标准、灰度与复盘
- **archive/** — 历史/辅助文档

## 多仓库开发特别说明

当使用 AI 编辑器同时打开多个项目时，请务必阅读：

→ [DEVELOPMENT.md](./DEVELOPMENT.md)（多仓库 + 多窗口开发核心指南）

该文档详细说明了：
- 每个窗口如何正确加载规则
- 跨仓库变更的处理流程
- TASK-XXXX traceability 要求
- 推荐的日常开发协作方式

## 使用建议

1. 优先阅读 `architecture/` 和 `development/` 目录。
2. NodeAgent、App、Backend 开发者请重点阅读对应目录。
3. 跨仓库字段、配置、事件或错误码变化，请先更新 `contracts/`。
4. 每个跨仓库任务请在 `development/tasks/` 创建独立任务单。
5. 不同角色请先阅读对应目录 README，并对照 `development/ROLE_CLOSURE_AUDIT.md`。
6. 若发现 TODO、占位实现或未完成项，请先登记到 `development/LiveMask_TODO闭环登记表_v3.7.md`。
7. 所有文档已按 v3.7 最终结构整理。

最后更新：2026年
