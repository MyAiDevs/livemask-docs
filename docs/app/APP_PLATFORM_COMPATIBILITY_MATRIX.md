# LiveMask App Platform Compatibility Matrix

## Purpose

This document defines the platform compatibility contract for `livemask-app`.
It is a release gate: a platform is not considered ready merely because the
shared Flutter UI compiles. The target must compile, launch, reach the login
screen, and have known platform-specific limitations documented.

## Current AppClient Validation Priority

Until the App client feature backlog is closed, LiveMask uses an
**Android-first feature validation** policy:

- Android debug on an emulator or authorized physical device is the primary
  functional acceptance target for App feature tasks.
- App feature tasks include login, API integration, content feed, growth/reward,
  release-check, settings/profile, diagnostics, and VPN-client UI work.
- iOS remains in the matrix, but iOS signing, provisioning, Xcode/CocoaPods,
  Sequoia xattr, and PacketTunnelProvider hardening are deferred platform
  hardening unless the TASK is explicitly iOS-scoped.
- A non-iOS App feature may be marked `Completed (Android-primary)` when Android
  validation passes, shared Flutter tests pass, and the completion report records
  iOS as `deferred / not blocking` with a concrete reason.
- Build-only evidence is not enough. Android-primary feature validation must
  include runtime launch plus task-relevant debug logs proving the App can reach
  Backend APIs and, when applicable, NodeAgent and Job Service.
- Release candidates still require the full platform matrix before production
  release. This policy changes feature-task closure, not final release gating.

## Runtime Closed-Loop Evidence

Every non-trivial App feature task must prove the feature works after launch.
Compilation is only the first gate.

Required runtime evidence:

- App launches on Android emulator or authorized physical Android device.
- Login/session state is established using a real dev-local account or approved
  dev preset.
- Task-relevant Backend API calls are visible in App debug logs, Backend logs,
  or both.
- If the task touches connect, diagnostics, protocol, node region, node status,
  observability, or VPN runtime, evidence must include NodeAgent reachability
  and matching NodeAgent logs/metrics/status.
- If the task touches release checks, growth digest, notification dispatch,
  scheduled jobs, rollout state, or other async work, evidence must include Job
  Service reachability and the relevant job run/status/log.
- Completion reports must include a closed-loop row:
  request -> response -> App UI/state -> event/log/metric.

Examples:

| Feature family | Required closed-loop proof |
| --- | --- |
| Login/auth | `POST /api/v1/auth/login` or refresh, `/api/v1/me`, App session state, no token leak in logs. |
| Connect/protocol | Fresh connect config, NodeAgent status/metrics/log evidence, App connection state, safe unsupported/app_pending handling. |
| Observability | App event/log emission, Backend ingestion or Sentry/runtime config fetch, no secret leakage. |
| Growth/reward | Backend notification/report fetch, role-specific UI state, ack/report event, no full user/wallet/IM leak. |
| Release check | Backend release check/latest endpoint, App update state, download URL not logged or sent to Sentry. |
| Job-backed flows | Job Service run/status evidence and App state reflecting Backend-owned job output. |

## Dev Role Preset Login

`livemask-app` should provide a dev-only role preset login surface so engineers
can switch users without manually typing credentials during every validation
run.

Rules:

- The preset switcher is allowed only in dev-local/debug builds.
- It must be disabled or removed from production, TestFlight, App Store, and
  release builds.
- It must not store real production credentials in ARB localization files,
  release assets, or checked-in public config.
- Dev credentials should come from debug-only dart-defines, local dev config, or
  a Backend dev seed endpoint.
- Completion reports must name the role preset used for validation.

Minimum presets:

| Role preset | Required coverage |
| --- | --- |
| Normal user | Login, profile, subscription, content, connect baseline. |
| Promotion ambassador | Referral link, promotion reward notification, referral report. |
| Sponsor ambassador | Sponsor report, sponsor reward notification, feedback entry. |
| Trial / expired user | Plan/paywall/connect-disabled states. |
| Debug operator account, if supported | Diagnostics and QA-only surfaces. |

## Rolling Support Window

| Platform | Required support window | Current engineering baseline | Verification environment |
| --- | --- | --- | --- |
| iOS | Latest 5 major iOS versions and latest 10 minor/runtime releases available to the release Xcode toolchain | `IPHONEOS_DEPLOYMENT_TARGET=13.0` until native VPN runtime requires a higher floor | macOS + Xcode simulator matrix; physical iPhone with Apple Team signing |
| Android | Latest 5 major Android versions and latest 10 API/minor releases available through Android Studio SDK Manager | Flutter Android default min SDK; compile/target SDK from installed Flutter/Android toolchain | Android Studio SDK, emulator or authorized physical Android device |
| macOS Apple Silicon | Latest 5 major macOS versions and latest 10 minor releases on Apple Silicon | `MACOSX_DEPLOYMENT_TARGET=10.15` until native VPN runtime requires a higher floor | `macos-arm64` build verifies the `arm64` slice; runtime on Apple Silicon Mac |
| macOS Intel | Latest 5 major macOS versions and latest 10 minor releases on Intel | Same macOS baseline; Flutter Release output is universal and must contain `x86_64` | `macos-x64` build verifies the `x86_64` slice; runtime on Intel Mac, Rosetta, or x64 macOS runner |
| Windows | Windows 10 and Windows 11 | Flutter Windows desktop target | Parallels Desktop Windows guest |
| Linux | Debian and Ubuntu desktop/server LTS families | Flutter Linux desktop target with GTK runtime dependencies | Parallels Desktop Debian and Ubuntu guests |
| Web | Current Chrome/Safari/Edge release family for UI-only preview | Flutter Web JS build; WebAssembly warnings are non-blocking until wasm is a release target | macOS browser smoke |

## Release Gate

Every release candidate must record:

- Build command and result for each target.
- Run command and result for each target that can be run in the current host.
- Runtime closed-loop evidence for the feature, not just compilation output.
- Exact OS/runtime version used for verification.
- Any unverified compatibility cell and the reason it could not be verified.
- Native VPN runtime status for the target, once VPN native work begins.

## Local Commands

`livemask-app/scripts/local-app.sh` is the canonical local runner.

```bash
bash scripts/local-app.sh doctor
bash scripts/local-app.sh build --target macos-arm64
bash scripts/local-app.sh build --target macos-x64
bash scripts/local-app.sh build --target ios
bash scripts/local-app.sh build --target android
bash scripts/local-app.sh build --target web
```

Windows and Linux must be run inside the target OS:

```bash
# Windows guest
bash scripts/local-app.sh build --target windows
bash scripts/local-app.sh start --target windows

# Debian / Ubuntu guest
bash scripts/local-app.sh build --target linux
bash scripts/local-app.sh start --target linux
```

## Current Mac Host Notes

- iOS simulator builds should use a safe mirror directory under
  `/private/tmp/livemask-app-ios-$USER` to avoid macOS Sequoia/iCloud
  `com.apple.provenance` code-signing failures when the repo is under
  `Documents`.
- iOS physical device runs require Xcode account signing, a unique bundle
  identifier, and Team / Provisioning Profile selection.
- Android physical devices must appear as `device` in `adb devices -l`.
  `unauthorized` means the phone has not accepted the USB debugging prompt.
- Android first build may install Gradle, Build Tools, NDK, CMake, and SDK
  platforms. This is environment setup, not application compilation failure.
- Do not run multiple Flutter builds in parallel. Flutter SDK, Gradle, Xcode,
  and CocoaPods locks can corrupt each other.
- macOS release evidence must separate Apple Silicon and Intel. On the current
  Flutter toolchain, macOS Release builds are universal; compile evidence must
  include `lipo -archs` proof that both `arm64` and `x86_64` slices exist.
  Runtime evidence is still separate: Apple Silicon runtime does not prove Intel
  runtime behavior.

## Compatibility Rules

- Platform-specific VPN behavior must be implemented behind native adapters.
  Shared Flutter code may own UI and state, but it must not pretend to start a
  system VPN tunnel without native platform integration.
- When Xcode or Android Studio drops old simulator/runtime images, archived
  verification must be done on a pinned older machine/VM before claiming
  support for that OS version.
- Windows/Linux compatibility can only be claimed after compiling and launching
  inside those operating systems. A macOS build is not evidence for either one.
- macOS compatibility can only be claimed per architecture. Apple Silicon and
  Intel compile/runtime evidence must be recorded independently.
- If a platform cannot be verified in the current task, the completion report
  must mark it as blocked or unverified, not completed.
- For non-iOS App feature tasks, iOS may be recorded as `deferred / not
  blocking` after Android functional validation passes. Do not use this
  exception for iOS-scoped tasks, native VPN PacketTunnelProvider work, or final
  release-candidate sign-off.
