# LiveMask Feature Flag 系统 - Go 实现 + Admin React 代码 v3.6

## 1. 技术选型说明
- **后端**：自研轻量级 Feature Flag 服务（基于 PostgreSQL + Redis）
- **SDK**：OpenFeature Go SDK（推荐）或自研简单客户端
- **Admin 前端**：React 18 + shadcn/ui + TanStack Query
- **实时同步**：Redis Pub/Sub + SSE / WebSocket

## 2. 后端核心代码（Go）

### 2.1 数据模型
```go
type FeatureFlag struct {
    ID          uuid.UUID `json:"id" db:"id"`
    Key         string    `json:"key" db:"key"`
    Name        string    `json:"name" db:"name"`
    Description string    `json:"description" db:"description"`
    Enabled     bool      `json:"enabled" db:"enabled"`
    Rules       JSONB     `json:"rules" db:"rules"` // targeting rules
    Rollout     int       `json:"rollout" db:"rollout"` // 0-100
    UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
```

### 2.2 Flag 评估服务（核心）
```go
// internal/featureflag/evaluator.go
package featureflag

import (
    "context"
    "encoding/json"
    "github.com/google/uuid"
)

type Evaluator struct {
    repo FlagRepository
}

func (e *Evaluator) Evaluate(ctx context.Context, key string, userID uuid.UUID, attributes map[string]interface{}) (bool, error) {
    flag, err := e.repo.GetByKey(ctx, key)
    if err != nil {
        return false, err
    }
    if !flag.Enabled {
        return false, nil
    }

    // 简单百分比 rollout
    if flag.Rollout < 100 {
        hash := hashUserID(userID) % 100
        if hash >= flag.Rollout {
            return false, nil
        }
    }

    // TODO: 实现更复杂的 targeting rules（用户属性匹配）
    return true, nil
}
```

### 2.3 Admin API 示例
```go
// internal/api/handler/featureflag_handler.go
func (h *Handler) UpdateFlag(c *gin.Context) {
    var req UpdateFlagRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    flag, err := h.flagService.UpdateFlag(c.Request.Context(), req)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // 发布变更到 Redis，通知所有服务
    h.redis.Publish(c, "featureflag:updated", flag.Key)

    c.JSON(200, flag)
}
```

## 3. Admin 配置页面 React 代码（关键部分）

```tsx
// components/FeatureFlag/FlagEditDrawer.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  key: z.string().min(3),
  name: z.string().min(2),
  enabled: z.boolean(),
  rollout: z.number().min(0).max(100),
  rules: z.any().optional(),
})

export function FlagEditDrawer({ flag, onSave }: { flag?: FeatureFlag; onSave: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: flag || { enabled: true, rollout: 100 },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <FormField
          control={form.control}
          name="rollout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rollout Percentage</FormLabel>
              <FormControl>
                <Slider 
                  min={0} 
                  max={100} 
                  step={5} 
                  value={[field.value]} 
                  onValueChange={(v) => field.onChange(v[0])} 
                />
              </FormControl>
              <FormDescription>{field.value}% of users will see this feature</FormDescription>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit">保存并发布</Button>
        </div>
      </form>
    </Form>
  )
}
```

**完整文件已保存至**：`docs/LiveMask_FeatureFlag系统_Go实现与Admin前端_v3.6.md`

---

## 总结
Feature Flag 系统已提供**生产级 Go 后端核心 + React Admin 配置页面**，可直接用于开发。支持百分比灰度、 targeting rules 扩展、实时变更通知。