# Blog / SEO Content — Content System 子契约

> TASK: `TASK-DOC-BLOG-SEO-001` → 已升级合并为 `TASK-DOC-CONTENT-001`
>
> 本文是 [CONTENT_SYSTEM_CONTRACT.md](./CONTENT_SYSTEM_CONTRACT.md) 的子契约，专门定义 `content_type=blog_article` 的 SEO 要求与 Website 页面规范。
>
> 所有内容类型共用的基础字段、App 展示字段、跳转规则已移至父契约。
> 后续 Backend（`TASK-BACKEND-CONTENT-001`）和 Website（`TASK-WEBSITE-BLOG-002`）必须按此实现。

## 定位

| 层级 | 文档 | 覆盖范围 |
| --- | --- | --- |
| 父契约 | `CONTENT_SYSTEM_CONTRACT.md` | 统一 content_items 模型、所有内容类型、App API、Admin API、跳转规则、安全规则 |
| 子契约（本文） | `BLOG_SEO_CONTENT_CONTRACT.md` | blog_article SEO 采集规则、Public API、Website SEO meta、JSON-LD、sitemap/RSS |

## 1. 内容类型（引用）

本文仅聚焦 `blog_article`。完整内容类型清单见父契约：

| 类型 | 标识 | MVP | Surface |
| --- | --- | --- | --- |
| Blog 文章 | `blog_article` | 是 | website |
| 帮助文章 | `help_article` | 是 | website |
| 发布说明 | `release_note` | 否 | website |
| 公告 | `announcement` | 是 | app |
| 活动 | `campaign` | 是 | app |
| App Banner | `app_banner` | 是 | app |

## 2. SEO 采集规则

### 2.1 Slug 规则

| 规则 | 说明 |
| --- | --- |
| slug 稳定性 | **slug 发布后禁止修改**。如果必须改，原 slug 必须实现 301 redirect 到新 URL |
| slug 格式 | 仅含小写字母、数字、连字符（`-`）。示例：`how-to-use-livemask-vpn` |
| slug 唯一性 | slug + locale 联合唯一 |

### 2.2 Title & Description 规则

| 规则 | 说明 |
| --- | --- |
| `seo_title` | 建议 <= 60 字符，超过应截断 |
| `seo_description` | 建议 120-160 字符。**必须为完整句子**，不可截断为片段 |
| 降级策略 | `seo_title` 为空 ⇒ 使用 `title`；`seo_description` 为空 ⇒ 截取 `excerpt` 前 160 字符 |

### 2.3 Canonical 规则

| 规则 | 说明 |
| --- | --- |
| 每篇文章 | **必须**有 `canonical_url` |
| 默认值 | 默认等于文章页面完整 URL |
| 跨域转载 | 转载/聚合内容必须指定原文 canonical |
| 分页 | 列表页分页应该自引用 canonical |

### 2.4 Robots & Sitemap 规则

| 规则 | 说明 |
| --- | --- |
| `noindex` | `robots` 包含 `noindex` 的页面**不得出现在 sitemap.xml 中** |
| `draft` | draft 状态不出现在 sitemap、RSS/Atom、list API |
| `unlisted` | unlisted 不出现在 sitemap、list API，但有独立 URL 可被直接访问 |
| `archived` | archived 可按策略返回 410 Gone 或保留 canonical |
| sitemap | sitemap.xml **只能包含** `status=published` **且** `robots` 不包含 `noindex` 的条目 |
| RSS/Atom | RSS/Atom **只包含** `status=published` **且** `visibility=public` 的条目 |

### 2.5 Hreflang 规则（未来预留）

| 规则 | 说明 |
| --- | --- |
| 多语言 | 未来同一文章多语言版本通过 `locale` + `slug` 关联 |
| hreflang | sitemap 应输出 `<xhtml:link rel="alternate" hreflang="..." href="..."/>` |
| 回退 | 浏览器语言不匹配时，默认降级到 `en-US` |

### 2.6 图片规则

| 规则 | 说明 |
| --- | --- |
| 可访问 URL | 所有文章图片必须使用可公开访问的 URL |
| Alt 文案 | 图片必须有 alt 文案 |
| CDN 优化 | 推荐使用 CDN 并提供 WebP / AVIF 支持 |

### 2.7 内容安全规则

| 规则 | 说明 |
| --- | --- |
| HTML Sanitize | 内容 HTML 必须经过 sanitize，禁止 XSS |
| script 禁止 | 文章内容中**不允许嵌入 `<script>` 或 `<iframe>`**，除非维护 allowlist |
| external links | 外部链接必须 `rel="noopener noreferrer"` |
| 导入内容 | `source_type=imported` 或 `generated` 的内容必须标记 `source_url` 用于追踪 |

### 2.8 API 缓存规则

| 规则 | MVP | 未来 |
| --- | --- | --- |
| ETag | — | `If-None-Match` / `ETag` |
| Last-Modified | 是 | — |

MVP 阶段 Public API 必须返回 `Last-Modified` header。

## 3. Public API 契约

### 3.1 文章列表（仅 blog / content_type=website 内容）

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
  "content_type": "blog_article",
  "title": "string",
  "excerpt": "string",
  "cover_image_url": "string",
  "cover_image_alt": "string",
  "author_name": "string",
  "category": "string",
  "tags": ["string"],
  "published_at": "RFC3339",
  "updated_at": "RFC3339",
  "reading_time_minutes": 0,
  "featured": false
}
```

列表 API **只返回** `status=published` 且 `visibility=public` 的文章。

### 3.2 文章详情

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
    "content_type": "blog_article",
    "title": "string",
    "excerpt": "string",
    "content_html": "string",
    "content_markdown": "string",
    "author_name": "string",
    "category": "string",
    "tags": ["string"],
    "cover_image_url": "string",
    "cover_image_alt": "string",
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

### 3.3 分类列表

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

### 3.4 标签列表

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

### 3.5 Sitemap / RSS 数据源

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

- 只包含 `status=published` 且 `visibility=public` 且 `robots` 不含 `noindex` 的条目
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

- 只包含 `status=published` 且 `visibility=public` 的条目
- `guid` 应为文章的 canonical URL 或 id

### 3.6 响应头

所有 API 必须返回：

| Header | 说明 |
| --- | --- |
| `Content-Type` | `application/json` 或 `application/xml`（sitemap/rss） |
| `Last-Modified` | MVP 必须。内容最新修改时间 |
| `Cache-Control` | 建议：`public, max-age=300`（5 分钟） |
| `Access-Control-Allow-Origin` | 如有跨域需求 |

未来可选补充 `ETag`。

## 4. Website 路由契约

| 路由 | 说明 | 渲染方式 |
| --- | --- | --- |
| `/blog` | 文章列表页 | SSR / SSG |
| `/blog/[slug]` | 文章详情页 | SSR / SSG |
| `/blog/category/[category]` | 分类文章列表 | SSR / SSG |
| `/blog/tag/[tag]` | 标签文章列表 | SSR / SSG |
| `/sitemap.xml` | Sitemap | SSG（依赖 Backend API 数据源） |
| `/rss.xml` 或 `/feed.xml` | RSS Feed | SSG（依赖 Backend API 数据源） |

## 5. Website SEO 要求

### 5.1 页面渲染

| 要求 | 说明 |
| --- | --- |
| SSR/SSG | 页面必须 SSR 或 SSG，**crawler 必须能读到完整 HTML** |
| Client-side 降级 | 页面不能只靠 client-side fetch 后渲染内容（会导致 crawler 看不到内容） |
| Loading skeleton | skeleton / spinner **不应成为 crawler 主内容**。骨架屏必须包裹在 `data-skeleton` 属性或 `noscript` 之后 |

### 5.2 Meta 标签

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

### 5.3 结构化数据 (JSON-LD)

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

### 5.4 Breadcrumb 结构化数据

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

### 5.5 内部链接

| 要求 | 说明 |
| --- | --- |
| 分类链接 | 文章页应包含 category internal link：`<a href="/blog/category/{category}">{category}</a>` |
| 标签链接 | 文章页应包含 tag internal links：`<a href="/blog/tag/{tag}">{tag}</a>` |
| 相关文章 | 如有 `related_article_ids`，渲染为 internal links |

### 5.6 HTTP 状态码

| 场景 | 状态码 | 说明 |
| --- | --- | --- |
| 页面正常 | 200 | — |
| 文章不存在 | 404 | 返回 404 页面，sitemap 不包含 |
| 文章 slug 变更 | 301 → 新 URL | 原 slug 必须有 redirect |
| 已归档 | 410 或 200（标记 archived） | 视业务决定 |
| 文章 draft 状态 | 404 | 不允许外部访问 |

## 6. 后续任务（见父契约）

后续任务已统一登记于 `CONTENT_SYSTEM_CONTRACT.md`。此处不再重复。

## 7. 契约变更记录

| 日期 | 变更 | 原因 |
| --- | --- | --- |
| 2026-05-18 | 初始版本 | `TASK-DOC-BLOG-SEO-001` |
| 2026-05-18 | 升级为子契约，基础字段/App 字段移至父契约 | `TASK-DOC-CONTENT-001` 统一内容模型 |
