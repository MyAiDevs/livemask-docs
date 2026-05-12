# LiveMask 积分定时任务 Go 实现 v3.6

**最后更新**：2026-05-10  
**定位**：积分 earning 统计、过期处理、每日重置等定时任务实现

---

## 一、每日积分统计任务

```go
type DailyPointsStatisticsTask struct {
    pointsRepo PointsRepository
    alertSvc   AlertService
}

func (t *DailyPointsStatisticsTask) Handle(ctx context.Context, payload *asynq.Payload) error {
    today := time.Now().Truncate(24 * time.Hour)

    // 1. 统计昨日 earning
    stats, err := t.pointsRepo.AggregateDailyEarning(ctx, today.AddDate(0, 0, -1))
    if err != nil {
        return err
    }

    // 2. 写入统计表
    if err := t.pointsRepo.SaveDailyStatistics(ctx, stats); err != nil {
        return err
    }

    // 3. 异常告警（例如 earning 量异常增长）
    if stats.TotalEarning.GreaterThan(decimal.NewFromInt(1000000)) {
        t.alertSvc.SendAlert(ctx, "积分 earning 异常增长", stats)
    }

    return nil
}
```

---

## 二、积分过期处理任务

```go
type PointsExpirationTask struct {
    pointsRepo PointsRepository
}

func (t *PointsExpirationTask) Handle(ctx context.Context, payload *asynq.Payload) error {
    // 处理 90 天未使用的积分（根据后台配置）
    expiredAmount, err := t.pointsRepo.ExpireOldPoints(ctx, 90)
    if err != nil {
        return err
    }

    log.Infof("今日过期积分数量: %s", expiredAmount)
    return nil
}
```

---

## 三、每日风控数据重置任务

```go
type DailyRiskResetTask struct {
    riskRepo RiskControlRepository
}

func (t *DailyRiskResetTask) Handle(ctx context.Context, payload *asynq.Payload) error {
    // 重置用户每日交易限额统计
    return t.riskRepo.ResetDailyTradeLimits(ctx)
}
```

---

## Scheduler 注册示例

```go
func registerPointsTasks(scheduler *asynq.Scheduler) {
    // 每天凌晨 2 点执行
    scheduler.Register("@daily", asynq.NewTask("points:daily_statistics", nil), asynq.TaskID("points-daily-stats"))
    scheduler.Register("@daily", asynq.NewTask("points:expire_old", nil), asynq.TaskID("points-expire"))
    scheduler.Register("@daily", asynq.NewTask("points:risk_reset", nil), asynq.TaskID("points-risk-reset"))
}
```

---

**已同步更新位置**：
- `LiveMask_积分经济体系_Go完整实现_v3.6.md`
- `LiveMask_开发任务清单与里程碑_v3.6.md`（新增 TASK-POINTS-001 ~ TASK-POINTS-003）

---

*本文件为生产级定时任务实现示例。*