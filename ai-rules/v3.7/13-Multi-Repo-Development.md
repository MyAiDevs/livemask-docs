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
8. 每个 `TASK-XXXX` 通过验证后必须合并并推送到 `dev`；只停留在 `task/*`
   或其它功能分支不能报告为 `completed`。
9. 运行时代码仓库只提交当前仓库代码和完成证据；跨仓库任务台账只能由
   `livemask-docs` 窗口更新。

## 2. 推荐窗口布局

- 窗口 1：`livemask-docs`
- 窗口 2：`livemask-backend`
- 窗口 3：`livemask-nodeagent`
- 窗口 4：`livemask-app`
- 窗口 5：`livemask-admin`（按需）

每个窗口的规则入口至少包含：

```markdown
@../livemask-docs/ai-rules/v3.7/00-Core-Principles.md
@../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md
@../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md
```

`livemask-docs` 仓库自身可以使用仓库内相对路径，例如
`@ai-rules/v3.7/00-Core-Principles.md`。不要在规则中写本机绝对路径。

## 3. 标准流程

1. 如果用户只用自然语言描述需求或 bug，先执行第 3.1 节的 TASK intake，不要直接改代码。
2. 在 `livemask-docs` 中确认或创建 `TASK-XXXX`。
3. 在每个相关仓库执行 `git fetch origin main dev`，然后切换到 `dev`。
4. 如果本地没有 `dev`，从 `origin/dev` 创建；如果远端也没有，再从 `origin/main` 创建并推送。
5. 执行“任务-仓库匹配门禁”，确认当前仓库允许处理当前任务。
6. 在匹配的主影响仓库或明确授权的受影响仓库开发。
7. 开发后检查其他受影响仓库是否需要同步修改。
8. 在所有相关仓库的 commit message 中包含 `TASK-XXXX`。
9. 任务分支验证通过后，切回 `dev`、更新 `origin/dev`、合并任务分支、解决冲突。
10. 在 `dev` 上重新执行该仓库必需的测试 / build / smoke 验证。
11. 将 `dev` 推送到 `origin/dev`，并在完成报告中记录 task branch commit、
    dev merge commit、远端 `origin/dev` ref 和验证结果。
12. 运行时代码仓库停止在完成报告，不得直接修改 `../livemask-docs` 或运行 task-sync
    来关闭跨仓库任务；由 `livemask-docs` 窗口依据完成报告更新 MVP、tasks、handoff 和契约索引。
13. 在 PR 描述中说明影响范围、验证结果、回滚策略和未完成项。
14. 只有 `dev` 合并到 `main` 才能触发远程预发布 CI/CD；只有 release 才能触发生产 CI/CD。

### 3.1 自然语言需求 / Bug Intake

当用户只用普通文本描述需求、bug、页面问题或“帮我修一下”时，Cursor / AI 不得直接改代码。
必须先执行 TASK intake：

1. 识别类型：`bugfix` / `feature` / `docs-only` / `test-smoke` / `refactor` / `investigation`。
2. 推断主影响仓库和受影响仓库，并执行任务-仓库匹配门禁。
3. 如果当前仓库不匹配，停止并报告：

```text
BLOCKED: current repository does not match inferred TASK scope.
Current repo: <repo>
Inferred task scope: <expected repos>
No files changed.
```

4. 如果当前仓库匹配，生成临时 TASK ID：

```text
TASK-<REPO-DOMAIN>-<SHORT-NAME>-<YYYYMMDD>
```

5. 从最新 `origin/dev` 创建 `task/<TASK-ID>`。
6. 实现前输出 mini task brief：

```text
TASK ID:
Repo:
Problem:
Scope:
Likely files:
Validation plan:
Cross-repo impact:
Docs handoff needed: yes/no
```

7. 实现、测试、提交，并用 `dev-merge-guard.sh` 合并到 `dev`。
8. 输出标准完成报告和 `Docs handoff evidence`。
9. 不得直接修改 `../livemask-docs`；由 docs 窗口根据 handoff 生成或更新任务文档。

## 4. 任务-仓库匹配门禁

每个 Cursor / AI 窗口在写任何文件之前，必须完成以下检查：

1. 确认当前仓库名：

```bash
basename "$PWD"
```

2. 打开当前 `TASK-XXXX` 任务单，检查：

```text
主影响仓库
受影响仓库
Cross-Repo Impact
Cursor handoff 中对应窗口
```

3. 当前仓库必须满足至少一个条件：

- 等于 `主影响仓库`
- 出现在 `受影响仓库`
- 在该任务的 Cursor handoff 中有明确的当前窗口 prompt
- 被 task-sync / Issue / 完成报告明确列为 `unlocked_repos`

4. 如果当前仓库不匹配，AI 必须停止并回复：

```text
BLOCKED: current repository does not match TASK scope.
Current repo: <repo>
Task: <TASK-ID>
Expected repos: <list from TASK>
No files changed.
```

5. 如果当前仓库匹配但需要其它仓库改动，AI 只能登记 blocker 或 handoff，
不得在当前仓库直接实现其它端的代码。

此门禁优先级高于任何实现指令、设计导出、示例代码或 AI 自行判断。任务描述中出现
Backend/API/DB/Go 字样，并不代表 Admin/Website/App 窗口可以写 Backend 代码。

## 5. 仓库写入边界

多窗口协同时，AI 可以阅读其它仓库和公共契约，但不得在错误仓库实现别的端的代码。

| 当前仓库 | 允许写入 | 禁止写入 |
| --- | --- | --- |
| `livemask-backend` | Go Backend、DB migration、Backend tests、Backend API contract notes | Flutter App、Next/Admin 页面、Website 页面、NodeAgent runtime |
| `livemask-admin` | Admin / Sponsor / Ambassador 前端、TypeScript、React、Next.js、shadcn、Admin API client | Go 文件、DB migration、Backend handler/service/repository、Flutter App、NodeAgent runtime |
| `livemask-website` | Public website、user portal、TypeScript、React/Vite/Next、Website API client | Go 文件、DB migration、Backend handler/service/repository、Admin-only pages under `/admin/*` |
| `livemask-app` | Flutter/Dart App、secure storage、App API client、App tests、MethodChannel 接口定义 | Go Backend、Admin/Website pages、NodeAgent runtime；不得声称纯 Dart 已实现系统 VPN 运行时 |
| `livemask-nodeagent` | Go NodeAgent runtime、agent config/cache/reporting、agent tests | Backend API handlers, Admin/Website/App UI |
| `livemask-ci-cd` | Compose, workflows, runtime scripts, smoke tests | Product code unless explicitly scoped to CI templates |
| `livemask-docs` | Contracts, tasks, handoff docs, rules, design source | Runtime implementation code |

### 5.2 CI/CD Smoke Script Discovery Gate

CI/CD 窗口收到 smoke / workflow / 脚本任务时，必须先发现现有脚本，不能把聊天中的
建议文件名当成已存在文件。

在写入任何 CI/CD 脚本前必须执行：

```bash
ls scripts | sort
rg -n "<domain>|<task>|<endpoint>" scripts .github/workflows
test -f scripts/<suggested-script>.sh && echo EXISTS || echo MISSING
```

规则：

1. 如果建议脚本不存在，必须在 mini task brief 中明确写：
   `scripts/<name>.sh does not exist; implementation will create it`。
2. 如果已有相近分域脚本，优先增强现有脚本；只有需要跨域聚合时才新增聚合脚本。
3. 不得在完成报告中声称更新了不存在的脚本。
4. 不得因为脚本不存在而伪造 PASS；应报告 `created` / `enhanced` / `SKIP with reason`。
5. `scripts/smoke.sh` 和 `.github/workflows/*` 的集成必须基于实际存在的脚本路径。
6. CI/CD smoke 的最终验收仍必须基于 `dev`，不能以 task 分支预检代替。

示例：如果用户或任务建议 `scripts/admin-control-plane-smoke.sh`，但仓库中不存在，
CI/CD 窗口必须先确认现有 `system-settings-smoke.sh`、`jobs-smoke.sh`、
`protocol-capability-smoke.sh`、`release-control-smoke.sh` 等是否可复用，再决定
新增聚合脚本或增强现有分域脚本。

### 5.3 Docs 台账写入边界

`livemask-docs` 拥有跨仓库任务台账和文档状态的唯一写入权。除非当前仓库就是
`livemask-docs`，否则不得写入 `../livemask-docs` 下的 MVP、tasks、handoff、
contract index、AI rules 或 `.cursorrules`。

运行时代码仓库完成任务后，只能在完成报告中交付 `TASK ID`、repository、task branch
commit、dev merge commit、remote dev ref、validation on dev 和 blockers 给 docs 窗口。
非 docs 窗口不得运行 task-sync 来更新或关闭跨仓库任务台账。

如果一个任务需要 Backend 和 Admin 同时改：

1. Backend 窗口只改 `livemask-backend`。
2. Admin 窗口只改 `livemask-admin`。
3. 双方通过 `livemask-docs` 契约、TASK、Issue 评论和 task-sync 交接。
4. 非本仓库代码最多只能提出变更建议，不能直接创建或修改。

特别规则：`livemask-admin` 和 `livemask-website` 读取 Backend 契约时，只能实现
API client、mock、页面状态和错误处理；不得创建 `.go`、`go.mod`、`go.sum`、migration
或 Backend 目录结构。

### 5.4 Backend API / Swagger 对齐门禁

Backend 的所有 API 必须和 Swagger/OpenAPI 文档对齐。任何新增、修改、删除 Backend
API 的任务，必须在同一个 TASK 中同步 OpenAPI，并通过 route/API drift 校验。

门禁要求：

1. Backend route、request schema、response schema、auth/RBAC、错误码、query/path
   params、状态机字段和 sensitive-field redaction 规则必须和 OpenAPI 一致。
2. 未同步 OpenAPI 的 Backend API 变更不得标记为 `completed`，只能标记为
   `partial` / `evidence_missing` 并登记补救 TASK。
3. Backend 可以提供机器可读 OpenAPI JSON 给 Admin/CI 使用，但不得公开未登录
   Swagger UI。
4. Human-facing Swagger UI 只能在登录后的 `livemask-admin` 中查看。
5. 如果任务触及 Swagger UI 或 OpenAPI 暴露方式，完成报告必须证明：
   - OpenAPI validation PASS；
   - route/API drift check PASS；
   - Backend 未暴露 public unauthenticated Swagger UI；
   - `livemask-admin` 登录后可查看 Swagger UI。

## 6. 分支与环境映射

| 分支 / ref | 环境含义 | 允许动作 |
| --- | --- | --- |
| `dev` | 本地 Go 测试、本地 Docker、开发集成 | AI 开发、单元测试、集成测试、跨仓库 task sync |
| `main` | 远程预发布 staging | 接收 `dev` 合并、触发 `livemask-ci-cd` staging smoke |
| `v*` release | 生产发布 | 手动发布版本、触发 production gate |

`task-unlocked` 只表示其它仓库窗口可以开始或继续开发，不表示 staging
部署，也不表示 production 发布。

## 7. Task 完成后的 Dev 合并门禁

每个仓库完成 `TASK-XXXX` 后必须执行以下门禁，除非用户明确要求只提交任务分支且
报告状态为 `partial`：

1. `task/*`、`codex/*` 或其它功能分支上的实现先完成本仓库要求的验证。
2. 使用非破坏性方式更新 `dev`：

```bash
git fetch origin main dev
git checkout dev
git pull --ff-only origin dev
```

3. 将已验证的任务分支合并到 `dev` 必须通过
   `livemask-ci-cd/scripts/dev-merge-guard.sh` 执行。禁止手写批量 merge 循环，
   例如 `for branch in task/*; do git merge ...; done`。
4. 如果发生冲突，只能解决当前仓库职责范围内的冲突；不得顺手改其它端代码。
5. 合并后必须在 `dev` 上重新运行本仓库必需的验证，例如：
   `go test` / `go build` / `npm build` / `vitest` / `flutter test` / smoke。
   CI/CD smoke / staging validation 只能使用 `dev`；`task/*`、`codex/*` 或其它
   功能分支上的 smoke 只能作为预检，不能作为完成验收。
6. 验证通过后必须推送：

```bash
git push origin dev
```

7. 完成报告必须写明：
   `Task Branch`、`Task Branch Commit`、`Dev Merge Commit`、`Remote dev Ref`、
   `Validation on dev`。

以下情况不得报告为 `completed`，只能报告为 `partial` 或 `blocked`：

- 任务分支尚未合并到 `dev`。
- `dev` 尚未推送到 `origin/dev`。
- 只在任务分支测试通过，未在合并后的 `dev` 上复测。
- CI/CD smoke 使用了 `task/*`、`codex/*` 或其它功能分支 ref，而不是 `dev`。
- 仍存在 merge conflict、未提交改动或未说明的 dirty worktree。
- 为了合并而使用 `git reset --hard`、删除 volume、清理他人改动等破坏性操作。
- 绕过 `dev-merge-guard.sh` 直接把任务分支合并到 `dev`。

如果任务本身直接在 `dev` 上完成，也必须提交、验证、推送 `origin/dev`，并在报告中说明
`Task Branch: none, developed on dev`。

## 8. 紧急处理

发现跨仓库不一致时：

1. 停止继续扩大变更。
2. 在 `livemask-docs` 中登记问题和对应 `TASK-XXXX`。
3. 标记受影响仓库、影响范围、回滚路径。
4. 完成修复后更新验证结果。
