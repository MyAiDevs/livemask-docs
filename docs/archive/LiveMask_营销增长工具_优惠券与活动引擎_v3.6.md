# LiveMask 营销增长工具 - 优惠券与活动引擎 v3.6

## 1. 数据库表结构

```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('percentage', 'fixed_amount')),
    value NUMERIC(10,2),
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    target_plan_ids JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(30), -- 'holiday', 'referral', 'limited_time'
    config JSONB,     -- 活动规则
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);
```

## 2. 核心 API 接口

### 2.1 验证优惠券
```go
// POST /api/v1/coupons/validate
func (h *Handler) ValidateCoupon(c *gin.Context) {
    var req struct {
        Code   string    `json:"code"`
        PlanID uuid.UUID `json:"plan_id"`
    }
    // ... 验证逻辑 + 返回折扣后价格
}
```

### 2.2 活动配置（Admin）
```go
// Admin 创建限时活动
type CreateCampaignRequest struct {
    Name   string          `json:"name"`
    Type   string          `json:"type"`
    Config json.RawMessage `json:"config"` // 例如：{ "discount": 30, "target_tags": ["game"] }
}
```

## 3. 推荐奖励机制（普通用户）

- 邀请人获得 **20% 佣金**（首月）
- 被邀请人获得 **首月 5 折**
- 后台可配置阶梯奖励（邀请 5 人、10 人解锁更高奖励）

**完整文件已保存至**：`docs/LiveMask_营销增长工具_优惠券与活动引擎_v3.6.md`
