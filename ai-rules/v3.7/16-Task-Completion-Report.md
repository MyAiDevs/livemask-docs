# 16 - Task Completion Report Rules

> 目标：每个 AI 编辑器窗口完成任务后，都必须用统一格式报告结果，并明确哪些其他仓库/角色已经被解锁可以继续开发。

## 1. 完成报告必须包含

AI 声明任务完成、阶段完成、可以提交、可以进入下一步时，必须输出以下字段：

1. `TASK ID`
2. `Repository / Branch / Commit`
3. `Task Branch / Task Branch Commit`
4. `Dev Merge Commit / Remote dev Ref`
5. `已完成内容`
6. `文档 / 契约变更`
7. `测试与验证`
8. `跨端影响`
9. `已解锁的后续开发窗口`
10. `仍然阻塞的窗口`
11. `风险 / 待办 / 技术债`
12. `下一步建议`
13. `Docs handoff evidence`
14. 如果任务来自自然语言需求 / bug，必须包含 `Task intake summary`

不得只回复“已完成”“已 push”“可以继续”。

分支要求：

- 日常任务完成报告中的 `Branch` 必须是 `dev` 或从 `dev` 派生的任务分支。
- 日常任务只有在任务分支已合并到 `dev`、在 `dev` 上复测通过，并已推送
  `origin/dev` 后，才可以报告为 `completed`。
- 任务分支合并到 `dev` 必须通过 `livemask-ci-cd/scripts/dev-merge-guard.sh`
  或该脚本生成的等价 completion evidence。绕过 guard 的手工合并不得报告为
  `completed`。
- CI/CD smoke / staging validation 必须基于 `dev`。`task/*`、`codex/*` 或其它
  功能分支 smoke 只能作为预检，不能作为最终完成证据。
- Backend / Admin / App / Website / NodeAgent / Job Service / CI-CD 等运行时代码仓库
  不得直接修改 `../livemask-docs`，不得自行用 task-sync 更新或关闭跨仓库任务。
  它们只能输出完成报告；`livemask-docs` 窗口负责统一更新任务台账、MVP、handoff
  和契约索引。
- 如果当前变更在 `main`，只能报告为预发布合并 / staging 验证，不能报告为日常开发完成。
- 如果当前变更来自 release / `v*` tag，必须报告版本号、生产 gate 和回滚版本。

## 2. 跨端解锁声明

如果某个功能或契约已经完成到足以让其它端开发，AI 必须显式声明：

| 端 / 角色 | 状态 | 说明 |
| --- | --- | --- |
| Backend | 已完成 / 可并行 / 阻塞 | API、DB、Redis、事件是否稳定 |
| Admin | 已完成 / 可并行 / 阻塞 | 是否可依据 API contract 开发页面 |
| App | 已完成 / 可并行 / 阻塞 | 是否可依据 API contract 开发读取/展示/降级 |
| NodeAgent | 已完成 / 可并行 / 阻塞 | 是否可依据 API contract 开发同步/降级/上报 |
| CI/CD | 已完成 / 可并行 / 阻塞 | 是否需要新增 smoke 或 workflow |
| Docs / QA | 已完成 / 可并行 / 阻塞 | 是否有验收矩阵和回归点 |

状态含义：

- `已完成`：当前仓库职责已完成并验证。
- `可并行`：其它端可基于已稳定契约开始开发，不必等待当前仓库更多实现。
- `阻塞`：其它端不能开始，必须说明阻塞原因和解除条件。

## 3. 标准输出模板

```markdown
## 任务完成报告

**TASK ID**:
**仓库 / 分支 / Commit**:
**Task Branch / Commit**:
**Dev Merge Commit**:
**Remote dev Ref**:
**结果**: completed / partial / blocked
**环境阶段**: dev-local / main-staging / release-production

### 已完成内容
- 

### 文档 / 契约变更
- 

### 测试与验证
- Unit:
- Integration:
- CI:
- Manual / Smoke:
- Validation on dev:

### 跨端影响与解锁状态
| 端 / 角色 | 状态 | 依据 | 下一步 |
| --- | --- | --- | --- |
| Backend |  |  |  |
| Admin |  |  |  |
| App |  |  |  |
| NodeAgent |  |  |  |
| CI/CD |  |  |  |
| Docs / QA |  |  |  |

### 风险 / 待办
- 

### 下一步建议
- 

### Docs handoff evidence
- Docs update owner: livemask-docs window
- Runtime repo must not edit livemask-docs directly: yes / no
- Task ledger update needed: yes / no
- Evidence for docs window:
  - TASK ID:
  - repository:
  - task branch commit:
  - dev merge commit:
  - remote dev ref:
  - validation on dev:

### Task intake summary
- Source request:
- Inferred task type: bugfix / feature / docs-only / test-smoke / refactor / investigation
- Inferred primary repo:
- Inferred affected repos:
- Generated TASK ID:
- Mini task brief confirmed before implementation: yes / no
```

## 4. 不得宣称完成的情况

出现以下情况时，AI 只能报告 `partial` 或 `blocked`：

- 日常开发发生在 `main`，且没有说明这是 `dev -> main` 预发布合并。
- 任务分支尚未合并到 `dev`。
- 合并后的 `dev` 尚未推送到 `origin/dev`。
- 只在任务分支验证通过，未在 `dev` 合并后重新验证。
- CI/CD smoke / staging 验证使用了 `task/*`、`codex/*` 或其它功能分支 ref。
- 绕过 `dev-merge-guard.sh` 直接手工合并任务分支。
- 仍存在 merge conflict、未提交改动或未说明的 dirty worktree。
- 运行时代码仓库直接修改了 `../livemask-docs` 的任务台账、MVP、handoff 或契约索引。
- 非 docs 窗口自行运行 task-sync 试图关闭或更新跨仓库任务状态。
- 用户只给自然语言需求 / bug 时，未执行 TASK intake 就直接改代码。
- 自然语言任务没有生成 TASK ID、mini task brief 或 docs handoff evidence。
- 没有测试或无法说明为什么没测试。
- API / DB / Redis / Event contract 变更未同步到 `livemask-docs`。
- 其它端依赖的字段、错误码、状态机不明确。
- CI/CD、Lark、staging smoke 中任一必需验证未完成且未说明后续 TASK。
- 有安全、支付、权限、Secret、审计相关缺口未登记。
- 代码或文档留下待办事项，但没有登记到明确的后续 `TASK-XXXX`。

## 5. Lark / 项目报告要求

当任务影响多个仓库时，AI 的完成报告必须能被直接整理进 Lark 项目报告，至少包含：

- 当前总体状态。
- 各仓库完成度。
- 可并行开发的窗口。
- 阻塞项与负责人。
- 下一步 TASK。
