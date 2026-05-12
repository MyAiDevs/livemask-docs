# LiveMask daily_country_traffic 每日聚合任务 v3.6

**创建日期**：2026-05-10  
**关联文档**：数据库详细设计、收益模型优化建议、系统设计文档

## 1. 任务目标

每天凌晨将前一天 `node_traffic_logs` + `nodes` 的数据聚合到 `daily_country_traffic` 表，并使用 MaxMind GeoLite2 解析国家代码。

支持幂等重跑任意历史日期。

## 2. 完整 Asynq Handler 实现

```go
package tasks

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"github.com/oschwald/geoip2-golang"
	"go.uber.org/zap"
)

type DailyCountryTrafficPayload struct {
	TargetDate string `json:"target_date"` // YYYY-MM-DD，可选，默认为昨天
}

func NewDailyCountryTrafficTask(targetDate string) *asynq.Task {
	payload, _ := json.Marshal(DailyCountryTrafficPayload{TargetDate: targetDate})
	return asynq.NewTask("daily:country_traffic", payload)
}

func HandleDailyCountryTraffic(ctx context.Context, t *asynq.Task) error {
	var p DailyCountryTrafficPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return err
	}

	targetDate := p.TargetDate
	if targetDate == "" {
		targetDate = time.Now().AddDate(0, 0, -1).Format("2006-01-02")
	}

	logger := zap.L().With(zap.String("task", "daily_country_traffic"), zap.String("date", targetDate))

	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer db.Close()

	geoDB, err := geoip2.Open("/etc/maxmind/GeoLite2-Country.mmdb")
	if err != nil {
		logger.Error("GeoIP2 数据库打开失败", zap.Error(err))
		return err
	}
	defer geoDB.Close()

	// 幂等聚合 SQL
	query := `
		INSERT INTO daily_country_traffic (
			country_code, traffic_date, total_traffic_gb, 
			upload_gb, download_gb, node_count, avg_quality_score
		)
		SELECT 
			COALESCE(geo.country_code, 'XX') AS country_code,
			?::date AS traffic_date,
			SUM(ndt.total_traffic_gb) AS total_traffic_gb,
			SUM(ndt.upload_gb) AS upload_gb,
			SUM(ndt.download_gb) AS download_gb,
			COUNT(DISTINCT ndt.node_id) AS node_count,
			AVG(COALESCE(nqs.overall_score, 0.75)) AS avg_quality_score
		FROM node_daily_traffic ndt
		LEFT JOIN nodes n ON ndt.node_id = n.id
		LEFT JOIN LATERAL (
			SELECT country_code 
			FROM (
				SELECT (geoip.country.iso_code) AS country_code
				FROM geoip2_country( n.public_ip::inet ) AS geoip
			) g
		) geo ON true
		LEFT JOIN node_quality_scores nqs ON nqs.node_id = ndt.node_id 
			AND nqs.created_at >= ?::date - INTERVAL '7 days'
		WHERE ndt.traffic_date = ?::date
		GROUP BY COALESCE(geo.country_code, 'XX')
		ON CONFLICT (country_code, traffic_date) 
		DO UPDATE SET
			total_traffic_gb = EXCLUDED.total_traffic_gb,
			upload_gb = EXCLUDED.upload_gb,
			download_gb = EXCLUDED.download_gb,
			node_count = EXCLUDED.node_count,
			avg_quality_score = EXCLUDED.avg_quality_score,
			updated_at = NOW();
	`

	_, err = db.ExecContext(ctx, query, targetDate, targetDate, targetDate)
	if err != nil {
		logger.Error("聚合失败", zap.Error(err))
		return err
	}

	logger.Info("daily_country_traffic 聚合完成")
	return nil
}
```

## 3. Scheduler 注册

```go
scheduler := asynq.NewScheduler(redisClient, &asynq.SchedulerOpts{
	Location: time.UTC,
})

scheduler.Register("@daily", NewDailyCountryTrafficTask(""), asynq.Queue("default"))
```

## 4. 注意事项

- GeoLite2 数据库需定期更新（建议每月自动更新脚本）
- `XX` 表示无法解析的国家代码
- 支持重跑历史日期（用于数据修复）
- 与 `node_daily_traffic` 保持一致的聚合逻辑

此任务与赞助商收益计算、全球流量可视化深度联动。
