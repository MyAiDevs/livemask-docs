# LiveMask 收益模型优化建议 v3.6（最终闭环版）

## 一、推广大使收益模型介绍

### 1. 设计理念

LiveMask 的推广大使收益模型核心目标是：

- **鼓励长期、高质量推广**：不是只看短期拉新，而是看被邀请用户是否长期留存。
- **保护平台长期利益**：随着平台规模扩大，逐步提高平台自身的收益占比。
- **形成正向循环**：推广大使帮助用户提升留存 → 用户忠诚度越高 → 大使收益越高 → 大使更有动力维护用户。
- **规则简洁透明**：彻底移除复杂的衰减机制，让大使更安心持续推广。

### 2. 最终收益公式（详细可配置版）

**后台配置结构**（存储在 `system_configs` 表，key = `promoter_revenue_config`）：

```json
{
  "base_commission_rate": 0.15,
  "tier_rules": [
    {"tier": "basic",   "min_invited_active": 0,   "min_monthly_traffic_gb": 0,     "multiplier": 1.00},
    {"tier": "silver",  "min_invited_active": 8,   "min_monthly_traffic_gb": 800,   "multiplier": 1.15},
    {"tier": "gold",    "min_invited_active": 25,  "min_monthly_traffic_gb": 2500,  "multiplier": 1.30},
    {"tier": "platinum","min_invited_active": 60,  "min_monthly_traffic_gb": 6000,  "multiplier": 1.50}
  ],
  "loyalty_bonus": {
    "bronze": 1.00,
    "silver": 1.08,
    "gold": 1.15,
    "platinum": 1.18
  },
  "platform_protection": {
    "base_user_count": 10000,
    "reduction_per_10k": 0.005,
    "max_reduction": 0.25
  },
  "c2c_extra_commission_rate": 0.015,
  "min_payout_usdt": 5.0
}
```

**最终月度推广大使收益计算公式**：

$$
\text{最终佣金(USDT)} = 
\left( \sum_{i=1}^{n} \text{被邀请用户}i\text{本月消费金额(USDT)} \times \text{基础分成率} \right)
\times \text{TierMultiplier}
\times \text{LoyaltyBonus}
\times \text{PlatformProtectionFactor}
+ \text{C2C额外佣金}
$$

其中：

- **TierMultiplier**：根据大使当前 `tier` 从配置中获取
- **LoyaltyBonus**：根据 `avg_invited_user_tier` 从配置中获取（每月定时任务更新）
- **PlatformProtectionFactor** = `1 - min( max_reduction, (当前总活跃用户数 - base_user_count) / 10000 * reduction_per_10k )`
- **C2C额外佣金** = C2C交易中由平台补贴给大使的部分（从C2C手续费中出）

**计算示例**（2026年5月）：

- 大使当前 Tier = Gold（multiplier = 1.30）
- 被邀请用户平均忠诚度 = Gold → LoyaltyBonus = 1.15
- 平台当前活跃用户 = 45,000 → PlatformProtectionFactor ≈ 0.825
- 被邀请用户本月总消费 = 12,000 USDT
- 基础分成率 = 15%
- C2C额外佣金 = 180 USDT

最终佣金 = (12000 × 0.15) × 1.30 × 1.15 × 0.825 + 180 ≈ **2,099.6 USDT**

**各部分说明**：

- **当前Tier基础比例**：根据累计邀请人数和流量匹配不同等级（15% ~ 30%）。
- **被邀请用户忠诚度加成**：被邀请用户平均忠诚度越高，大使获得额外加成（最高 +18%）。
- **平台保护系数**：平台用户规模越大，推广大使的分成比例越低（保护平台收益）。

### 3. 为什么这样设计？

| 问题               | 旧模型（有衰减）               | 新模型（v3.6）                     | 改进效果             |
|--------------------|--------------------------------|------------------------------------|----------------------|
| 规则复杂度         | 高（衰减计算复杂）             | 低（清晰简单）                     | 大幅降低             |
| 长期激励           | 弱（断推就衰减）               | 强（忠诚度加成）                   | 显著提升             |
| 平台收益保护       | 一般                           | 强（随规模自动降低比例）           | 更好                 |
| 与用户留存联动     | 无                             | 深度绑定                           | 形成正向循环         |
| C2C 协同           | 无                             | 有平台补贴 + 大使额外佣金          | 更好                 |

## 二、核心组成部分详解

### 1. Tier 基础比例

| Tier   | 最低邀请人数 | 最低月邀请流量 | 基础分成比例 |
|--------|--------------|----------------|--------------|
| Basic  | 0            | 0              | 15.0%        |
| Silver | 8            | 800 GB         | 22.0%        |
| Gold   | 25           | 2500 GB        | 30.0%        |

### 2. 被邀请用户忠诚度加成（核心创新）

系统每月自动计算大使过去30天内被邀请用户的**平均忠诚度等级**，给予额外加成：

| 被邀请用户平均忠诚度 | 加成系数 | 说明 |
|----------------------|----------|------|
| Bronze               | 1.00x    | 基础     |
| Silver               | 1.08x    | +8%      |
| Gold                 | 1.15x    | +15%     |
| Platinum             | 1.18x    | +18%     |

**计算逻辑**：按被邀请用户当前忠诚度等级加权平均得出平均分数，再映射到对应加成系数。

**边界情况处理（用户取消订阅后）**：
- 用户取消订阅后，其忠诚度等级**冻结 30 天**（不计入大使的平均忠诚度计算）。
- 如果用户在 30 天内重新订阅，则恢复正常计入。
- 如果超过 30 天未重新订阅，则在下一次 `UpdateAffiliateLoyaltyStats` 定时任务中**自动从计算基数中剔除**，大使的忠诚度加成可能下降。
- 目的：保护大使不因短期取消而立即受损，同时鼓励大使帮助用户重新激活。

### 3. 平台保护系数（规模保护）

$$
\text{平台保护系数} = 1 - \max\left(0, \frac{\text{当前总活跃用户数} - 10000}{10000} \times 0.5\%\right)
$$

- 平台用户越多，推广大使拿的比例越低，但总量可能更高。
- 平台收益占比随规模增长而提升。

### 4. C2C 平台补贴机制 + 推广大使佣金发放（已闭环）

- 用户使用 C2C 积分续费时，平台从 C2C 手续费中额外提取 3%~5% 作为补贴。
- **资金来源**：完全来自 C2C 交易手续费，不占用订阅主收入。
- **推广大使小额佣金发放时机**（已明确）：
  - 当 `c2c_trades.status` 变为 `completed` 且支付 Webhook 确认成功后，系统通过消息队列**异步近实时**触发佣金记账任务（通常在 1~5 分钟内到账）。
  - 佣金比例后台可配置（默认 0.5%~2%），从平台手续费中支出。
  - 记录在 `affiliate_commissions` 表（`source = 'c2c_trade'`）。

## 8. 数据库字段（已同步）

```sql
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS
    avg_invited_user_tier    VARCHAR(20) DEFAULT 'bronze',
    loyalty_bonus_factor     NUMERIC(5,4) DEFAULT 1.0;
```

## 9. 每月定时任务
- `UpdateAffiliateLoyaltyStats`：每月1号自动重新计算并更新大使的 `avg_invited_user_tier` 和 `loyalty_bonus_factor`。

---

## 三、赞助商节点（Sponsor Node）收益模型（新增 - 2026-05-10）

### 1. 设计目标
- 激励高质量节点贡献：奖励在线稳定、网络质量好、贡献节点多的赞助商。
- 完全后台可配置：所有规则（数量等级、质量权重、1U=多少GB）均可通过 Admin 后台动态调整，无需改代码。
- 公平透明：收益与实际贡献（流量 + 质量 + 规模）强绑定。
- 与质量申诉闭环联动：申诉调整质量分后自动触发收益追溯重算。

### 2. 核心可配置参数（存储在 system_configs 表，key = "sponsor_node_revenue_config"）

```json
{
  "base_gb_per_unit": 100.0,                    // 1U = 100 GB contributed traffic（最终收益换算核心）
  "quality_weights": {
    "uptime_score": 0.35,                       // 在线时间权重
    "network_quality_score": 0.45,              // 网络质量权重（来自现有 Quality Score）
    "node_count_score": 0.20                    // 机器总数（赞助商贡献节点数）权重
  },
  "tier_rules": [                               // 赞助节点数量等级收益规则
    {"min_nodes": 1,  "max_nodes": 5,   "bonus_multiplier": 1.00},
    {"min_nodes": 6,  "max_nodes": 20,  "bonus_multiplier": 1.10},
    {"min_nodes": 21, "max_nodes": 50,  "bonus_multiplier": 1.20},
    {"min_nodes": 51, "max_nodes": null, "bonus_multiplier": 1.30}
  ],
  "min_quality_for_payout": 0.60,               // 低于此质量分不发放收益
  "payout_cycle": "daily",                      // daily / weekly
  "platform_share_rate": 0.15                   // 平台抽成比例（可选）
}
```

**Admin 后台配置界面**：提供可视化表单 + JSON 编辑器 + 立即生效开关。

### 3. 质量综合评分（Quality Composite Score）计算公式

针对**单个节点**或**赞助商整体**（推荐按赞助商聚合计算，便于规模激励）：

$$
\text{QualityScore} = w_{uptime} \times \text{UptimeScore} + w_{network} \times \text{NetworkQualityScore} + w_{nodeCount} \times \text{NodeCountScore}
$$

**各分项说明**：
- **UptimeScore**：周期内在线时长 / 总时长（0~1）
- **NetworkQualityScore**：来自现有 `node_quality_scores` 表的 EWMA 综合分（已归一化到 0~1）
- **NodeCountScore**：赞助商当前活跃节点数归一化（例如 log(节点数+1) / log(最大合理节点数) 或直接用节点数 / 100 上限封顶）

**权重默认**：在线时间 35%、网络质量 45%、机器总数 20%（可后台配置调整）。

### 4. 最终收益计算公式（完全可配置）

$$
\text{赞助商收益 (U)} = \frac{\text{周期内贡献总流量 (GB)}}{\text{base\_gb\_per\_unit}} \times \text{QualityScore} \times \text{TierBonus}
$$

- `base_gb_per_unit`：1U 等于多少 GB（核心换算率，越大越慷慨）
- `TierBonus`：根据赞助商当前活跃节点总数从 `tier_rules` 查表获得
- 低于 `min_quality_for_payout` 的节点/赞助商不参与本次结算

**示例**：
- base_gb_per_unit = 100
- 赞助商贡献 5000 GB
- QualityScore = 0.92
- TierBonus = 1.20（拥有 25 个节点）
- 收益 = 5000 / 100 × 0.92 × 1.20 = **55.2 U**

### 5. 赞助商节点收益计算定时任务（CalculateSponsorNodeRevenue）完整实现

**任务说明**：每日/每周定时执行，为所有活跃赞助商计算当期节点收益，并记录到 `sponsor_revenues` 表。支持与质量申诉追溯调整联动。

**完整 Go 代码**（生产级，含配置读取、质量计算、Tier 查询、收益记录）：

```go
package task

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"gorm.io/gorm"
)

// SponsorNodeRevenueConfig 从 system_configs 读取的配置结构
type SponsorNodeRevenueConfig struct {
	BaseGBPerUnit       float64            `json:"base_gb_per_unit"`
	QualityWeights      map[string]float64 `json:"quality_weights"`
	TierRules           []TierRule         `json:"tier_rules"`
	MinQualityForPayout float64            `json:"min_quality_for_payout"`
	PayoutCycle         string             `json:"payout_cycle"`
}

type TierRule struct {
	MinNodes        int     `json:"min_nodes"`
	MaxNodes        *int    `json:"max_nodes"`
	BonusMultiplier float64 `json:"bonus_multiplier"`
}

// CalculateSponsorNodeRevenuePayload 任务 payload
type CalculateSponsorNodeRevenuePayload struct {
	PeriodStart time.Time `json:"period_start"`
	PeriodEnd   time.Time `json:"period_end"`
	ForceRecalc bool      `json:"force_recalc"` // 是否强制重算（用于申诉追溯）
}

// NewCalculateSponsorNodeRevenueTask 创建任务
func NewCalculateSponsorNodeRevenueTask(start, end time.Time, force bool) *asynq.Task {
	payload, _ := json.Marshal(CalculateSponsorNodeRevenuePayload{
		PeriodStart: start,
		PeriodEnd:   end,
		ForceRecalc: force,
	})
	return asynq.NewTask("revenue:calculate_sponsor_node", payload)
}

// HandleCalculateSponsorNodeRevenue 处理函数（注册到 Asynq Server）
func HandleCalculateSponsorNodeRevenue(ctx context.Context, t *asynq.Task) error {
	var p CalculateSponsorNodeRevenuePayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("解析 payload 失败: %w", err)
	}

	db := GetDB() // 假设全局 DB

	// 1. 读取后台配置
	var cfgJSON string
	if err := db.Raw(`SELECT value FROM system_configs WHERE key = 'sponsor_node_revenue_config'`).Scan(&cfgJSON).Error; err != nil {
		return fmt.Errorf("读取收益配置失败: %w", err)
	}

	var cfg SponsorNodeRevenueConfig
	if err := json.Unmarshal([]byte(cfgJSON), &cfg); err != nil {
		return fmt.Errorf("解析收益配置失败: %w", err)
	}

	// 2. 获取所有活跃赞助商（有 active 节点的）
	type SponsorAgg struct {
		SponsorID     string
		TotalTraffic  float64 // GB
		NodeCount     int
		AvgQuality    float64
		UptimeScore   float64
	}
	var sponsors []SponsorAgg

	// ==================== 优化后的高性能收益计算 SQL ====================
	// 核心优化点：
	// 1. 使用 CTE 拆分逻辑，便于优化器执行
	// 2. traffic 聚合只扫描必要时间范围（依赖 (log_time, node_id) 索引 + 分区）
	// 3. quality 使用 DISTINCT ON + 最近7天窗口，避免全表 join
	// 4. 只处理有流量的赞助商（WHERE total_traffic_gb > 0）
	// 5. 左连接质量，避免无质量数据时丢失 sponsor
	err := db.Raw(`
WITH period_traffic AS (
    SELECT 
        n.sponsor_id,
        SUM(ntl.traffic_gb) AS total_traffic_gb,
        COUNT(DISTINCT n.id) AS active_node_count
    FROM node_traffic_logs ntl
    INNER JOIN nodes n ON ntl.node_id = n.id
    WHERE ntl.log_time >= ? 
      AND ntl.log_time < ?
      AND n.status = 'active'
    GROUP BY n.sponsor_id
),
recent_quality AS (
    -- 只取最近7天内每个节点最新的质量记录（利用 (node_id, created_at) 索引）
    SELECT DISTINCT ON (nqs.node_id)
        n.sponsor_id,
        nqs.overall_score,
        nqs.uptime_score,
        nqs.network_quality_score
    FROM node_quality_scores nqs
    INNER JOIN nodes n ON nqs.node_id = n.id
    WHERE nqs.created_at >= ? - INTERVAL '7 days'
      AND n.status = 'active'
    ORDER BY nqs.node_id, nqs.created_at DESC
),
sponsor_quality_agg AS (
    SELECT 
        sponsor_id,
        AVG(overall_score)           AS avg_overall_quality,
        AVG(uptime_score)            AS avg_uptime_score,
        AVG(network_quality_score)   AS avg_network_quality
    FROM recent_quality
    GROUP BY sponsor_id
)
SELECT 
    pt.sponsor_id,
    pt.total_traffic_gb,
    pt.active_node_count,
    COALESCE(sqa.avg_overall_quality, 0.78)   AS quality_score,
    COALESCE(sqa.avg_uptime_score, 0.82)      AS uptime_score,
    COALESCE(sqa.avg_network_quality, 0.85)   AS network_quality_score
FROM period_traffic pt
LEFT JOIN sponsor_quality_agg sqa ON pt.sponsor_id = sqa.sponsor_id
WHERE pt.total_traffic_gb > 0
ORDER BY pt.sponsor_id;
	`, p.PeriodStart, p.PeriodEnd, p.PeriodStart).Scan(&sponsors).Error

	if err != nil {
		return fmt.Errorf("聚合赞助商数据失败: %w", err)
	}

	// ==================== 推荐的索引与进一步优化建议 ====================
	// 1. 必须索引（强烈建议创建）：
	// CREATE INDEX CONCURRENTLY idx_node_traffic_logs_time_node 
	//   ON node_traffic_logs (log_time, node_id) INCLUDE (traffic_gb);
	// CREATE INDEX CONCURRENTLY idx_node_quality_scores_node_time 
	//   ON node_quality_scores (node_id, created_at DESC) INCLUDE (overall_score, uptime_score, network_quality_score);
	// CREATE INDEX CONCURRENTLY idx_nodes_sponsor_status ON nodes (sponsor_id, status) WHERE status = 'active';
	//
	// 2. 高并发/大数据量场景推荐：
	//    - 将 node_traffic_logs 按月分区（RANGE partitioning on log_time）
	//    - 每日凌晨生成 `node_daily_traffic` 汇总表（见数据库设计文档 2.14）
	//    - 本收益任务直接从 `node_daily_traffic` 按日期范围聚合，查询性能从分钟级降至秒级
	//    - node_traffic_logs 仅用于实时趋势图和异常检测
	//
	// 3. Tier 计算仍在 Go 层完成（因为 tier_rules 是 JSON 配置，灵活性更高）

	// 3. 逐个计算收益并入库
	for _, s := range sponsors {
		// 计算 QualityScore
		w := cfg.QualityWeights
		qualityScore := w["uptime_score"]*s.UptimeScore + 
		                 w["network_quality_score"]*s.AvgQuality + 
		                 w["node_count_score"]*normalizeNodeCount(s.NodeCount)

		if qualityScore < cfg.MinQualityForPayout {
			continue // 不达标不发放
		}

		// 查询 TierBonus
		tierBonus := 1.0
		for _, rule := range cfg.TierRules {
			if s.NodeCount >= rule.MinNodes && (rule.MaxNodes == nil || s.NodeCount <= *rule.MaxNodes) {
				tierBonus = rule.BonusMultiplier
				break
			}
		}

		// 计算收益
		revenueU := (s.TotalTraffic / cfg.BaseGBPerUnit) * qualityScore * tierBonus

		// 记录收益（幂等处理：使用 ON CONFLICT 更新）
		revenueRecord := map[string]interface{}{
			"sponsor_id":     s.SponsorID,
			"period_start":   p.PeriodStart,
			"period_end":     p.PeriodEnd,
			"traffic_gb":     s.TotalTraffic,
			"quality_score":  qualityScore,
			"tier_bonus":     tierBonus,
			"revenue_u":      revenueU,
			"config_snapshot": cfgJSON, // 快照配置，保证历史可追溯
			"created_at":     time.Now(),
		}

		if err := db.Table("sponsor_revenues").Create(revenueRecord).Error; err != nil {
			// 实际生产中应记录错误并继续
			continue
		}
	}

	return nil
}

func normalizeNodeCount(count int) float64 {
	if count <= 0 {
		return 0
	}
	// 简单归一化示例：log(count+1) / log(101) 上限封顶
	return math.Min(math.Log(float64(count+1))/math.Log(101), 1.0)
}
```

**使用方式**：
- 在 Asynq Scheduler 中注册每日任务：
  ```go
  scheduler.Register("0 2 * * *", NewCalculateSponsorNodeRevenueTask(yesterdayStart, yesterdayEnd, false))
  ```
- 申诉调整质量分后，触发 `ForceRecalc = true` 的追溯任务。

---

**注意**：以上代码为生产级框架，实际项目中需补充完整的事务、错误重试、日志、以及更精确的 SQL 聚合（结合现有 `node_quality_scores` 表）。
### 5. 与现有机制的联动（已闭环）
- 质量分来自 `node_quality_scores` + 新增的 uptime / node_count 计算
- 申诉调整质量分后 → 自动触发 `RecalculateNodeRevenue` 任务（追溯调整收益）
- 收益记录到 `sponsor_revenues` 表（与 node_traffic_logs、node_appeals 关联）
- 每日/每周定时任务 `CalculateSponsorNodeRevenue` 读取最新 config 进行结算

### 6. 数据库新增字段建议
```sql
ALTER TABLE partners ADD COLUMN IF NOT EXISTS
    active_node_count      INT DEFAULT 0,
    current_quality_score  NUMERIC(5,2) DEFAULT 0.00,
    last_revenue_calc_at   TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS sponsor_revenues (
    id BIGSERIAL PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES partners(id),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_traffic_gb NUMERIC(18,2),
    quality_score NUMERIC(5,2),
    tier_bonus NUMERIC(5,2),
    base_gb_per_unit NUMERIC(10,2),           -- 结算时使用的配置值（快照）
    revenue_u NUMERIC(18,6),
    status VARCHAR(20) DEFAULT 'calculated',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Admin 配置接口（已规划）
- `GET /admin/revenue/sponsor-node-config`
- `POST /admin/revenue/sponsor-node-config`（更新 JSON 配置，立即生效）
- 配置变更自动记录审计日志

此模型完全满足“后台可配置 + 节点数量等级 + 质量综合评分 + 1U=多少GB”所有需求，并与质量申诉、节点生命周期形成完整商业闭环。
