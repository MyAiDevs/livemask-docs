# LiveMask 推广大使收益计算定时任务 v3.6

**最后更新**：2026-05-10

## 1. 任务概述

每月 1 日凌晨自动执行，计算上个月所有推广大使的佣金，并支持申诉后的追溯重算。

## 2. 核心逻辑

1. 读取 `system_configs.promoter_revenue_config` 配置
2. 统计每个大使上月被邀请用户的消费总额
3. 计算 TierMultiplier（根据邀请活跃人数 + 月贡献流量）
4. 计算 LoyaltyBonus（被邀请用户平均忠诚度等级）
5. 计算 PlatformProtectionFactor（随平台用户增长逐步降低）
6. 计算 C2C 额外佣金
7. 最终佣金入库 `affiliate_commissions`
8. 支持申诉后强制重跑某位大使的计算

## 3. 完整 Go 代码实现（Asynq + GORM）

```go
package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"gorm.io/gorm"
)

type PromoterRevenuePayload struct {
	YearMonth     string `json:"year_month"`      // "2026-04"
	ForceAmbassadorID *string `json:"force_ambassador_id,omitempty"` // 申诉时指定某位大使重算
}

func NewPromoterRevenueTask(yearMonth string, forceAmbassadorID *string) *asynq.Task {
	payload, _ := json.Marshal(PromoterRevenuePayload{
		YearMonth:         yearMonth,
		ForceAmbassadorID: forceAmbassadorID,
	})
	return asynq.NewTask("promoter:revenue:calculate", payload)
}

func HandlePromoterRevenueCalculation(ctx context.Context, t *asynq.Task) error {
	var p PromoterRevenuePayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("unmarshal payload: %w", err)
	}

	db := GetDBFromContext(ctx) // 从 context 获取 DB

	// 1. 读取配置
	var configJSON string
	db.Raw(`SELECT value FROM system_configs WHERE key = 'promoter_revenue_config'`).Scan(&configJSON)

	var cfg struct {
		BaseCommissionRate float64 `json:"base_commission_rate"`
		TierRules          []struct {
			Tier                 string  `json:"tier"`
			MinInvitedActive     int     `json:"min_invited_active"`
			MinMonthlyTrafficGB  int     `json:"min_monthly_traffic_gb"`
			Multiplier           float64 `json:"multiplier"`
		} `json:"tier_rules"`
		LoyaltyBonus         map[string]float64 `json:"loyalty_bonus"`
		PlatformProtection   struct {
			BaseUserCount    int     `json:"base_user_count"`
			ReductionPer10k  float64 `json:"reduction_per_10k"`
			MaxReduction     float64 `json:"max_reduction"`
		} `json:"platform_protection"`
		C2CExtraRate float64 `json:"c2c_extra_commission_rate"`
	}
	json.Unmarshal([]byte(configJSON), &cfg)

	// 2. 获取所有大使（或指定大使）
	query := db.Table("ambassadors").
		Select("ambassadors.id, ambassadors.user_id, ambassadors.current_tier, ambassadors.avg_invited_user_tier, ambassadors.loyalty_bonus_factor")

	if p.ForceAmbassadorID != nil {
		query = query.Where("ambassadors.id = ?", *p.ForceAmbassadorID)
	}

	rows, err := query.Rows()
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var amb struct {
			ID                  string
			UserID              string
			CurrentTier         string
			AvgInvitedUserTier  string
			LoyaltyBonusFactor  float64
		}
		rows.Scan(&amb.ID, &amb.UserID, &amb.CurrentTier, &amb.AvgInvitedUserTier, &amb.LoyaltyBonusFactor)

		// 3. 统计上月被邀请用户消费
		var totalConsumption float64
		db.Raw(`
			SELECT COALESCE(SUM(amount_usdt), 0)
			FROM user_subscriptions us
			JOIN users u ON us.user_id = u.id
			WHERE u.invited_by_ambassador_id = ? 
			  AND us.period_start >= ? 
			  AND us.period_start < ?
		`, amb.UserID, startOfMonth(p.YearMonth), endOfMonth(p.YearMonth)).Scan(&totalConsumption)

		// 4. 计算 TierMultiplier
		tierMultiplier := getTierMultiplier(amb.CurrentTier, cfg.TierRules)

		// 5. LoyaltyBonus
		loyaltyBonus := cfg.LoyaltyBonus[amb.AvgInvitedUserTier]
		if loyaltyBonus == 0 {
			loyaltyBonus = 1.0
		}

		// 6. PlatformProtectionFactor
		totalActiveUsers := getTotalActiveUsers(db, p.YearMonth)
		platformFactor := calculatePlatformProtection(totalActiveUsers, cfg.PlatformProtection)

		// 7. C2C 额外佣金
		var c2cExtra float64
		db.Raw(`
			SELECT COALESCE(SUM(commission_amount), 0)
			FROM c2c_trades
			WHERE promoter_id = ? AND status = 'completed'
			  AND created_at >= ? AND created_at < ?
		`, amb.UserID, startOfMonth(p.YearMonth), endOfMonth(p.YearMonth)).Scan(&c2cExtra)

		// 8. 最终佣金
		baseCommission := totalConsumption * cfg.BaseCommissionRate
		finalCommission := baseCommission * tierMultiplier * loyaltyBonus * platformFactor + c2cExtra

		// 9. 入库（幂等）
		db.Exec(`
			INSERT INTO affiliate_commissions 
			(ambassador_id, year_month, total_consumption, base_commission, tier_multiplier, 
			 loyalty_bonus, platform_factor, c2c_extra, final_commission, calculated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
			ON CONFLICT (ambassador_id, year_month) 
			DO UPDATE SET 
				total_consumption = EXCLUDED.total_consumption,
				final_commission = EXCLUDED.final_commission,
				calculated_at = NOW()
		`, amb.ID, p.YearMonth, totalConsumption, baseCommission, tierMultiplier,
			loyaltyBonus, platformFactor, c2cExtra, finalCommission)
	}

	return nil
}

func getTierMultiplier(currentTier string, rules []struct{...}) float64 {
	// 根据当前 tier 返回 multiplier
	for _, r := range rules {
		if r.Tier == currentTier {
			return r.Multiplier
		}
	}
	return 1.0
}

func calculatePlatformProtection(totalUsers int, cfg struct{...}) float64 {
	if totalUsers <= cfg.BaseUserCount {
		return 1.0
	}
	reduction := float64((totalUsers-cfg.BaseUserCount)/10000) * cfg.ReductionPer10k
	if reduction > cfg.MaxReduction {
		reduction = cfg.MaxReduction
	}
	return 1.0 - reduction
}
```

---

**Scheduler 注册示例**（在 `cmd/server/main.go`）：

```go
scheduler := asynq.NewScheduler(redisClient, &asynq.SchedulerOpts{})
scheduler.Register("@monthly", NewPromoterRevenueTask(time.Now().AddDate(0, -1, 0).Format("2006-01"), nil))
```

---

此任务已与 `node_appeals` / `affiliate_appeals` 联动，管理员审核通过后可触发 `ForceAmbassadorID` 重算。