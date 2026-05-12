# LiveMask API 详细规格 v3.6（生产级完整版）

## 1. 通用规范

### 1.1 Base URL
- 生产: `https://api.livemask.vpn/v1`
- Staging: `https://staging-api.livemask.vpn/v1`

### 1.2 认证方式
- **客户端 / Web 用户**: `Authorization: Bearer <JWT>`
- **Agent / 节点**: mTLS 双向证书 + `X-Node-ID` Header
- **内部服务**: mTLS + Service Account JWT

### 1.3 统一响应格式

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "meta": { "request_id": "uuid", "took_ms": 12 }
}
```

**失败响应**
```json
{
  "code": 1001,
  "message": "参数错误",
  "error": {
    "field": "loyalty_bonus_factor",
    "reason": "must be between 1.0 and 1.5"
  },
  "meta": { "request_id": "uuid" }
}
```

### 1.4 错误码规范（完整版）

### 1.5 配置拉取接口增强说明（vpn_client_governance）

---

## 9. 节点监控大盘接口（新增）

### 9.1 获取节点监控汇总数据

**接口**：`GET /admin/nodes/monitoring/summary`

**说明**：获取当前所有节点的实时质量和流量汇总数据，用于大盘首页展示。

**响应示例**：
```json
{
  "code": 0,
  "data": {
    "total_nodes": 128,
    "active_nodes": 115,
    "avg_quality_score": 82.5,
    "total_bandwidth_mbps": 12450,
    "top_bandwidth_node": { "id": "...", "name": "HK-01", "bandwidth_mbps": 850 },
    "lowest_bandwidth_node": { "id": "...", "name": "SG-03", "bandwidth_mbps": 12 }
  }
}
```

### 9.2 获取节点流量趋势

**接口**：`GET /admin/nodes/monitoring/traffic-trend?node_id=xxx&period=24h`

**说明**：获取单个节点的流量趋势数据。

### 9.3 获取最高/最低带宽节点 Top N

**接口**：`GET /admin/nodes/monitoring/top-bandwidth?type=highest&limit=10`

**说明**：获取当前带宽最高或最低的节点列表。

### 9.4 获取节点质量/流量明细日志

**接口**：`GET /admin/nodes/monitoring/logs?node_id=xxx&type=traffic&limit=100`

**说明**：分页获取节点的详细质量或流量上报日志。

---

## 10. 节点监控大盘接口实现示例（Go）

> **说明**：以下为推荐的生产级实现方式，供开发团队参考。实际项目中可根据团队代码风格调整。

### 10.1 获取节点监控汇总数据（推荐实现）

**接口**：`GET /admin/nodes/monitoring/summary`

#### Handler 层

```go
// internal/api/handler/node_monitoring_handler.go
package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetMonitoringSummary 获取节点监控大盘汇总数据
// @Summary 获取节点监控汇总
// @Tags NodeMonitoring
// @Produce json
// @Success 200 {object} response.Response{data=MonitoringSummaryResponse}
// @Router /admin/nodes/monitoring/summary [get]
func (h *NodeMonitoringHandler) GetMonitoringSummary(c *gin.Context) {
	ctx := c.Request.Context()

	summary, err := h.service.GetMonitoringSummary(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 5001, "message": "获取监控汇总失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": summary,
	})
}
```

#### Service 层

```go
// internal/service/node_monitoring_service.go
package service

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type NodeMonitoringService struct {
	repo *repository.NodeMonitoringRepository
}

func (s *NodeMonitoringService) GetMonitoringSummary(ctx context.Context) (*MonitoringSummaryResponse, error) {
	// 1. 获取基础统计
	stats, err := s.repo.GetBasicStats(ctx)
	if err != nil {
		return nil, err
	}

	// 2. 获取最高带宽节点
	topNode, err := s.repo.GetTopBandwidthNode(ctx, "highest", 1)
	if err != nil {
		return nil, err
	}

	// 3. 获取最低带宽节点
	lowestNode, err := s.repo.GetTopBandwidthNode(ctx, "lowest", 1)
	if err != nil {
		return nil, err
	}

	return &MonitoringSummaryResponse{
		TotalNodes:        stats.TotalNodes,
		ActiveNodes:       stats.ActiveNodes,
		AvgQualityScore:   stats.AvgQualityScore,
		TotalBandwidthMbps: stats.TotalBandwidthMbps,
		TopBandwidthNode:  topNode,
		LowestBandwidthNode: lowestNode,
		UpdatedAt:         time.Now(),
	}, nil
}
```

#### Repository 层（核心查询）

```go
// internal/repository/node_monitoring_repository.go
package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NodeMonitoringRepository struct {
	db *gorm.DB
}

// GetBasicStats 获取基础统计数据
func (r *NodeMonitoringRepository) GetBasicStats(ctx context.Context) (*BasicNodeStats, error) {
	var stats BasicNodeStats

	err := r.db.WithContext(ctx).Raw(`
		SELECT 
			COUNT(*) as total_nodes,
			COUNT(*) FILTER (WHERE status = 'active') as active_nodes,
			COALESCE(AVG(quality_score), 0) as avg_quality_score,
			COALESCE(SUM(current_bandwidth_mbps), 0) as total_bandwidth_mbps
		FROM nodes
		WHERE deleted_at IS NULL
	`).Scan(&stats).Error

	return &stats, err
}

// GetTopBandwidthNode 获取最高或最低带宽节点
func (r *NodeMonitoringRepository) GetTopBandwidthNode(ctx context.Context, order string, limit int) (*TopBandwidthNode, error) {
	var node TopBandwidthNode

	orderBy := "current_bandwidth_mbps DESC"
	if order == "lowest" {
		orderBy = "current_bandwidth_mbps ASC"
	}

	err := r.db.WithContext(ctx).Raw(`
		SELECT id, name, current_bandwidth_mbps as bandwidth_mbps
		FROM nodes
		WHERE status = 'active' AND deleted_at IS NULL
		ORDER BY `+orderBy+`
		LIMIT ?
	`, limit).Scan(&node).Error

	return &node, err
}
```

**结构体定义示例**（放在 `internal/model/node_monitoring.go`）：

```go
type MonitoringSummaryResponse struct {
	TotalNodes          int64            `json:"total_nodes"`
	ActiveNodes         int64            `json:"active_nodes"`
	AvgQualityScore     float64          `json:"avg_quality_score"`
	TotalBandwidthMbps  float64          `json:"total_bandwidth_mbps"`
	TopBandwidthNode    *TopBandwidthNode `json:"top_bandwidth_node,omitempty"`
	LowestBandwidthNode *TopBandwidthNode `json:"lowest_bandwidth_node,omitempty"`
	UpdatedAt           time.Time        `json:"updated_at"`
}

type TopBandwidthNode struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	BandwidthMbps float64   `json:"bandwidth_mbps"`
}

type BasicNodeStats struct {
	TotalNodes         int64   `json:"total_nodes"`
	ActiveNodes        int64   `json:"active_nodes"`
	AvgQualityScore    float64 `json:"avg_quality_score"`
	TotalBandwidthMbps float64 `json:"total_bandwidth_mbps"`
}
```

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"live-mask-backend/internal/service"
)

type NodeMonitoringHandler struct {
	service *service.NodeMonitoringService
}

func NewNodeMonitoringHandler(s *service.NodeMonitoringService) *NodeMonitoringHandler {
	return &NodeMonitoringHandler{service: s}
}

// GetMonitoringSummary 获取节点监控大盘汇总数据
func (h *NodeMonitoringHandler) GetMonitoringSummary(c *gin.Context) {
	summary, err := h.service.GetMonitoringSummary(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    5001,
			"message": "获取监控数据失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": summary,
	})
}
```

#### Service 层

```go
// internal/service/node_monitoring_service.go
package service

import (
	"context"
	"live-mask-backend/internal/repository"
)

type NodeMonitoringService struct {
	repo *repository.NodeMonitoringRepository
}

func NewNodeMonitoringService(r *repository.NodeMonitoringRepository) *NodeMonitoringService {
	return &NodeMonitoringService{repo: r}
}

func (s *NodeMonitoringService) GetMonitoringSummary(ctx context.Context) (*model.NodeMonitoringSummary, error) {
	return s.repo.GetMonitoringSummary(ctx)
}
```

#### Repository 层（核心查询）

```go
// internal/repository/node_monitoring_repository.go
package repository

import (
	"context"
	"live-mask-backend/internal/model"
)

func (r *NodeMonitoringRepository) GetMonitoringSummary(ctx context.Context) (*model.NodeMonitoringSummary, error) {
	query := `
		SELECT 
			COUNT(*) AS total_nodes,
			COUNT(*) FILTER (WHERE status = 'active') AS active_nodes,
			COALESCE(AVG(quality_score), 0) AS avg_quality_score,
			COALESCE(SUM(current_bandwidth_mbps), 0) AS total_bandwidth_mbps
		FROM nodes
		WHERE deleted_at IS NULL;
	`

	var summary model.NodeMonitoringSummary
	err := r.db.QueryRowContext(ctx, query).Scan(
		&summary.TotalNodes,
		&summary.ActiveNodes,
		&summary.AvgQualityScore,
		&summary.TotalBandwidthMbps,
	)
	if err != nil {
		return nil, err
	}

	// 获取最高/最低带宽节点（可单独优化为子查询或缓存）
	summary.TopBandwidthNode, _ = r.getTopBandwidthNode(ctx, "highest")
	summary.LowestBandwidthNode, _ = r.getTopBandwidthNode(ctx, "lowest")

	return &summary, nil
}

func (r *NodeMonitoringRepository) getTopBandwidthNode(ctx context.Context, order string) (*model.SimpleNodeInfo, error) {
	orderBy := "DESC"
	if order == "lowest" {
		orderBy = "ASC"
	}

	query := `
		SELECT id, name, current_bandwidth_mbps 
		FROM nodes 
		WHERE status = 'active' AND deleted_at IS NULL 
		ORDER BY current_bandwidth_mbps ` + orderBy + ` 
		LIMIT 1
	`

	var node model.SimpleNodeInfo
	err := r.db.QueryRowContext(ctx, query).Scan(&node.ID, &node.Name, &node.BandwidthMbps)
	return &node, err
}
```

### 10.2 获取最高/最低带宽节点 Top N

**接口**：`GET /admin/nodes/monitoring/top-bandwidth?type=highest&limit=10`

#### Repository 查询示例

```go
func (r *NodeMonitoringRepository) GetTopBandwidthNodes(ctx context.Context, nodeType string, limit int) ([]model.NodeBandwidthInfo, error) {
	order := "DESC"
	if nodeType == "lowest" {
		order = "ASC"
	}

	query := `
		SELECT 
			id, 
			name, 
			current_bandwidth_mbps,
			quality_score,
			status,
			updated_at
		FROM nodes 
		WHERE status = 'active' AND deleted_at IS NULL
		ORDER BY current_bandwidth_mbps ` + order + `
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []model.NodeBandwidthInfo
	for rows.Next() {
		var n model.NodeBandwidthInfo
		if err := rows.Scan(&n.ID, &n.Name, &n.BandwidthMbps, &n.QualityScore, &n.Status, &n.UpdatedAt); err != nil {
			return nil, err
		}
		nodes = append(nodes, n)
	}
	return nodes, nil
}
```

### 性能优化建议

1. **索引优化**（已在 `node_traffic_logs` 和 `nodes` 表中添加）：
   ```sql
   CREATE INDEX idx_nodes_bandwidth ON nodes(current_bandwidth_mbps) WHERE status = 'active';
   CREATE INDEX idx_traffic_logs_node_time ON node_traffic_logs(node_id, recorded_at DESC);
   ```

2. **缓存策略**：
   - `summary` 接口建议使用 Redis 缓存 30~60 秒。
   - `top-bandwidth` 可缓存 15 秒。

3. **大数据量优化**：
   - `node_traffic_logs` 表建议按天分区（Partition）。
   - 趋势图数据可使用物化视图（Materialized View）提升查询性能。

---

客户端通过 `GET /client/config` 接口拉取配置时，`data` 中会包含 `vpn_client_governance` 字段，用于动态资源治理和行为控制。

**响应示例片段**：
```json
{
  "code": 0,
  "data": {
    "vpn_client_governance": {
      "enabled": true,
      "resource_limits": { ... },
      "behavior": { ... },
      "platform_overrides": { ... }
    }
  }
}
```

详细结构定义见《LiveMask_数据库详细设计_v3.6.md》中的 `vpn_client_governance` 配置详细结构章节。


| Code | HTTP | 分类 | 说明 | 常见场景 |
|------|------|------|------|----------|
| 1001 | 400 | 参数错误 | 请求参数校验失败 | 必填字段缺失、格式错误 |
| 1002 | 401 | 认证失败 | Token 无效/过期 | JWT 过期、签名错误 |
| 1003 | 403 | 权限不足 | 无权访问资源 | 普通用户访问管理员接口 |
| 2001 | 429 | 限流 | 请求过于频繁 | 超过每秒/每分钟配额 |
| 3001 | 500 | 系统错误 | 服务器内部错误 | 数据库异常、未捕获异常 |
| 4001 | 400 | 业务规则 | Tier 不满足条件 | 邀请人数不足无法升级 |
| 4002 | 400 | 业务规则 | Quarantine 期间操作被拒绝 | 节点处于隔离期 |
| 4003 | 400 | 业务规则 | 配置版本冲突 | 客户端配置版本过旧 |
| 4004 | 400 | 业务规则 | 免费区流量不计入佣金 | 推广大使尝试刷免费区流量 |

### 1.5 分页规范
所有列表接口统一使用：
- `page` (默认 1)
- `page_size` (默认 20, 最大 100)
- 返回 `meta.total`, `meta.page`, `meta.page_size`

---

## 2. 推广大使相关接口（完整）

### 2.1 获取当前推广大使状态
**GET** `/client/affiliate/status`

**响应示例**
```json
{
  "code": 0,
  "data": {
    "current_tier": "gold",
    "loyalty_bonus_factor": 1.15,
    "estimated_commission_rate": 0.345,
    "total_invites": 87,
    "total_traffic_gb": 12480,
    "avg_invited_user_tier": "gold",
    "last_updated_at": "2026-05-08T00:00:00Z"
  }
}
```

### 2.2 管理员获取推广大使列表
**GET** `/admin/affiliates`

**查询参数**
- `tier`, `status`, `page`, `page_size`

### 2.3 手动触发忠诚度统计（管理员/定时任务）
**POST** `/admin/affiliates/recalculate-loyalty`

**请求 Body**
```json
{
  "ambassador_ids": ["uuid1", "uuid2"],   // 为空则全量
  "force": false
}
```

---

## 3. 威胁狩猎 / Quarantine 相关接口（完整）

### 3.1 获取 Quarantine 列表
**GET** `/admin/hunting/quarantine`

**查询参数**
- `status`: quarantine / resolved / rejected
- `target_type`: node / ambassador
- `source`: system_hunting / user_report

### 3.2 复核 Quarantine（管理员）
**PATCH** `/admin/appeals/:id/review`

**请求 Body**
```json
{
  "action": "approve",           // approve / reject / extend
  "comment": "确认异常，执行处罚",
  "extend_days": 7,
  "new_status": "disabled"       // 仅当 action=approve 时可选
}
```

### 3.3 系统自动创建 Quarantine（内部接口）
**POST** `/internal/hunting/create-quarantine`

**请求 Body**
```json
{
  "target_type": "node",
  "target_id": "uuid",
  "reason": "quality_score_stddev > 25 AND last_7d_avg_quality < 65",
  "source": "system_hunting"
}
```

---

## 4. 配置热更新相关接口（完整）

### 4.1 客户端拉取配置
**GET** `/client/config?types=affiliate,threat_hunting,free_zone,notification,vpn_client_governance`

> **说明**：`vpn_client_governance` 用于客户端动态资源治理（内存上限、健康检查频率、协议切换策略等），由后台 `system_configs` 统一管理，支持热更新。

**响应示例**
```json
{
  "code": 0,
  "data": {
    "config_version": 87,
    "config_hash": "a1b2c3d4e5f6g7h8...",
    "affiliate_config": { ... },
    "threat_hunting_config": { ... },
    "free_zone_config": {
      "max_bandwidth_mbps": 500,
      "traffic_weight_for_commission": 0.0
    },
    "notification_config": { ... }
  }
}
```

**客户端必须行为**：
1. 校验 `config_hash`
2. Hash 不一致则应用新配置
3. 应用失败 → 回滚 + 上报 `/client/config/rollback`

### 4.2 配置回滚上报
**POST** `/client/config/rollback`

**请求 Body**
```json
{
  "config_version": 86,
  "reason": "apply_failed",
  "error_detail": "..."
}
```

---

## 5. 支付相关接口（USDT）

> **说明**：支付接口定义以本章节为准。《LiveMask_USDT支付接入文档_v3.6.md》重点描述业务流程、平台选型和集成注意事项。

### 5.1 创建支付订单（客户端）
**POST** `/client/payment/create`

**请求 Body**
```json
{
  "amount_usd": 29.9,
  "pay_currency": "usdttrc20",      // usdttrc20 / usdterc20 / usdtpolygon 等
  "plan_id": "premium_monthly",     // 可选，关联套餐
  "remark": "用户备注"
}
```

**成功响应**
```json
{
  "code": 0,
  "data": {
    "order_id": "pay_20260508_abc123",
    "payment_id": "now_9876543210",
    "pay_address": "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "pay_amount": "29.85",
    "pay_currency": "usdttrc20",
    "expires_at": "2026-05-08T08:30:00Z",
    "qr_code_url": "https://api.livemask.vpn/qr/xxx",
    "status": "waiting"
  }
}
```

### 5.2 查询支付状态
**GET** `/client/payment/status/:order_id`

**响应示例**
```json
{
  "code": 0,
  "data": {
    "order_id": "pay_20260508_abc123",
    "status": "finished",           // waiting / confirming / finished / failed / expired
    "paid_amount": "29.85",
    "paid_at": "2026-05-08T07:55:12Z",
    "tx_hash": "0x..."
  }
}
```

### 5.3 管理员查看支付记录
**GET** `/admin/payments`

**查询参数**
- `status`, `user_id`, `start_time`, `end_time`, `page`, `page_size`

### 5.4 NOWPayments Webhook（内部）
**POST** `/internal/payment/webhook/nowpayments`

> 由 NOWPayments 回调，需验证签名。处理成功后触发：
> - 更新用户套餐 / 流量
> - 触发忠诚度统计
> - C2C 平台补贴计算
> - 发送通知

**请求 Header**
- `x-nowpayments-sig`: 签名

**请求 Body**（部分关键字段）
```json
{
  "payment_id": "now_9876543210",
  "order_id": "pay_20260508_abc123",
  "status": "finished",
  "price_amount": 29.9,
  "pay_amount": 29.85,
  "pay_currency": "usdttrc20",
  "actually_paid": 29.85,
  "tx_hash": "..."
}
```

### 5.5 支付相关错误码补充
| Code | HTTP | 说明 | 常见场景 |
|------|------|------|----------|
| 5001 | 400 | 支付金额不合法 | 金额不在允许范围内 |
| 5002 | 400 | 支付货币不支持 | pay_currency 不支持 |
| 5003 | 400 | 订单已过期 | 支付链接已失效 |
| 5004 | 400 | 重复支付 | 订单已支付成功 |
}
```

---

## 5. 通知与汇报相关接口（新增）

### 5.1 管理员发送测试通知
**POST** `/admin/notifications/test`

**请求 Body**
```json
{
  "channel": "telegram",
  "template_key": "affiliate_weekly_report",
  "target": "@livemask_ops"
}
```

### 5.2 获取通知模板列表
**GET** `/admin/notification-templates`

### 5.3 更新通知模板
**PUT** `/admin/notification-templates/:key`

---

## 6. 节点与 Free Zone 相关接口

### 6.3 客户端上报VPN连接质量（新增，闭环补充）
**POST** `/client/vpn/report-connection-quality`

用于App端上报本次连接的成功/失败、延迟等信息，以较低权重影响节点质量评分（与Agent上报形成互补）。

**请求 Body**
```json
{
  "node_id": "node_xxxxx",
  "success": true,
  "latency_ms": 128,
  "disconnect_reason": null,
  "network_type": "wifi",
  "duration_seconds": 3600
}
```

### 6.4 客户端节点快速反馈（新增，闭环补充）
**POST** `/client/nodes/quick-feedback`

用户在App内对当前连接节点进行“差评”反馈。系统会自动创建低优先级申诉，并可短期临时降低节点评分。

**请求 Body**
```json
{
  "node_id": "node_xxxxx",
  "rating": 1,
  "reason": "速度太慢，频繁断开",
  "current_connected": true
}
```

**处理逻辑**：
- 自动创建 `appeals` 记录（`source = 'user_quick_feedback'`，`priority = 'low'`）
- 如果同一节点在短时间内收到较多差评，可临时降低 `quality_score`（例如24小时内降低5-10分）

### 6.1 客户端获取推荐节点（已过滤 Free Zone）
**GET** `/client/nodes/recommend`

**响应说明**：
- 付费用户**自动过滤** `is_free_zone = true` 的节点
- 返回已按 `quality_score` + 延迟排序

### 6.2 管理员更新节点带宽限制
**PATCH** `/admin/nodes/:id/bandwidth-limit`

**请求 Body**
```json
{
  "bandwidth_limit_mbps": 300,
  "is_free_zone": true
}
```

---

## 7. 完整错误码表（推荐在开发时使用）

（已在上方 1.4 节列出）

---

## 8. C2C 积分市场接口（新增，完整闭环版）

C2C 积分市场允许用户之间交易积分（Points）。买家可用 USDT 购买积分，卖家可将积分挂单出售换取 USDT。

**核心设计原则**：
- 交易撮合由平台托管（Escrow），资金和积分均由平台中转。
- 买家支付 USDT 走现有支付系统（`/client/payment/create`）。
- 支付成功后（Webhook 回调），系统自动释放积分给买家，并将 USDT 打给卖家（扣除平台手续费）。
- 与推广大使佣金、用户忠诚度、C2C 平台补贴形成完整闭环。

### 8.1 创建卖单（卖积分换 USDT）
**POST** `/client/c2c/sell-order/create`

**请求 Body**
```json
{
  "points_amount": 5000,
  "price_per_point_usdt": 0.0085,
  "min_trade_points": 100,
  "remark": "急售"
}
```

### 8.2 创建买单（用 USDT 买积分）
**POST** `/client/c2c/buy-order/create`

**请求 Body**
```json
{
  "points_amount": 3000,
  "max_price_per_point_usdt": 0.009
}
```

### 8.3 浏览市场订单
**GET** `/client/c2c/market?type=sell&min_points=1000&max_price=0.01`

### 8.4 执行/确认交易（买家确认支付）
**POST** `/client/c2c/trade/execute`

买家选择一个卖单后，系统会先创建一个 USDT 支付订单（内部调用支付系统），用户完成支付后，Webhook 成功 → 系统释放积分并结算给卖家。

**请求 Body**
```json
{
  "sell_order_id": "c2c_sell_xxxxx",
  "points_amount": 2000
}
```

**响应**：返回支付订单信息，引导用户去支付。

### 8.5 我的 C2C 订单列表
**GET** `/client/c2c/my-orders?status=active,completed`

### 8.6 取消订单
**POST** `/client/c2c/order/cancel`

### 8.7 发起交易争议
**POST** `/client/c2c/dispute/create`

### 8.8 管理员 C2C 订单管理
**GET** `/admin/c2c/orders`
**POST** `/admin/c2c/dispute/:id/resolve`

**业务闭环说明**：
- 买家支付成功后，Webhook (`/internal/payment/webhook/nowpayments`) 会触发 C2C 交易完成逻辑：
  1. 增加买家积分余额
  2. 扣除卖家积分 + 增加卖家 USDT 余额（扣平台手续费）
  3. 给推广大使增加小额佣金（如果有）
  4. 更新用户忠诚度
  5. 发送通知

详细字段定义、状态流转、风控规则见《LiveMask_数据库详细设计_v3.6.md》中的 C2C 相关表设计。

---

**文档状态**：此版本已达到**生产级 API 契约**标准，可直接用于生成客户端 SDK 和后端 Controller 代码。C2C 积分市场接口已与支付系统形成完整闭环。

---

## 11. 订阅套餐管理接口（Subscription Plans）- 新增

### 11.1 获取套餐列表（支持筛选）
**GET** `/admin/subscription/plans`

**Query 参数**：
- `status`: active | draft | inactive
- `target_tag`: 科学上网 | 电商 | AI | 游戏
- `page`, `page_size`

**响应示例**：
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "plan_xxx",
        "name": "专业科学上网套餐",
        "image_mobile_url": "https://cdn.../mobile.jpg",
        "image_pc_url": "https://cdn.../pc.jpg",
        "target_tags": ["科学上网", "AI"],
        "data_allowance_gb": 500,
        "validity_days": 30,
        "has_bandwidth_limit": true,
        "max_bandwidth_mbps": 100,
        "price_usdt": 9.9,
        "status": "active",
        "subscriber_count": 1240,
        "sort_order": 10
      }
    ],
    "total": 12,
    "page": 1
  }
}
```

### 11.2 创建/更新套餐
**POST** `/admin/subscription/plans`（新建）
**PUT** `/admin/subscription/plans/{id}`（更新）

**请求 Body**（与 `subscription_plans` 表字段对应）：
```json
{
  "name": "专业科学上网套餐",
  "description": "适合重度用户...",
  "image_mobile_url": "...",
  "image_pc_url": "...",
  "target_tags": ["科学上网", "AI工具"],
  "data_allowance_gb": 500,
  "validity_days": 30,
  "has_bandwidth_limit": true,
  "max_bandwidth_mbps": 100,
  "price_usdt": 9.9,
  "billing_cycle": "monthly",
  "is_active": true,
  "sort_order": 10,
  "features": {
    "support_ipv6": true,
    "max_devices": 5
  }
}
```

### 11.3 上下架套餐
**POST** `/admin/subscription/plans/{id}/toggle-status`

**Body**：
```json
{
  "is_active": true
}
```

### 11.4 删除套餐（软删除）
**DELETE** `/admin/subscription/plans/{id}`

---

## 12. Subscription Plans CRUD Go 实现示例

### 12.1 Model 定义
```go
// internal/model/subscription_plan.go
package model

import "time"

type SubscriptionPlan struct {
	ID                 string    `json:"id" db:"id"`
	Name               string    `json:"name" db:"name"`
	Description        string    `json:"description" db:"description"`
	ImageMobileURL     string    `json:"image_mobile_url" db:"image_mobile_url"`
	ImagePCURL         string    `json:"image_pc_url" db:"image_pc_url"`
	TargetTags         []string  `json:"target_tags" db:"target_tags"`
	DataAllowanceGB    float64   `json:"data_allowance_gb" db:"data_allowance_gb"`
	ValidityDays       int       `json:"validity_days" db:"validity_days"`
	HasBandwidthLimit  bool      `json:"has_bandwidth_limit" db:"has_bandwidth_limit"`
	MaxBandwidthMbps   int       `json:"max_bandwidth_mbps" db:"max_bandwidth_mbps"`
	PriceUSDT          float64   `json:"price_usdt" db:"price_usdt"`
	BillingCycle       string    `json:"billing_cycle" db:"billing_cycle"`
	IsActive           bool      `json:"is_active" db:"is_active"`
	SortOrder          int       `json:"sort_order" db:"sort_order"`
	Features           JSONB     `json:"features" db:"features"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time `json:"updated_at" db:"updated_at"`
}
```

### 12.2 Handler 示例（简化版）
```go
// internal/api/handler/subscription_plan_handler.go
func (h *SubscriptionPlanHandler) CreatePlan(c *gin.Context) {
	var req CreatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"code": 1001, "message": err.Error()})
		return
	}

	plan := &model.SubscriptionPlan{
		// ... 字段映射
	}

	if err := h.svc.CreatePlan(c.Request.Context(), plan); err != nil {
		c.JSON(500, gin.H{"code": 5000, "message": "创建失败"})
		return
	}

	c.JSON(200, gin.H{"code": 0, "data": plan})
}
```

**完整三层架构代码**已同步到 `LiveMask_普通用户订阅全生命周期管理设计_v3.6.md` 附录中。

---

**文档状态更新**：订阅套餐管理接口已与普通用户订阅生命周期、支付系统、NodeAgent 配置下发形成完整闭环。
