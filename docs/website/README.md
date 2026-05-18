# Website Documentation

This directory stores public website and user portal development documents.

Current priority:

- Auth / registration / login entry
- User portal shell
- Subscription and device entry points
- C2C market entry points

Primary contracts:

- `docs/contracts/api/auth-rbac.md`
- `docs/contracts/i18n/I18N_LOCALIZATION_CONTRACT.md`
- `docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md`
- `design/frontend-suite/atoms/v1/export/`
- `docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`

Website does not call `livemask-job-service` directly. Website consumes Backend
public APIs and generated artifacts. SEO rebuilds, sitemap/RSS refresh,
content cache purge, and other long-running website operations should be
triggered through Backend Job Gateway and Job Service, then exposed as safe
Backend/Website state. Website pages must not embed Admin job tokens or service
credentials.

## I18N / Chinese SEO

Website must support `zh-CN` as the default public language and `en-US` as
fallback. Crawler-critical text must be visible in the generated HTML, not only
translated client-side after hydration. Blog, Content, sitemap, RSS/feed,
canonical, JSON-LD, and hreflang behavior must follow
`docs/contracts/i18n/I18N_LOCALIZATION_CONTRACT.md`.

Required follow-up:

- `TASK-WEBSITE-I18N-001`
