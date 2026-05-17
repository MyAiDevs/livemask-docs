# LiveMask App Local Build and Troubleshooting Runbook

## Purpose

This runbook is mandatory for Cursor/Codex windows working in `livemask-app`.
It captures the local build rules, path conventions, logs, known environment
pitfalls, and cross-platform / cross-chip verification requirements.

## Canonical Paths

Use repository-relative paths. Do not hard-code a developer's absolute
workspace path in committed docs or scripts.

| Item | Canonical path |
| --- | --- |
| App repo | `../livemask-app` from `livemask-docs`, or current repo when inside `livemask-app` |
| Public docs | `../livemask-docs/docs/app/` |
| App local runner | `scripts/local-app.sh` |
| Local logs | `.local-dev/logs/<target>.log` |
| Local pid files | `.local-dev/run/<target>.pid` |
| Local build lock | `.local-dev/run/build.lock` |
| iOS safe mirror | `/private/tmp/livemask-app-ios-$USER` by default |
| Android SDK on the current Mac | `/opt/homebrew/share/android-commandlinetools` |

If a local machine uses different paths, pass them through environment variables
or local shell config. Do not commit machine-specific absolute paths such as
`/Users/<name>/Documents/...` into source-controlled files.

## Canonical Script

All App build/run work should go through:

```bash
bash scripts/local-app.sh <command> --target <target>
```

Supported commands:

```text
doctor
build
start
stop
restart
status
logs
```

Supported targets:

```text
macos
macos-arm64
macos-x64
ios
android
linux
windows
web
```

`macos` is a convenience alias. Release evidence must use `macos-arm64` and
`macos-x64` explicitly.

## Required Startup Sequence

Before any App task:

```bash
git fetch origin main dev
git checkout dev
git pull --ff-only origin dev
bash scripts/local-app.sh doctor
```

Do not develop App code on `main`.

## Build Commands

Use single-target builds when resources are tight:

```bash
bash scripts/local-app.sh build --target macos-arm64
bash scripts/local-app.sh build --target macos-x64
bash scripts/local-app.sh build --target ios
bash scripts/local-app.sh build --target android
bash scripts/local-app.sh build --target web
```

Queue builds only when the machine is ready:

```bash
bash scripts/local-app.sh build --targets macos-arm64,macos-x64,ios,android,web
```

Windows and Linux must be built inside the target OS:

```bash
# Windows 10/11 guest
bash scripts/local-app.sh build --target windows

# Debian / Ubuntu guest
bash scripts/local-app.sh build --target linux
```

## Run Commands

```bash
bash scripts/local-app.sh start --target macos-arm64
bash scripts/local-app.sh start --target web
bash scripts/local-app.sh start --target ios --device-id <simulator-or-device-id>
bash scripts/local-app.sh start --target android --device-id <emulator-or-device-id>
```

For high-signal debugging, prefer foreground mode:

```bash
bash scripts/local-app.sh start --target macos-arm64 --foreground
bash scripts/local-app.sh start --target ios --device-id <simulator-id> --foreground
```

## Log and Status Commands

```bash
bash scripts/local-app.sh status
bash scripts/local-app.sh logs --target macos-arm64
bash scripts/local-app.sh logs --target ios
bash scripts/local-app.sh logs --target android
bash scripts/local-app.sh logs --target web
```

If a start command claims success but the app is not visible, inspect the log
first:

```bash
tail -n 160 .local-dev/logs/<target>.log
```

Useful platform probes:

```bash
flutter devices
flutter emulators
adb devices -l
xcrun simctl list devices available
xcrun simctl list devices booted
curl -s -v http://127.0.0.1:3003/ | head -80
lipo -archs build/macos/Build/Products/Release/livemask_app.app/Contents/MacOS/livemask_app
```

## Build Serialization

Do not run multiple Flutter builds from different windows at the same time.
Flutter SDK cache, Gradle, Xcode, CocoaPods, and native asset state can corrupt
or block each other.

`scripts/local-app.sh` uses `.local-dev/run/build.lock` to serialize builds and
remove stale locks. If a manual interruption leaves a bad lock:

```bash
rm -rf .local-dev/run/build.lock
```

Only remove the lock after confirming no Flutter/Xcode/Gradle build is still
running.

## macOS Architecture Rules

macOS has two required architecture tracks:

| Target | Meaning | Compile evidence | Runtime evidence |
| --- | --- | --- | --- |
| `macos-arm64` | Apple Silicon | `lipo -archs` contains `arm64` | Run on Apple Silicon Mac |
| `macos-x64` | Intel Mac | `lipo -archs` contains `x86_64` | Run on Intel Mac, Rosetta, or x64 macOS runner |

On the current Flutter toolchain, `flutter build macos` produces a universal
Release binary containing both `x86_64` and `arm64`. That is compile evidence
for both slices, but runtime evidence still must be collected separately.

Do not report “macOS done” without saying which of these are complete:

- `macos-arm64` compile
- `macos-arm64` runtime
- `macos-x64` compile
- `macos-x64` runtime

## iOS Notes

- iOS simulator builds use `/private/tmp/livemask-app-ios-$USER` by default.
  This avoids macOS Sequoia / iCloud `com.apple.provenance` code-sign failures
  when the repo is under `Documents`.
- Do not copy stale `ios/Pods`, `ios/.symlinks`, `ios/Podfile.lock`, or
  `ios/Runner.xcworkspace` into the safe mirror. The script regenerates them.
- If simulator services fail, retry with:

```bash
xcrun simctl list devices available
```

- Physical iPhone deployment requires Xcode signing:
  - Apple ID / Developer Team
  - unique Bundle ID
  - Provisioning Profile

Build success on simulator does not prove physical device signing.

## Android Notes

- Android physical devices must show as `device`:

```bash
adb devices -l
```

- `unauthorized` means the phone has not accepted the USB debugging prompt.
- First Android build may install Gradle, Android SDK platforms, Build Tools,
  NDK, and CMake. This can take a long time and is not an App code failure.
- If Gradle wrapper download reports `zip END header not found`, delete the
  broken wrapper cache and retry:

```bash
rm -rf ~/.gradle/wrapper/dists/gradle-<version>-all
```

- The current project uses a Tencent Gradle distribution mirror and Android
  Maven mirrors in `android/settings.gradle.kts` to reduce network failures.
- If Android Studio installed SDKs in another root, update Flutter:

```bash
flutter config --android-sdk <sdk-root>
```

## Windows Notes

- Windows builds must run inside Windows 10/11.
- Use Parallels Desktop Windows 11 first, then Windows 10 before release.
- Install Flutter Windows desktop requirements inside the Windows guest.
- A macOS host cannot prove Windows build or runtime behavior.

## Linux Notes

- Linux builds must run inside Linux.
- Verify both Debian stable and Ubuntu LTS before release.
- Install Flutter Linux desktop dependencies inside the guest OS, including GTK
  runtime/development packages required by Flutter.
- A macOS host cannot prove Linux build or runtime behavior.

## Web Notes

- Web is a UI preview and debugging target, not the native VPN runtime.
- `flutter_secure_storage_web` may emit WebAssembly dry-run warnings because it
  uses browser APIs not supported by wasm. This is non-blocking while the Web
  target is JS-only.
- Verify local Web server with:

```bash
bash scripts/local-app.sh start --target web --foreground
curl -s -v http://127.0.0.1:3003/ | head -80
```

## Compatibility Reporting

Every App completion report that touches build, runtime, platform code, native
VPN, secure storage, auth, or UI must include a platform matrix:

| Target | Build | Run | Evidence | Notes |
| --- | --- | --- | --- | --- |
| macos-arm64 | pass/fail/not run | pass/fail/not run | command/log | Apple Silicon |
| macos-x64 | pass/fail/not run | pass/fail/not run | command/log | Intel/Rosetta/x64 runner |
| ios | pass/fail/not run | pass/fail/not run | simulator/device id | Simulator vs physical device |
| android | pass/fail/not run | pass/fail/not run | APK/device id | Emulator vs physical device |
| windows | pass/fail/not run | pass/fail/not run | guest OS | Windows 10/11 |
| linux | pass/fail/not run | pass/fail/not run | guest OS | Debian/Ubuntu |
| web | pass/fail/not run | pass/fail/not run | URL/status | UI preview only |

Never mark a target complete if it was only inferred from another OS, another
CPU architecture, or a different host.
