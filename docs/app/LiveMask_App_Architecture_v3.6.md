# LiveMask App 客户端架构设计 v3.6

## 1. 技术栈

- Flutter + Dart
- sing-box（核心代理引擎）
- Riverpod / Provider（状态管理）
- GEOIP 远程更新

## 2. 核心模块

- Onboarding 引导与激活
- 节点推荐与连接
- 配置热更新
- 本地黑白名单
- 连接质量上报
- 威胁情报展示

## 3. 关键约束

- 必须支持多平台（iOS、Android、Mac、Windows）
- 必须实现 GEOIP 远程同步
- Onboarding 必须形成完整闭环
- 异常场景必须有本地补偿逻辑

## 4. 与 Backend 的联动

- 配置下发
- Onboarding 进度上报
- 连接质量反馈
- 留存预警干预接收

---

*详细开发规范请参考 ai-rules 中的 Client 相关规则*