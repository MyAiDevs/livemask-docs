# TASK-DOC-001 - 文档入口与多窗口规则闭环

- 状态：Done
- Owner：Docs Maintainer
- 创建日期：2026-05-13
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-nodeagent`, `livemask-app`
- 关联里程碑：M1 文档闭环

## 1. Background

README 和核心规则引用了缺失文档，导致新开发者和 AI 窗口无法按规则完成闭环。多仓库协作需要稳定入口、规则摘要、任务登记、契约目录和自动检查。

## 2. Scope

### In Scope

- 补齐 README 指向的规则文件
- 补齐角色入口 README
- 补齐架构基线和任务登记入口
- 新增 TODO 闭环登记
- 新增 contracts、tasks、风险台账和检查脚本
- 新增多角色闭环审计和缺失角色入口
- 新增角色交接链路、阻断条件和回流路径

### Out of Scope

- 业务仓库代码改动
- 真实生产配置值
- 具体业务接口实现

## 3. Contracts

- API：新增契约目录和模板
- Config：新增配置契约目录和配置变更模板
- Events：新增事件契约目录和模板
- Error Codes：新增统一错误码文档
- State Machines：新增状态机登记文档

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | 后续需要同步规则引用 | 否，本任务只改 docs | 后续 TASK 检查 `.cursorrules` / Copilot instructions |
| `livemask-nodeagent` | 后续需要同步规则引用 | 否，本任务只改 docs | 后续 TASK 检查 `.cursorrules` / Copilot instructions |
| `livemask-app` | 后续需要同步规则引用 | 否，本任务只改 docs | 后续 TASK 检查 `.cursorrules` / Copilot instructions |
| `livemask-docs` | 文档入口与规则闭环 | 是 | Markdown 链接检查和 diff check |

## 5. Validation

- [x] Markdown 相对链接检查通过
- [x] `git diff --check` 通过
- [x] README 核心链接有对应文件
- [x] TODO 有归属登记表
- [x] Backend / NodeAgent / App / Admin / Payment / Ops / Security / QA / Product 角色入口已覆盖
- [x] 角色交接链路、PR 交接表、任务模板交接表已补齐

## 6. Follow-up

- `TASK-DOC-002`：同步各业务仓库 `.cursorrules` / `.github/copilot-instructions.md`
- `TASK-DOC-003`：为 archive 文档标注 Active / Superseded / Historical 状态
- `TASK-DOC-004`：把核心 API、支付状态机和 NodeAgent 配置契约从模板推进到真实条目
- `TASK-DOC-005`：在真实业务任务中试运行角色交接链，补充样例证据
