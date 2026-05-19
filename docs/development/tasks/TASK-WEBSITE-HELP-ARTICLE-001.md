# TASK-WEBSITE-HELP-ARTICLE-001 - Website Help Article Rendering Pages

> Owner: Website / Content
> Repo: `livemask-website`
> Task branch: `task/TASK-WEBSITE-HELP-ARTICLE-001`
> Task branch commit: `93f3cab`
> Dev merge commit: `9ce1a88` (on `dev`)
> Remote dev ref: `9ce1a88` (pushed to `origin/dev`)
> Status: **completed**
> Depends on: `TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001` (data layer: content types, API client, hooks)
> Created: 2026-05-20
> Completed: 2026-05-20
>
> Reason: `TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001` only delivered the
> help_article data layer. The `/support` list and localized detail pages
> rendering help_article content were MISSING from the original batch.
> This task closes that gap.

## 1. Background

The unified Content System contract (`TASK-DOC-CONTENT-001`) defines
`help_article` as one of 6 content types. `TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001`
delivered the data layer (types, API client, React Query hooks) but NOT the
actual front-end pages that render help articles at `/support` and
`/:locale/support` public routes.

This task closes that gap.

## 2. Scope

### In Scope

- `/support` list page showing all active help_article items with category filtering.
- `/support/:slug` (or `/:locale/support/:slug`) detail page rendering article body.
- Localized routes with `zh-CN` default and `en-US` fallback.
- Category badges, update timestamps, and empty/loading states.
- SEO metadata: `title`, `description`, `canonical`, `hreflang`, `robots`.
- Markdown body rendering with sanitization (script/iframe stripped).
- Mock mode support for local development.
- `404` detail page when slug not found, with "Back to Help Center" link.

### Out of Scope

- Backend Content API changes (Content System API is assumed stable per
  `TASK-DOC-CONTENT-001` and Backend `TASK-BACKEND-CONTENT-001`).
- App help article surfaces.
- Admin help article management UI.
- Advanced search for help articles.
- Version history/diff for articles.

## 3. Contracts

- API: `GET /api/v1/content/website` (existing, returns `help_article` items).
- Types: `WebsiteContentType` includes `"help_article"` (existing).
- Types: `WebsiteContentItem` includes `slug`, `category`, `updated_at` fields (existing).
- Route: `/support`, `/:locale/support` for list; `/support/:slug`, `/:locale/support/:slug` for detail.
- Components: `SupportListPage`, `SupportArticlePage` in `src/pages/support/`.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-website` | Adds `/support` list + detail pages using existing Content APIs and hooks. |
| All others | No impact. Backend Content API already serves help_article items. |

## 5. Implementation

### Pages

- `src/pages/support/SupportPages.tsx` — `SupportListPage` and `SupportArticlePage`.
- Components use `contentClient.getHelpArticles(locale)` and `contentClient.getHelpArticleBySlug(slug, locale)`.
- `MarkdownRenderer` renders article body with XSS sanitization.
- Route registrations in `App.tsx`.

## 6. Validation

```
tsc -b PASS
npm run build PASS
npm run test not configured
git diff --check PASS
dist/sitemap.xml generated with zh-CN/en-US hreflang
dist/rss.xml generated language=zh-CN
```

- Mock mode renders list/detail with seeded help articles.
- Category filter works in list view.
- 404 page shown for unknown slug.
- Back link navigates to `/support` list.
- SEO meta tags present in rendered HTML.
- Routes implemented:
  - `/support`, `/:locale/support` — list page
  - `/support/:slug`, `/:locale/support/:slug` — detail page

## 7. Dev Merge Evidence

| Field | Value |
|-------|-------|
| **Repository** | `livemask-website` |
| **Task branch** | `task/TASK-WEBSITE-HELP-ARTICLE-001` |
| **Task branch commit** | `93f3cab` |
| **Dev merge commit** | `9ce1a88` — merged via integration branch through `dev-merge-guard.sh` |
| **Remote dev ref** | `9ce1a88` on `origin/dev` |
| **Validation** | `tsc -b` PASS, `npm run build` PASS, `git diff --check` PASS, sitemap/RSS generation PASS |
| **Evidence status** | ✅ complete — merged to `dev`, pushed to `origin/dev` |

## 8. Follow-up

- CI/CD should add website help-article smoke once real Content API data is deployed.
- Admin can independently create/update help_article content via Admin Content UI.
