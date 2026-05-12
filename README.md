# LiveMask Documentation

> Central documentation, AI development rules, and multi-repository collaboration hub

---

## 🚀 Multi-Window Development with AI Editors (核心重点)

当你使用 **Cursor / Windsurf / VS Code + Copilot** 同时打开多个仓库进行开发时，请务必先阅读以下内容：

### 必读文档
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — 多仓库 + 多窗口开发完整操作指南（强烈建议首先阅读）
- **[MultiWindow_Development_Rules_Summary_v3.7.md](ai-rules/v3.7/MultiWindow_Development_Rules_Summary_v3.7.md)** — 多窗口开发核心规则汇总

### 核心原则（铁律）
- 所有变更必须关联同一个 `TASK-XXXX`
- 修改 Backend / Payment 时，必须主动分析对 NodeAgent 和 App 的影响
- 配置变更必须先在 `livemask-docs` 中记录影响范围
- 代码注释必须包含 `TASK-XXXX`
- 修改后必须检查其他仓库是否需要同步更新

---

## 按角色快速导航

| 角色 | 建议优先阅读 |
|--------|-------------------------|
| **Backend 开发者** | `docs/backend/`, `ai-rules/v3.7/04-Multi-Repo-Linkage.md` |
| **NodeAgent 开发者** | `docs/nodeagent/`, `ai-rules/v3.7/05-NodeAgent-Specific-Rules.md` |
| **App 开发者** | `docs/app/`, `ai-rules/v3.7/06-Client-App-Specific-Rules.md` |
| **使用 AI 辅助开发** | `ai-rules/v3.7/` 整个目录 + `DEVELOPMENT.md` |

---

## Core Rules

所有开发者和 AI 辅助必须遵守以下核心规则：

- [Multi-Repo Development Rules](ai-rules/v3.7/13-Multi-Repo-Development.md)
- [Code Comment Traceability](ai-rules/v3.7/14-Code-Comment-Traceability.md)
- [Multi-Window Consistency Checklist](ai-rules/v3.7/15-MultiWindow-Consistency-Checklist.md)

---

## Repository Structure

```
docs/
├── architecture/
├── development/
├── nodeagent/
├── app/
├── backend/
├── operations/
├── business/
├── payment/
├── monitoring/
├── retention/
├── security/
└── archive/
```

---

## Getting Started

```bash
git submodule add https://github.com/sammytan/livemask-docs.git docs
git submodule update --init --recursive
```

---

## Contribution

所有变更必须关联 `TASK-XXXX`。
跨仓库变更请先在 `livemask-docs` 中记录影响范围。