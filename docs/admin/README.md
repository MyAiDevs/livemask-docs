# Admin / Frontend 文档入口

## 1. 职责范围

`livemask-admin` 负责运营后台、权限管理、配置编辑、审计查看、数据大盘、人工复核和内部工具。

管理员、运营者、赞助大使、推广大使、普通用户和订阅用户可以共用同一个后台产品和设计系统，但必须使用独立 URI 边界和权限边界，不能混在同一路径空间。

推荐路径边界：

| Surface | URI Prefix | 角色 |
| --- | --- | --- |
| 系统管理后台 | `/admin/system/*` | 超级管理员 / 安全管理员 |
| 运营后台 | `/admin/ops/*` | 运营 / 客服 / 节点运维 |
| 财务收益后台 | `/admin/finance/*` | 财务 / 收益审核 |
| 赞助大使自助后台 | `/sponsor/*` | 赞助节点 / Sponsor Ambassador |
| 推广大使自助后台 | `/ambassador/*` | 推广大使 |
| 普通用户账户后台 | `/account/*` | 登录用户 |
| 订阅用户账单后台 | `/billing/*` | 订阅 / 支付用户 |

隐藏菜单不是安全边界。所有前端路径隔离必须由 Backend 鉴权和授权同步强制执行。

## 2. 修改 Admin 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否修改 Backend Admin API 契约
- [ ] 是否修改配置项、FeatureFlag、风控参数或支付参数
- [ ] 是否新增或修改 URI 前缀、角色边界或权限边界
- [ ] 是否需要审计日志、双人复核或权限控制
- [ ] 是否影响运营、客服、财务或安全团队流程

## 3. 必须更新文档的场景

- Admin API 字段、筛选条件、分页、导出格式变化
- 配置表单新增、删除或修改字段
- 权限、角色、审批流或审计日志变化
- 运营大盘指标、口径或告警阈值变化
- 人工复核、申诉、退款、封禁流程变化

## 4. 完成标准

- [ ] API contract 已更新或确认无需更新
- [ ] 配置变更有 `CONFIG_CHANGE_RECORD`
- [ ] 权限矩阵和审计字段已说明
- [ ] 运营人员操作路径和异常处理路径完整
- [ ] 验证截图、接口响应或手工验证记录写入任务单

## 5. 前端设计输入

- `docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md`
- `docs/admin/LIVEMASK_NODE_SPONSOR_UI_DESIGN_BRIEF_FOR_ATOMS.md`

该文档用于 Admin Console 与 Website 的前端设计输入，包含 Atoms 可直接使用的 Prompt、页面结构、组件要求、状态设计和验收清单。

其中 `LIVEMASK_NODE_SPONSOR_UI_DESIGN_BRIEF_FOR_ATOMS.md` 专门用于赞助节点、推广大使、收益配置、收益计算和追溯重算相关页面。
