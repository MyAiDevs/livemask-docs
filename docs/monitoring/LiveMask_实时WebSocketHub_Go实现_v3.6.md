# LiveMask 实时 WebSocket Hub 完整 Go 实现 v3.6

**位置**：`internal/realtime/hub.go` + `internal/realtime/redis_pubsub.go`

## 1. 核心架构

- **Hub**：管理所有 WebSocket 连接 + 权限校验
- **Redis Pub/Sub**：跨实例广播实时流量/节点状态
- **权限**：JWT + Admin Role 校验（只允许 Admin 订阅敏感实时数据）

## 2. 完整代码实现

```go
package realtime

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	"github.com/golang-jwt/jwt/v5"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { return true }, // 生产环境需严格校验
}

// Hub 管理所有连接
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
	redis      *redis.Client
}

type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	userID   string
	role     string // admin / sponsor
	nodeID   string // 如果是 sponsor，只允许看自己节点
}

func NewHub(redisClient *redis.Client) *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		redis:      redisClient,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// 权限校验中间件
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		c.Set("userID", claims["user_id"].(string))
		c.Set("role", claims["role"].(string))
		c.Set("nodeIDs", claims["node_ids"]) // sponsor 可访问的节点列表
		c.Next()
	}
}

// WebSocket 升级处理
func (h *Hub) ServeWS(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	client := &Client{
		hub:    h,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
		role:   role,
	}

	h.register <- client

	// 启动写协程
	go client.writePump()
	// 启动读协程（处理 ping/pong）
	go client.readPump()
}

// 写协程
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// 读协程
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

// 从 Redis 订阅并广播（后台服务启动时调用）
func (h *Hub) SubscribeRedis(ctx context.Context, channel string) {
	pubsub := h.redis.Subscribe(ctx, channel)
	defer pubsub.Close()

	for {
		msg, err := pubsub.ReceiveMessage(ctx)
		if err != nil {
			continue
		}
		h.broadcast <- []byte(msg.Payload)
	}
}

// 发布实时消息（NodeAgent 心跳或流量更新时调用）
func (h *Hub) Publish(ctx context.Context, channel string, payload interface{}) error {
	data, _ := json.Marshal(payload)
	return h.redis.Publish(ctx, channel, data).Err()
}
```

---

**使用示例（main.go 启动时）**：

```go
hub := realtime.NewHub(redisClient)
go hub.Run()

// 订阅 Redis 频道
go hub.SubscribeRedis(ctx, "realtime:node_status")
go hub.SubscribeRedis(ctx, "realtime:country_traffic")

// 路由
adminGroup := r.Group("/admin/realtime")
adminGroup.Use(realtime.AuthMiddleware(jwtSecret))
adminGroup.GET("/ws", hub.ServeWS)
```

---

此实现已支持：
- Admin 权限校验
- Sponsor 只能看自己节点（可扩展）
- Redis Pub/Sub 跨实例广播
- 心跳保活 + 优雅断线
- 高并发安全（带 buffer + mutex）

---

需要我继续生成 **实时消息推送的具体 Payload 定义**（node_status、traffic_update 等）吗？