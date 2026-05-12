# LiveMask 用户订阅购买流程 - 原价 vs 现价展示设计 v3.6

**最后更新**：2026-05-10

## 1. 设计目标
在用户订阅购买页面清晰展示**原价 vs 现价**，强化折扣感知，提升转化率，同时保持专业与信任感。

## 2. 页面结构（推荐）

### 2.1 套餐卡片（列表页 / 选择页）

```tsx
// 推荐组件：PlanCard.tsx
<div className="relative border rounded-2xl p-6 hover:shadow-lg transition-all">
  {plan.original_price_usdt && plan.original_price_usdt > plan.price_usdt && (
    <div className="absolute -top-3 right-4">
      <Badge className="bg-red-500 text-white">
        立省 {((plan.original_price_usdt - plan.price_usdt) / plan.original_price_usdt * 100).toFixed(0)}%
      </Badge>
    </div>
  )}

  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="text-2xl font-semibold">{plan.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
    </div>
    <div className="text-right">
      {plan.original_price_usdt && plan.original_price_usdt > plan.price_usdt && (
        <div className="text-sm text-muted-foreground line-through">
          {plan.original_price_usdt} {plan.currency}
        </div>
      )}
      <div className="text-4xl font-bold tracking-tighter text-primary">
        {plan.price_usdt} <span className="text-base font-normal">USDT</span>
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {plan.billing_cycle === 'monthly' && '月付'}
        {plan.billing_cycle === 'yearly' && '年付'}
        {/* ... */}
      </div>
    </div>
  </div>

  {/* 其他信息：流量、有效期、带宽限制等 */}
</div>
```

### 2.2 结算确认页（Checkout）

在最终支付确认页面再次强化价格对比：

- **左侧**：套餐摘要 + 价格明细
- **右侧**：支付按钮区域

**价格展示逻辑**：
- 如果有 `original_price_usdt` 且大于 `price_usdt`：
  - 显示原价（删除线）
  - 显示现价（大字体 + 强调色）
  - 显示节省金额和折扣百分比
- 否则只显示现价

**推荐文案**：
- “原价：XX USDT”
- “现价：XX USDT（已优惠 XX%）”
- “您本次节省：XX USDT”

## 3. 推荐交互与动效

- 套餐卡片 Hover 时价格区域轻微放大
- 折扣 Badge 使用红色或橙色，增加紧迫感
- 结算页使用“您将节省 XXX USDT”的强调文案
- 支持年付/月付切换时实时更新价格对比

## 4. 数据来源
直接从 `subscription_plans` 表读取：
- `price_usdt`
- `original_price_usdt`
- `billing_cycle`

---

**已同步更新位置**：
- `LiveMask_普通用户订阅全生命周期管理设计_v3.6.md`
- `LiveMask_用户订阅购买流程_价格展示设计_v3.6.md`（本文件）

需要我生成对应的 React 组件代码示例吗？