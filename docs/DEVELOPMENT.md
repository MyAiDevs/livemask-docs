# LiveMask 多仓库 + 多窗口 AI 开发操作手册（v3.7）

> **这是整个项目的核心协作指南**，所有使用 AI 编辑器同时开发多个仓库的开发者都必须阅读。

## 1. 核心原则

LiveMask 采用 **多仓库架构 + 中央文档仓库** 设计：

- `livemask-docs` 是 **唯一真相来源**（Single Source of Truth）。
- 所有子仓库通过 `git submodule` 引入 `livemask-docs`。
- **所有开发行为必须通过 `livemask-docs` 进行 traceable（可追溯）**。

## 2. AI 编辑器多窗口开发标准工作流

当你在 Cursor / Windsurf / VS Code 中同时打开多个仓库时，请严格遵循以下流程：

### 2.1 准备阶段（必须执行）

1. 打开 `livemask-docs` 仓库
2. 阅读最新 `DEVELOPMENT.md` 和 `ai-rules/v3.7/MultiWindow_Development_Rules_Summary_v3.7.md`
3. 确认当前正在处理的 `TASK-XXXX`（从任务清单中获取）
4. 打开需要开发的子仓库（例如 `livemask-backend`）
5. 确保该仓库根目录有正确的 `.cursorrules` 文件

### 2.2 开发阶段（强制要求）

- **每次对话开始时**，AI 必须先确认：
  - 当前处理的 TASK-XXXX
  - 当前所在的仓库
  - 是否涉及跨仓库变更

- **修改代码时必须在注释中标注**：
  ```go
  // TASK-BE-023: 新增用户风险评分接口
  // 影响范围：NodeAgent 配置下发 + App 客户端展示
  func CalculateRiskScore(...) {
  ```

- **任何跨仓库影响的变更，必须先在 `livemask-docs` 中记录**（在对应文档的「多窗口开发注意事项」章节补充说明）。

### 2.3 跨仓库变更标准流程

当你在某个仓库做变更时，AI 必须主动执行以下检查：

1. **影响分析**：这个变更会影响哪些其他仓库？
2. **通知机制**：是否需要更新其他仓库的文档或代码？
3. **测试验证**：是否需要在其他仓库进行联动测试？

**常见场景处理示例**：
- Backend 新增/修改接口 → 必须检查 NodeAgent 是否需要同步配置，App 是否需要更新调用
- NodeAgent 配置热更新逻辑变更 → 必须检查 Backend 的推荐引擎是否受影响
- 支付相关逻辑变更 → 必须检查 Admin 后台和运营文档是否需要同步更新

## 3. 多窗口开发铁律（必须遵守）

1. **TASK 一致性铁律**：所有相关变更必须使用同一个 TASK-XXXX
2. **影响分析铁律**：修改任何核心模块时，必须主动分析对其他端的影响
3. **文档先行铁律**：重要架构/接口变更，必须先在 `livemask-docs` 中更新文档，再修改代码
4. **注释可追溯铁律**：关键代码变更必须在注释中包含 TASK-XXXX
5. **配置变更铁律**：任何配置变更必须先在 `livemask-docs` 中记录影响范围

## 4. 推荐的 .cursorrules 配置

每个子仓库的 `.cursorrules` 至少应包含：

```markdown
@docs/ai-rules/v3.7/00-Core-Principles.md
@docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md
@docs/ai-rules/v3.7/13-Multi-Repo-Development.md
@docs/ai-rules/v3.7/14-Code-Comment-Traceability.md
@docs/ai-rules/v3.7/15-MultiWindow-Consistency-Checklist.md

# 根据仓库类型加载专用模块
```

## 5. 常见问题与处理

**Q: 同时打开多个窗口时，AI 行为不一致怎么办？**
A: 每个窗口只加载自己仓库的 `.cursorrules`，这是正常现象。关键是通过同一个 TASK 和 `livemask-docs` 来保持一致性。

**Q: 修改 Backend 后，AI 没有主动检查 NodeAgent 怎么办？**
A: 在 `.cursorrules` 中已经强制要求 AI 必须主动检查跨仓库影响。如果没有检查，属于违反规则。

---

**最后更新**：2026-05