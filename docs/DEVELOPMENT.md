# LiveMask 多仓库开发指南（Multi-Repository Development）

> 本文档是 LiveMask 项目使用 AI 编辑器同时打开多个仓库进行开发时的核心操作手册。

任何 AI 开发工具第一次进入项目，必须先阅读
[AI Project Status Onboarding](development/AI_PROJECT_STATUS_ONBOARDING.md)。

## 1. 多窗口开发核心原则

1. 所有变更必须关联同一个 `TASK-XXXX`。
2. 修改 Backend / Payment / 核心服务时，必须主动分析对 NodeAgent 和 App 的影响。
3. 配置变更必须先在 `livemask-docs` 中记录影响范围。
4. 关键代码注释必须清晰且包含 `TASK-XXXX`。
5. 跨仓库变更必须先做影响分析，再做实现。
6. 完成前必须执行闭环验证，不能只完成单仓库改动。
7. 完成报告只是状态事件，不是 GitHub Issue 关闭信号。
8. 多窗口必须遵守 task lease：一个窗口同一时间只能拥有一个 active task，开始第二个任务前必须结束第一个任务的报告、提交和 task-sync。
9. 每个 task 通过测试后必须合并到 `dev` 并推送 `origin/dev`；只停留在
   `task/*` 或其它功能分支不能报告为完成。
10. CI/CD smoke / staging validation 必须从 `dev` 运行。task 分支 smoke 只能作为预检，
    不能作为最终验收证据。
11. task 分支合并到 `dev` 必须通过 `livemask-ci-cd/scripts/dev-merge-guard.sh`。
    禁止手写批量合并循环。
12. 运行时代码仓库不得直接修改 `../livemask-docs` 或自行运行 task-sync；它们只输出
    完成证据，由 `livemask-docs` 窗口统一更新任务台账。
13. 用户只用普通文本描述需求或 bug 时，必须先执行 TASK intake，不能直接改代码。
14. `livemask-docs` 窗口收到 Cursor / Codex / 人工完成报告后，必须作为任务调度中枢处理：
    读取任务事实源、审核完成证据、同步 GitHub Issue、总结已完成/未完成模块、
    主动创建或分配下一批 Cursor 任务，并更新任务文档。
15. 如果任务清单暂时没有下一步，但项目尚未完成落地，`livemask-docs` 窗口必须扫描项目
    文档、contracts、handoff、QA/runbook 和相关任务状态，识别缺口并创建新的 `TASK-*.md`。

详细规则见 [Issue, Task Sync, And Multi-Window Governance](development/ISSUE_TASK_SYNC_GOVERNANCE.md)。
Codex 调度窗口的职责见 [Codex Task Dispatcher Role](development/CODEX_TASK_DISPATCHER_ROLE.md)。
任务状态快照见 [Task State Ledger](development/task-state-ledger.json)。
新任务派发必须使用 [Cursor Task Brief Template](development/CURSOR_TASK_BRIEF_TEMPLATE.md)。

## 2. 日常多窗口开发工作流

### 准备阶段

- 同时打开 `livemask-docs`、`livemask-backend`、`livemask-nodeagent`、`livemask-app` 等相关仓库。
- 任何 AI 工具先读 `docs/development/AI_PROJECT_STATUS_ONBOARDING.md`，再读具体 TASK。
- 确保每个仓库都加载对应规则文件，例如 `.cursorrules` 或 `.github/copilot-instructions.md`。
- 在对话开始时明确当前处理的 `TASK-XXXX`。
- 先阅读 [LiveMask_系统设计文档_v3.6.md](../LiveMask_系统设计文档_v3.6.md) 和 [LiveMask_开发任务清单与里程碑_v3.6.md](../LiveMask_开发任务清单与里程碑_v3.6.md)。
- `livemask-docs` 调度窗口还必须查看 `docs/development/task-state-ledger.json`，
  并用 `docs/development/CURSOR_TASK_BRIEF_TEMPLATE.md` 生成下一批任务。
- 其它 AI 编辑器需要理解 Codex 调度职责时，先读
  `docs/development/CODEX_TASK_DISPATCHER_ROLE.md`。

### 开发阶段

1. 如果用户只给自然语言需求 / bug，先执行 TASK intake：
   类型识别、仓库归属、TASK ID、mini task brief、验证计划和 docs handoff 判断。
2. 在主影响仓库中进行修改。
3. 修改前使用影响分析 Checklist。
4. 如涉及 API、配置、事件、错误码或状态机，先让 `livemask-docs` 窗口更新
   `docs/contracts/`；运行时代码仓库不要直接写 `../livemask-docs`。
5. 如属于跨仓库任务，由 `livemask-docs` 窗口在 `docs/development/tasks/`
   建立或更新独立任务单。
6. 修改后更新关键代码注释，必须包含 `TASK-XXXX`。
7. 如涉及架构、接口或配置变更，在完成报告中给出 docs handoff evidence，
   由 `livemask-docs` 窗口同步更新台账和契约。
8. 在受影响仓库中完成兼容性检查。
9. 提交时 commit message 必须包含 `TASK-XXXX`。
10. 如果使用任务分支，验证通过后通过 `dev-merge-guard.sh` 合并到 `dev`。
11. 在合并后的 `dev` 上重新验证，并推送 `origin/dev`。
12. 需要 CI/CD / smoke 的任务，只能以 `dev` ref 作为最终 smoke 来源。

## 3. 变更影响分析 Checklist

- [ ] 已确认当前 `TASK-XXXX`
- [ ] 如果需求来自普通文本，已完成 TASK intake 和 mini task brief
- [ ] 已分析本次变更会影响哪些仓库（Backend / NodeAgent / App / Payment / Admin）
- [ ] 已确认是否需要同步更新架构、接口、配置或运维文档
- [ ] 已确认是否影响配置热更新、FeatureFlag、支付风控或降级模式
- [ ] 已确认代码注释中是否需要包含 `TASK-XXXX`
- [ ] 已确认 PR 描述是否说明跨仓库影响和验证结果
- [ ] `livemask-docs` 调度窗口已更新或确认无需更新 `task-state-ledger.json`
- [ ] 新派发任务使用了 Cursor task brief 模板

## 4. 常见场景处理

### Backend 接口变更

- 更新 `docs/backend/README.md` 或对应接口文档。
- 检查 NodeAgent 是否需要同步调整配置下发、轮询、上报或降级逻辑。
- 检查 App 是否需要更新请求封装、错误处理、本地缓存或 UI 反馈。
- 在代码注释和 PR 中写明影响范围与 `TASK-XXXX`。

### 配置热更新

- 先在 `livemask-docs` 记录配置项、默认值、影响范围和回滚策略。
- 检查 NodeAgent 是否需要重启或重新加载配置。
- 检查 App 是否需要新增解析逻辑或兼容旧配置。
- 明确是否影响 Degraded Mode 行为。

### 支付相关变更

- 评估支付回调、幂等键、订单状态机、风控规则和退款路径。
- 检查 Backend、App、Payment Provider、数据库审计字段是否闭环。
- 明确失败补偿、重试策略和人工介入入口。

## 5. 完成标准

一个任务只有同时满足以下条件才算完成：

- [ ] 代码、文档、提交、PR 使用同一个 `TASK-XXXX`
- [ ] 独立任务单已更新
- [ ] 契约文档已更新或确认无需更新
- [ ] 所有受影响仓库均已检查
- [ ] App Client、Backend API、NodeAgent、Database 的数据流闭环
- [ ] 失败、重试、降级、回滚路径已说明
- [ ] 文档中的验收标准已更新
- [ ] 已执行 `bash scripts/check-docs.sh`
- [ ] 任务分支已合并到 `dev`，并已推送 `origin/dev`
- [ ] 合并后的 `dev` 已重新执行本仓库必需验证
- [ ] task 分支合并使用了 `dev-merge-guard.sh`，或报告中说明了等价 guard evidence
- [ ] CI/CD smoke / staging validation 使用的是 `dev`，不是 `task/*` 分支
- [ ] 运行时代码仓库没有直接修改 `../livemask-docs`；docs 状态由 `livemask-docs`
      窗口根据完成证据统一更新
- [ ] 如果任务来自自然语言需求 / bug，完成报告包含 Task intake summary
- [ ] 若任务是跨仓库 Epic，所有 child task 与最终 smoke 已完成；单个 repo 的 `implemented` 不能关闭 Epic
- [ ] 若 CI/CD 仍有 SKIP，状态必须写为 `completed_with_skip` 或 `verified_with_skip`，不得写成完整 `completed`
- [ ] `livemask-docs` 窗口已同步已有 GitHub Issue，或创建/登记新的后续 Issue/TASK
- [ ] 已按模块总结 completed / partial / blocked / evidence_missing 状态，并给出下一批 Cursor 任务
