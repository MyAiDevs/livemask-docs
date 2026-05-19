# Support / Business Ops 文档入口

## 1. 职责范围

Support / Business Ops 负责用户解释、客服升级、人工补偿、支付异常处理、申诉处理、发布后反馈和运营复盘。

## 2. 介入前必须确认

- [ ] 当前问题关联 `TASK-XXXX` 或事故编号
- [ ] 用户可见状态和错误码已明确
- [ ] 是否涉及支付、权益、封禁、节点故障或隐私安全
- [ ] 是否需要 Product、Payment、Ops、Security 或 Backend 介入
- [ ] 是否有补偿、退款、补单或申诉路径

## 3. 必须更新文档的场景

- 新增用户可见错误、支付异常、权益异常
- 新增或修改客服话术、补偿策略、退款策略
- 修改申诉、封禁、节点故障处理流程
- 发布后出现用户集中反馈
- 运营复盘发现产品或技术缺口

## 4. 完成标准

- [ ] 用户解释话术明确
- [ ] 人工介入和升级路径明确
- [ ] 补偿、退款、补单、申诉处理记录可追踪
- [ ] Product 复盘入口明确
- [ ] 相关风险或后续 TASK 已登记

## 5. 必读文档

- `docs/product/README.md`
- `docs/payment/README.md`
- `docs/operations/README.md`
- `docs/development/ROLE_READINESS_ASSESSMENT.md`
- `docs/contracts/users/USER_CONTACT_NOTIFICATION_CONTRACT.md`

## 6. 用户 IM 联系与通知运营

Support / Business Ops 可以协助用户绑定 Telegram、WhatsApp、Lark 等 IM 联系方式，但必须通过 Admin 的 Contact Channels / Bot Invite 流程完成，不得把 IM ID 写入备注、日志、任务评论或非结构化字段。

运营规则：

- 用户提供 IM ID 时，Support 应在用户详情页添加 Contact Channel，并填写 audit reason。
- 未验证的 IM contact 不能用于正式活动、公告、安全或账单通知。
- Telegram、WhatsApp、Lark 必须先让用户关注/启动/安装官方 Bot 或完成 provider callback/OTP 验证；只有 `verified` 状态可正式推送。
- 机器人邀请必须有过期时间，并通过 Job Service 投递。
- 营销活动必须尊重用户 `marketing_campaigns` 偏好。
- 用户要求退订时，必须更新 Notification Preferences，不得只在客服备注中记录。
- 投递失败应查看 Delivery Logs 和 Job Run，不要重复手动发送造成骚扰。
