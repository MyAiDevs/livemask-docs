# LiveMask 多仓库 + 多窗口 AI 开发指南（v3.7）

## 1. 核心原则

LiveMask 采用**多仓库架构** + **中央文档仓库**的设计：

- `livemask-docs`：唯一真相来源（Single Source of Truth），包含所有 AI 开发规则、任务清单、架构文档。
- 其他仓库（`livemask-backend`、`livemask-nodeagent`、`livemask-app`、`livemask-admin`、`livemask-ci-cd` 等）通过 **git submodule** 引入 `livemask-docs`。

## 2. AI 编辑器同时打开多个项目的正确做法

当你在 Cursor / Windsurf / VS Code 中同时打开多个仓库窗口时，请遵循以下规则：

### 2.1 每个窗口必须加载对应仓库的规则

- 每个子仓库根目录都应该有 `.cursorrules` 文件。
- 该文件会自动引用 `docs/ai-rules/v3.7/` 中的模块化规则。
- 不同仓库加载的规则模块应该不同（例如 NodeAgent 仓库要加载 NodeAgent 专用规则）。

### 2.2 所有变更必须关联 TASK-XXXX

- 无论在哪个仓库修改代码或文档，**必须在 commit message 和 PR 描述中关联同一个 TASK-XXXX**。
- 示例：`feat(backend): 添加用户风险评分接口 (TASK-LR-02)`

### 2.3 跨仓库变更的处理流程

当你在某个仓库做变更时，AI 必须主动检查是否影响其他仓库：

1. 修改 Backend 接口 → 检查是否需要同步更新 NodeAgent 配置和 App 客户端。
2. 修改 NodeAgent 配置下发逻辑 → 检查是否需要同步更新 Backend 的推荐引擎。
3. 修改支付相关逻辑 → 检查是否需要同步更新 Admin 后台和运营文档。

### 2.4 推荐的日常开发流程

1. 打开 `livemask-docs` 仓库，阅读最新 `DEVELOPMENT.md` 和相关规则。
2. 打开需要开发的子仓库（例如 `livemask-backend`）。
3. Cursor 会自动加载该仓库的 `.cursorrules`。
4. 开始开发前，先让 AI 读取当前 `TASK-XXXX` 的完整描述。
5. 开发过程中，AI 必须主动提出“这个变更是否需要同步其他仓库？”

## 3. 推荐的 .cursorrules 配置

每个子仓库的 `.cursorrules` 应该至少包含以下内容：

```markdown
# LiveMask [仓库名] Rules

@docs/ai-rules/v3.7/00-Core-Principles.md
@docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md
@docs/ai-rules/v3.7/13-Multi-Repo-Development.md

# 根据仓库类型加载专用模块
# Backend 仓库额外加载：
@docs/ai-rules/v3.7/07-Security-Secrets-Vault.md
@docs/ai-rules/v3.7/08-Config-Hot-Update-Rules.md
@docs/ai-rules/v3.7/10-Payment-Integration-Rules.md

# NodeAgent 仓库额外加载：
@docs/ai-rules/v3.7/05-NodeAgent-Specific-Rules.md
```

## 4. 常见问题

**Q: 同时打开多个窗口时，AI 规则冲突怎么办？**
A: 每个窗口只加载自己仓库的 `.cursorrules`，不会冲突。

**Q: 跨仓库修改怎么保证一致性？**
A: 所有变更必须走同一个 TASK，通过 `livemask-docs` 里的任务清单追踪。

---

最后更新：2026-05