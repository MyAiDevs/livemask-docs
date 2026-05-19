# TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001 - Website Release Control Regression

> Owner: Website / App Release / Backend / CI-CD / Docs
> Repo: `livemask-website`
> Branch: `task/TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001`
> Commit: `5edaada`
> Status: Verified dev-local; waiting Backend deployment for real integration
> Created: 2026-05-19

## 1. Background

The Website downloads surface depends on App Release metadata controlled by
Backend and release jobs. This regression verifies that the Website is wired to
the App Release contract without hardcoded artifact URLs, storage credentials,
or per-request SEO generation.

## 2. Scope

Verified behavior:

- `/download` page renders the public release download surface.
- Release API client calls `GET /api/v1/app/releases/latest`.
- Latest stable release per platform selection is supported.
- Release notes URL typing is present.
- zh-CN default routing and en-US fallback are preserved.
- `hreflang` alternates are generated.
- `sitemap.xml` and `rss.xml` are generated at build time.
- Production `VITE_API_MOCK_MODE=false` must connect to Backend.
- No hardcoded artifact URL is rendered.
- No signed URL query is exposed in HTML.
- Sitemap/RSS are not regenerated per request.

## 3. Validation

Validation evidence from the Website window:

```text
tsc -b PASS
npm run build PASS
git diff --check PASS
```

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must deploy `GET /api/v1/app/releases/latest` for real integration smoke. |
| `livemask-admin` | Release Control IA can share the Operations release menu/page with NodeAgent Release while keeping App Release APIs and permissions separate. |
| `livemask-ci-cd` | Release-control smoke should verify Website latest-release metadata, no storage secret leakage, and build-time sitemap/RSS output. |
| `livemask-docs` | App Release handoff and MVP plan record the Website regression evidence. |

## 5. Remaining Risks

- Real integration is blocked until Backend deploys
  `GET /api/v1/app/releases/latest`.
- Mock fallback is allowed for local development only; production must fail
  closed when Backend metadata is unavailable.

## 6. Done Criteria

- Website release client integration is verified.
- Download page and SEO artifacts are verified.
- No artifact URL or signed URL query leakage is documented.
- Backend deployment blocker is explicit.
- CI/CD release-control smoke follow-up is explicit.
