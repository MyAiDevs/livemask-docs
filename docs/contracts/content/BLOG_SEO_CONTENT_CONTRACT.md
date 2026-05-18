# Blog / SEO Content System 跨仓库契约

> TASK: `TASK-DOC-BLOG-SEO-001`
>
> 本文定义 Blog / SEO 内容系统在 Backend / Website / Admin 之间的数据模型、Public API、SEO meta、sitemap、RSS/Atom、结构化数据（JSON-LD）、采集友好规则和后续任务。
>
> 后续 Backend（`TASK-BACKEND-BLOG-001`）和 Website（`TASK-WEBSITE-BLOG-001`）必须按此实现。

## 1. 内容类型

| 类型 | 标识 | MVP | 说明 |
| --- | --- | --- | --- |
| Blog 文章 | `blog_article` | 是 | SEO 收录、用户教育、下载转化 |
| 帮助文章 | `help_article` | 否 | 协议/隐私科普、FAQ、使用指南 |
| 发布说明 | `release_note` | 否 | 产品更新、版本发布、Changelog |
| 公告 | `announcement` | 否 | 维护通知、政策变更、紧急公告 |

MVP 只实现 `blog_article`，但所有字段设计必须复用基础和 SEO 字段，便于 `help_article` / `release_note` / `announcement` 通过 `content_type` 字段扩展。

## 2. BlogArticle 数据模型

### 2.1 基础字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid / int64 | 是 | 全局唯一标识 |
| `slug` | string | 是 | URL 友好标识，**发布后不可修改**，修改必须加 301 redirect |
| `content_type` | string | 是 | 内容类型标识：`blog_article` / `help_article` / `release_note` / `announcement` |
| `locale` | string | 是 | 语言代码，如 `zh-CN`、`en-US`。预留 hreflang 多语言支持 |
| `title` | string | 是 | 文章标题。**建议 <= 60 chars**（SEO title 兼容） |
| `excerpt` | string | 否 | 摘要 / 导语 |
| `content_markdown` | text | 是 | Markdown 原文，内容系统唯一编辑源 |
| `content_html` | text | 否 | 预渲染 HTML。MVP 可由 Website 在 SSG 时渲染，但 API 应能返回 HTML |
| `status` | enum | 是 | `draft` / `published` / `archived`。draft 不出现在任何公开面 |
| `visibility` | enum | 否（默认 `public`） | `public` / `unlisted`。unlisted 有独立 URL 但不在列表/sitemap 中 |
| `author_name` | string | 是 | 作者名（显示用，不一定是系统 user） |
| `category` | string | 是 | 分类标识。必须存在于 categories 枚举/表中 |
| `tags` | string[] | 否 | 标签列表 |

### 2.2 媒体字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cover_image_url` | string | 否 | 封面图 URL。必须可公开访问，必须有 alt 文案 |

### 2.3 SEO 元数据字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `seo_title` | string | 否 | 自定义 SEO title。留空则默认使用 `title`。**建议 <= 60 chars** |
| `seo_description` | string | 否 | 自定义 SEO meta description。**建议 120-160 chars**。留空则截取 `excerpt` |
| `canonical_url` | string | 是 | 规范 URL。**每篇文章必须有 canonical** |
| `og_title` | string | 否 | Open Graph title。留空则使用 `seo_title` -> `title` |
| `og_description` | string | 否 | Open Graph description。留空则使用 `seo_description` -> `excerpt` |
| `og_image_url` | string | 否 | Open Graph 图片。留空则使用 `cover_image_url` |
| `robots` | string | 否（默认 `index,follow`） | robots meta 值。合法值：`index,follow` / `noindex,follow` / `index,nofollow` / `noindex,nofollow` |

### 2.4 时间字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `published_at` | timestamp | 否 | 首次发布时间。`status=published` 后必须设置 |
| `updated_at` | timestamp | 是 | 最后更新时间 |
| `created_at` | timestamp | 是 | 创建时间 |

### 2.5 建议字段（MVP 可暂不实现）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `reading_time_minutes` | int | 预计阅读时间（分钟），可由 Backend 或 Website 在写/发布时计算 |
| `word_count` | int | 字数统计，SSR/SSG 时可注入 JSON-LD |
| `source_type` | enum | `original` / `imported` / `generated`。来源追踪 |
| `source_url` | string | 原文来源 URL。用于 imported/generated 内容溯源 |
| `noindex_reason` | string | 如果 `robots` 包含 `noindex`，记录原因（审计用途） |
| `featured` | bool | 是否精选。支持 `GET /api/v1/content/blog?featured=true` 过滤 |
| `sort_weight` | int | 排序权重，越大越靠前 |
| `related_article_ids` | uuid[] | 人工关联文章 ID 列表 |
| `schema_type` | enum | `Article` / `BlogPosting` / `NewsArticle`。默认 `BlogPosting` |

## 3. SEO 采集规则

### 3.1 Slug 规则

| 规则 | 说明 |
| --- | --- |
| slug 稳定性 | **slug 发布后禁止修改**。如果必须改，原 slug 必须实现 301 redirect 到新 URL |
| slug 格式 | 仅含小写字母、数字、连字符（`-`）。示例：`how-to-use-livemask-vpn` |
| slug 唯一性 | slug + locale 联合唯一 |

### 3.2 Title & Description 规则

| 规则 | 说明 |
| --- | --- |
| `seo_title` | 建议 <= 60 字符，超过应截断 |
| `seo_description` | 建议 120-160 字符。**必须为完整句子**，不可截断为片段 |
| 降级策略 | `seo_title` 为空 ⇒ 使用 `title`；`seo_description` 为空 ⇒ 截取 `excerpt` 前 160 字符 |

### 3.3 Canonical 规则

| 规则 | 说明 |
| --- | --- |
| 每篇文章 | **必须**有 `canonical_url` |
| 默认值 | 默认等于文章页面完整 URL |
| 跨域转载 | 转载/聚合内容必须指定原文 canonical |
| 分页 | 列表页分页应该自引用 canonical |

### 3.4 Robots & Sitemap 规则

| 规则 | 说明 |
| --- | --- |
| `noindex` | `robots` 包含 `noindex` 的页面**不得出现在 sitemap.xml 中** |
| `draft` | draft 状态不出现在 sitemap、RSS/Atom、list API |
| `unlisted` | unlisted 不出现在 sitemap、list API，但有独立 URL 可被直接访问 |
| `archived` | archived 可按策略返回 410 Gone（内容已删除）或保留 canonical（内容仍可读但标记过期），视业务决定 |
| sitemap | sitemap.xml **只能包含** `status=published` **且** `robots` 不包含 `noindex` 的条目 |
| RSS/Atom | RSS/Atom **只包含** `status=published` 的条目 |

### 3.5 Hreflang 规则（未来预留）

| 规则 | 说明 |
| --- | --- |
| 多语言 | 未来同一文章多语言版本通过 `locale` + `slug` 关联 |
| hreflang | sitemap 应输出 `<xhtml:link rel="alternate" hreflang="..." href="..."/>` |
| 回退 | 浏览器语言不匹配时，默认降级到 `en-US` |

### 3.6 图片规则

| 规则 | 说明 |
| --- | --- |
| 可访问 URL | 所有文章图片必须使用可公开访问的 URL |
| Alt 文案 | 图片必须有 alt 文案 |
| CDN 优化 | 推荐使用 CDN 并提供 WebP / AVIF 支持 |

### 3.7 内容安全规则

| 规则 | 说明 |
| --- | --- |
| HTML Sanitize | 内容 HTML 必须经过 sanitize，禁止 XSS |
| script 禁止 | 文章内容中**不允许嵌入 `<script>` 或 `<iframe>`**，除非维护 allowlist |
| external links | 外部链接必须 `rel="noopener noreferrer"` |
| 导入内容 | `source_type=imported` 或 `generated` 的内容必须标记 `source_url` 用于追踪 |

### 3.8 API 缓存规则

| 规则 | MVP | 未来 |
| --- | --- | --- |
| ETag | — | `If-None-Match` / `ETag` |
| Last-Modified | 是 | — |

MVP 阶段 Public API 必须返回 `Last-Modified` header。

## 4. Public API 契约

### 4.1 文章列表

```
GET /api/v1/content/blog
```

#### Query Parameters

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `locale` | string | 否 | 语言筛选。默认返回所有 locale |
| `category` | string | 否 | 分类筛选 |
| `tag` | string | 否 | 标签筛选 |
| `q` | string | 否 | 全文搜索（title + excerpt + content_markdown） |
| `page` | int | 否（默认 1） | 页码 |
| `limit` | int | 否（默认 20，最大 100） | 每页条数 |
| `featured` | bool | 否 | 精选筛选 |

#### Response

```json
{
  "items": [ArticleSummary],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

#### ArticleSummary 结构

```json
{
  "id": "uuid",
  "slug": "string",
  "locale": "string",
  "content_type": "string",
  "title": "string",
  "excerpt": "string",
  "cover_image_url": "string",
  "author_name": "string",
  "category": "string",
  "tags": ["string"],
  "published_at": "RFC3339",
  "updated_at": "RFC3339",
  "reading_time_minutes": 0,
  "featured": false
}
```

列表 API **只返回** `status=published` 且 `visibility != unlisted` 的文章。

### 4.2 文章详情

```
GET /api/v1/content/blog/{slug}
```

#### Query Parameters

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `locale` | string | 否 | 语言，默认从 `Accept-Language` 推断或取第一条 |

#### Response

```json
{
  "article": {
    "id": "uuid",
    "slug": "string",
    "locale": "string",
    "content_type": "string",
    "title": "string",
    "excerpt": "string",
    "content_html": "string",
    "content_markdown": "string",
    "author_name": "string",
    "category": "string",
    "tags": ["string"],
    "cover_image_url": "string",
    "seo_title": "string",
    "seo_description": "string",
    "canonical_url": "string",
    "og_title": "string",
    "og_description": "string",
    "og_image_url": "string",
    "robots": "string",
    "published_at": "RFC3339",
    "updated_at": "RFC3339",
    "created_at": "RFC3339",
    "reading_time_minutes": 0,
    "word_count": 0,
    "featured": false,
    "related_article_ids": ["uuid"],
    "source_type": "string",
    "source_url": "string"
  }
}
```

**规则**:

- `status=draft` 的文章，只有 Admin API 可读取
- `visibility=unlisted` 的文章，任何知道 slug 的客户端可通过此 API 读取
- `status=archived` 的文章，API 应返回 410 Gone 或保留数据并标记 archived（由业务决定）

### 4.3 分类列表

```
GET /api/v1/content/blog/categories
```

#### Response

```json
{
  "categories": [
    {
      "name": "string",
      "slug": "string",
      "article_count": 0
    }
  ]
}
```

只统计 `status=published` 且 `visibility=public` 的文章。

### 4.4 标签列表

```
GET /api/v1/content/blog/tags
```

#### Response

```json
{
  "tags": [
    {
      "name": "string",
      "slug": "string",
      "article_count": 0
    }
  ]
}
```

只统计 `status=published` 且 `visibility=public` 的文章。

### 4.5 Sitemap / RSS 数据源

```
GET /api/v1/content/sitemap
```

返回纯数据结构，Website 负责渲染为 `sitemap.xml`。

#### Response

```json
{
  "urls": [
    {
      "loc": "string",
      "lastmod": "RFC3339",
      "changefreq": "weekly",
      "priority": 0.8,
      "alternates": [
        {"hreflang": "zh-CN", "href": "string"},
        {"hreflang": "en-US", "href": "string"}
      ]
    }
  ]
}
```

- 只包含 `status=published` 且 `robots` 不含 `noindex` 的条目
- 分页由 Backend 处理或 Website 批量拉取

```
GET /api/v1/content/rss
```

#### Response

```json
{
  "feed": {
    "title": "string",
    "description": "string",
    "link": "string",
    "language": "string",
    "items": [
      {
        "title": "string",
        "link": "string",
        "description": "string",
        "content_html": "string",
        "author": "string",
        "category": ["string"],
        "pub_date": "RFC822",
        "guid": "string"
      }
    ]
  }
}
```

- 只包含 `status=published` 的条目
- `guid` 应为文章的 canonical URL 或 id

### 4.6 响应头

所有 API 必须返回：

| Header | 说明 |
| --- | --- |
| `Content-Type` | `application/json` 或 `application/xml`（sitemap/rss） |
| `Last-Modified` | MVP 必须。内容最新修改时间 |
| `Cache-Control` | 建议：`public, max-age=300`（5分钟） |
| `Access-Control-Allow-Origin` | 如有跨域需求 |

未来可选补充 `ETag`。

## 5. Admin API 预留（本任务不实现）

| 端点 | 方法 | 说明 |
| --- | --- | --- |
| `/admin/api/v1/content/blog` | GET | 列表（含 draft/archived） |
| `/admin/api/v1/content/blog` | POST | 创建文章 |
| `/admin/api/v1/content/blog/{id}` | PATCH | 更新文章 |
| `/admin/api/v1/content/blog/{id}` | DELETE | 删除文章 |
| `/admin/api/v1/content/blog/{id}/publish` | POST | 发布（设置 `status=published` + `published_at`） |
| `/admin/api/v1/content/blog/{id}/archive` | POST | 归档（设置 `status=archived`） |

Admin API 必须支持读取所有 status 和 visibility 的文章。

## 6. Website 路由契约

| 路由 | 说明 | 渲染方式 |
| --- | --- | --- |
| `/blog` | 文章列表页 | SSR / SSG |
| `/blog/[slug]` | 文章详情页 | SSR / SSG |
| `/blog/category/[category]` | 分类文章列表 | SSR / SSG |
| `/blog/tag/[tag]` | 标签文章列表 | SSR / SSG |
| `/sitemap.xml` | Sitemap | SSG（依赖 Backend API 数据源） |
| `/rss.xml` 或 `/feed.xml` | RSS Feed | SSG（依赖 Backend API 数据源） |

## 7. Website SEO 要求

### 7.1 页面渲染

| 要求 | 说明 |
| --- | --- |
| SSR/SSG | 页面必须 SSR 或 SSG，**crawler 必须能读到完整 HTML** |
| Client-side 降级 | 页面不能只靠 client-side fetch 后渲染内容（会导致 crawler 看不到内容） |
| Loading skeleton | skeleton / spinner **不应成为 crawler 主内容**。骨架屏必须包裹在 `data-skeleton` 属性或 `noscript` 之后 |

### 7.2 Meta 标签

每篇文章详情页必须输出：

```html
<title>{seo_title || title}</title>
<meta name="description" content="{seo_description || excerpt}">
<link rel="canonical" href="{canonical_url}">
<meta property="og:title" content="{og_title || seo_title || title}">
<meta property="og:description" content="{og_description || seo_description || excerpt}">
<meta property="og:image" content="{og_image_url || cover_image_url}">
<meta property="og:type" content="article">
<meta name="robots" content="{robots}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{og_title || seo_title || title}">
<meta name="twitter:description" content="{og_description || seo_description || excerpt}">
<meta name="twitter:image" content="{og_image_url || cover_image_url}">
```

### 7.3 结构化数据 (JSON-LD)

每篇文章详情页必须输出 JSON-LD `BlogPosting`：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{title}",
  "description": "{seo_description || excerpt}",
  "image": "{cover_image_url}",
  "author": {
    "@type": "Person",
    "name": "{author_name}"
  },
  "datePublished": "{published_at}",
  "dateModified": "{updated_at}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{canonical_url}"
  }
}
</script>
```

列表页应输出 `BreadcrumbList` 结构化数据。

### 7.4 Breadcrumb 结构化数据

博客列表页和文章详情页应输出 `BreadcrumbList`：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://livemask.com"},
    {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://livemask.com/blog"},
    {"@type": "ListItem", "position": 3, "name": "{title}", "item": "{canonical_url}"}
  ]
}
</script>
```

### 7.5 内部链接

| 要求 | 说明 |
| --- | --- |
| 分类链接 | 文章页应包含 category internal link：`<a href="/blog/category/{category}">{category}</a>` |
| 标签链接 | 文章页应包含 tag internal links：`<a href="/blog/tag/{tag}">{tag}</a>` |
| 相关文章 | 如有 `related_article_ids`，渲染为 internal links |

### 7.6 HTTP 状态码

| 场景 | 状态码 | 说明 |
| --- | --- | --- |
| 页面正常 | 200 | — |
| 文章不存在 | 404 | 返回 404 页面，sitemap 不包含 |
| 文章 slug 变更 | 301 → 新 URL | 原 slug 必须有 redirect |
| 已归档 | 410 或 200（标记 archived） | 视业务决定 |
| 文章 draft 状态 | 404 | 不允许外部访问 |

## 8. 数据安全

| 规则 | 说明 |
| --- | --- |
| Sanitize Markdown/HTML | 所有通过 API 返回的 `content_html` 必须经过 sanitize，过滤 XSS 向量 |
| 禁止 script/iframe | 文章内容中不允许嵌入 `<script>` 或 `<iframe>`，除非维护显式 allowlist（如嵌入视频） |
| External links | 所有外部链接必须使用 `rel="noopener noreferrer"` |
| 导入内容追溯 | `source_type=imported` 或 `generated` 必须携带 `source_url` |
| 用户隐私 | 文章内容不存储用户私密信息（邮箱、IP、设备 ID 等） |
| 输入验证 | Backend 在写入时验证：slug 格式、title 长度、enum 合法性、URL 格式 |
| SQL 注入防护 | 所有查询使用参数化查询或 ORM，任何时候不可拼接 SQL |

## 9. 后续任务

| TASK | 仓库 | 目标 |
| --- | --- | --- |
| `TASK-BACKEND-BLOG-001` | `livemask-backend` | 按本契约实现 BlogArticle DB schema、CRUD API、sitemap/RSS 数据源 |
| `TASK-WEBSITE-BLOG-001` | `livemask-website` | 按本契约实现 blog 页面、SEO meta、JSON-LD、sitemap.xml、RSS |
| `TASK-ADMIN-BLOG-001` | `livemask-admin` | 按本契约实现 Admin 文章管理页面 |
| `TASK-CICD-BLOG-SEO-001` | `livemask-ci-cd` | 添加 Blog/SEO 相关的 CI smoke 测试 |

## 10. 契约变更记录

| 日期 | 变更 | 原因 |
| --- | --- | --- |
| 2026-05-18 | 初始版本 | `TASK-DOC-BLOG-SEO-001` |
