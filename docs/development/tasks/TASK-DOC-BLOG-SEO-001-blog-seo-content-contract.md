# TASK-DOC-BLOG-SEO-001 - Blog / SEO Content Contract Definition

- 状态：Ready
- Owner：Docs
- 创建日期：2026-05-18
- 目标完成日期：2026-05-18
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-website`, `livemask-admin`, `livemask-ci-cd`

## 1. Background

当前 Backend 缺少 Blog 文章数据模型和接口，Website 也缺少同步实现。Blog 内容要用于 SEO 收录、用户教育、下载转化、协议/隐私科普、产品更新和公告。必须避免随机字段设计，先定义契约。

## 2. Scope

### In Scope

- 定义 Blog / SEO 内容系统跨仓库契约，约束 Backend 数据模型、Public API、Website 页面、SEO meta、sitemap、RSS/Atom、结构化数据（JSON-LD）、采集友好规则。
- 新增文档：
  - `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md`
  - 本任务单
- 登记后续 implementation TASK：
  - `TASK-BACKEND-BLOG-001`
  - `TASK-WEBSITE-BLOG-001`
  - `TASK-ADMIN-BLOG-001`
  - `TASK-CICD-BLOG-SEO-001`
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
| `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md` | Blog / SEO 内容系统跨仓库契约：数据模型、API、SEO 规则、Website 路由、安全规则 |

## 4. Cross-Repo Impact

| 仓库 | 后续必须做什么 | 是否本任务修改 |
| --- | --- | --- |
| `livemask-backend` | 实现 BlogArticle DB schema（id/slug/locale/title/excerpt/content_markdown/content_html/status/visibility/author_name/category/tags/cover_image_url/SEO fields/时间字段）、CRUD Public API（`GET /api/v1/content/blog` 列表和详情、categories、tags、sitemap 数据源、RSS 数据源）、Admin API 预留端点 | 否 |
| `livemask-website` | 实现 blog 路由（`/blog`、`/blog/[slug]`、`/blog/category/[category]`、`/blog/tag/[tag]`、`/sitemap.xml`、`/rss.xml`）、SSR/SSG 渲染、SEO meta、JSON-LD `BlogPosting`、breadcrumb、robots meta | 否 |
| `livemask-admin` | 实现 Admin 文章管理页面（列表/创建/编辑/发布/归档） | 否 |
| `livemask-app` | 无直接影响 | 否 |
| `livemask-nodeagent` | 无直接影响 | 否 |
| `livemask-ci-cd` | 添加 Blog/SEO 相关的 CI smoke 测试 | 否 |
| `livemask-docs` | 新增契约和任务文档 | 是 |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs | Backend | `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md` — 数据模型、API 契约、SEO 规则、安全规则 | 契约字段未覆盖所有必填字段 |
| 2 | Docs | Website | `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md` — 路由契约、SEO 要求、JSON-LD 模板、状态码 | Website 无 SSR/SSG 基础设施 |
| 3 | Docs | Admin | `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md` — Admin API 预留定义 | Backend Admin API 未实现 |
| 4 | Docs | CI/CD | `BLOG_SEO_CONTENT_CONTRACT.md` 后续任务清单 | 无 |

## 6. Implementation Plan

- [x] 创建 `docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md`
  - [x] 内容类型定义（blog_article / help_article / release_note / announcement）
  - [x] BlogArticle 完整数据模型（必填字段 + 建议字段）
  - [x] SEO 采集规则（slug、title/description、canonical、robots、sitemap、RSS、hreflang、图片、内容安全、API 缓存）
  - [x] Public API 契约（列表、详情、分类、标签、sitemap 数据源、RSS 数据源）
  - [x] Admin API 预留
  - [x] Website 路由契约
  - [x] Website SEO 要求（SSR/SSG、meta、JSON-LD、breadcrumb、内部链接、状态码）
  - [x] 数据安全规则
  - [x] 后续任务登记
- [x] 创建本任务单 `TASK-DOC-BLOG-SEO-001-blog-seo-content-contract.md`
- [ ] 运行 `scripts/check-docs.sh` 验证
- [ ] 提交到 `dev` 分支

## 7. Validation Plan

- [x] Contract structure review — 契约覆盖所有要求的模块
- [x] Cross-repo impact reviewed — 不修改其他仓库
- [x] Follow-up TASKs registered — 4 个后续 TASK
- [ ] `scripts/check-docs.sh` — 文档链接和 traceability 检查

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| 后续实现时字段定义遗漏 | 跨端不一致 | 各端实现前必须重新审阅本契约 | Docs |
| 契约过于详细反而导致实现僵化 | 约束过度 | 建议字段标记为 MVP 可跳过，后续按需补充 | Docs |
| slug 修改无 redirect | SEO 流量丢失 | 契约强制 slug 发布后不可改 + 301 redirect 要求 | Backend |

## 9. Rollback

- 回滚触发条件：check-docs 失败且无法修复，或后续端反馈字段定义不合理
- 回滚步骤：`git revert` 本任务提交，删除 `docs/contracts/content/` 和任务单，推送回 `dev`
- 回滚验证：`scripts/check-docs.sh` 通过，`.cursorrules` 未改变

## 10. Completion Evidence

- Commit：待提交
- 文档链接：`docs/contracts/content/BLOG_SEO_CONTENT_CONTRACT.md`
- Task 链接：`docs/development/tasks/TASK-DOC-BLOG-SEO-001-blog-seo-content-contract.md`
- 验证：`scripts/check-docs.sh` 执行结果

## 11. Follow-up

| TASK | Repo | Goal |
| --- | --- | --- |
| `TASK-BACKEND-BLOG-001` | `livemask-backend` | 实现 BlogArticle DB schema、CRUD API、sitemap/RSS 数据源 |
| `TASK-WEBSITE-BLOG-001` | `livemask-website` | 实现 blog 页面、SEO meta、JSON-LD、sitemap.xml、RSS |
| `TASK-ADMIN-BLOG-001` | `livemask-admin` | 实现 Admin 文章管理页面 |
| `TASK-CICD-BLOG-SEO-001` | `livemask-ci-cd` | 添加 Blog/SEO 相关的 CI smoke 测试 |

未完成项：无
