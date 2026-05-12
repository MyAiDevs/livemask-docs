# LiveMask 数据库设计 v3.6（最终闭环版）

## 1. 核心表变更（v3.6 新增/修改字段）

### ambassadors 表
- 新增 `avg_invited_user_tier` VARCHAR(20)：被邀请用户平均忠诚度等级（每月定时任务更新）
- 新增 `loyalty_bonus_factor` NUMERIC(5,4)：当前忠诚度加成系数

### nodes 表
- 新增 `is_free_zone` BOOLEAN：是否处于免费区
- 新增 `bandwidth_limit_mbps` NUMERIC(8,2)：节点带宽上限（免费区节点使用独立配置）

### appeals 表
- 新增 `source` VARCHAR(30)：支持 'user_report'、'system_hunting' 等来源
- quarantine 状态通过 status 字段 + 关联 hunting 记录实现

### 新增配置表支持
- system_configs 表使用 JSONB 统一存储所有可热更新配置（affiliate_config、threat_hunting、free_zone 等）

## 2. 定时任务相关
- 每月执行 `UpdateAffiliateLoyaltyStats` 更新大使忠诚度相关字段
- 每15分钟执行威胁狩猎 + quarantine 检查
- 每5分钟检查免费区带宽使用情况
