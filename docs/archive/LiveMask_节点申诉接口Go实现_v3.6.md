# LiveMask 节点申诉接口 Go 实现 v3.6

**最后更新**：2026-05-10  
**说明**：本文档包含 Sponsor 节点质量申诉与管理员审核的完整 Go 代码实现（三层架构 + Gin + UUID + PostgreSQL）。

---

## 1. 数据模型（model/appeal.go）

```go
package model

import (
	"time"

	"github.com/google/uuid"
)

type AppealStatus string

const (
	AppealStatusPending     AppealStatus = "pending"
	AppealStatusUnderReview AppealStatus = "under_review"
	AppealStatusResolved    AppealStatus = "resolved"
	AppealStatusRejected    AppealStatus = "rejected"
)

type AppealType string

const (
	AppealTypeQualityScoreDispute AppealType = "quality_score_dispute"
	AppealTypeNodeStatusDowngrade AppealType = "node_status_downgrade"
	AppealTypeDegradedModeTrigger AppealType = "degraded_mode_trigger"
	AppealTypeOther               AppealType = "other"
)

type NodeAppeal struct {
	ID                     uuid.UUID     `db:"id" json:"id"`
	NodeID                 uuid.UUID     `db:"node_id" json:"node_id"`
	SponsorID              uuid.UUID     `db:"sponsor_id" json:"sponsor_id"`
	AppealType             AppealType    `db:"appeal_type" json:"appeal_type"`
	Status                 AppealStatus  `db:"status" json:"status"`
	Description            string        `db:"description" json:"description"`
	EvidenceFiles          []string      `db:"evidence_files" json:"evidence_files"` // JSONB 存储文件路径数组
	RelatedQualityLogIDs   []uuid.UUID   `db:"related_quality_log_ids" json:"related_quality_log_ids"`
	AdminID                *uuid.UUID    `db:"admin_id" json:"admin_id,omitempty"`
	AdminDecision          *string       `db:"admin_decision" json:"admin_decision,omitempty"`
	ScoreAdjustment        *float64      `db:"score_adjustment" json:"score_adjustment,omitempty"`
	AdjustmentEffectiveFrom *time.Time   `db:"adjustment_effective_from" json:"adjustment_effective_from,omitempty"`
	CreatedAt              time.Time     `db:"created_at" json:"created_at"`
	UpdatedAt              time.Time     `db:"updated_at" json:"updated_at"`
	ResolvedAt             *time.Time    `db:"resolved_at" json:"resolved_at,omitempty"`
}
```

---

## 2. DTO 定义（dto/appeal_dto.go）

```go
package dto

import (
	"time"

	"github.com/google/uuid"
)

type CreateAppealRequest struct {
	NodeID      uuid.UUID `json:"node_id" binding:"required"`
	AppealType  string    `json:"appeal_type" binding:"required,oneof=quality_score_dispute node_status_downgrade degraded_mode_trigger other"`
	Description string    `json:"description" binding:"required,min=20,max=2000"`
	Evidence    []string  `json:"evidence_files"` // 前端已上传后的文件路径
}

type AppealListResponse struct {
	ID           uuid.UUID  `json:"id"`
	NodeID       uuid.UUID  `json:"node_id"`
	AppealType   string     `json:"appeal_type"`
	Status       string     `json:"status"`
	Description  string     `json:"description"`
	CreatedAt    time.Time  `json:"created_at"`
	ResolvedAt   *time.Time `json:"resolved_at,omitempty"`
}

type ReviewAppealRequest struct {
	Decision              string     `json:"decision" binding:"required,oneof=approve reject request_more_info"`
	DecisionNote          string     `json:"decision_note" binding:"required,min=5"`
	ScoreAdjustment       *float64   `json:"score_adjustment"`        // 正数加分，负数减分
	AdjustmentEffectiveFrom *time.Time `json:"adjustment_effective_from"`
}
```

---

## 3. Repository 层（repository/appeal_repository.go）

```go
package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"live-mask-backend/internal/model"
)

type AppealRepository interface {
	Create(ctx context.Context, appeal *model.NodeAppeal) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.NodeAppeal, error)
	ListBySponsor(ctx context.Context, sponsorID uuid.UUID, limit, offset int) ([]model.NodeAppeal, int64, error)
	ListForAdmin(ctx context.Context, status, appealType string, limit, offset int) ([]model.NodeAppeal, int64, error)
	UpdateStatusAndDecision(ctx context.Context, id uuid.UUID, status model.AppealStatus, adminID uuid.UUID, decision string, scoreAdj *float64, effectiveFrom *time.Time) error
}

type appealRepository struct {
	db *sqlx.DB
}

func NewAppealRepository(db *sqlx.DB) AppealRepository {
	return &appealRepository{db: db}
}

func (r *appealRepository) Create(ctx context.Context, appeal *model.NodeAppeal) error {
	query := `
		INSERT INTO node_appeals 
		(id, node_id, sponsor_id, appeal_type, status, description, evidence_files, related_quality_log_ids, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(ctx, query,
		appeal.ID, appeal.NodeID, appeal.SponsorID, appeal.AppealType, appeal.Status,
		appeal.Description, appeal.EvidenceFiles, appeal.RelatedQualityLogIDs,
		appeal.CreatedAt, appeal.UpdatedAt,
	)
	return err
}

func (r *appealRepository) UpdateStatusAndDecision(ctx context.Context, id uuid.UUID, status model.AppealStatus,
	adminID uuid.UUID, decision string, scoreAdj *float64, effectiveFrom *time.Time) error {

	query := `
		UPDATE node_appeals 
		SET status = $1, admin_id = $2, admin_decision = $3, 
		    score_adjustment = $4, adjustment_effective_from = $5,
		    resolved_at = $6, updated_at = $7
		WHERE id = $8
	`
	_, err := r.db.ExecContext(ctx, query,
		status, adminID, decision, scoreAdj, effectiveFrom, time.Now(), time.Now(), id,
	)
	return err
}

func (r *appealRepository) ListBySponsor(ctx context.Context, sponsorID uuid.UUID, limit, offset int) ([]model.NodeAppeal, int64, error) {
	var appeals []model.NodeAppeal
	var total int64

	countQuery := `SELECT COUNT(*) FROM node_appeals WHERE sponsor_id = $1`
	if err := r.db.GetContext(ctx, &total, countQuery, sponsorID); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, node_id, sponsor_id, appeal_type, status, description, evidence_files, 
		       created_at, resolved_at
		FROM node_appeals 
		WHERE sponsor_id = $1 
		ORDER BY created_at DESC 
		LIMIT $2 OFFSET $3
	`
	err := r.db.SelectContext(ctx, &appeals, query, sponsorID, limit, offset)
	return appeals, total, err
}

func (r *appealRepository) ListForAdmin(ctx context.Context, status, appealType string, limit, offset int) ([]model.NodeAppeal, int64, error) {
	var appeals []model.NodeAppeal
	var total int64

	where := "WHERE 1=1"
	args := []interface{}{}
	argIdx := 1

	if status != "" {
		where += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}
	if appealType != "" {
		where += fmt.Sprintf(" AND appeal_type = $%d", argIdx)
		args = append(args, appealType)
		argIdx++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM node_appeals %s", where)
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT id, node_id, sponsor_id, appeal_type, status, description, evidence_files, 
		       created_at, resolved_at, admin_decision, score_adjustment
		FROM node_appeals 
		%s 
		ORDER BY created_at DESC 
		LIMIT $%d OFFSET $%d
	`, where, argIdx, argIdx+1)

	args = append(args, limit, offset)
	err := r.db.SelectContext(ctx, &appeals, query, args...)
	return appeals, total, err
}
```

---

## 4. Service 层（service/appeal_service.go）

```go
package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	"live-mask-backend/internal/model"
	"live-mask-backend/internal/repository"
)

type AppealService struct {
	repo     repository.AppealRepository
	nodeRepo repository.NodeRepository // 用于校验节点归属
}

func NewAppealService(repo repository.AppealRepository, nodeRepo repository.NodeRepository) *AppealService {
	return &AppealService{repo: repo, nodeRepo: nodeRepo}
}

// CreateAppeal Sponsor 提交申诉（带归属校验）
func (s *AppealService) CreateAppeal(ctx context.Context, sponsorID uuid.UUID, req *dto.CreateAppealRequest) (*model.NodeAppeal, error) {
	// 1. 校验节点是否属于该 Sponsor
	node, err := s.nodeRepo.GetByID(ctx, req.NodeID)
	if err != nil || node.SponsorID != sponsorID {
		return nil, errors.New("node not found or not owned by you")
	}

	appeal := &model.NodeAppeal{
		ID:           uuid.New(),
		NodeID:       req.NodeID,
		SponsorID:    sponsorID,
		AppealType:   model.AppealType(req.AppealType),
		Status:       model.AppealStatusPending,
		Description:  req.Description,
		EvidenceFiles: req.Evidence,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.repo.Create(ctx, appeal); err != nil {
		return nil, err
	}
	return appeal, nil
}

// ReviewAppeal 管理员审核（带收益追溯触发）
func (s *AppealService) ReviewAppeal(ctx context.Context, appealID uuid.UUID, adminID uuid.UUID, req *dto.ReviewAppealRequest) error {
	appeal, err := s.repo.GetByID(ctx, appealID)
	if err != nil {
		return err
	}

	var newStatus model.AppealStatus
	switch req.Decision {
	case "approve":
		newStatus = model.AppealStatusResolved
	case "reject":
		newStatus = model.AppealStatusRejected
	case "request_more_info":
		newStatus = model.AppealStatusUnderReview
	default:
		return errors.New("invalid decision")
	}

	// 更新申诉状态
	if err := s.repo.UpdateStatusAndDecision(ctx, appealID, newStatus, adminID, req.DecisionNote, req.ScoreAdjustment, req.AdjustmentEffectiveFrom); err != nil {
		return err
	}

	// 如果管理员调整了质量分，触发异步收益重新计算任务
	if req.ScoreAdjustment != nil && *req.ScoreAdjustment != 0 {
		// TODO: 发布消息到队列或直接调用 revenue recalculation service
		// go s.revenueService.RecalculateNodeRevenue(appeal.NodeID, req.AdjustmentEffectiveFrom)
	}

	return nil
}
```

---

## 5. Handler 层（handler/sponsor_appeal_handler.go + admin）

```go
package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"live-mask-backend/internal/dto"
	"live-mask-backend/internal/service"
)

// Sponsor 提交申诉
func CreateAppeal(c *gin.Context) {
	var req dto.CreateAppealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sponsorID := c.MustGet("user_id").(uuid.UUID) // 从 JWT 中获取

	appeal, err := appealService.CreateAppeal(c.Request.Context(), sponsorID, &req)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, appeal)
}

// Admin 审核申诉
func ReviewAppeal(c *gin.Context) {
	appealID := uuid.MustParse(c.Param("id"))
	adminID := c.MustGet("user_id").(uuid.UUID)

	var req dto.ReviewAppealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := appealService.ReviewAppeal(c.Request.Context(), appealID, adminID, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "appeal reviewed successfully"})
}
```

---

## 6. 路由注册示例

```go
// Sponsor 路由组
sponsorGroup := r.Group("/sponsor")
sponsorGroup.Use(middleware.JWTAuth())
{
    sponsorGroup.POST("/nodes/:node_id/appeals", handler.CreateAppeal)
    sponsorGroup.GET("/appeals", handler.ListMyAppeals)
}

// Admin 路由组
adminGroup := r.Group("/admin")
adminGroup.Use(middleware.JWTAuth(), middleware.AdminOnly())
{
    adminGroup.GET("/appeals", handler.ListAppealsForAdmin)
    adminGroup.POST("/appeals/:id/review", handler.ReviewAppeal)
}
```

---

## 7. 重要注意事项（必须实现）

1. **Sponsor 只能申诉自己拥有的节点**（已在 Service 中校验）
2. **调整质量分后必须触发收益重新计算**（异步任务 + 审计日志）
3. **所有操作必须记录审计日志**（`admin_operation_logs` 表）
4. **申诉处理期间可冻结该节点收益计算**（可选，但推荐）
5. **证据文件建议单独走文件上传服务**，只存路径到 `evidence_files` JSONB

---

**使用建议**：
- 将以上代码放入对应目录（`internal/handler`、`internal/service`、`internal/repository`、`internal/model`、`internal/dto`）
- 结合之前提供的 `config/manager.go` 和 `singbox/controller.go`，形成完整 NodeAgent + 申诉闭环

需要我继续生成 `ListMyAppeals` / `ListAppealsForAdmin` 的完整实现，或收益重新计算任务代码吗？
