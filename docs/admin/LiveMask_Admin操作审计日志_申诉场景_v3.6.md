# LiveMask Admin 操作审计日志（申诉场景）v3.6

## 1. 审计日志表（已存在或新增）

```sql
CREATE TABLE admin_action_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id    UUID NOT NULL,
    action      VARCHAR(100) NOT NULL,           -- e.g. "appeal.review", "quality.adjust"
    target_type VARCHAR(50),                     -- "node_appeal", "node_quality"
    target_id   UUID,
    details     JSONB,                           -- 详细操作内容
    ip_address  VARCHAR(50),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## 2. 审计日志记录代码（middleware + service）

```go
// middleware/audit.go
func AuditLogger(action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		if c.Writer.Status() == 200 {
			adminID := c.MustGet("admin_id").(uuid.UUID)
			targetID := c.Param("id") // 或从 body 获取

			log := model.AdminActionLog{
				AdminID:   adminID,
				Action:    action,
				TargetType: "node_appeal",
				TargetID:  uuid.MustParse(targetID),
				Details:   c.MustGet("audit_details").(map[string]interface{}),
				IPAddress: c.ClientIP(),
			}
			// 异步写入
			go auditRepo.Create(context.Background(), &log)
		}
	}
}
```

在 ReviewAppeal Handler 中使用：

```go
c.Set("audit_details", map[string]interface{}{
	"decision": decision,
	"score_adjustment": scoreAdj,
	"effective_from": effectiveFrom,
})
```

---

**推荐**：使用独立 goroutine 或消息队列写入审计日志，避免阻塞主流程。
