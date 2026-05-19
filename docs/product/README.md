# Product 文档入口

## 1. 职责范围

Product 负责需求范围、用户价值、验收标准、优先级、灰度策略、运营口径和跨团队取舍。

## 2. 需求进入开发前必须确认

- [ ] 已创建或关联 `TASK-XXXX`
- [ ] In Scope / Out of Scope 明确
- [ ] 用户影响、业务指标和成功标准明确
- [ ] App、Backend、NodeAgent、Admin、Payment、Ops 影响已初筛
- [ ] 不做什么、延后什么、风险接受项已记录

## 3. 必须更新文档的场景

- 用户流程、套餐、价格、权益、活动、留存策略变化
- 运营规则、风控阈值、客服处理方式变化
- 用户联系方式、IM 绑定、通知订阅偏好、机器人邀请或消息投递策略变化
- 后端定时简报、运营报告、运维报告、赞助大使报告、推广大使报告等通知模板变化
- 上线范围、灰度策略、实验口径变化
- 影响用户协议、隐私政策、支付说明或商店审核材料

## 4. 用户联系与通知偏好

当产品需求涉及 Telegram、WhatsApp、Lark、Email、Push 等联系渠道、
机器人邀请、活动/公告/安全通知、订阅偏好或投递日志时，必须先阅读：

- [User Contact & Notification Preference Contract](../contracts/users/USER_CONTACT_NOTIFICATION_CONTRACT.md)

产品侧必须明确：

- 哪些通知属于 transactional/security，哪些属于 marketing/campaign。
- 是否允许用户关闭，以及关闭后是否影响安全通知。
- 默认渠道优先级和 fallback 规则。
- 机器人主动邀请用户 IM ID 的触发条件、有效期、频率限制和客服话术。
- Telegram/WhatsApp/Lark 是否要求用户先关注/启动/安装官方 Bot，并通过回调认证后才可交互。
- 系统报告、运营报告、运维报告、赞助大使报告、推广大使报告的接收角色、发送频率、变量和静默规则。
- 隐私政策是否需要补充 IM handle/chat_id、通知偏好、delivery logs 的说明。

## 5. 完成标准

- [ ] 任务单验收标准可测试
- [ ] 业务指标和观察窗口明确
- [ ] 灰度、回滚、客服话术和运营动作明确
- [ ] 范围外事项有后续 TASK
- [ ] 发布后复盘入口明确
