# LiveMask API 设计文档 v3.6（最终闭环版）

## 1. 通用规范
- Base URL: https://api.livemask.vpn/v1
- 认证：JWT Bearer（客户端/Web） + mTLS（Agent）
- 所有配置变更支持热更新 + 版本哈希校验

## 2. 新增/更新接口（v3.6 重点）

### 2.1 推广大使相关
- GET /admin/config/affiliate
- PATCH /admin/config/affiliate（实时调整 Tier、loyalty_bonus、platform_protection）
- GET /client/affiliate/status（返回当前 Tier、忠诚度加成、预计佣金）

### 2.2 威胁狩猎相关（重大更新）
- 狩猎命中后自动创建 quarantine 状态 + 系统申诉
- PATCH /admin/appeals/:id/review（支持 quarantine 复核：approve / reject / extend）
- GET /admin/hunting/quarantine（查看当前隔离中的节点/大使）

### 2.3 免费区节点相关
- GET /admin/config/free-zone
- PATCH /admin/config/free-zone（调整 free_zone_max_bandwidth_mbps）
- GET /client/nodes（付费用户自动过滤免费区节点）

### 2.4 C2C 平台补贴
- C2C 交易成功后自动触发平台补贴逻辑（后端内部调用，不暴露新接口）

### 2.5 用户留存相关
- GET /client/retention/status（返回当前忠诚度、Streak、预计奖励）
- POST /client/retention/claim（领取连续使用奖励）

## 3. 配置热更新接口（加强版）
- 所有配置接口返回 `config_version` 和 `config_hash`
- 客户端/Agent 必须校验 hash，不一致则自动回滚

## 4. 其他接口
原有接口保持兼容，v3.6 主要增加以上配置和安全相关接口。
