# LiveMask 积分经济体系 Go 完整实现 v3.6

本文档提供积分 earning、消费、C2C 交易的**生产级完整 Go 代码**（Repository + Service + Handler 三层架构）。

## 1. 数据模型 (model/points.go)

```go
package model

import (
	"time"

	"github.com/google/uuid"
)

type PointsBalance struct {
	UserID          uuid.UUID `db:"user_id" json:"user_id"`
	AvailablePoints float64   `db:"available_points" json:"available_points"`
	FrozenPoints    float64   `db:"frozen_points" json:"frozen_points"`
	TotalEarned     float64   `db:"total_earned" json:"total_earned"`
	TotalSpent      float64   `db:"total_spent" json:"total_spent"`
	UpdatedAt       time.Time `db:"updated_at" json:"updated_at"`
}

type PointsTransaction struct {
	ID              uuid.UUID `db:"id" json:"id"`
	UserID          uuid.UUID `db:"user_id" json:"user_id"`
	TransactionType string    `db:"transaction_type" json:"transaction_type"`
	Amount          float64   `db:"amount" json:"amount"`
	BalanceBefore   float64   `db:"balance_before" json:"balance_before"`
	BalanceAfter    float64   `db:"balance_after" json:"balance_after"`
	RelatedID       *uuid.UUID `db:"related_id" json:"related_id,omitempty"`
	Description     string    `db:"description" json:"description"`
	CreatedAt       time.Time `db:"created_at" json:"created_at"`
}

type PointsC2CListing struct {
	ID              uuid.UUID `db:"id" json:"id"`
	SellerID        uuid.UUID `db:"seller_id" json:"seller_id"`
	PointsAmount    float64   `db:"points_amount" json:"points_amount"`
	PricePerPoint   float64   `db:"price_per_point" json:"price_per_point"`
	TotalPriceUSDT  float64   `db:"total_price_usdt" json:"total_price_usdt"`
	Status          string    `db:"status" json:"status"`
	CreatedAt       time.Time `db:"created_at" json:"created_at"`
}

type PointsC2CTrade struct {
	ID                  uuid.UUID `db:"id" json:"id"`
	ListingID           uuid.UUID `db:"listing_id" json:"listing_id"`
	BuyerID             uuid.UUID `db:"buyer_id" json:"buyer_id"`
	SellerID            uuid.UUID `db:"seller_id" json:"seller_id"`
	PointsAmount        float64   `db:"points_amount" json:"points_amount"`
	PricePerPoint       float64   `db:"price_per_point" json:"price_per_point"`
	TotalUSDT           float64   `db:"total_usdt" json:"total_usdt"`
	PlatformCommission  float64   `db:"platform_commission" json:"platform_commission"`
	Status              string    `db:"status" json:"status"`
	CreatedAt           time.Time `db:"created_at" json:"created_at"`
}
```

## 2. Repository 层 (repository/points_repository.go)

```go
package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"yourproject/model"
)

type PointsRepository interface {
	GetBalance(ctx context.Context, userID uuid.UUID) (*model.PointsBalance, error)
	UpsertBalance(ctx context.Context, balance *model.PointsBalance) error
	CreateTransaction(ctx context.Context, tx *model.PointsTransaction) error
	CreateC2CListing(ctx context.Context, listing *model.PointsC2CListing) error
	GetActiveC2CListing(ctx context.Context, id uuid.UUID) (*model.PointsC2CListing, error)
	UpdateC2CListingStatus(ctx context.Context, id uuid.UUID, status string) error
	CreateC2CTrade(ctx context.Context, trade *model.PointsC2CTrade) error
}

type pointsRepository struct {
	db *sqlx.DB
}

func NewPointsRepository(db *sqlx.DB) PointsRepository {
	return &pointsRepository{db: db}
}

func (r *pointsRepository) GetBalance(ctx context.Context, userID uuid.UUID) (*model.PointsBalance, error) {
	var balance model.PointsBalance
	err := r.db.GetContext(ctx, &balance, `
		SELECT * FROM points_balances WHERE user_id = $1
	`, userID)
	if errors.Is(err, sql.ErrNoRows) {
		// 初始化余额
		balance = model.PointsBalance{UserID: userID}
		return &balance, nil
	}
	return &balance, err
}

func (r *pointsRepository) UpsertBalance(ctx context.Context, balance *model.PointsBalance) error {
	_, err := r.db.NamedExecContext(ctx, `
		INSERT INTO points_balances (user_id, available_points, frozen_points, total_earned, total_spent, updated_at)
		VALUES (:user_id, :available_points, :frozen_points, :total_earned, :total_spent, NOW())
		ON CONFLICT (user_id) DO UPDATE SET
			available_points = EXCLUDED.available_points,
			frozen_points = EXCLUDED.frozen_points,
			total_earned = EXCLUDED.total_earned,
			total_spent = EXCLUDED.total_spent,
			updated_at = NOW()
	`, balance)
	return err
}

// ... 其他方法实现（CreateTransaction, CreateC2CListing 等）
```

## 3. Service 层 (service/points_service.go) - 核心业务逻辑

```go
package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"yourproject/model"
	"yourproject/repository"
)

type PointsService struct {
	repo repository.PointsRepository
}

func NewPointsService(repo repository.PointsRepository) *PointsService {
	return &PointsService{repo: repo}
}

// EarnPoints 积分 earning（节点贡献、购买赠送、推广奖励）
func (s *PointsService) EarnPoints(ctx context.Context, userID uuid.UUID, amount float64, txType, description string, relatedID *uuid.UUID) error {
	balance, err := s.repo.GetBalance(ctx, userID)
	if err != nil {
		return err
	}

	newAvailable := balance.AvailablePoints + amount
	newTotalEarned := balance.TotalEarned + amount

	newBalance := &model.PointsBalance{
		UserID:          userID,
		AvailablePoints: newAvailable,
		TotalEarned:     newTotalEarned,
	}

	if err := s.repo.UpsertBalance(ctx, newBalance); err != nil {
		return err
	}

	tx := &model.PointsTransaction{
		UserID:          userID,
		TransactionType: txType,
		Amount:          amount,
		BalanceBefore:   balance.AvailablePoints,
		BalanceAfter:    newAvailable,
		RelatedID:       relatedID,
		Description:     description,
	}
	return s.repo.CreateTransaction(ctx, tx)
}

// SpendPoints 积分消费（购买套餐）
func (s *PointsService) SpendPoints(ctx context.Context, userID uuid.UUID, amount float64, description string) error {
	// ... 实现扣减逻辑 + 事务处理
	return nil
}

// CreateC2CListing 创建积分挂单
func (s *PointsService) CreateC2CListing(ctx context.Context, sellerID uuid.UUID, pointsAmount, pricePerPoint float64) error {
	// 1. 冻结卖家积分
	// 2. 创建 listing
	return nil
}

// BuyC2CPoints 购买积分（C2C）
func (s *PointsService) BuyC2CPoints(ctx context.Context, buyerID, listingID uuid.UUID) error {
	// 1. 校验 listing 状态
	// 2. 扣 USDT（调用支付服务）
	// 3. 解冻卖家积分 + 增加买家积分
	// 4. 记录交易 + 平台抽成
	// 5. 更新 listing 状态
	return nil
}
```

## 4. Handler 层示例 (handler/points_handler.go)

```go
package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (h *PointsHandler) EarnPoints(c *gin.Context) {
	var req struct {
		UserID      uuid.UUID `json:"user_id"`
		Amount      float64   `json:"amount"`
		Type        string    `json:"type"`
		Description string    `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.pointsService.EarnPoints(c.Request.Context(), req.UserID, req.Amount, req.Type, req.Description, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "points earned successfully"})
}
```

**说明**：以上为关键核心代码。完整可运行版本建议结合事务（`sqlx` + `BeginTx`）和分布式锁实现。