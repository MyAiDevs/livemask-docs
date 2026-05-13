# LiveMask 多仓库 + 多窗口协同开发规范 v3.7

> 核心目标：当 AI 编辑器同时打开多个项目窗口时，仍然保持架构一致性、规则一致性和变更可追溯性。

## 1. 铁律

1. `livemask-docs` 是唯一真相来源。
2. 所有代码变更必须关联同一个 `TASK-XXXX`。
3. 跨仓库变更必须同步检查 App、Backend、NodeAgent、Database 和 Payment。
4. 多窗口开发时，AI 必须主动加载跨仓库规则。
5. 禁止在不同窗口使用不一致的规则版本。

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
2. 在主影响仓库开发。
3. 开发后检查其他受影响仓库是否需要同步修改。
4. 在所有相关仓库的 commit message 中包含 `TASK-XXXX`。
5. 在 PR 描述中说明影响范围、验证结果、回滚策略和未完成项。

## 4. 紧急处理

发现跨仓库不一致时：

1. 停止继续扩大变更。
2. 在 `livemask-docs` 中登记问题和对应 `TASK-XXXX`。
3. 标记受影响仓库、影响范围、回滚路径。
4. 完成修复后更新验证结果。
