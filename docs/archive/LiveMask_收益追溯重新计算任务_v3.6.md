# LiveMask 收益追溯重新计算任务 v3.6

**最后更新**：2026-05-10

## 1. 任务说明

当管理员在审核节点申诉时调整了 `score_adjustment` 后，需要异步触发该任务，重新计算受影响时间段内该节点的收益，并进行补发或扣除。

推荐使用 **Asynq**（基于 Redis 的任务队列）或简单 cron + goroutine 实现。

## 2. 核心代码实现（task/recalculate_revenue.go）

```go
package task

import (
	"context"
	"time"

	"github.com/hibiken/asynq"
	"github.com/google/uuid"
	"live-mask-backend/internal/repository"
	"live-mask-backend/internal/service"
)

const TypeRecalculateNodeRevenue = "revenue:recalculate_node"

type RecalculateNodeRevenuePayload struct {
	NodeID                uuid.UUID `json:"node_id"`
	EffectiveFrom         time.Time `json:"effective_from"`
	AdjustmentAmount      float64   `json:"adjustment_amount"` // 正数补发，负数扣除
	AppealID              uuid.UUID `json:"appeal_id"`
}

func NewRecalculateNodeRevenueTask(nodeID uuid.UUID, effectiveFrom time.Time, adjustment float64, appealID uuid.UUID) (*asynq.Task, error) {
	payload := RecalculateNodeRevenuePayload{
		NodeID:           nodeID,
		EffectiveFrom:    effectiveFrom,
		AdjustmentAmount: adjustment,
		AppealID:         appealID,
	}
	return asynq.NewTask(TypeRecalculateNodeRevenue, payload)
}

func HandleRecalculateNodeRevenue(ctx context.Context, t *asynq.Task) error {
	var p RecalculateNodeRevenuePayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return err
	}

	// 1. 获取受影响期间的原始收益记录
	revenueRepo := repository.NewNodeRevenueRepository()
	records, err := revenueRepo.GetRecordsByNodeAndTimeRange(ctx, p.NodeID, p.EffectiveFrom, time.Now())
	if err != nil {
		return err
	}

	// 2. 重新计算并生成调整记录
	revenueService := service.NewRevenueService()
	for _, record := range records {
		adjustedAmount := record.OriginalAmount * (p.AdjustmentAmount / 100) // 示例：按百分比调整
		// 创建调整记录
		adjustment := &model.NodeRevenueAdjustment{
			NodeID:     p.NodeID,
			Period:     record.Period,
			Amount:     adjustedAmount,
			Reason:     "appeal_adjustment",
			AppealID:   &p.AppealID,
			CreatedAt:  time.Now(),
		}
		if err := revenueRepo.CreateAdjustment(ctx, adjustment); err != nil {
			return err
		}
	}

	// 3. 更新节点累计收益
	if err := revenueService.ApplyRevenueAdjustment(ctx, p.NodeID, p.AdjustmentAmount); err != nil {
		return err
	}

	return nil
}
```

## 3. 队列集成建议

在 Admin Review Appeal Handler 中，成功调整质量分后：

```go
task, _ := task.NewRecalculateNodeRevenueTask(nodeID, effectiveFrom, scoreAdjustment, appealID)
client.Enqueue(task, asynq.Queue("revenue"), asynq.MaxRetry(3))
```

---

**注意**：实际生产中建议使用更精确的收益计算公式（参考 `收益模型优化建议` 文档中的 Final Revenue 公式）。
