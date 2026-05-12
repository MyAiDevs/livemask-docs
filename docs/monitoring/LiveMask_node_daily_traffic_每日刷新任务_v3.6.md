# LiveMask node_daily_traffic 每日刷新任务 v3.6

## 1. 任务目标
每日凌晨将前一天 `node_traffic_logs` 的明细数据聚合到 `node_daily_traffic` 汇总表，实现收益计算和质量评分的高性能查询。

## 2. 完整 Go 实现（Asynq + 幂等）

```go
package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

type DailyTrafficRefreshPayload struct {
	TargetDate string `json:"target_date"` // YYYY-MM-DD
}

func NewDailyTrafficRefreshTask(targetDate time.Time) (*asynq.Task, error) {
	payload, _ := json.Marshal(DailyTrafficRefreshPayload{
		TargetDate: targetDate.Format("2006-01-02"),
	})
	return asynq.NewTask("node:daily_traffic_refresh", payload, asynq.MaxRetry(3)), nil
}

func HandleDailyTrafficRefresh(ctx context.Context, t *asynq.Task) error {
	var p DailyTrafficRefreshPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("unmarshal payload failed: %w", err)
	}

	targetDate, err := time.Parse("2006-01-02", p.TargetDate)
	if err != nil {
		return fmt.Errorf("invalid target_date: %w", err)
	}

	db := ctx.Value("db").(*pgxpool.Pool) // 从 context 获取连接池
	logger := ctx.Value("logger").(*zap.Logger)

	start := targetDate
	end := targetDate.AddDate(0, 0, 1)

	query := `
		INSERT INTO node_daily_traffic (
			node_id, sponsor_id, traffic_date,
			total_traffic_gb, upload_gb, download_gb,
			peak_bandwidth_mbps, avg_connection_count, total_uptime_seconds
		)
		SELECT 
			n.id,
			n.sponsor_id,
			?::date,
			COALESCE(SUM(ntl.traffic_gb), 0),
			COALESCE(SUM(ntl.upload_gb), 0),
			COALESCE(SUM(ntl.download_gb), 0),
			MAX(ntl.peak_bandwidth_mbps),
			AVG(ntl.connection_count)::int,
			EXTRACT(EPOCH FROM SUM(CASE WHEN ntl.status = 'online' THEN ntl.duration ELSE INTERVAL '0' END))::bigint
		FROM nodes n
		LEFT JOIN node_traffic_logs ntl 
			ON ntl.node_id = n.id 
			AND ntl.log_time >= ? 
			AND ntl.log_time < ?
		WHERE n.status = 'active'
		GROUP BY n.id, n.sponsor_id
		ON CONFLICT (node_id, traffic_date) 
		DO UPDATE SET
			total_traffic_gb = EXCLUDED.total_traffic_gb,
			upload_gb = EXCLUDED.upload_gb,
			download_gb = EXCLUDED.download_gb,
			peak_bandwidth_mbps = EXCLUDED.peak_bandwidth_mbps,
			avg_connection_count = EXCLUDED.avg_connection_count,
			total_uptime_seconds = EXCLUDED.total_uptime_seconds,
			updated_at = NOW();
	`

	_, err = db.Exec(ctx, query, start, start, end)
	if err != nil {
		logger.Error("daily traffic refresh failed", zap.Error(err), zap.String("date", p.TargetDate))
		return err
	}

	logger.Info("daily traffic refresh completed", zap.String("date", p.TargetDate))
	return nil
}
```

**注册 Scheduler（每天凌晨 2:00 执行前一天数据）**：
```go
scheduler := asynq.NewScheduler(redisClient, nil)
scheduler.Register("@daily", NewDailyTrafficRefreshTask(time.Now().AddDate(0,0,-1)))
```

## 3. 幂等与容错设计
- 使用 `ON CONFLICT (node_id, traffic_date) DO UPDATE` 实现完全幂等，可安全重跑。
- 支持补跑任意历史日期（传入不同 target_date）。
- 大数据量时可增加 `LIMIT` + 游标分批处理（生产环境建议）。

## 4. 与收益计算联动
收益定时任务直接从 `node_daily_traffic` 聚合，性能从分钟级降至秒级。
```sql
SELECT sponsor_id, SUM(total_traffic_gb) 
FROM node_daily_traffic 
WHERE traffic_date BETWEEN ? AND ?
GROUP BY sponsor_id;
```

---

**注意**：生产环境建议对 `node_traffic_logs` 按月 RANGE 分区，`node_daily_traffic` 也建议按月分区。
