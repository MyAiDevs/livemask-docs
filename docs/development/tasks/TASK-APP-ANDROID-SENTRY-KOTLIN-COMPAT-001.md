# TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001 — Android Sentry Kotlin Compatibility

- Status: Completed
- Owner: App Client Lead
- Created: 2026-05-20
- Completed: 2026-05-20
- Primary repository: `livemask-app`
- Affected repositories: `livemask-docs`
- Milestone: MVP platform build matrix

## 1. Background

`TASK-APP-INTEGRITY-RECONCILE-001` recorded Android debug/release builds as
blocked by a pre-existing `sentry_flutter` Kotlin language-version mismatch.
The App repo has now reconciled that blocker on `origin/dev`.

## 2. Scope

In scope:

- Fix Android `sentry_flutter` Kotlin compiler language-version compatibility.
- Restore missing localization keys that blocked generated App localization
  code.
- Fix `PlatformInfo` compile-time architecture/build-number fields used by
  release check.
- Fix App profile navigation compile issue.
- Re-run Android debug/release, web, macOS, analyze, and unit tests.

Out of scope:

- iOS codesign and physical-device signing.
- Windows/Linux Parallels validation.
- Real Android release signing-key provisioning.

## 3. Implementation Evidence

| Field | Value |
| --- | --- |
| Repository | `livemask-app` |
| Task branch | `task/TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001` |
| Task branch commit | `77447b6` |
| Dev merge commit | `5ce5c6c` |
| Remote dev ref | `5ce5c6c` |
| Merge method | `dev-merge-guard.sh` |

Implemented fixes:

- `android/build.gradle.kts` overrides `:sentry_flutter` compiler language
  version to `KOTLIN_1_9`, while keeping `sentry_flutter` at `8.14.2`.
- Added missing `growth_revenue_*`, `growth_notification_*`, `growth_*`,
  `force_update_*`, and `update_*` keys to `app_en.arb` and `app_zh.arb`,
  then regenerated localization output.
- Added `PlatformInfo.arch` and `PlatformInfo.buildNumber` with
  compile-time defaults.
- Fixed `profile_screen.dart` callback access by calling
  `widget.onNavigate?.call('/growth-revenue')`.
- Updated tests that construct `PlatformInfo`.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-app` | Android debug/release build blocker is closed on `origin/dev`. |
| `livemask-ci-cd` | Full platform smoke can stop marking Android as Kotlin-blocked; release-signing state must still be reported honestly. |
| `livemask-docs` | MVP plan, task index, App integrity reconcile, App release regression, and cursor handoffs must mark Android Kotlin blocker as resolved. |

## 5. Validation

| Check | Result |
| --- | --- |
| `flutter analyze` | PASS — 0 errors, 544 info/warnings |
| `flutter test` | PASS — 567/567 |
| `flutter build apk --debug` | PASS |
| `flutter build apk --release` | PASS — `app-release.apk` 60.3MB |
| `flutter build web` | PASS |
| `flutter build macos` | PASS |
| `git diff --check` | PASS |
| `dev-merge-guard.sh` | PASS |

## 6. Platform Matrix Update

| Platform | Status after this task | Notes |
| --- | --- | --- |
| Android debug | PASS | Kotlin language-version blocker resolved. |
| Android release | PASS | Build succeeds, but uses debug signing config because no release signing key is configured. |
| macOS arm64/x64 | PASS | macOS build passes. |
| Web | PASS | Web build passes. |
| iOS simulator/device | BLOCKED | Sequoia xattr/codesign and signing environment still require `TASK-APP-IOS-CODESIGN-ENV-001`. |
| Windows/Linux | BLOCKED | Requires Parallels VM validation. |

## 7. Remaining Follow-Ups

| TASK | Status | Scope |
| --- | --- | --- |
| TASK-APP-IOS-CODESIGN-ENV-001 | Open | Resolve iOS Sequoia xattr/codesign and signing identity / physical-device validation. |
| TASK-APP-ANDROID-RELEASE-SIGNING-001 | Proposed | Configure real Android release signing instead of relying on debug signing for release build validation. |
| Windows/Linux Parallels validation | Environment dependent | Validate App builds inside Windows and Linux VMs. |
