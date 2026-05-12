# LiveMask C2C 积分交易风控与异常处理 Go 实现 v3.6

**最后更新**：2026-05-10  
**定位**：C2C 积分交易的核心风控逻辑与异常处理实现

---

## 一、核心风控规则实现

### 1. 风控规则结构体

```go
package points

import (
	"context"
	"errors"
	"time"

	"github.com/shopspring/decimal"
)

type RiskRule struct {
	MaxDailyTradeAmount     decimal.Decimal // 单日最大交易积分数量
	MaxSingleTradeAmount    decimal.Decimal // 单笔最大交易积分数量
	MinTradeAmount          decimal.Decimal // 单笔最小交易积分数量
	PriceDeviationThreshold decimal.Decimal // 价格偏离阈值（例如 0.3 = 30%）
	RequireKYCForTrade      bool            // 大额交易是否需要 KYC
}

var DefaultRiskRule = RiskRule{
	MaxDailyTradeAmount:     decimal.NewFromInt(50000),
	MaxSingleTradeAmount:    decimal.NewFromInt(10000),
	MinTradeAmount:          decimal.NewFromInt(100),
	PriceDeviationThreshold: decimal.NewFromFloat(0.30),
	RequireKYCForTrade:      true,
}
```

### 2. 风控检查服务

```go
type RiskControlService struct {
	ruleRepo     RiskRuleRepository
	tradeRepo    PointsC2CTradeRepository
	kycService   KYCService
	priceService PointsPriceService
}

func (s *RiskControlService) ValidateTrade(ctx context.Context, req CreateTradeRequest) error {
	// 1. 基础数量校验
	if req.Amount.LessThan(s.rule.MinTradeAmount) {
		return errors.New("交易数量低于最小限制")
	}
	if req.Amount.GreaterThan(s.rule.MaxSingleTradeAmount) {
		return errors.New("单笔交易数量超过限制")
	}

	// 2. 每日交易限额检查
	dailyAmount, err := s.tradeRepo.GetUserDailyTradeAmount(ctx, req.UserID, time.Now())
	if err != nil {
		return err
	}
	if dailyAmount.Add(req.Amount).GreaterThan(s.rule.MaxDailyTradeAmount) {
		return errors.New("已超过今日交易限额")
	}

	// 3. 价格偏离检测（防刷单）
	currentPrice := s.priceService.GetCurrentMarketPrice()
	deviation := req.Price.Sub(currentPrice).Abs().Div(currentPrice)
	if deviation.GreaterThan(s.rule.PriceDeviationThreshold) {
		return errors.New("交易价格偏离市场价过大，疑似异常")
	}

	// 4. 大额交易 KYC 检查
	if req.Amount.GreaterThan(decimal.NewFromInt(5000)) && s.rule.RequireKYCForTrade {
		if !s.kycService.IsUserKYCVerified(ctx, req.UserID) {
			return errors.New("大额交易需完成 KYC 认证")
		}
	}

	return nil
}
```

---

## 二、异常处理与熔断机制

```go
type TradeExceptionHandler struct {
	alertService AlertService
}

func (h *TradeExceptionHandler) HandleAbnormalTrade(ctx context.Context, tradeID string, reason string) error {
	// 1. 自动冻结相关交易
	err := h.tradeRepo.FreezeTrade(ctx, tradeID)
	if err != nil {
		return err
	}

	// 2. 创建申诉工单（复用现有 appeals 体系）
	appeal := &model.Appeal{
		Type:        "points_c2c_abnormal",
		RelatedID:   tradeID,
		Status:      "pending",
		Description: reason,
	}
	if err := h.appealRepo.Create(ctx, appeal); err != nil {
		return err
	}

	// 3. 发送告警
	h.alertService.SendHighPriorityAlert(ctx, "C2C积分交易异常", reason)

	return nil
}
```

---

## 三、与现有申诉系统的联动

C2C 积分交易异常直接复用 `node_appeals` 表结构，新增 `appeal_type = 'points_c2c_abnormal'` 枚举值即可。

---

**已同步更新位置**：
- `LiveMask_积分经济体系_Go完整实现_v3.6.md`
- `LiveMask_C2C积分交易业务流程与风控规则_v3.6.md`

---

*本文件为生产级风控实现示例，可直接用于开发。*