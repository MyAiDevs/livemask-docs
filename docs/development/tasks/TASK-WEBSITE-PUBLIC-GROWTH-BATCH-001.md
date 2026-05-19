# TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001 - Website Public Growth Batch

> Owner: Website / Backend / Content / App Release / CI-CD / Docs
> Repo: `livemask-website`
> Branch: `task/TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001`
> Commit: `9d8c144`
> Status: partial / evidence_missing (task branch not merged to dev)
> Created: 2026-05-19
>
> Regression branch: `task/TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001`
> Regression commit: `5edaada`

## 1. Background

The public Website must support the LiveMask growth funnel, App release
distribution, localized SEO, and crawler-visible content. The Website previously
depended on mock or hardcoded surfaces for downloads, blog/content, and SEO
generation. This batch connects those surfaces to Backend contracts while
keeping safe mock fallback for local development.

## 2. Scope

Completed subtasks:

| Subtask | Scope | Result |
| --- | --- | --- |
| `TASK-WEBSITE-DOWNLOADS-001` | Downloads page consumes public App release metadata | Done |
| `TASK-WEBSITE-I18N-001` | zh-CN default route, en-US fallback, hreflang, localized sitemap | Done |
| `TASK-WEBSITE-BLOG-002` | Blog list/detail/category/tag use real Content APIs | Done |
| `TASK-WEBSITE-CONTENT-001` | `help_article` content support and marketing SEO metadata | Done |
| `TASK-WEBSITE-SEO-REBUILD-001` | Build-time `sitemap.xml` and `rss.xml` generation from Backend with fallback | Done |

Changed implementation areas:

- `src/lib/releases-types.ts`
- `src/lib/releases-api.ts`
- `src/pages/WebsitePage.tsx`
- `App.tsx`
- `SEO.tsx`
- `seo-plugin.ts`
- `blog-api.ts`
- `content-types.ts`
- `useContent.ts`
- Release notes and help article rendering surfaces.

## 3. Validation

Validation evidence:

```text
tsc -b PASS
npm run build PASS
dist/sitemap.xml generated
dist/rss.xml generated
git diff --check PASS
VITE_API_MOCK_MODE=true mock fallback PASS
TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001 PASS on branch task/TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001 commit 5edaada
```

SEO evidence:

- `hreflang` alternates exist for `zh-CN`, `en-US`, and `x-default`.
- Sitemap entries are locale-prefixed and include alternates.
- RSS language is `zh-CN`.
- Build-time generation avoids per-request CPU spikes.

Release-control regression evidence:

- `/download` page renders the release download surface.
- Website API client is wired to `GET /api/v1/app/releases/latest`.
- Latest stable release per platform selection is verified.
- Release notes URL typing is present.
- Production `VITE_API_MOCK_MODE=false` requires Backend instead of mock-only
  success.
- No hardcoded artifact URL or signed URL query is exposed.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must implement `GET /api/v1/app/releases/latest` returning latest stable releases per platform. Content sitemap/RSS APIs should remain locale-aware. |
| `livemask-admin` | No direct blocker; App Release Admin UI remains tracked separately by `TASK-ADMIN-APP-RELEASE-001`. |
| `livemask-app` | No direct blocker; update-check remains tracked separately by `TASK-APP-RELEASE-CHECK-001`. |
| `livemask-ci-cd` | Should add or extend Website smoke for downloads, sitemap, RSS, hreflang, and no hardcoded artifact URLs. |
| `livemask-docs` | MVP plan and release/content handoffs must reflect Website completion. |

## 5. Remaining Risks

- `GET /api/v1/app/releases/latest` is still waiting for Backend deployment for
  real integration, even though the Website client regression passes.
- Production must connect to Backend when `VITE_API_MOCK_MODE=false`; mock data
  is development fallback only.
- iOS App Store link format must be confirmed by Backend release metadata.
- Full changelog URLs require Backend mapping from `release_notes_content_id` to
  Website Content System URL.
- Production zh-CN content requires Backend content seed/translation coverage.

## 6. Dev Merge Evidence

| Field | Value |
|-------|-------|
| **Repository** | `livemask-website` |
| **Task branch** | `task/TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001` |
| **Task branch commit** | `9d8c144` |
| **Dev merge commit** | **Evidence missing** — task branch not merged to `livemask-website` dev |
| **Remote dev ref** | **Evidence missing** |
| **Validation** | `tsc -b` PASS, `npm run build` PASS, `git diff --check` PASS, sitemap/RSS generation PASS |
| **Evidence status** | **missing** — pending Website window dev merge |
| **Last verified at** | 2026-05-19 (dev-local on task branch only) |
| **Runtime repo evidence** | pending external repo audit — requires `livemask-website` window to verify dev merge |

## 7. Done Criteria

- Website downloads page no longer hardcodes artifact URLs.
- Blog pages consume public Content APIs.
- Marketing pages include SEO metadata.
- `help_article` and `release_note` content types are supported.
- `sitemap.xml` and `rss.xml` are generated at build time.
- Validation evidence is recorded.
- Backend/App/Admin/CI-CD follow-ups are clearly separated.
