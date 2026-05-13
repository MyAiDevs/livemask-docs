# Alert And Dashboard Index

## 1. MVP 指标

| Metric | Owner | Level | 说明 |
| --- | --- | --- | --- |
| `api_request_errors_total` | Backend / SRE | P1 | API 错误率 |
| `api_db_write_errors_total` | Backend / SRE | P0 | DB 写失败 |
| `api_redis_write_errors_total` | Backend / SRE | P1 | Redis 写失败 |
| `redis_stale_state_filtered_total` | Backend | P2 | 过滤 stale 节点次数 |
| `nodeagent_report_duplicate_total` | NodeAgent / Backend | P2 | 重复上报 |
| `config_version_lagging_nodes` | Backend / Ops | P1 | 配置滞后节点数 |
| `payment_webhook_signature_invalid_total` | Payment / Security | P0 | Webhook 验签失败 |
| `entitlement_grant_failed_total` | Backend / Payment | P0 | 权益发放失败 |
| `app_connection_success_rate` | App / Product | P1 | App 连接成功率 |
| `node_degraded_count` | NodeAgent / Ops | P1 | degraded 节点数 |

## 2. MVP Dashboard

| Dashboard | Owner | 内容 |
| --- | --- | --- |
| System Health | SRE | API、DB、Redis、Worker、Queue |
| Node Realtime | NodeAgent / Ops | 心跳、degraded、流量、质量 |
| Config Rollout | Backend / Ops | config version 生效率、失败率 |
| Payment Health | Payment | webhook、订单状态、权益发放 |
| App Experience | Product / App | 连接成功率、fallback、quick feedback |

## 3. 告警恢复条件

- API error：连续 10 分钟低于阈值。
- DB write error：无新增失败并确认无积压 outbox。
- Redis write error：Redis 可写，补偿任务完成。
- Payment P0：异常订单全部有处理记录。
- Config lag：滞后节点低于阈值或已进入维护清单。

## 4. 发布观察窗口

- T+15 min：API / DB / Redis / payment webhook 无 P0。
- T+1 h：App 连接成功率无明显下降。
- T+24 h：支付对账无异常，NodeAgent 上报无积压。
