# LiveMask 测试策略与 CI/CD 集成配置 v3.6

## 1. 测试金字塔与覆盖要求

- **单元测试**：> 80% 覆盖率（Go）
- **集成测试**：核心 API + 数据库交互
- **E2E 测试**：关键用户路径（订阅购买、首次连接 VPN、收益计算）
- **工具**：Go testing + testify + Playwright（前端）

## 2. 关键路径测试用例模板

### 2.1 订阅购买流程（E2E 示例 - Playwright）

```ts
// tests/e2e/subscription-purchase.spec.ts
import { test, expect } from '@playwright/test';

test('用户成功购买月度套餐', async ({ page }) => {
  await page.goto('/pricing');
  await page.click('text=月度专业版');
  await page.click('button:has-text("立即订阅")');
  
  // 支付流程模拟...
  await expect(page.locator('text=订阅成功')).toBeVisible();
  await expect(page.locator('text=剩余流量')).toContainText('100 GB');
});
```

### 2.2 NodeAgent 配置热更新测试（Go 集成测试）

```go
// internal/featureflag/evaluator_test.go
func TestEvaluator_Evaluate_Rollout(t *testing.T) {
    // 测试 30% rollout 是否正确工作
}
```

## 3. CI/CD 配置（GitHub Actions 示例）

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.23'
      - name: Run Go Tests
        run: go test ./... -coverprofile=coverage.out
      - name: Upload Coverage
        uses: codecov/codecov-action@v4

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Playwright
        run: npx playwright install
      - name: Run E2E Tests
        run: npx playwright test
```

**完整文件已保存至**：`docs/LiveMask_测试策略与CI_CD落地文件_v3.6.md`