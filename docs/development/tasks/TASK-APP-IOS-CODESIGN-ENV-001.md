# TASK-APP-IOS-CODESIGN-ENV-001 — iOS Codesign Environment

- Status: Partial
- Owner: App Client Lead
- Created: 2026-05-20
- Last updated: 2026-05-20
- Primary repository: `livemask-app`
- Affected repositories: `livemask-docs`
- Milestone: MVP platform build matrix

## 1. Background

`TASK-APP-INTEGRITY-RECONCILE-001` recorded iOS simulator/device builds as
blocked by macOS Sequoia extended attributes and missing signing identity. The
App repo has now clarified the root cause and verified a safe workdir path for
iOS simulator builds.

## 2. Scope

In scope:

- Update iOS/macOS CocoaPods lockfile consistency.
- Diagnose macOS Sequoia `com.apple.provenance` / extended-attribute
  codesign failure.
- Verify iOS simulator build from a safe workdir outside `~/Documents`.
- Record iOS device signing prerequisites.

Out of scope:

- Adding Apple Developer certificates, Team ID, provisioning profiles, private
  keys, or signing paths.
- Claiming iOS device validation without a real signing identity and physical
  device.

## 3. Implementation Evidence

| Field | Value |
| --- | --- |
| Repository | `livemask-app` |
| Task branch | `task/TASK-APP-IOS-CODESIGN-ENV-001` |
| Task branch commit | `a46f0da` |
| Integration branch | `integration/task-app-ios-codesign-env-001-task-TASK-APP-IOS-CODESIGN-ENV-001-20260520030724` (`33d4613`) |
| Dev merge commit | `a5243cd` |
| Remote dev ref | `a5243cd` |
| Merge method | `dev-merge-guard.sh` |

Implemented / verified:

- Updated `ios/Podfile.lock` so `sentry_flutter`, `package_info_plus`, and
  `Sentry/HybridSDK` CocoaPods dependencies remain consistent after repeated
  `flutter pub get` runs.
- Confirmed direct iOS simulator build from the repo path under `~/Documents`
  can fail because macOS Sequoia adds `com.apple.provenance` extended
  attributes to Flutter framework artifacts before ad-hoc codesign.
- Confirmed iOS simulator build succeeds from `/private/tmp` safe workdir.
- Confirmed `scripts/local-app.sh` already contains `clean_apple_extended_attributes()`
  and `execution_work_dir_for()` support for safe iOS build workdirs.
- Confirmed no Apple certificate, Team ID, provisioning profile, private key, or
  signing path was committed.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-app` | iOS simulator is unblocked when built through the safe workdir path; iOS device remains blocked by missing signing identity and Team ID. |
| `livemask-ci-cd` | Full-platform smoke should run iOS simulator builds through `scripts/local-app.sh --ios` / safe workdir and keep iOS device as signing-blocked. |
| `livemask-docs` | MVP plan, task index, App integrity reconcile, and handoff docs must distinguish simulator safe-workdir PASS from device signing BLOCKED. |

## 5. Validation

| Check | Result |
| --- | --- |
| `flutter analyze` | PASS — 0 errors, 544 info/warnings |
| `flutter test` | PASS — 567/567 |
| `flutter build ios --simulator --no-codesign` from repo directory | BLOCKED — macOS Sequoia `com.apple.provenance` xattr |
| `flutter build ios --simulator --no-codesign` from `/private/tmp` safe workdir | PASS — `Runner.app` built |
| `flutter build ios` for device | BLOCKED — 0 signing identities, no Team ID |
| `git diff --check` | PASS |
| `dev-merge-guard.sh` | PASS |

## 6. Platform Matrix Update

| Platform | Status after this task | Notes |
| --- | --- | --- |
| iOS simulator | PASS with safe workdir | Use `scripts/local-app.sh --ios` or equivalent `/private/tmp` workdir. |
| iOS device | BLOCKED | Requires Apple Developer account, signing certificate, Team ID, provisioning, and physical device. |
| Android debug/release | PASS | Already fixed by `TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001`. |
| macOS / Web | PASS | No new blocker introduced by this task. |
| Windows/Linux | BLOCKED | Requires Parallels VM validation. |

## 7. Remaining Follow-Ups

| TASK | Status | Scope |
| --- | --- | --- |
| TASK-APP-IOS-DEVICE-SIGNING-001 | Proposed | Configure Apple Developer Team ID, signing identities, provisioning profiles, and physical device validation. |
| TASK-APP-ANDROID-RELEASE-SIGNING-001 | Proposed | Configure real Android release signing keys; current release build passes with debug signing config. |
| Windows/Linux Parallels validation | Environment dependent | Validate App builds inside Windows and Linux VMs. |
