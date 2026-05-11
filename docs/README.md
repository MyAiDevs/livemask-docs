# LiveMask 项目文档索引 (v3.7)

> **Single Source of Truth**：本仓库为 LiveMask 项目的所有核心文档、架构设计、开发规范、运营手册的唯一真相来源。

## 目录结构

```
docs/
├── architecture/          # 整体架构与技术设计
├── development/           # 开发规范、任务清单、AI 规则
├── nodeagent/             # VPN 节点 Agent 相关
├── app/                   # 多平台客户端相关
├── backend/               # 后端服务相关
├── operations/            # 运营与值班
├── business/              # 商业模式与收益
├── payment/               # 支付系统
├── monitoring/            # 监控与可观测性
├── retention/             # 用户留存与预警
├── security/              # 安全与威胁情报
└── archive/               # 历史版本文档
```

## 核心阅读顺序（推荐）

1. [DEVELOPMENT.md](../DEVELOPMENT.md) — 多窗口 AI 开发工作流（必读）
2. [architecture/LiveMask_系统设计文档_v3.6.md](architecture/LiveMask_系统设计文档_v3.6.md)
3. [development/LiveMask_开发任务清单与里程碑_v3.6.md](development/LiveMask_开发任务清单与里程碑_v3.6.md)
4. [ai-rules/v3.7/00-Core-Principles.md](../ai-rules/v3.7/00-Core-Principles.md) — AI 开发铁律

## 各分类文档

### 架构类 (Architecture)
- [系统设计文档](architecture/LiveMask_系统设计文档_v3.6.md)
- [数据库详细设计](architecture/LiveMask_数据库详细设计_v3.6.md)
- [技术架构文档](architecture/LiveMask_技术架构文档_v3.6.md)

### 开发类 (Development)
- [开发任务清单与里程碑](development/LiveMask_开发任务清单与里程碑_v3.6.md)
- [文档索引与关联说明](development/LiveMask_文档索引与关联说明_v3.6.md)

### NodeAgent
- [NodeAgent 架构与开发规范](nodeagent/LiveMask_NodeAgent架构与开发规范_v3.6.md)

### App 客户端
- [App 客户端开发与加密安全规范](app/LiveMask_App客户端开发与加密安全规范_v3.6.md)

### Backend
- [Backend 架构设计](backend/LiveMask_Backend_Architecture_v3.6.md)

### 运营类
- [运营手册](operations/LiveMask_运营手册_v3.6.md)

### 商业与收益
- [收益模型优化建议](business/LiveMask_收益模型优化建议_v3.6.md)
- [积分 C2C 经济体系](business/LiveMask_Points_C2C_Economy_v3.6.md)

### 支付
- [支付系统设计](payment/LiveMask_Payment_System_Design_v3.6.md)

### 监控
- [监控与可观测性](monitoring/LiveMask_Monitoring_Observability_v3.6.md)

### 留存预警
- [留存预警与 Win-back 系统](retention/LiveMask_Retention_Winback_System_v3.6.md)

### 安全
- [威胁情报系统](security/LiveMask_Security_Threat_Intelligence_v3.6.md)

---

**维护规则**：
- 所有重要变更必须同步更新本索引
- 新增文档请放在对应分类目录下
- 历史版本放入 `archive/` 目录

最后更新：2026-05-12