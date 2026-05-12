# LiveMask 多仓库开发指南（Multi-Repository Development）

> 本文档是 LiveMask 项目使用 **AI 编辑器（Cursor / Windsurf / VS Code + Copilot）同时打开多个仓库** 进行开发时的核心操作手册。

## 1. 多窗口开发核心原则（铁律）

1. **所有变更必须关联同一个 `TASK-XXXX`**  
   代码注释、提交信息、PR 描述中都必须包含 `TASK-XXXX`。

2. **修改 Backend / Payment / 核心服务时，必须主动分析对 NodeAgent 和 App 的影响**  
   不能只改一端就提交。

3. **配置变更必须先在 `livemask-docs` 中记录影响范围**  
   尤其是配置热更新、FeatureFlag、支付风控规则等。

4. **代码注释必须清晰且包含 TASK-XXXX**  
   关键函数、重要逻辑块、接口变更处都要写。

5. **跨仓库变更必须先做影响分析**  
   使用下方提供的 Checklist。

## 2. 日常多窗口开发工作流

### 准备阶段
- 同时打开 `livemask-docs` + `livemask-backend` + `livemask-nodeagent` + `livemask-app` 等相关仓库
- 确保每个仓库都加载了对应的 `.cursorrules`（推荐使用 `templates/repositories/` 下的模板）
- 在对话开始时明确当前处理的 `TASK-XXXX`

### 开发阶段
1. 在对应仓库中进行修改
2. **修改前**：使用下方 Checklist 进行影响分析
3. **修改后**：更新代码注释（必须包含 TASK-XXXX）
4. 如涉及架构或配置变更，同步更新 `livemask-docs` 中的对应文档
5. 提交时 Commit Message 必须包含 `TASK-XXXX`

## 3. 变更影响分析 Checklist（可直接复制使用）

在进行任何可能影响多个仓库的变更前，请检查以下项目：

- [ ] 已确认当前 `TASK-XXXX`
- [ ] 已分析本次变更会影响哪些仓库（Backend / NodeAgent / App / Payment 等）
- [ ] 是否需要同步更新 `livemask-docs` 中的架构或设计文档？
- [ ] 配置变更是否需要在 `livemask-docs` 中记录影响范围？
- [ ] 代码注释中是否已包含 `TASK-XXXX`？
- [ ] 是否需要在 PR 描述中说明跨仓库影响？

## 4. 常见场景处理示例

### 场景一：Backend 接口变更
- 必须在 `backend/` 相关文档中记录变更
- 通知 NodeAgent 端是否需要同步调整
- App 端是否需要更新调用方式
- 在代码注释中写明影响范围 + TASK-XXXX

### 场景二：配置热更新
- 必须先在 `livemask-docs` 中记录本次配置变更的影响范围
- NodeAgent 端是否需要重启或重新加载配置
- 是否影响 Degraded Mode 行为

### 场景三：支付相关变更
- 必须评估对支付回调、风控规则的影响
- 是否需要同步更新 NodeAgent 的支付相关逻辑
- App 端支付流程是否需要调整

## 5. 不同角色开发 Checklist

**Backend 开发者**：
- 修改接口/服务前必须检查对 NodeAgent 和 App 的影响
- 配置变更必须更新 `livemask-docs`

**NodeAgent 开发者**：
- 配置热更新、Degraded Mode 变更必须同步确认 Backend 侧影响
- 与 Backend 的配置同步机制是否需要调整

**App 开发者**：
- 后端接口变更后及时同步更新调用逻辑
- Onboarding、连接质量上报等流程变更需评估影响

## 6. 代码可追溯性要求

所有代码变更（尤其是关键逻辑）必须满足：
- 函数/类上方写清楚用途 + `TASK-XXXX`
- 重要判断逻辑添加注释说明
- Commit Message 格式建议：`feat(backend): xxx (TASK-BE-023)`
