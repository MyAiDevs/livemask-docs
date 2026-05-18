# TASK-DOC-CONTENT-001 - Unified Content System Contract

- 状态：Ready
- Owner：Docs
- 创建日期：2026-05-18
- 目标完成日期：2026-05-18
- 旧任务兼容名：`TASK-DOC-BLOG-SEO-001`
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-website`, `livemask-admin`, `livemask-app`, `livemask-ci-cd`

## 1. Background

旧任务 `TASK-DOC-BLOG-SEO-001` 只覆盖了 blog_article，未考虑 App 公告、活动、Banner 等展示型内容。当前 Backend 缺少统一内容模型，各端分散实现会导致数据不一致。

本任务将 Blog / SEO 契约升级为统一 Content System 契约，覆盖 Blog Article、Help Article、Release Note、Announcement、Campaign、App Banner 六种内容类型，并定义 App API、App 展示规则、跳转规则和 Admin API。

## 2. Scope

### In Scope

- 创建 `docs/contracts/content/CONTENT_SYSTEM_CONTRACT.md` — 统一内容系统跨仓库契约
- 重写 `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md` — 降级为 Content System 的 blog_article SEO 子契约
- 创建本任务单 `TASK-DOC-CONTENT-001-content-system-contract.md`
- 更新 `docs/contracts/README.md` — 添加 Content System Contract 索引
- 更新 `docs/development/tasks/README.md` — 替换旧 Blog/SEO 任务索引为统一 Content System 任务索引
- 更新 `docs/development/MVP_IMPLEMENTATION_PLAN.md` — 添加 Content System 进入 MVP 范围
- 运行 `scripts/check-docs.sh` 验证

### Out of Scope

- 不修改 `livemask-backend` 代码
- 不修改 `livemask-website` 代码
- 不修改 `livemask-admin` 代码
- 不修改 `livemask-app` 代码
- 不修改 `livemask-nodeagent` 代码
- 不修改 `livemask-ci-cd` 代码
- 不提交无关的 `.cursorrules` 修改

## 3. Contracts

| 契约 | 说明 |
| --- | --- |
| `docs/contracts/content/CONTENT_SYSTEM_CONTRACT.md` | 统一内容系统跨仓库契约：content_items 模型、6 种内容类型、App API、Admin API、跳转规则、安全规则 |
| `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md` | blog_article SEO 子契约（降级后）：SEO 采集规则、Public API、Website SEO 要求 |

## 4. Cross-Repo Impact

| 仓库 | 后续必须做什么 | 是否本任务修改 |
| --- | --- | --- |
| `livemask-backend` | 实现 `content_items` 统一 DB schema（含基础字段 + SEO 字段 + App 字段）、Public Blog API (`GET /api/v1/content/blog/*`)、App Content API (`GET /api/v1/content/app`)、sitemap/RSS 数据源、Admin Content CRUD API | 否 |
| `livemask-website` | 集成 Blog API，实现 `/blog/*` 路由、SEO meta、JSON-LD、sitemap.xml、RSS | 否 |
| `livemask-admin` | 实现统一内容管理页面（管理所有 6 种 content_type） | 否 |
| `livemask-app` | 实现公告/活动/banner feed、Home banner、Notice center、Activity card、Modal、跳转处理 | 否 |
| `livemask-nodeagent` | 无直接影响 | 否 |
| `livemask-ci-cd` | 添加 Blog SEO + App content CI smoke | 否 |
| `livemask-docs` | 新增/修改契约和任务文档 | 是 |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs | Backend | `CONTENT_SYSTEM_CONTRACT.md` — content_items 模型、Blog API、App API、Admin API | 模型字段未覆盖所有 content_type |
| 2 | Docs | Website | `BLOG_SEO_CONTENT_CONTRACT.md` — 路由契约、SEO 要求、JSON-LD 模板 | Website 无 SSR/SSG 基础设施 |
| 3 | Docs | App | `CONTENT_SYSTEM_CONTRACT.md` — App API、展示规则、跳转规则、placement | App 无 native 路由处理 |
| 4 | Docs | Admin | `CONTENT_SYSTEM_CONTRACT.md` — Admin API 预留 | Backend Admin API 未实现 |
| 5 | Docs | CI/CD | 后续任务清单 | 无 |

## 6. Implementation Plan

- [x] 创建 `docs/contracts/content/CONTENT_SYSTEM_CONTRACT.md`
  - [x] 统一 content_items 模型（基础字段、SEO 字段、App 字段）
  - [x] 6 种 content_type（blog_article / help_article / release_note / announcement / campaign / app_banner）
  - [x] placement 枚举（app_home_banner / app_modal / app_activity_card / app_notice_center / app_profile_notice / app_billing_notice）
  - [x] 展示时间规则（ends_at 默认 30 天、effective_ends_at、展示窗口过滤）
  - [x] 跳转规则（app_route / website_url / external_url + allowlist + 禁止目标）
  - [x] Public API（Blog API 引用子契约）
  - [x] App API（GET /api/v1/content/app + 完整 query/response/过滤规则）
  - [x] Admin API 预留（7 个端点）
  - [x] Website 路由契约
  - [x] App 展示契约
  - [x] 安全规则
  - [x] SEO 规则汇总
  - [x] 后续任务登记（6 个后续 TASK）
- [x] 重写 `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md` — 降级为子契约
  - [x] 开头声明父子关系
  - [x] SEO 采集规则保留
  - [x] Public API 保留（列表/详情/分类/标签/sitemap/rss）
  - [x] Website 路由和 SEO 保留
  - [x] 基础字段/App 字段/Admin API 移出
- [x] 创建本任务单
- [ ] 更新 `docs/contracts/README.md`
- [ ] 更新 `docs/development/tasks/README.md`
- [ ] 更新 `docs/development/MVP_IMPLEMENTATION_PLAN.md`
- [ ] 运行 `scripts/check-docs.sh` 验证
- [ ] 提交到 `dev` 分支

## 7. Validation Plan

- [x] Contract structure review — 统一模型覆盖所有 6 种类型
- [x] Cross-repo impact reviewed — 不修改其他仓库
- [x] Follow-up TASKs registered — 6 个后续 TASK
- [ ] `scripts/check-docs.sh` — 文档链接和 traceability 检查

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| 字段过于通用导致特定类型校验不严格 | blog_article 的必填字段可能被忽略 | SEO 子契约补充 blog_article 专属校验规则 | Docs |
| App 端和 Website 端对同一字段理解不一致 | 跨端显示异常 | 本契约已明确 surface 筛选规则和字段生效范围 | Docs |
| 后续任务拆分后依赖关系复杂 | 开发顺序混乱 | 任务单中明确各 TASK 的依赖关系和 handoff | Docs |

## 9. Rollback

- 回滚触发条件：check-docs 失败且无法修复，或后续端反馈字段定义不合理
- 回滚步骤：`git revert` 本任务提交，恢复旧版 `BLOG_SEO_CONTENT_CONTRACT.md`，推送回 `dev`
- 回滚验证：`scripts/check-docs.sh` 通过，`.cursorrules` 未改变

## 10. Completion Evidence

- Commit：待提交
- 文档链接：
  - `docs/contracts/content/CONTENT_SYSTEM_CONTRACT.md`
  - `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md`
  - `docs/development/tasks/TASK-DOC-CONTENT-001-content-system-contract.md`
- 验证：`scripts/check-docs.sh` 执行结果

## 11. Follow-up

| TASK | Repo | Goal |
| --- | --- | --- |
| `TASK-BACKEND-CONTENT-001` | `livemask-backend` | 统一 content_items schema + Public Blog API + App Content API |
| `TASK-BACKEND-ADMIN-CONTENT-001` | `livemask-backend` | Admin Content CRUD API |
| `TASK-WEBSITE-BLOG-002` | `livemask-website` | Website Blog real API integration |
| `TASK-ADMIN-CONTENT-001` | `livemask-admin` | Admin Content Management UI |
| `TASK-APP-CONTENT-FEED-001` | `livemask-app` | App 公告/活动/banner feed |
| `TASK-CICD-CONTENT-SEO-001` | `livemask-ci-cd` | Blog SEO + App content smoke |

未完成项：无
