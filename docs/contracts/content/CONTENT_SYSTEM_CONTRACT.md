# Content System 跨仓库统一契约

> TASK: `TASK-DOC-CONTENT-001`（旧任务兼容名: `TASK-DOC-BLOG-SEO-001`）
>
> 本文定义 LiveMask 统一内容系统（Content System）在 Backend / Website / Admin / App 之间的完整契约。
>
> Backend 不应只做 `blog_articles` 表。所有内容类型共用一个 `content_items`（或 `content_entries`）模型，`content_type` 区分业务类型，SEO 字段和 App 展示字段作为可选扩展。
>
> 子契约：[BLOG_SEO_CONTENT_CONTRACT.md](./BLOG_SEO_CONTENT_CONTRACT.md) — blog_article 专属的 SEO 要求与 Website 页面规范。

## 1. 设计原则

1. **统一模型** — 所有内容类型共用 `content_items` 表，严禁分散建表。
2. **按 type 扩展** — `content_type` 决定行为、校验规则、Surface 输出和 SEO/App 字段生效范围。
3. **字段分层** — 基础字段所有类型共用；SEO 字段仅对 indexable 类型生效；App 字段仅对 app surface 类型生效。
4. **展示时间驱动** — `published_at`、`starts_at`、`ends_at` 联合控制展示窗口，过期内容自动隐藏。

## 2. 内容类型

| 类型 | 标识 | MVP | 说明 |
| --- | --- | --- | --- |
| Blog 文章 | `blog_article` | 是 | SEO 收录、用户教育、下载转化 |
| 帮助文章 | `help_article` | 是 | 协议/隐私科普、FAQ、使用指南 |
| 发布说明 | `release_note` | 否 | 产品更新、版本发布、Changelog |
| 公告 | `announcement` | 是 | 维护通知、政策变更、紧急公告 |
| 活动 | `campaign` | 是 | 推广活动、限时优惠、节日活动 |
| App Banner | `app_banner` | 是 | App 首页横幅、弹窗、插屏广告位 |

## 3. content_items 统一数据模型

### 3.1 基础字段（所有类型共用）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid / int64 | 是 | 全局唯一标识 |
| `slug` | string | 是（`app_banner` 可为空） | URL 友好标识。**blog_article / help_article / release_note 发布后不可修改**，修改必须加 301 redirect |
| `locale` | string | 是 | 语言代码，如 `zh-CN`、`en-US`。预留多语言支持 |
| `content_type` | string | 是 | 枚举：`blog_article` / `help_article` / `release_note` / `announcement` / `campaign` / `app_banner` |
| `title` | string | 是 | 标题。SEO 类型建议 <= 60 chars |
| `excerpt` | string | 否 | 摘要 / 导语 |
| `content_markdown` | text | 否 | Markdown 原文。blog_article 必填，app_banner 可为空 |
| `content_html` | text | 否 | 预渲染 HTML。API 应能返回 HTML 或由 Website/App 渲染 |
| `status` | enum | 是 | `draft` / `published` / `archived` |
| `visibility` | enum | 否（默认 `public`） | `public` / `unlisted`。unlisted 不在列表/sitemap/App feed 中 |
| `surface` | enum | 是 | `website` / `app` / `admin` / `all`。控制该内容出现在哪些端 |
| `placement` | string | 否 | App 展示位标识。见 [4. App 字段] |
| `author_name` | string | 否 | 作者名（显示用） |
| `category` | string | 否 | 分类标识（用于 blog 类型） |
| `tags` | string[] | 否 | 标签列表 |
| `cover_image_url` | string | 否 | 封面图 / 配图 URL |
| `cover_image_alt` | string | 否 | 封面图 alt 文案 |
| `featured` | bool | 否 | 是否精选 / 置顶 |
| `sort_weight` | int | 否（默认 0） | 排序权重，越大越靠前 |
| `link_type` | string | 否 | 跳转类型：`none` / `app_route` / `website_url` / `external_url` |
| `link_target` | string | 否 | 跳转目标，格式取决于 `link_type`，见 [7. 跳转规则] |
| `published_at` | timestamp | 否 | 计划/实际发布时间 |
| `starts_at` | timestamp | 否 | 展示开始时间（App 内容） |
| `ends_at` | timestamp | 否 | 展示结束时间（App 内容） |
| `created_at` | timestamp | 是 | 创建时间 |
| `updated_at` | timestamp | 是 | 最后更新时间 |
| `deleted_at` | timestamp | 否 | 软删除时间 |

### 3.2 SEO 字段（仅 blog_article / help_article / release_note 生效）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `seo_title` | string | 否 | 自定义 SEO title。留空默认使用 `title`。建议 <= 60 chars |
| `seo_description` | string | 否 | 自定义 SEO meta description。建议 120-160 chars。留空截取 `excerpt` |
| `canonical_url` | string | 是* | 规范 URL。SEO 类型必须填写 |
| `og_title` | string | 否 | Open Graph title。留空使用 `seo_title` -> `title` |
| `og_description` | string | 否 | Open Graph description。留空使用 `seo_description` -> `excerpt` |
| `og_image_url` | string | 否 | Open Graph 图片。留空使用 `cover_image_url` |
| `robots` | string | 否（默认 `index,follow`） | robots meta。合法值：`index,follow` / `noindex,follow` / `index,nofollow` / `noindex,nofollow` |
| `schema_type` | string | 否（默认 `BlogPosting`） | `Article` / `BlogPosting` / `NewsArticle` |
| `reading_time_minutes` | int | 否 | 预计阅读时间（分钟） |
| `word_count` | int | 否 | 字数统计 |
| `source_type` | enum | 否 | `original` / `imported` / `generated` |
| `source_url` | string | 否 | 原文来源 URL（用于 imported/generated 溯源） |
| `noindex_reason` | string | 否 | 如果 `robots` 含 `noindex`，记录原因 |
| `related_article_ids` | uuid[] | 否 | 相关文章 ID 列表 |

> `*` — canonical_url 对 blog_article / help_article / release_note 为必填，对其他类型可不填。

### 3.3 App 展示字段（仅 surface=app/all 生效）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `starts_at` | timestamp | 否 | 展示开始时间（App 内容用） |
| `ends_at` | timestamp | 否 | 展示结束时间。为空则默认 +1 个月 |
| `default_display_days` | int | 否（默认 30） | 默认展示天数，用于计算 `effective_ends_at` |
| `priority` | int | 否（默认 0） | 展示优先级，越大越优先 |
| `dismissible` | bool | 否（默认 true） | 是否可手动关闭 |
| `require_login` | bool | 否（默认 false） | 是否需要登录后可见 |
| `min_app_version` | string | 否 | 最低 App 版本，低于此版本不展示 |
| `max_app_version` | string | 否 | 最高 App 版本，高于此版本不展示 |
| `platforms` | string[] | 否 | 平台筛选：`ios` / `android` / `macos` / `windows` / `linux` / `web`。空表示所有平台 |
| `audience_segment` | string | 否 | 受众分群标识（预留，MVP 可空） |

## 4. placement 枚举

App 展示位标识（`surface=app` 或 `surface=all` 时启用）：

| placement | 说明 |
| --- | --- |
| `app_home_banner` | App 首页顶部横幅 |
| `app_modal` | App 弹窗 |
| `app_activity_card` | App 活动卡片 |
| `app_notice_center` | App 通知中心 |
| `app_profile_notice` | App 个人页通知 |
| `app_billing_notice` | App 账单页通知 |

## 5. 展示时间规则

### 5.1 `ends_at` 默认值

- `announcement` / `campaign` / `app_banner` 如果 `ends_at` 为空，**默认展示 30 天**（即 `starts_at + 30 days`）。
- 默认值应由 Backend 在 API 响应中计算并返回 `effective_ends_at` 字段，不修改数据库存储。
- Admin UI 应提示"默认展示 1 个月"。

### 5.2 展示窗口过滤

| 条件 | 行为 |
| --- | --- |
| `status != published` | 所有端不展示 |
| `published_at` 未到 或 `starts_at` 未到 | 不展示 |
| `ends_at` 已过 | 不展示（App feed 过滤） |
| `surface = website` 且请求来自 App | 不返回 |
| `surface = app` 且请求来自 Website | 不返回 |
| `surface = all` | 两端均可展示 |

## 6. 跳转类型（link_type / link_target）

| link_type | link_target 规则 | 示例 |
| --- | --- | --- |
| `none` | 忽略 | — |
| `app_route` | 仅限 allowlist 内路由 | `/billing`, `/profile`, `/blog/privacy-guide` |
| `website_url` | 站内相对路径 | `/blog/privacy-guide` |
| `external_url` | 必须是 `https://` | `https://example.com` |

### app_route allowlist

| 路由 | 说明 |
| --- | --- |
| `/billing` | 账单页 |
| `/billing/plans` | 套餐选择页 |
| `/nodes` | 节点列表页 |
| `/nodes/recommended` | 推荐节点页 |
| `/profile` | 个人资料页 |
| `/support` | 客服/支持页 |
| `/diagnostics` | 诊断页 |
| `/blog/*` | Blog 文章（通配） |
| `/activity/*` | 活动页面（通配） |

### 禁止的 link_target

- `javascript:` — 禁止
- `data:` — 禁止
- `file:` — 禁止
- `http:` （非 HTTPS） — 禁止。`external_url` 必须是 `https://`

## 7. Public API 契约

### 7.1 文章列表（Blog + Help + Release Note）

```
GET /api/v1/content/blog
```

查询参数与 [BLOG_SEO_CONTENT_CONTRACT.md](./BLOG_SEO_CONTENT_CONTRACT.md) 一致，额外支持 `content_type` 筛选。

### 7.2 文章详情

```
GET /api/v1/content/blog/{slug}
```

见子契约。

### 7.3 分类/标签

```
GET /api/v1/content/blog/categories
GET /api/v1/content/blog/tags
```

见子契约。

### 7.4 Sitemap / RSS

```
GET /api/v1/content/sitemap
GET /api/v1/content/rss
```

见子契约。

## 8. App API 契约

```
GET /api/v1/content/app
```

### Query Parameters

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `locale` | string | 否 | 语言筛选 |
| `platform` | string | 否 | 平台标识：`ios` / `android` / `macos` / `windows` / `linux` / `web` |
| `app_version` | string | 否 | App 版本号，用于版本范围过滤 |
| `placement` | string | 否 | 展示位筛选：`app_home_banner` / `app_modal` / `app_activity_card` / `app_notice_center` / `app_profile_notice` / `app_billing_notice` |
| `content_type` | string | 否 | 内容类型筛选（逗号分隔多选） |
| `limit` | int | 否（默认 20，最大 50） | 每页条数 |

### Response

```json
{
  "items": [
    {
      "id": "uuid",
      "content_type": "announcement",
      "title": "string",
      "excerpt": "string",
      "content_markdown": "string",
      "content_html": "string",
      "cover_image_url": "string",
      "cover_image_alt": "string",
      "surface": "app",
      "placement": "app_home_banner",
      "starts_at": "RFC3339",
      "ends_at": "RFC3339",
      "effective_ends_at": "RFC3339",
      "link_type": "app_route",
      "link_target": "/billing/plans",
      "dismissible": true,
      "priority": 10,
      "featured": false,
      "sort_weight": 0,
      "published_at": "RFC3339",
      "updated_at": "RFC3339"
    }
  ]
}
```

### 过滤规则

| 条件 | 行为 |
| --- | --- |
| `status != published` | 不返回 |
| `surface` 不含 `app`（即 `website` 或 `admin`） | 不返回 |
| `visibility = unlisted` | 不返回 |
| `starts_at` 未到 或 `ends_at` 已过 | 不返回 |
| `platforms` 非空且不包含当前平台 | 不返回 |
| `min_app_version` > 当前版本 | 不返回 |
| `max_app_version` < 当前版本 | 不返回 |
| `require_login = true` 且未登录 | 不返回（App 端处理，API 侧统一返回需要登录的标记） |

## 9. Admin API 预留（本任务只定义不实现）

Admin 必须能管理所有 content_type：

| 端点 | 方法 | 说明 |
| --- | --- | --- |
| `/admin/api/v1/content` | GET | 内容列表（含所有 content_type、status、visibility） |
| `/admin/api/v1/content/{id}` | GET | 内容详情 |
| `/admin/api/v1/content` | POST | 创建内容 |
| `/admin/api/v1/content/{id}` | PATCH | 更新内容 |
| `/admin/api/v1/content/{id}` | DELETE | 删除内容 |
| `/admin/api/v1/content/{id}/publish` | POST | 发布 |
| `/admin/api/v1/content/{id}/archive` | POST | 归档（设置 `status=archived`） |

Admin API 参数应包含 `content_type` 筛选，支持管理所有 6 种类型。

## 10. Website 路由契约

| 路由 | 说明 | 渲染方式 |
| --- | --- | --- |
| `/blog` | 文章列表页 | SSR / SSG |
| `/blog/[slug]` | 文章详情页 | SSR / SSG |
| `/blog/category/[category]` | 分类文章列表 | SSR / SSG |
| `/blog/tag/[tag]` | 标签文章列表 | SSR / SSG |
| `/sitemap.xml` | Sitemap | SSG（依赖 API 数据源） |
| `/rss.xml` 或 `/feed.xml` | RSS Feed | SSG（依赖 API 数据源） |

## 11. App 展示契约

| 展示位 | 说明 | 数据来源 |
| --- | --- | --- |
| Home banner | App 首页顶部横幅 | `GET /api/v1/content/app?placement=app_home_banner` |
| Notice center | App 通知中心列表 | `GET /api/v1/content/app?placement=app_notice_center` |
| Activity card | App 活动卡片区域 | `GET /api/v1/content/app?placement=app_activity_card` |
| Modal（可选） | App 弹窗 | `GET /api/v1/content/app?placement=app_modal` |

### App 端行为要求

- App 不解析或展示 SEO-only 字段（`seo_title`、`canonical_url`、`robots` 等不返回给 App）
- App 内链跳转使用 App 原生路由导航
- Website 跳转使用 App 内置 WebView
- external_url 跳转前应展示风险提示（"即将离开 App 前往外部网站"）
- loading skeleton 可用于异步获取，但不应覆盖有效内容

## 12. 子契约：Blog / SEO Content

详见 [BLOG_SEO_CONTENT_CONTRACT.md](./BLOG_SEO_CONTENT_CONTRACT.md)，包含：

- blog_article 专属的完整数据字段
- SEO 采集规则（slug、title/description、canonical、robots、sitemap、RSS、hreflang、图片、内容安全）
- Public API（list、detail、categories、tags、sitemap、rss）
- Website SEO 要求（SSR/SSG、meta、JSON-LD BlogPosting、BreadcrumbList、内部链接、HTTP 状态码）

## 13. SEO 规则（汇总）

| 规则 | 说明 |
| --- | --- |
| slug 稳定 | 发布后禁止修改，改 slug 必须 301 redirect |
| title | 建议 <= 60 chars |
| seo_description | 建议 120-160 chars，完整句子 |
| canonical | 每篇可索引文章必须 |
| draft | 不出现在 sitemap / RSS / list API |
| archived | 可 410 或保留 canonical |
| noindex | 不进入 sitemap |
| sitemap | 只包含 published + public + indexable |
| RSS | 只包含 published + public |
| HTML sanitize | 必须 |
| script | 禁止 |
| iframe | 仅 allowlist（如嵌入视频） |
| external links | `rel="noopener noreferrer"` |
| Last-Modified | MVP 必须 |
| ETag | 后续补充 |

## 14. 安全规则

| 规则 | 说明 |
| --- | --- |
| Markdown/HTML sanitize | 所有 API 返回的 `content_html` 必须 sanitize |
| 禁止 script | 内容中不允许嵌入 `<script>` |
| iframe 仅 allowlist | 仅允许白名单域名嵌入 |
| external_url 校验 | 必须 `https://`，禁止 `javascript:`/`data:`/`file:`/`http:` |
| 用户私密信息 | 不存储邮箱、IP、设备 ID 等 |
| App content 安全 | App 内容字段不得携带 JWT/token/secret |
| Admin 错误信息 | 错误信息不得泄漏 token 或敏感配置 |
| SQL 注入防护 | 参数化查询或 ORM，任何时候不可拼接 SQL |

## 15. 后续任务

| TASK | 仓库 | 目标 |
| --- | --- | --- |
| `TASK-BACKEND-CONTENT-001` | `livemask-backend` | 统一 `content_items` schema + Public Blog API + App Content API |
| `TASK-BACKEND-ADMIN-CONTENT-001` | `livemask-backend` | Admin Content CRUD API |
| `TASK-WEBSITE-BLOG-002` | `livemask-website` | Website Blog real API integration |
| `TASK-ADMIN-CONTENT-001` | `livemask-admin` | Admin Content Management UI |
| `TASK-APP-CONTENT-FEED-001` | `livemask-app` | App 公告/活动/banner feed |
| `TASK-CICD-CONTENT-SEO-001` | `livemask-ci-cd` | Blog SEO + App content smoke |

## 16. 契约变更记录

| 日期 | 变更 | 原因 |
| --- | --- | --- |
| 2026-05-18 | 初始版本 | `TASK-DOC-CONTENT-001`（替代 `TASK-DOC-BLOG-SEO-001`） |
