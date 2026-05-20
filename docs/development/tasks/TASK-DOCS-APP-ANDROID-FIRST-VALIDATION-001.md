# TASK-DOCS-APP-ANDROID-FIRST-VALIDATION-001

> Status: Completed
> Owner: livemask-docs / livemask-app
> Scope: AppClient validation priority and documentation sync

## 1. Background

During iOS physical-device validation, the App reached successful build/signing
states but Xcode, provisioning, CocoaPods/Sentry warnings, Sequoia xattr behavior
and device attach loops created high operational cost unrelated to most App
feature logic.

The project decision is to close ordinary App feature work through Android-first
functional validation, then return to iOS platform hardening after the remaining
App client features are closed.

## 2. Policy

For non-iOS App feature tasks:

- Android debug on an emulator or authorized physical device is the primary
  functional acceptance target.
- Flutter shared tests must still pass.
- The platform matrix must still list iOS, macOS, Windows, Linux and Web.
- iOS may be marked `deferred / not blocking` when the blocker is signing,
  provisioning, Xcode/CocoaPods, Sequoia xattr behavior, or
  PacketTunnelProvider hardening.
- Final release candidates still require full platform sign-off.

This exception does **not** apply to:

- iOS-specific TASKs.
- Native VPN PacketTunnelProvider tasks.
- App Store/TestFlight release tasks.
- Release-candidate production sign-off.

## 3. Files Updated

| File | Change |
| --- | --- |
| `livemask-app/.cursorrules` | Added Android-first feature validation and iOS deferred hardening rules. |
| `livemask-app/README.md` | Added current AppClient validation priority section. |
| `docs/app/APP_PLATFORM_COMPATIBILITY_MATRIX.md` | Added Android-first policy and completion-state exception. |
| `docs/app/APP_LOCAL_BUILD_AND_TROUBLESHOOTING.md` | Updated platform reporting guidance. |
| `docs/development/MVP_IMPLEMENTATION_PLAN.md` | Added `Completed (Android-primary)` status and priority ordering. |
| `docs/development/tasks/README.md` | Registered this task. |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-app` | Feature tasks should use Android as primary functional validation and list iOS as deferred when appropriate. |
| `livemask-ci-cd` | App smoke/final release gates should distinguish Android-primary feature closure from full release-candidate platform sign-off. |
| `livemask-docs` | Completion reports may use `Completed (Android-primary)` for App features with required evidence. |

## 5. Done Criteria

- [x] App Cursor rules updated.
- [x] App README updated.
- [x] Docs compatibility matrix updated.
- [x] Docs build troubleshooting guide updated.
- [x] MVP plan status vocabulary updated.
- [x] Task index updated.

## 6. Completion Evidence

Runtime evidence is recorded in the implementation task reports for
`TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001`,
`TASK-APP-IOS-CODESIGN-ENV-001`, and
`TASK-APP-IOS-BOTTOM-NAV-MATERIAL-FIX-001`.

This task is docs/rules-only.
