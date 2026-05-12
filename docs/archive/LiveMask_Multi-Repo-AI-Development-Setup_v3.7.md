# LiveMask 多仓库 + AI 辅助开发工作流（v3.7 最终推荐版）

## 1. 核心原则

- **livemask-docs** 是唯一真相来源（Single Source of Truth）。
- 所有开发仓库通过 **git submodule** 引入 `livemask-docs`。
- 每个开发仓库的 AI 编辑器（Cursor / Copilot / Windsurf 等）必须能**自动或一键加载**对应领域的规则。
- 跨端变更必须 traceable（TASK-XXXX）并相互可见。

## 2. 推荐仓库结构

```
livemask-docs/                  ← 中央文档仓库（必须）
├── ai-rules/v3.7/              ← 模块化 AI 规则（12+ 个文件）
├── docs/                       ← 所有 LiveMask_*.md
└── templates/repositories/     ← 各仓库 README 模板

livemask-backend/
├── docs/                       ← git submodule → livemask-docs
├── .cursorrules
├── .github/copilot-instructions.md
├── scripts/sync-ai-rules.sh
└── ...

livemask-nodeagent/
livemask-app/
livemask-admin/
livemask-website/
livemask-infra/
```

## 3. 如何让 AI 编辑器自动找到规则

### 推荐方案（最稳健）

**步骤 1**：在每个开发仓库添加 docs 为 submodule

```bash
git submodule add https://github.com/your-org/livemask-docs.git docs
git submodule update --init --recursive
```

**步骤 2**：在每个开发仓库根目录放置以下文件（已生成模板）

- `.cursorrules`（Cursor 专用）
- `.github/copilot-instructions.md`（GitHub Copilot 专用）
- `scripts/sync-ai-rules.sh`（开发者一键同步最新规则）

**步骤 3**：AI 规则加载策略

在 `.cursorrules` 中写入：

```markdown
# LiveMask AI Rules Loader (Backend Repo)

@docs/ai-rules/v3.7/00-Core-Principles.md
@docs/ai-rules/v3.7/01-Architecture-Guard.md
@docs/ai-rules/v3.7/03-Traceability.md
@docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md
@docs/ai-rules/v3.7/08-Config-Hot-Update-Rules.md
@docs/ai-rules/v3.7/13-Multi-Repo-Development.md   # 新增

# 根据当前任务自动加载对应模块
# 如果任务涉及 NodeAgent，请额外加载 05-NodeAgent-Specific-Rules.md
```

Cursor 支持 `@file` 语法，可以自动加载多个规则文件。

### 不同端的规则加载建议

| 开发端       | 必须加载的规则模块                          | 额外推荐模块                  |
|--------------|---------------------------------------------|-------------------------------|
| Backend      | 00, 01, 03, 04, 08, 13                      | 07, 10, 11, 12                |
| NodeAgent    | 00, 01, 03, 04, 05, 07, 08, 13              | 09                            |
| App (Flutter)| 00, 01, 03, 04, 06, 13                      | 07, 09                        |
| Admin (React)| 00, 01, 03, 04, 13                          | 08, 09, 11                    |
| Website      | 00, 01, 03, 04, 13                          | -                             |
| CI/CD        | 00, 03, 04, 09, 13                          | 12                            |

## 4. 跨端兼容与同步开发机制

### 强制要求（已写入 AI 规则）

1. **所有 PR / Commit 必须包含 `TASK-XXXX`**（来自开发任务清单）。
2. **跨端影响变更**：
   - Backend 修改配置下发逻辑 → 必须在 PR 描述中 @ 相关 NodeAgent/App 开发者，并说明影响。
   - AI 在实现前必须先搜索 GitHub Issues / PRs 中相同 TASK-ID 的其他仓库变更。
3. **推荐工作流**：
   - 在 `livemask-docs` 创建 Epic Issue（关联多个 TASK）。
   - 各端在自己的仓库创建子 Issue，引用同一个 Epic。
   - 使用 GitHub Projects 统一跟踪。

### AI 规则新增模块（已创建）

新增 `13-Multi-Repo-Development.md`，核心内容：

- 实现跨端功能前，必须先阅读对方仓库的最新相关代码（通过 submodule）。
- 所有公共协议（配置格式、API response、错误码）必须先在 `livemask-docs` 中定义。
- 禁止在单个仓库内硬编码跨端逻辑。

## 5. 日常使用流程（开发者视角）

```bash
# 1. 首次克隆开发仓库
git clone ...
cd livemask-backend
git submodule update --init --recursive

# 2. 一键同步最新 AI 规则（推荐加入 Makefile）
make sync-rules
# 或
bash scripts/sync-ai-rules.sh

# 3. 开始开发
# Cursor / Windsurf 会自动加载 .cursorrules 中指定的规则文件

# 4. 提交时
git commit -m "feat: xxx (TASK-BE-042)"
```

---

**总结**：采用 **中央 livemask-docs + git submodule + 模块化 AI 规则 + TASK traceability** 的组合，是目前在多仓库场景下让 AI 开发最可控、最易同步的方式。

此文档已同步到 `livemask-docs` 仓库，并被所有仓库的 README 模板引用。