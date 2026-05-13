# LiveMask 开发任务清单与里程碑 v3.6

> 本文档是 `TASK-XXXX` 的登记入口。没有登记的跨仓库变更不得开始实现。

## 1. TASK 编号规则

推荐格式：

- `TASK-DOC-001`：文档、规则、流程
- `TASK-BE-001`：Backend
- `TASK-APP-001`：App
- `TASK-NA-001`：NodeAgent
- `TASK-PAY-001`：Payment
- `TASK-OPS-001`：运维、监控、部署

同一跨仓库变更必须使用同一个 TASK 编号。

## 2. 任务模板

```markdown
## TASK-XXXX - <任务标题>

- 状态：Todo / In Progress / Blocked / Done
- Owner：
- 主影响仓库：
- 受影响仓库：
- 背景：
- 范围内：
- 范围外：
- 接口/配置/数据影响：
- 风险：
- 回滚策略：
- 验收标准：
- 验证结果：
- 后续 TASK：
```

## 3. 当前里程碑

| 里程碑 | 目标 | 完成标准 | 状态 |
| --- | --- | --- | --- |
| M1 文档闭环 | README、AI 规则、角色入口、任务登记可互相跳转 | 不存在断链规则；每个角色有入口；TASK 有模板；契约和自动检查已建立 | Done |
| M2 架构闭环 | App / Backend / NodeAgent / Database 的职责和闭环路径清晰 | 架构文档覆盖配置、接口、数据、回滚 | Todo |
| M3 开发闭环 | 多窗口开发可以按清单执行 | 每次提交前可完成一致性 Checklist | Todo |

## 4. 当前任务

## TASK-DOC-001 - 文档入口与多窗口规则闭环

- 状态：Done
- Owner：Docs Maintainer
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-nodeagent`, `livemask-app`
- 背景：README 和核心规则引用了缺失文档，导致新开发者和 AI 窗口无法按规则完成闭环。
- 范围内：补齐规则摘要、代码注释追踪、多窗口一致性清单、角色入口、架构基线和任务登记模板。
- 范围外：具体业务接口实现、真实生产配置值、各业务仓库代码改动。
- 接口/配置/数据影响：无直接代码接口变化；影响开发流程和文档引用。
- 风险：如果业务仓库没有同步引用最新文档，仍可能继续使用旧规则。
- 回滚策略：恢复 README 与规则文件到上一版本，并保留本任务作为待处理缺口。
- 验收标准：README 中所有核心链接存在；`00-Core-Principles.md` 的前置阅读文档存在；多窗口完成标准有可复制 Checklist。
- 验证结果：本地 Markdown 链接检查通过；核心 README 引用文件已补齐；裸 TODO 已归档到 `docs/development/LiveMask_TODO闭环登记表_v3.7.md`；新增 contracts、tasks、风险台账和自动检查脚本。
- 后续 TASK：同步各业务仓库 `.cursorrules` / `.github/copilot-instructions.md`。
