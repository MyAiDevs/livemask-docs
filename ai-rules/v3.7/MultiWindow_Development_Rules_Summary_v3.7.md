# MultiWindow Development Rules Summary v3.7

> 本文是多窗口开发的入口摘要。详细规则以同目录下编号文件为准。

## 必须加载的规则

- [00-Core-Principles.md](00-Core-Principles.md)
- [02-Closed-Loop-Validation.md](02-Closed-Loop-Validation.md)
- [04-Multi-Repo-Linkage.md](04-Multi-Repo-Linkage.md)
- [13-Multi-Repo-Development.md](13-Multi-Repo-Development.md)
- [14-Code-Comment-Traceability.md](14-Code-Comment-Traceability.md)
- [15-MultiWindow-Consistency-Checklist.md](15-MultiWindow-Consistency-Checklist.md)
- [16-Task-Completion-Report.md](16-Task-Completion-Report.md)

## 一句话原则

任何变更都必须回答四个问题：

1. 这属于哪个 `TASK-XXXX`？
2. 影响哪些仓库和层？
3. 文档、代码、提交、PR 是否使用同一个追踪编号？
4. 验证、回滚、未完成项是否记录清楚？
5. 哪些其它端/窗口已经被解锁可以继续开发，哪些仍然阻塞？

## 最小闭环

- App Client 有反馈、重试、补偿
- Backend 有校验、错误处理、幂等和状态流转
- NodeAgent 有配置同步、降级和上报
- Database 有迁移、约束、索引和审计
- Docs 有影响范围、验证结果和后续事项

## 禁止完成条件

出现以下任一情况时，不得声明任务完成：

- 缺少 `TASK-XXXX`
- 只改了一个仓库但没有跨仓库检查
- README 或规则文件指向不存在的文档
- 有 TODO 但没有后续 TASK
- 有配置或接口变化但没有回滚策略
- 完成报告没有明确跨端影响和解锁状态
