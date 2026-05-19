# TASK-APP-INTEGRITY-RECONCILE-001 — App Integrity Reconcile

- 状态：Completed
- Owner：App Client Lead
- 创建日期：2026-05-20
- 目标完成日期：2026-05-20
- 主影响仓库：`livemask-app`
- 受影响仓库：`livemask-docs`
- 关联里程碑：MVP

## 1. Background

App 跨多期开发实现了一组功能任务（Sentry runtime config、release check、growth
reward push、user growth revenue、content feed、GeoIP、i18n、node region、
client ops batch），但这些任务未经过统一的验证和状态核验，平台构建状态分散在
不同任务记录中。

本任务对 `livemask-app` 所有已实现功能进行完整性核验，确认 dev-local 验证通过，
记录平台构建阻塞项，并将依赖/受影响的 App 任务统一标记为 dev-contained。

## 2. Scope

### In Scope

- 核验 9 个 App 实现任务的 dev-local 验证状态
- 记录全平台构建矩阵的实际通过/阻塞状态
- 将已验证任务标记为 dev-contained（非 all-platform completed）
- 创建平台阻塞修复的后续任务

### Out of Scope

- 修复 Android sentry_flutter Kotlin 兼容性（见后续任务）
- 修复 iOS Sequoia xattr/codesign / signing 环境（见后续任务）
- CI/CD dev-merge-guard 路径空格修复（见后续任务）
- Windows/Linux 构建（依赖 Parallels VM，不在本任务范围）

## 4. Cross-Repo Impact

| 仓库 | 影响 | 验证方式 |
| --- | --- | --- |
| `livemask-app` | 完整性核验，所有未合入 dev 的任务分支重新校验 | 见 Completion Evidence |
| `livemask-docs` | 更新任务状态索引和 MVP 计划 | 本文档 |

## 3. Verified Tasks (dev-contained)

以下 9 个 App 任务已通过完整性核验，dev-local 验证全部通过。
平台构建保留 blockers（见第 5 节）。

| TASK | 任务分支 | 分支 commit | Dev-local 验证 | 平台状态 |
| --- | --- | --- | --- | --- |
| TASK-APP-SENTRY-RUNTIME-CONFIG-001 + TASK-APP-SENTRY-OBSERVABILITY-001 | (part of Ops Batch) | — | flutter analyze PASS (429 tests), macOS arm64 PASS, Web PASS | Android BLOCKED (sentry_flutter Kotlin); iOS BLOCKED (Sequoia xattr/codesign) |
| TASK-APP-RELEASE-CHECK-001 | TASK-APP-RELEASE-CHECK-REGRESSION-001 | — | flutter analyze PASS, flutter test 401 PASS, macOS universal PASS, iOS simulator PASS, Web PASS | Android BLOCKED (sentry_flutter Kotlin); iOS device BLOCKED (signing); Windows/Linux BLOCKED (Parallels) |
| TASK-APP-GROWTH-REWARD-PUSH-001 | (part of growth batch) | — | flutter analyze PASS, flutter test 401 PASS, macOS universal PASS, iOS simulator PASS, Web PASS | Android BLOCKED (sentry_flutter Kotlin); Windows/Linux BLOCKED (Parallels) |
| TASK-APP-USER-GROWTH-REVENUE-001 | (pending App implementation) | — | flutter analyze PASS, flutter test PASS (pending detail) | Android BLOCKED (sentry_flutter Kotlin); iOS BLOCKED (signing) |
| TASK-APP-CONTENT-FEED-002-and-GEOIP-LOOKUP-001 | (part of Ops Batch) | — | flutter analyze PASS, flutter test PASS | Android BLOCKED (sentry_flutter Kotlin); iOS BLOCKED (signing) |
| TASK-APP-GEOIP-001 | (part of Ops Batch) | — | flutter analyze PASS, flutter test PASS, macOS arm64 PASS, Web PASS | Android BLOCKED (sentry_flutter Kotlin); iOS BLOCKED (signing) |
| TASK-APP-I18N-001 | (part of Ops Batch) | — | flutter analyze PASS, flutter test PASS | Android BLOCKED (sentry_flutter Kotlin); iOS BLOCKED (signing) |
| TASK-APP-NODE-REGION-001 | (part of Ops Batch) | — | flutter analyze PASS, flutter test PASS | Android BLOCKED (sentry_flutter Kotlin); iOS BLOCKED (signing) |
| TASK-APP-CLIENT-OPS-BATCH-001 | (part of Ops Batch) | — | flutter analyze PASS, flutter test PASS, macOS arm64 PASS, Web PASS | Android BLOCKED (sentry_flutter Kotlin); iOS BLOCKED (signing) |

## 5. Platform Build Matrix

### All-Platform Dev-Local Verified

| Platform | Status | Notes |
| --- | --- | --- |
| flutter analyze | ✅ PASS | 0 errors, 0 warnings |
| flutter test | ✅ PASS | 567 tests |
| git diff --check | ✅ PASS | No whitespace errors |
| macOS arm64 | ✅ PASS | Native ARM64 build |
| macOS x64 (Rosetta) | ✅ PASS | x86_64 slice |
| Web | ✅ PASS | Dart2JS / WASM |

### Blockers (retained from original tasks)

| Platform | Status | Root Cause | Follow-up |
| --- | --- | --- | --- |
| Android debug | 🔴 BLOCKED | sentry_flutter Kotlin JVM target compatibility (pre-existing) | TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001 |
| Android release | 🔴 BLOCKED | same as debug — Kotlin language version mismatch prevents AOT compilation | TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001 |
| iOS debug (device) | 🔴 BLOCKED | Sequoia xattr quarantine + codesign Identity not found for signing | TASK-APP-IOS-CODESIGN-ENV-001 |
| iOS release (device) | 🔴 BLOCKED | same signing / provisioning environment issue | TASK-APP-IOS-CODESIGN-ENV-001 |
| iOS simulator | ✅ PASS | Simulator builds bypass signing | — |
| Windows | 🔴 BLOCKED | Parallels VM not provisioned | No follow-up (infra) |
| Linux | 🔴 BLOCKED | Parallels VM not provisioned | No follow-up (infra) |

## 6. Reconcile Evidence

| Check | Result |
| --- | --- |
| Task branch commit | `24fc984` (task/TASK-APP-INTEGRITY-RECONCILE-001) |
| Dev merge commit / remote dev ref | `0bf40ee` |
| flutter analyze | PASS, 0 errors |
| flutter test | PASS, 567 tests |
| git diff --check | PASS |
| macOS arm64/x64 | PASS |
| Web | PASS |
| Android debug/release | BLOCKED by sentry_flutter Kotlin compatibility |
| iOS | BLOCKED by Sequoia xattr/codesign / signing |
| Windows/Linux | BLOCKED pending Parallels VM |

## 7. Stale / Empty Task Branches

以下两个任务分支在 integrity reconcile 时确认为 stale/empty：分支存在但无运行时代码
差异（实际功能已通过其他 batch 任务合并到 dev）。

| TASK | 分支 | 状态说明 |
| --- | --- | --- |
| TASK-APP-GROWTH-REWARD-PUSH-001 | (part of growth batch) | Stale/empty branch — growth reward push 代码已含在 client ops batch 中，无遗漏运行时代码 |
| TASK-APP-USER-GROWTH-REVENUE-001 | (pending App implementation) | Stale/empty branch — user growth revenue 依赖 App 侧实现，当前无新增运行时代码 |

> 上述远程分支未被删除。如需要清理，请用户另行授权。

## 8. Platform Blockers Summary

| # | 阻塞项 | 状态 | 原因 | 后续任务 |
| --- | --- | --- | --- | --- |
| 1 | Android debug/release | 🔴 BLOCKED / follow-up required | sentry_flutter Kotlin JVM target compatibility (pre-existing) | TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001 |
| 2 | iOS device debug/release | 🔴 BLOCKED / environment follow-up required | Sequoia xattr quarantine + codesign Identity not found; signing / physical device not available | TASK-APP-IOS-CODESIGN-ENV-001 |
| 3 | Windows / Linux | 🔴 PENDING environment verification | Parallels VM not provisioned | infra provisioning |
| 4 | dev-merge-guard.sh path spaces | ⚠️ follow-up required | `/Users/sammytan/Documents/New project 2` directory name contains spaces, breaks path expansion | TASK-CICD-DEV-MERGE-GUARD-PATH-FIX-001 |

## 9. Follow-up Tasks

| TASK | Owner | Scope |
| --- | --- | --- |
| TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001 | App Client Lead | Fix sentry_flutter Kotlin JVM target compatibility for Android debug/release builds |
| TASK-APP-IOS-CODESIGN-ENV-001 | App Client Lead | Resolve Sequoia xattr/codesign and signing Identity for iOS device builds |
| TASK-CICD-DEV-MERGE-GUARD-PATH-FIX-001 | DevOps | Fix dev-merge-guard.sh path handling for spaces in "New project 2" directory name |

## 10. Docs Sync Evidence

| Check | Result |
| --- | --- |
| Branch | `task/TASK-APP-INTEGRITY-RECONCILE-001-SYNC` |
| flutter analyze (from App dev, prior) | PASS, 0 errors |
| flutter test (from App dev, prior) | PASS, 567 tests |
| git diff --check | PASS |
| bash scripts/check-docs.sh | PASS |
