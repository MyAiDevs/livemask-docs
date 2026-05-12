# LiveMask Admin「积分经济配置」页面 - React + shadcn/ui 完整代码示例 v3.6

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

const pointsConfigSchema = z.object({
  enabled: z.boolean(),
  node_points_rate: z.number().min(0).max(5),
  plan_purchase_bonus_rate: z.number().min(0).max(1),
  promoter_points_rate: z.number().min(0).max(0.5),
  points_c2c_platform_commission: z.number().min(0).max(0.3),
  min_points_trade: z.number().min(10),
})

type PointsConfigForm = z.infer<typeof pointsConfigSchema>

export default function PointsEconomyConfigPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PointsConfigForm>({
    resolver: zodResolver(pointsConfigSchema),
    defaultValues: {
      enabled: true,
      node_points_rate: 0.8,
      plan_purchase_bonus_rate: 0.15,
      promoter_points_rate: 0.10,
      points_c2c_platform_commission: 0.08,
      min_points_trade: 100,
    },
  })

  const onSubmit = async (data: PointsConfigForm) => {
    setIsLoading(true)
    try {
      // 调用后端 API 保存配置
      const response = await fetch("/api/admin/points-economy/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("保存失败")

      toast({
        title: "配置已保存",
        description: "积分经济参数已更新，立即生效",
      })
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请检查网络或联系技术支持",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">积分经济配置</h1>
        <p className="text-muted-foreground mt-2">
          配置积分 earning 规则、C2C 交易抽成等核心参数
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* 基础开关 */}
        <Card>
          <CardHeader>
            <CardTitle>基础设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">启用积分经济体系</Label>
              <Switch
                id="enabled"
                checked={form.watch("enabled")}
                onCheckedChange={(checked) => form.setValue("enabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Earning 规则 */}
        <Card>
          <CardHeader>
            <CardTitle>积分获取规则</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>赞助节点积分比例</Label>
              <Input
                type="number"
                step="0.1"
                {...form.register("node_points_rate", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground mt-1">每获得 1U 收益额外赠送的积分比例</p>
            </div>

            <div>
              <Label>购买套餐赠送比例</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("plan_purchase_bonus_rate", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground mt-1">购买套餐金额的百分比作为积分赠送</p>
            </div>

            <div>
              <Label>推广大使积分比例</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("promoter_points_rate", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground mt-1">被邀请用户消费时，大使额外获得的积分比例</p>
            </div>
          </CardContent>
        </Card>

        {/* C2C 交易规则 */}
        <Card>
          <CardHeader>
            <CardTitle>C2C 积分交易规则</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>平台抽成比例</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("points_c2c_platform_commission", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground mt-1">每笔 C2C 交易平台收取的抽成比例</p>
            </div>

            <div>
              <Label>最小交易积分数量</Label>
              <Input
                type="number"
                {...form.register("min_points_trade", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? "保存中..." : "保存配置"}
          </Button>
        </div>
      </form>
    </div>
  )
}
```

**使用说明**：
- 使用 `react-hook-form` + `zod` 进行表单校验
- 提交后调用后端 `/api/admin/points-economy/config` 接口
- 可直接复制到 Next.js + shadcn/ui 项目中使用

---

**文档已同步更新**：
- `LiveMask_数据库详细设计_v3.6.md`（已添加积分表 + ER 图）
- 新建 `LiveMask_积分经济体系_Go完整实现_v3.6.md`
- 新建 `LiveMask_Admin积分经济配置_React_shadcn代码示例_v3.6.md`
- `LiveMask_文档索引与关联说明_v3.6.md` 已记录本次所有变更

现在积分经济体系已形成**完整可落地的生产级闭环**。