# LiveMask 积分经济体系 API 接口与 Go 实现 v3.6

**最后更新**：2026-05-10

## 一、核心 API 接口列表

### 1. 用户积分相关接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/user/points/balance` | 获取当前积分余额 | User JWT |
| GET | `/user/points/transactions` | 获取积分流水（分页） | User JWT |
| POST | `/user/points/spend` | 使用积分购买套餐（混合支付） | User JWT |

### 2. C2C 积分交易接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/user/points/c2c/listings` | 上架积分出售 | User JWT |
| GET | `/user/points/c2c/listings` | 获取积分 C2C 市场列表 | User JWT |
| POST | `/user/points/c2c/listings/{id}/buy` | 购买积分 | User JWT |
| POST | `/user/points/c2c/listings/{id}/cancel` | 取消上架 | User JWT |

### 3. 内部调用接口（服务间）

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/internal/points/earn` | 增加积分（节点贡献、购买赠送、推广奖励） | Internal Service Token |
| POST | `/internal/points/adjust` | 管理员调整积分（申诉追溯） | Admin |

---

## 二、Go 代码实现示例（三层架构）

### 1. Model 定义

```go
// model/points.go
type UserPoints struct {
    UserID     uuid.UUID `json:"user_id" gorm:"primaryKey"`
    Balance    int64     `json:"balance"`
    UpdatedAt  time.Time `json:"updated_at"`
}

type PointsTransaction struct {
    ID          uuid.UUID `json:"id" gorm:"primaryKey"`
    UserID      uuid.UUID `json:"user_id"`
    Amount      int64     `json:"amount"`      // 正数为获得，负数为消费
    Type        string    `json:"type"`        // earn, spend, c2c_sell, c2c_buy, admin_adjust
    RelatedID   *uuid.UUID `json:"related_id"` // 关联的订阅ID、C2C交易ID等
    Description string    `json:"description"`
    CreatedAt   time.Time `json:"created_at"`
}

type PointsC2CListing struct {
    ID            uuid.UUID `json:"id"`
    SellerID      uuid.UUID `json:"seller_id"`
    Amount        int64     `json:"amount"`      // 出售积分数量
    PriceUSDT     float64   `json:"price_usdt"`  // 总价 USDT
    Status        string    `json:"status"`      // active, sold, cancelled
    CreatedAt     time.Time `json:"created_at"`
    SoldAt        *time.Time `json:"sold_at"`
}
```

### 2. Repository 层

```go
// repository/points_repository.go
func (r *PointsRepository) GetBalance(ctx context.Context, userID uuid.UUID) (int64, error) {
    var points UserPoints
    err := r.db.WithContext(ctx).First(&points, "user_id = ?", userID).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return 0, nil
        }
        return 0, err
    }
    return points.Balance, nil
}

func (r *PointsRepository) AddPoints(ctx context.Context, userID uuid.UUID, amount int64, txType string, relatedID *uuid.UUID, desc string) error {
    return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        // 1. 更新余额
        result := tx.Model(&UserPoints{}).
            Where("user_id = ?", userID).
            Update("balance", gorm.Expr("balance + ?", amount))
        
        if result.RowsAffected == 0 {
            // 不存在则创建
            tx.Create(&UserPoints{UserID: userID, Balance: amount})
        }

        // 2. 记录流水
        tx.Create(&PointsTransaction{
            UserID:      userID,
            Amount:      amount,
            Type:        txType,
            RelatedID:   relatedID,
            Description: desc,
        })
        return nil
    })
}
```

### 3. Service 层（核心业务逻辑）

```go
// service/points_service.go
func (s *PointsService) EarnPoints(ctx context.Context, req EarnPointsRequest) error {
    // 校验来源（节点贡献、购买赠送、推广奖励等）
    return s.repo.AddPoints(ctx, req.UserID, req.Amount, req.Type, req.RelatedID, req.Description)
}

func (s *PointsService) SpendPointsForSubscription(ctx context.Context, userID uuid.UUID, pointsToSpend int64, subscriptionID uuid.UUID) error {
    balance, _ := s.repo.GetBalance(ctx, userID)
    if balance < pointsToSpend {
        return errors.New("积分余额不足")
    }
    return s.repo.AddPoints(ctx, userID, -pointsToSpend, "spend_subscription", &subscriptionID, "使用积分购买套餐")
}

func (s *PointsService) CreateC2CListing(ctx context.Context, sellerID uuid.UUID, amount int64, priceUSDT float64) (*PointsC2CListing, error) {
    // 风控检查：每日上架次数、持有限制等
    if err := s.riskControl.CheckC2CListing(sellerID, amount); err != nil {
        return nil, err
    }
    listing := &PointsC2CListing{
        SellerID:  sellerID,
        Amount:    amount,
        PriceUSDT: priceUSDT,
        Status:    "active",
    }
    return s.c2cRepo.Create(ctx, listing)
}

func (s *PointsService) BuyC2CListing(ctx context.Context, buyerID, listingID uuid.UUID) error {
    // 1. 锁定 listing
    // 2. 扣除买家 USDT（调用支付服务）
    // 3. 增加买家积分
    // 4. 扣除卖家积分 + 平台抽成
    // 5. 记录交易 + 平台收益
    return s.c2cRepo.ExecuteTrade(ctx, buyerID, listingID)
}
```

### 4. Handler 示例

```go
// handler/points_handler.go
func (h *PointsHandler) CreateC2CListing(c *gin.Context) {
    var req struct {
        Amount    int64   `json:"amount" binding:"required,gt=0"`
        PriceUSDT float64 `json:"price_usdt" binding:"required,gt=0"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    userID := middleware.GetUserID(c)
    listing, err := h.pointsService.CreateC2CListing(c.Request.Context(), userID, req.Amount, req.PriceUSDT)
    if err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, listing)
}
```

---

## 三、与现有系统的联动

- **订阅购买**：支持 USDT + 积分混合支付
- **节点收益**：USDT + 积分双轨发放
- **推广大使**：佣金 + 积分双收益
- **质量申诉**：可追溯调整积分余额

此文档已与 `LiveMask_积分经济体系_API与Go实现_v3.6.md` 保持一致。
