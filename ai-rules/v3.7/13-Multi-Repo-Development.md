# LiveMask 多仓库 + 多窗口协同开发规范 v3.7

> 核心目标：当 AI 编辑器同时打开多个项目窗口时，仍然保持架构一致性、规则一致性和变更可追溯性。

## 1. 铁律

1. `livemask-docs` 是唯一真相来源。
2. 所有代码变更必须关联同一个 `TASK-XXXX`。
3. 跨仓库变更必须同步检查 App、Backend、NodeAgent、Database 和 Payment。
4. 多窗口开发时，AI 必须主动加载跨仓库规则。
5. 禁止在不同窗口使用不一致的规则版本。
6. 所有日常开发必须基于 `dev` 分支；禁止直接在 `main` 上开发。
7. `main` 只代表远程预发布；生产只能由 GitHub Release / `v*` tag 触发。

## 2. 推荐窗口布局

- 窗口 1：`livemask-docs`
- 窗口 2：`livemask-backend`
- 窗口 3：`livemask-nodeagent`
- 窗口 4：`livemask-app`
- 窗口 5：`livemask-admin`（按需）

每个窗口的规则入口至少包含：

```markdown
@docs/ai-rules/v3.7/00-Core-Principles.md
@docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md
@docs/ai-rules/v3.7/13-Multi-Repo-Development.md
```

## 3. 标准流程

1. 在 `livemask-docs` 中确认或创建 `TASK-XXXX`。
2. 在每个相关仓库执行 `git fetch origin main dev`，然后切换到 `dev`。
3. 如果本地没有 `dev`，从 `origin/dev` 创建；如果远端也没有，再从 `origin/main` 创建并推送。
4. 在主影响仓库开发。
5. 开发后检查其他受影响仓库是否需要同步修改。
6. 在所有相关仓库的 commit message 中包含 `TASK-XXXX`。
7. 在 PR 描述中说明影响范围、验证结果、回滚策略和未完成项。
8. 只有 `dev` 合并到 `main` 才能触发远程预发布 CI/CD；只有 release 才能触发生产 CI/CD。

## 4. 分支与环境映射

| 分支 / ref | 环境含义 | 允许动作 |
| --- | --- | --- |
| `dev` | 本地 Go 测试、本地 Docker、开发集成 | AI 开发、单元测试、集成测试、跨仓库 task sync |
| `main` | 远程预发布 staging | 接收 `dev` 合并、触发 `livemask-ci-cd` staging smoke |
| `v*` release | 生产发布 | 手动发布版本、触发 production gate |

`task-unlocked` 只表示其它仓库窗口可以开始或继续开发，不表示 staging
部署，也不表示 production 发布。

## 5. 紧急处理

发现跨仓库不一致时：

1. 停止继续扩大变更。
2. 在 `livemask-docs` 中登记问题和对应 `TASK-XXXX`。
3. 标记受影响仓库、影响范围、回滚路径。
4. 完成修复后更新验证结果。
