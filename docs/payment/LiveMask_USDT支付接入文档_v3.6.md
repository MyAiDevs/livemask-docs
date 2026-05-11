# LiveMask USDT 支付接入文档 v3.6（最终版）

## 1. 支付平台推荐（2026 年最新建议）

根据 LiveMask 的业务特性（隐私优先、全球用户、抗审查、需要稳定 webhook），推荐以下方案：

### 推荐方案（按优先级排序）

| 优先级 | 平台 | 类型 | 推荐理由 | 缺点 | 推荐指数 |
|--------|------|------|----------|------|----------|
| **P0** | **NOWPayments** | 第三方 | 文档极好、Webhook 稳定、多链 USDT 支持完善、费率低（0.5%~1%）、支持 TRC20/ERC20/Polygon/BSC | 需要 KYC（企业版） | ★★★★★ |
| **P0** | **BTCPay Server** | 自托管 | 完全隐私、无 KYC、数据可控、支持 Lightning + On-chain、与 LiveMask 理念高度一致 | 需要自己运维节点 | ★★★★★ |
| **P1** | **CoinGate** | 第三方 | 老牌稳定、支持多种加密货币、Webhook 可靠 | 费率稍高 | ★★★★ |
| **P2** | **Plisio** | 第三方 | 费率低、支持 USDT 多链、集成简单 | 品牌知名度一般 | ★★★☆ |

### 最终推荐组合

- **主力方案**：**NOWPayments**（快速上线、稳定可靠）
- **隐私增强方案**：**BTCPay Server 自托管**（作为 NOWPayments 的补充或替代）
- **备用方案**：CoinGate

**建议**：MVP 阶段先接 **NOWPayments**，后期再自建 BTCPay Server 实现双通道。

---

## 2. NOWPayments 接入方案（主力推荐）

### 2.1 架构设计

```
用户下单 → 后端创建 Invoice (NOWPayments) → 返回支付地址/QR码
          ↓
用户支付 USDT → NOWPayments 检测到链上确认 → Webhook 回调后端
          ↓
后端验证签名 → 更新订单状态 → 触发以下业务闭环：
- 更新用户套餐 / 流量余额
- 触发 `UpdateAffiliateLoyaltyStats`（忠诚度统计）
- 计算并发放 C2C 平台补贴
- 发送支付成功通知（Telegram / Email）
- 记录审计日志
```

### 2.2 核心接口实现

> **重要说明**：具体接口定义、请求/响应结构、错误码请以《LiveMask_API详细规格_v3.6.md》中的 **「5. 支付相关接口」** 章节为准。
> 本文档重点描述业务流程、平台选型、Webhook 处理逻辑和业务闭环。

#### 创建支付订单（Go 示例）

#### 创建支付订单

```go
// internal/payment/nowpayments.go
type NOWPaymentsClient struct {
    APIKey  string
    BaseURL string
}

type CreateInvoiceRequest struct {
    PriceAmount   float64 `json:"price_amount"`
    PriceCurrency string `json:"price_currency"` // "usd"
    PayCurrency   string `json:"pay_currency"`   // "usdttrc20" or "usdterc20"
    OrderID       string `json:"order_id"`
    OrderDesc     string `json:"order_description"`
    IpnCallbackURL string `json:"ipn_callback_url"`
}

func (c *NOWPaymentsClient) CreateInvoice(ctx context.Context, req CreateInvoiceRequest) (*InvoiceResponse, error) {
    // 实现 HTTP POST 到 https://api.nowpayments.io/v1/invoice
    // 返回 payment_id, pay_address, pay_amount, pay_currency 等
}
```

#### Webhook 回调处理（最关键）

```go
// internal/payment/webhook.go
func HandleNOWPaymentsWebhook(c *gin.Context) {
    signature := c.GetHeader("x-nowpayments-sig")
    body, _ := io.ReadAll(c.Request.Body)

    // 1. 验证签名
    if !verifyNOWPaymentsSignature(body, signature, config.NowPaymentsIPNSecret) {
        c.JSON(400, gin.H{"error": "invalid signature"})
        return
    }

    var payload NOWPaymentsWebhookPayload
    json.Unmarshal(body, &payload)

    // 2. 幂等性处理（根据 payment_id + status）
    if err := processPaymentUpdate(payload); err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{"status": "ok"})
}

func verifyNOWPaymentsSignature(payload []byte, signature, secret string) bool {
    // 使用 HMAC-SHA256 验证
    h := hmac.New(sha256.New, []byte(secret))
    h.Write(payload)
    expected := hex.EncodeToString(h.Sum(nil))
    return subtle.ConstantTimeCompare([]byte(expected), []byte(signature)) == 1
}
```

### 2.3 Webhook Payload 结构（预设）

```json
{
  "payment_id": "123456789",
  "payment_status": "finished",        // waiting / confirming / finished / failed / refunded
  "pay_address": "Txxxxxxxxxxxxxxxxxx",
  "pay_amount": 25.5,
  "actually_paid": 25.5,
  "pay_currency": "usdttrc20",
  "order_id": "order_20260508_001",
  "price_amount": 25.0,
  "price_currency": "usd",
  "created_at": "2026-05-08T12:00:00Z",
  "updated_at": "2026-05-08T12:05:30Z"
}
```

**关键状态说明**：
- `finished`：链上已确认，可视为支付成功
- `confirming`：已支付但未达到确认数（可部分放行或等待）
- `failed` / `refunded`：需要处理失败逻辑

---

## 3. BTCPay Server 自托管方案（隐私优先推荐）

适合对隐私要求极高的场景。

### 优势
- 完全自托管，无第三方
- 支持 USDT + Lightning Network
- Webhook + Greenfield API 非常成熟
- 与 LiveMask 理念高度一致

### 接入建议
- 使用官方 Docker 部署
- 通过 Greenfield API 创建 Invoice
- Webhook 签名验证方式与 NOWPayments 类似（HMAC）

---

## 4. 支付成功后的业务闭环（已实现）

支付成功后应自动触发以下逻辑（已在 v3.6 中设计）：

1. 更新用户余额 / 套餐
2. 触发 `loyalty` 相关字段更新（累计充值金额）
3. 如果是 C2C 积分购买，触发平台补贴逻辑
4. 发送通知（Telegram / Email）
5. 记录审计日志

---

## 5. 安全与风控建议

- **Webhook 必须验证签名**（防止伪造）
- **IP 白名单**（NOWPayments 官方 IP 段）
- **幂等性处理**（payment_id + status 组合唯一）
- **金额校验**（actually_paid >= pay_amount * 0.99）
- **与威胁情报黑名单联动**（异常支付地址自动风控）

---

## 6. 开发优先级建议

| 阶段 | 任务 | 优先级 |
|------|------|--------|
| Phase 1 | NOWPayments 创建 Invoice + Webhook 基础实现 | P0 |
| Phase 1 | Webhook 签名验证 + 幂等性处理 | P0 |
| Phase 2 | BTCPay Server 自托管部署 + 对接 | P1 |
| Phase 2 | 多链 USDT 支持（TRC20 + ERC20） | P1 |
| Phase 3 | 支付失败补偿、退款流程 | P2 |

---

**文档状态**：本文件已更新为 v3.6 最终版，包含推荐平台、接入方案、代码示例、Webhook 结构、业务闭环等完整内容。

---

## 7. 多支付方式统一架构设计（Multi-Payment Architecture）【预留设计】

> **重要说明**：当前 LiveMask 以 **USDT 加密货币支付** 为主（NOWPayments / BTCPay Server）。  
> 本章节为**未来可能接入 Google Play Billing 和 Apple In-App Purchase** 提前做的架构预留设计，**不影响当前 USDT 支付的实现**。

### 7.1 统一支付抽象层设计

为支持多支付方式（USDT + Google + Apple），后端应建立统一的支付抽象层。

```go
// internal/payment/provider.go
type PaymentProvider string

const (
	PaymentProviderUSDTNOWPayments PaymentProvider = "usdt_nowpayments"
	PaymentProviderUSDTBTCPay      PaymentProvider = "usdt_btcpay"
	PaymentProviderGooglePlay      PaymentProvider = "google_play"
	PaymentProviderAppleIAP        PaymentProvider = "apple_iap"
)

type PaymentProvider interface {
	CreatePayment(ctx context.Context, req CreatePaymentRequest) (*PaymentResponse, error)
	HandleWebhook(ctx context.Context, payload []byte, signature string) error
	VerifyReceipt(ctx context.Context, receipt string) (*ReceiptInfo, error) // 主要用于 Google/Apple
	CancelSubscription(ctx context.Context, externalID string) error
}
```

**核心原则**：
- 业务层只依赖 `PaymentProvider` 接口，不关心具体是 USDT 还是 App Store。
- 不同支付方式的差异通过具体实现类封装。

### 7.2 数据库表结构扩展建议

当前 `user_subscriptions` 和 `payment_orders` 表需要扩展以支持多支付方式：

```sql
-- 在 user_subscriptions 表中增加以下字段（向后兼容）
ALTER TABLE user_subscriptions 
    ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(30),
    ADD COLUMN IF NOT EXISTS external_subscription_id VARCHAR(128),
    ADD COLUMN IF NOT EXISTS receipt_data TEXT,
    ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;

-- payment_orders 表扩展
ALTER TABLE payment_orders 
    ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(30),
    ADD COLUMN IF NOT EXISTS external_transaction_id VARCHAR(128),
    ADD COLUMN IF NOT EXISTS receipt_data JSONB;
```

**建议**：未来可将 `payment_orders` 重命名为更通用的 `payment_transactions`。

### 7.3 Google Play Billing 与 Apple In-App Purchase 关键差异

| 维度               | USDT (NOWPayments/BTCPay)      | Google Play Billing              | Apple In-App Purchase (IAP)          | 备注 |
|--------------------|--------------------------------|----------------------------------|--------------------------------------|------|
| **货币类型**       | 加密货币 (USDT)                | 法定货币                         | 法定货币                             | - |
| **订阅管理**       | 需自己实现续费逻辑             | Google 负责自动续费              | Apple 负责自动续费                   | App Store 更重度托管 |
| **验证方式**       | 链上确认 + Webhook             | Google Play Developer API        | App Store Server Notifications v2    | Apple 推荐使用 Server Notifications |
| **抽成比例**       | 0.5%~1%                        | 15% / 30%                        | 15% / 30%                            | App Store 抽成较高 |
| **沙箱测试**       | 支持测试网                     | Google Play Console 沙箱         | App Store Connect 沙箱 + TestFlight  | - |
| **退款处理**       | 链上不可逆，需人工处理         | Google 可部分退款                | Apple 退款政策严格                   | LiveMask 当前不支持退款 |
| **订阅状态同步**   | 需自己实现                     | Google 主动推送                  | Apple Server Notifications v2        | 强烈建议使用 Server Notifications |

**重要建议**：
- Google 和 Apple 的**自动续费订阅**由平台托管，后端主要负责**接收通知 + 验证 receipt + 更新本地订阅状态**。
- 未来如果接入 App Store，**强烈推荐使用 Apple 的 App Store Server Notifications v2**，而非轮询验证 receipt。

### 7.4 未来实施路线图（建议）

| 阶段   | 支付方式                  | 优先级 | 预计工作量 | 备注 |
|--------|---------------------------|--------|------------|------|
| Phase 1 | USDT (NOWPayments)        | P0     | 已完成     | 当前主力 |
| Phase 2 | BTCPay Server 自托管      | P1     | 中         | 隐私增强 |
| Phase 3 | Google Play Billing       | P2     | 高         | 需要处理订阅通知 |
| Phase 4 | Apple In-App Purchase     | P2     | 高         | 合规要求更高，抽成高 |

**建议**：在 Phase 1（USDT）完成后，再评估是否接入 App Store（需综合考虑抽成、合规、用户支付习惯）。

### 7.5 预留的接口与注意事项

在当前支付模块中，建议预留以下能力（即使暂不实现）：

- `PaymentProvider` 接口
- `VerifyReceipt` 方法（主要用于 Google/Apple）
- `HandleServerNotification` 方法（处理 Google/Apple 的服务器通知）
- 在 `user_subscriptions` 表中预留 `payment_provider` 和 `external_subscription_id` 字段

这样未来接入 Google/Apple 时，业务代码改动会最小化。

---

**本章总结**：当前 USDT 支付保持不变，同时通过抽象层 + 数据库预留字段，为未来接入 Google Play 和 Apple App Store 做好了架构准备。