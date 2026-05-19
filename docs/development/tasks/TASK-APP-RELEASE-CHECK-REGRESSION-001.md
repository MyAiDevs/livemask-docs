# TASK-APP-RELEASE-CHECK-REGRESSION-001 - App Release Check Regression

> Owner: App / App Release / Backend / CI-CD / Docs
> Repo: `livemask-app`
> Status: Completed dev-local with platform blockers recorded
> Created: 2026-05-19

## 1. Background

The App release-check flow must safely consume Backend release metadata, support
localized forced and optional update UX, and protect signed download URLs from
logs, Sentry breadcrumbs, and user-visible surfaces. This regression records
the App-side verification evidence against
`APP_RELEASE_DISTRIBUTION_CONTRACT.md` section 7.1.

## 2. Scope

Verified behavior:

- Update check uses Backend-compatible release metadata.
- Forced update dialog is not dismissible.
- Optional update UI can be dismissed.
- Release notes support zh-CN / en-US through App locale.
- sha256 and signature values are used for local verification only.
- `download_url` is not sent to Sentry breadcrumbs.
- Signed URL query strings are not logged.

## 3. Validation

```text
flutter analyze PASS
flutter test PASS (401 tests)
```

Security regression checks:

| Check | Status | Evidence |
| --- | --- | --- |
| `download_url` not sent to Sentry breadcrumb | PASS | No Sentry call path records release download URL. |
| Signed query not logged | PASS | URL is passed to `launchUrl` only. |
| Forced update not dismissible | PASS | Uses `PopScope(canPop: false)`. |
| Optional update dismissible | PASS | Close action sets dismissed state. |
| sha256/signature local only | PASS | Values are not exposed externally. |
| zh-CN/en-US release notes | PASS | Locale is passed through `localeProvider`. |

Full-platform compile matrix:

| Target | Result | Notes |
| --- | --- | --- |
| macOS arm64 | PASS | Universal binary includes arm64. |
| macOS x64 | PASS | Universal binary includes x86_64; slice verified with `lipo -archs`. |
| iOS simulator | PASS | `build/ios/iphonesimulator/Runner.app` generated. |
| iOS device | BLOCKED | Requires Xcode signing and physical device. |
| Android debug | BLOCKED | Pre-existing `sentry_flutter` Kotlin language version issue. |
| Android release | BLOCKED | Same Kotlin issue. |
| Windows | BLOCKED | Requires Parallels VM. |
| Linux | BLOCKED | Requires Parallels VM. |
| Web | PASS | `build/web` generated. |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | `GET /api/v1/app/releases/check` must remain available or mock-compatible for dev-local validation. |
| `livemask-ci-cd` | Release pipelines must inject `APP_ARCH` correctly for iOS/Android where `PlatformInfo._hostArchitecture()` depends on compile-time configuration. |
| `livemask-docs` | MVP plan and App Release handoff record the regression evidence. |

## 5. Remaining Risks

- Android debug/release remain blocked by the existing `sentry_flutter` Kotlin
  language version mismatch.
- iOS device validation requires signing and a physical device.
- Windows/Linux validation requires Parallels-hosted environments.
- Production release pipelines must inject the correct `APP_ARCH` value for
  iOS and Android builds.

## 6. Done Criteria

- App release-check safety checks are recorded.
- Full-platform compile matrix is recorded with honest blockers.
- Backend and CI/CD follow-ups are explicit.
- No new contract is required beyond the existing App Release Distribution
  contract.
