# LiveMask 多仓库联动规则 v3.7

## 核心原则

当在多个仓库同时开发时，必须严格遵守以下联动规则。

### 1. 变更影响分析

在任何仓库进行变更前，AI 必须主动回答：

- 这个变更会影响哪些其他仓库？
- 是否需要同步修改 NodeAgent 配置、上报或降级逻辑？
- 是否需要同步修改 App 端请求逻辑、本地缓存或用户反馈？
- 是否需要更新 `livemask-docs` 中的架构、接口、配置或运维文档？

### 2. 接口与配置变更联动

Backend 修改 API 接口时，必须同步检查：

- `livemask-nodeagent` 的配置下发、轮询、上报逻辑
- `livemask-app` 的请求封装、错误处理、本地缓存和 UI 反馈
- `livemask-docs` 中的接口、配置和任务文档

### 3. 配置热更新联动

Backend 修改配置结构时，必须同步检查：

- NodeAgent 的 ConfigManager
- App 端配置解析逻辑
- 默认值、回滚策略和降级行为
- 文档中的配置说明

### 4. 任务 Traceability

所有跨仓库变更必须在代码注释、commit message 和 PR 描述中标注同一个 `TASK-XXXX`。

### 5. Docs 台账归属

`livemask-docs` 是跨仓库任务台账、契约索引、MVP 状态和 Cursor handoff 的唯一写入窗口。

运行时代码仓库完成任务后，只能输出完成证据，不得直接修改 `../livemask-docs`，
也不得用 task-sync 代替 docs 台账更新。只有 `livemask-docs` 窗口可以更新
MVP、tasks、handoff、contract index，并在台账更新后触发 task-sync。

## 多窗口开发时的 AI 行为要求

- 每个窗口的 AI 都必须加载本文件。
- 用户只用自然语言描述需求或 bug 时，先执行 TASK intake、判断仓库归属、生成 TASK ID 和 mini task brief。
- 检测到跨仓库影响时，必须提醒用户在其他窗口进行兼容性检查。
- 禁止只在当前窗口完成开发而不检查其他端。
- 运行时代码窗口不得跨仓库修改 `livemask-docs`；需要文档同步时必须输出证据并交给 docs 窗口。

## 禁止行为

- 只修改一个仓库而不检查其他受影响仓库
- 不同窗口使用不同版本的联动规则
- 忽略 `TASK-XXXX`，导致变更无法追溯
- 文档只写结论，不写验证、回滚和未完成项
- 用户只给自然语言需求或 bug 时，未执行 TASK intake 就直接改代码
- Backend / Admin / App / Website / NodeAgent / Job Service / CI-CD 窗口直接修改 `../livemask-docs`
- 非 docs 窗口用 task-sync 关闭或更新跨仓库任务台账
