# Internationalization And Localization Contract

Task: `TASK-DOC-I18N-001`

Status: Ready

Owner: Backend / Admin / Website / App / Docs / CI-CD

Applies to:

- `livemask-backend`
- `livemask-admin`
- `livemask-website`
- `livemask-app`
- `livemask-ci-cd`
- `livemask-docs`

## 1. Goal

LiveMask must support Chinese as a first-class product language across Backend,
Admin, Website, and App. The goal is not to replace English strings by hand on
each page. The goal is a durable i18n contract:

```text
Backend returns stable codes and message keys.
Clients render localized text using their own translation catalogs.
Content System stores locale-specific content.
Website outputs SEO-visible localized HTML.
Chinese is the default user-facing language.
English remains the fallback language.
```

## 2. Supported Locales

MVP supported locales:

| Locale | Purpose | Required |
| --- | --- | --- |
| `zh-CN` | Default user-facing locale, Admin default option, Website primary SEO locale | Yes |
| `en-US` | Fallback locale and developer/operator fallback | Yes |

Future locales may include `zh-HK`, `zh-TW`, `ja-JP`, `ko-KR`, or other market-specific locales, but they are not part of MVP.

## 3. Locale Resolution Order

Backend and clients must resolve locale in this order:

1. Explicit query parameter: `?locale=zh-CN`
2. User profile preference: `preferred_locale`
3. Request header: `Accept-Language`
4. Client platform/system locale
5. Default: `zh-CN`
6. Fallback: `en-US`

Clients may persist a user-selected locale locally. A user-selected locale always overrides system locale.

## 4. Backend Error Contract

Backend must not require clients to display raw English `message` strings. All API errors must include stable machine-readable fields.

Required shape:

```json
{
  "error": {
    "code": "CONTENT_NOT_FOUND",
    "message": "Content not found.",
    "message_key": "errors.content.not_found",
    "params": {
      "slug": "privacy-guide"
    }
  }
}
```

Field rules:

| Field | Required | Purpose |
| --- | --- | --- |
| `code` | Yes | Stable error code used by clients, tests, logs, and docs. |
| `message` | Yes | Fallback human-readable message. Existing clients may still use it. |
| `message_key` | Yes for new/updated errors | Translation key used by Admin/Website/App. |
| `params` | Optional | Safe interpolation parameters. |

Rules:

- Existing `code` and `message` must remain backward-compatible.
- `message_key` must be stable and documented when adding new error codes.
- `params` must not contain secrets, raw tokens, passwords, node secrets, HMAC signatures, full signed URLs, user private data, or raw configs.
- Backend may localize `message` according to locale, but clients must prefer local translation catalogs when possible.
- Audit/action identifiers must not be translated in storage; Admin translates display labels.

## 5. Content System Locale Rules

Content System must support locale-specific records for:

- `blog_article`
- `help_article`
- `release_note`
- `announcement`
- `campaign`
- `app_banner`

Required fields:

| Field | Rule |
| --- | --- |
| `locale` | Required for every content item. MVP values: `zh-CN`, `en-US`. |
| `slug` | Stable within `(locale, slug)` uniqueness. |
| `canonical_url` | Locale-aware canonical URL. |
| `hreflang` | Website must generate locale alternates when available. |
| `seo_title` / `seo_description` | Localized per content item. |

Fallback order:

```text
requested locale -> zh-CN -> en-US -> no item
```

Rules:

- Draft/archived/noindex filtering rules still apply per locale.
- Sitemap must include localized URLs for indexable localized content.
- RSS may default to `zh-CN` in MVP, but locale-specific feeds are allowed.
- App content feed must request locale and must not display SEO-only fields.

## 6. Backend Requirements

`livemask-backend` must implement:

- Locale parser for query/header/user preference.
- `preferred_locale` on user profile if profile settings exist.
- Error responses with `message_key`.
- Content APIs with locale filtering and fallback.
- Public Website APIs honoring locale.
- App content APIs honoring locale.
- Admin APIs returning stable enum/code fields and localizable display metadata only when safe.

Backend must not:

- Return raw English-only errors as the only user-visible path.
- Localize stored audit action names.
- Store translated enum values as domain state.
- Put secrets inside `params`.

Follow-up task: `TASK-BACKEND-I18N-001`.

## 7. Admin Requirements

`livemask-admin` must implement a central i18n layer.

Requirements:

- Default locale: `zh-CN`.
- Supported locales: `zh-CN`, `en-US`.
- Language switcher in account/settings surface.
- Persist selected locale in `localStorage` or equivalent.
- All visible UI labels must use translation keys, including:
  - sidebar
  - dashboard
  - jobs
  - protocol templates
  - GeoIP
  - content
  - users
  - logs/audit/metrics
  - billing/payment
  - buttons/dialogs/toasts/errors
- API errors must render by:
  1. `message_key`
  2. `code`
  3. Backend fallback `message`
  4. Generic localized error
- Permission constants and enum values stay untranslated in code and API models; only display labels are translated.
- Production must not silently fall back to raw English for major navigation/pages.

Follow-up task: `TASK-ADMIN-I18N-001`.

## 8. Website Requirements

`livemask-website` must support SEO-visible localized pages.

Requirements:

- Default public website locale: `zh-CN`.
- Supported locale routes: either `/zh-CN/*` and `/en-US/*`, or documented default `zh-CN` route with locale alternates.
- Navigation must be Chinese by default.
- Blog/content pages must request locale from Backend.
- Crawler-critical text must be server/build-time visible, not only client-side translated after hydration.
- Localized SEO metadata:
  - `title`
  - `description`
  - `canonical`
  - `og:*`
  - `twitter:*`
  - JSON-LD fields
  - breadcrumbs
  - `hreflang`
- Sitemap must include localized URLs.
- RSS/feed must document locale behavior.
- External links keep `rel="noopener noreferrer"`.

Website must not:

- Render only English navigation on the default route.
- Depend on loading skeletons as crawler-visible content.
- Silently use mock English content in production.

Follow-up task: `TASK-WEBSITE-I18N-001`.

## 9. App Requirements

`livemask-app` must support localized Flutter UI and localized error handling.

Requirements:

- Default locale: `zh-CN`.
- Fallback locale: `en-US`.
- Use Flutter-supported localization mechanism (`arb`/generated localization or an established project-local equivalent).
- Detect system locale when user has not selected one.
- Add language setting in Profile/Settings.
- Persist selected locale in `SharedPreferences`.
- Move visible strings out of widgets/screens, including:
  - onboarding
  - login/register
  - home/connect
  - nodes
  - billing
  - profile/settings
  - diagnostics
  - content feed
  - GeoIP debug/status
  - reconnect states
  - errors/toasts/dialogs
- API errors must render using `message_key` or `code` mapping before fallback `message`.
- App content feed must request locale.

App must not:

- Localize protocol identifiers, internal enum values, or security-critical machine states directly.
- Show raw Backend English errors as the primary UX.
- Log full localized error params when params may include sensitive data.

Follow-up task: `TASK-APP-I18N-001`.

## 10. Translation Key Rules

Translation keys must be stable, namespaced, and descriptive.

Recommended namespaces:

```text
common.*
nav.*
actions.*
errors.*
auth.*
dashboard.*
jobs.*
nodes.*
protocol.*
geoip.*
content.*
billing.*
logs.*
settings.*
app.connect.*
website.blog.*
```

Rules:

- Do not use visible English text as the translation key.
- Do not use dynamic data inside keys.
- Use interpolation params for dynamic values.
- Keep keys stable across copy changes.
- Missing translation should fail tests for required surfaces or show a clearly detectable fallback in dev.

## 11. CI/CD Requirements

`livemask-ci-cd` must add i18n smoke coverage.

Required checks:

- Backend error response includes `message_key`.
- Backend content API supports `locale=zh-CN`.
- Admin default navigation includes Chinese labels.
- Admin can switch to English if implemented.
- Website default page exposes crawler-visible Chinese nav text.
- Website sitemap includes localized URLs or documented default locale URLs.
- Website blog/detail SEO contains localized metadata.
- App localization tests verify Chinese and English strings.
- No major user-facing page renders obvious raw English-only copy in default Chinese mode, except protocol names, product names, enum-like identifiers, or developer/debug pages.

Follow-up task: `TASK-CICD-I18N-001`.

## 12. Cursor Implementation Rules

Cursor must follow these rules in all repos:

1. Do not manually replace random English strings without introducing or using an i18n layer.
2. Do not localize domain enums in storage or API contracts.
3. Do not remove English fallback.
4. Do not put secrets or raw private data in localization params.
5. Do not make Website SEO pages rely only on client-side translation.
6. Do not call raw `fetch()` from business API files when project-specific HTTP wrappers exist.
7. Add tests for locale resolution and visible Chinese strings on critical surfaces.
8. Completion reports must list supported locales, translation files, fallback behavior, and verification commands.

## 13. Follow-Up Task Index

| TASK | Repo | Scope |
| --- | --- | --- |
| `TASK-BACKEND-I18N-001` | `livemask-backend` | Locale parser, error `message_key`, content locale/fallback, user `preferred_locale`. |
| `TASK-ADMIN-I18N-001` | `livemask-admin` | Admin translation layer, Chinese default, language switcher, localized error handling. |
| `TASK-WEBSITE-I18N-001` | `livemask-website` | Website locale routes/SEO/hreflang/content locale and Chinese default navigation. |
| `TASK-APP-I18N-001` | `livemask-app` | Flutter localization, locale setting, localized errors and content feed locale. |
| `TASK-CICD-I18N-001` | `livemask-ci-cd` | Backend/Admin/Website/App localization smoke checks. |

## 14. Done Criteria

- Backend error responses include `message_key` for new/updated errors.
- Content APIs support locale and fallback.
- Admin default UI is Chinese-ready through a central translation layer.
- Website default public pages expose crawler-visible Chinese content.
- App default UI is Chinese-ready with English fallback.
- CI/CD validates critical i18n paths.
- English remains available as fallback.
- No local dev runtime is stopped during docs-only or implementation validation unless explicitly requested.
