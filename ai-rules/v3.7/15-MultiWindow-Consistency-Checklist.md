# 15 - MultiWindow Consistency Checklist (v3.7)

> 目标：每次多窗口开发结束前，用同一张清单确认所有仓库、规则和文档已经闭环。

## 1. 开始前

- [ ] 已打开 `livemask-docs`
- [ ] 已确认当前 `TASK-XXXX`
- [ ] 已确认主影响仓库
- [ ] 已确认可能受影响仓库
- [ ] 每个窗口加载同一版本 `ai-rules/v3.7`

## 2. 修改前

- [ ] 已阅读 `00-Core-Principles.md`
- [ ] 已阅读 `04-Multi-Repo-Linkage.md`
- [ ] 已阅读当前任务在任务清单中的范围
- [ ] 已确认不扩展任务范围
- [ ] 已记录接口、配置、数据、支付或运维影响

## 3. 修改后

- [ ] Backend 影响已检查
- [ ] NodeAgent 影响已检查
- [ ] App 影响已检查
- [ ] Database / Migration 影响已检查
- [ ] Payment / Risk Control 影响已检查
- [ ] 文档已更新
- [ ] 关键注释包含 `TASK-XXXX`

## 4. 提交前

- [ ] commit message 包含 `TASK-XXXX`
- [ ] PR 描述包含影响范围
- [ ] PR 描述包含验证结果
- [ ] PR 描述包含回滚策略
- [ ] 未完成项已明确归属到后续 `TASK-XXXX`

## 5. 不通过时的处理

任何一项无法勾选时，不得标记任务完成。必须在任务清单中记录：

- 缺口说明
- 影响范围
- 责任仓库
- 后续 TASK
- 临时风险控制方案
