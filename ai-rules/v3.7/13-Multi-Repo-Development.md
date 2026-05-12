# LiveMask 多仓库 + 多窗口协同开发规范 v3.7（强化版）

> **核心目标**：当 AI 编辑器同时打开多个项目窗口时，仍然能保持架构一致性、规则一致性和变更可追溯性。

## 1. 铁律（必须严格遵守）

1. **livemask-docs 是唯一真相来源**（Single Source of Truth）
2. **所有代码变更必须关联同一个 TASK-XXXX**
3. **跨仓库变更必须同步检查**（App ↔ Backend ↔ NodeAgent）
4. **多窗口开发时，AI 必须主动加载跨仓库规则**
5. **禁止在不同窗口使用不一致的规则版本**

## 2. 多窗口开发推荐架构

### 推荐窗口布局
- **窗口 1（主窗口）**：`livemask-docs`（始终打开，作为参考）
- **窗口 2**：`livemask-backend`
- **窗口 3**：`livemask-nodeagent`
- **窗口 4**：`livemask-app`
- **窗口 5**：`livemask-admin`（按需）

### 每个窗口的 .cursorrules 必须包含
```markdown
@docs/ai-rules/v3.7/00-Core-Principles.md
@docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md
@docs/ai-rules/v3.7/13-Multi-Repo-Development.md
```

并根据当前仓库类型额外加载对应专业模块。

## 3. 跨仓库变更处理标准流程

当一个功能涉及多个仓库时，AI 必须执行以下流程：

1. 在 `livemask-docs` 中确认/创建 TASK-XXXX 描述
2. 先在主影响仓库开发
3. 开发完成后，主动检查其他受影响仓库是否需要同步修改
4. 在所有相关仓库的 commit message 中必须包含 `TASK-XXXX`
5. 在 PR 描述中说明对其他仓库的影响及已同步情况

## 4. AI 编辑器多窗口协同机制

- **Cursor**：通过每个仓库根目录的 `.cursorrules` 自动加载规则
- **GitHub Copilot**：通过 `.github/copilot-instructions.md` 加载
- **跨窗口通信**：AI 应在需要时主动建议用户在其他窗口打开对应仓库进行检查

## 5. 常见错误与禁止行为

- 在 backend 改了接口，没有检查 NodeAgent 配置是否需要更新
- 不同窗口的 AI 使用不同版本的规则
- 忽略 TASK-XXXX，导致变更无法追溯
- 只在自己窗口开发，不主动检查跨仓库影响

## 6. 紧急处理
发现跨仓库不一致时，立即停止开发，在 `livemask-docs` 创建 Issue，并关联 TASK-XXXX。