# LiveMask 积分 C2C 交易 E2E 测试（Playwright）v3.6

**最后更新**：2026-05-11

## 1. 测试目标
覆盖用户端积分 C2C 交易完整流程，包括上架、购买、取消、纠纷处理等核心路径，以及关键风控场景。

## 2. 技术栈
- Playwright + TypeScript
- 使用 `test.describe` + `test.step` 组织
- 推荐使用 Page Object Model（POM）

## 3. 核心测试场景

### 3.1 用户端 - 积分 C2C 市场基础流程

```typescript
import { test, expect } from '@playwright/test';

test.describe('积分 C2C 交易 - 完整流程', () => {

  test('用户可以成功上架积分出售', async ({ page }) => {
    await page.goto('/points/market');
    await page.getByRole('button', { name: '上架积分' }).click();
    
    await page.getByLabel('出售数量').fill('500');
    await page.getByLabel('单价 (USDT)').fill('0.012');
    await page.getByRole('button', { name: '确认上架' }).click();

    await expect(page.getByText('上架成功')).toBeVisible();
    await expect(page.getByText('500 积分')).toBeVisible();
  });

  test('用户可以成功购买积分', async ({ page }) => {
    await page.goto('/points/market');
    
    // 假设已有挂单
    await page.getByRole('row', { name: /500 积分/ }).getByRole('button', { name: '购买' }).click();
    
    await page.getByRole('button', { name: '确认购买' }).click();
    await expect(page.getByText('交易成功')).toBeVisible();
    await expect(page.getByText('积分已到账')).toBeVisible();
  });

  test('用户可以取消自己的挂单', async ({ page }) => {
    await page.goto('/points/my-listings');
    await page.getByRole('row', { name: /我的挂单/ }).getByRole('button', { name: '取消' }).click();
    await page.getByRole('button', { name: '确认取消' }).click();

    await expect(page.getByText('取消成功')).toBeVisible();
  });
});
```

### 3.2 风控场景测试

```typescript
test('价格偏离过大时禁止上架', async ({ page }) => {
  await page.goto('/points/market');
  await page.getByRole('button', { name: '上架积分' }).click();
  
  await page.getByLabel('单价 (USDT)').fill('0.05'); // 远高于市场价
  await page.getByRole('button', { name: '确认上架' }).click();

  await expect(page.getByText('价格偏离市场价过大')).toBeVisible();
});

test('超过每日交易限额时拒绝交易', async ({ page }) => {
  // 模拟已达到每日限额
  await page.goto('/points/market');
  await page.getByRole('row').first().getByRole('button', { name: '购买' }).click();
  await expect(page.getByText('已达到今日交易限额')).toBeVisible();
});
```

### 3.3 Admin 端 - 纠纷处理流程

```typescript
test('管理员可以处理积分交易纠纷', async ({ page }) => {
  await page.goto('/admin/points/disputes');
  
  await page.getByRole('row', { name: /纠纷中/ }).first().click();
  await page.getByRole('button', { name: '同意买家申诉' }).click();
  await page.getByLabel('处理备注').fill('买家提供有效凭证');
  await page.getByRole('button', { name: '确认处理' }).click();

  await expect(page.getByText('处理成功')).toBeVisible();
});
```

## 4. 推荐的 Page Object Model 结构

```ts
// pages/PointsMarketPage.ts
export class PointsMarketPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/points/market');
  }

  async openCreateListingDialog() {
    await this.page.getByRole('button', { name: '上架积分' }).click();
  }

  async createListing(amount: number, price: number) {
    await this.page.getByLabel('出售数量').fill(amount.toString());
    await this.page.getByLabel('单价 (USDT)').fill(price.toString());
    await this.page.getByRole('button', { name: '确认上架' }).click();
  }
}
```

## 5. CI 集成建议

在 GitHub Actions 中加入：

```yaml
- name: Run E2E Tests (Points C2C)
  run: npx playwright test tests/points-c2c.spec.ts
```

---

**说明**：以上为关键场景示例，实际项目中建议覆盖 15~20 个核心用例，并结合视觉回归测试（ Percy / Chromatic）。