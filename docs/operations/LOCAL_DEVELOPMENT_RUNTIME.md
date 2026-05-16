# LiveMask Local Development Runtime

> This runbook defines the local runtime environment for daily development on
> `dev`. It is separate from unit tests and separate from remote staging smoke.

## 1. Goal

Every developer or AI editor window should be able to run a real local backend
stack before handing off a task.

Local runtime means:

```text
PostgreSQL + Redis via Docker Compose
Backend via Docker Compose, mounted from local `livemask-backend`
Admin via Docker Compose, mounted from local `livemask-admin`
Website via Docker Compose, mounted from local `livemask-website`
NodeAgent via Docker Compose, mounted from local `livemask-nodeagent`
App via local Flutter SDK, compiled and launched on the developer machine
```

This is not production and not staging. It is the developer integration
environment for `dev-local`.

App is intentionally local-only in this runtime. Pre-release and production do
not start an App container, because App is a client deliverable that is built,
packaged, installed, and tested through platform-specific flows. On macOS M-series
developer machines, the first verification target is the native macOS Flutter
client. Web preview remains available for quick UI checks, but it also runs from
the local Flutter SDK, not Docker.

## 2. Ports

| Service | URL / Port | Owner |
| --- | --- | --- |
| Backend API | `http://127.0.0.1:18080` | `livemask-backend` |
| PostgreSQL | `127.0.0.1:15432` | Docker compose |
| Redis | `127.0.0.1:16379` | Docker compose |
| Admin | `http://127.0.0.1:3001` | `livemask-admin` |
| Website | `http://127.0.0.1:3002` | `livemask-website` |
| App macOS client | local `.app` / Flutter process | `livemask-app` |
| App web preview | `http://127.0.0.1:3003` when `--app-web` | `livemask-app` |
| NodeAgent status | `http://127.0.0.1:19090` | `livemask-nodeagent` |

These ports intentionally avoid common defaults such as `5432`, `6379`, and
`3000`.

## 3. Start

From `livemask-docs`:

```bash
bash scripts/local-dev.sh start
```

This starts PostgreSQL, Redis, and Backend.

Optional:

```bash
bash scripts/local-dev.sh start --admin
bash scripts/local-dev.sh start --website
bash scripts/local-dev.sh start --app       # local macOS Flutter client
bash scripts/local-dev.sh start --app-web   # local Flutter web-server preview
bash scripts/local-dev.sh start --app-target macos,ios
bash scripts/local-dev.sh start --nodeagent
bash scripts/local-dev.sh start --all
```

`--all` starts Backend/Admin/Website/NodeAgent with Docker and starts the App as
a local macOS Flutter process.

For local Backend code reload, run:

```bash
bash scripts/local-dev.sh start --auto-reload
```

The script installs `air` inside the Backend container and watches the mounted
local source tree.

## 4. Docker Pull Acceleration

The local runtime uses official images by default:

```text
postgres:16-alpine
redis:7-alpine
golang:1.25-alpine
node:22-alpine
ghcr.io/cirruslabs/flutter:stable
golang:1.26-alpine
```

If Docker Hub is slow, set image overrides in `livemask-ci-cd/.env`:

```bash
cd ../livemask-ci-cd
cp .env.example .env
```

Then change the image variables while keeping the same image names and tags:

```text
POSTGRES_IMAGE=<mirror>/postgres:16-alpine
REDIS_IMAGE=<mirror>/redis:7-alpine
BACKEND_GO_IMAGE=<mirror>/golang:1.25-alpine
ADMIN_NODE_IMAGE=<mirror>/node:22-alpine
WEBSITE_NODE_IMAGE=<mirror>/node:22-alpine
NODEAGENT_GO_IMAGE=<mirror>/golang:1.26-alpine
```

Flutter is not pulled as a Docker image for App development. Install Flutter on
the Mac and verify with:

```bash
cd ../livemask-app
bash scripts/local-app.sh doctor
```

On a shared development server, prefer configuring Docker daemon registry
mirrors once so every repository benefits from the same acceleration policy.

## 5. Check

```bash
bash scripts/local-dev.sh status
curl -fsS http://127.0.0.1:18080/api/v1/health
curl -fsS http://127.0.0.1:18080/api/v1/config/client
curl -I http://127.0.0.1:3001
curl -I http://127.0.0.1:3002
bash ../livemask-app/scripts/local-app.sh status
curl -fsS http://127.0.0.1:19090/config/status
```

Logs are written under:

```text
docker compose -f ../livemask-ci-cd/infra/docker-compose.local.yml logs -f
```

Examples:

```bash
docker compose -f ../livemask-ci-cd/infra/docker-compose.local.yml logs backend -f
docker compose --profile admin -f ../livemask-ci-cd/infra/docker-compose.local.yml logs admin -f
docker compose --profile website -f ../livemask-ci-cd/infra/docker-compose.local.yml logs website -f
docker compose --profile nodeagent -f ../livemask-ci-cd/infra/docker-compose.local.yml logs nodeagent -f
bash ../livemask-app/scripts/local-app.sh logs --target macos
```

## 6. Stop

```bash
bash scripts/local-dev.sh stop
```

This stops and removes local Docker containers. Named volumes are preserved so
PostgreSQL data, Go module cache, and `node_modules` do not need to be rebuilt
on every start. It also stops local App macOS/web Flutter processes started by
this script.

Restart:

```bash
bash scripts/local-dev.sh restart
bash scripts/local-dev.sh restart --auto-reload --all
```

## 7. App Local Runtime

The App should point to:

```text
http://127.0.0.1:18080
```

The App must be run from the Mac local Flutter SDK:

```bash
cd ../livemask-app
bash scripts/local-app.sh doctor
bash scripts/local-app.sh start --target macos
bash scripts/local-app.sh logs --target macos
```

Build multiple App targets as a queue:

```bash
bash scripts/local-app.sh build --targets macos,ios
bash scripts/local-app.sh build --targets all
```

Target support:

| Target | Where it can be built / run |
| --- | --- |
| `macos` | macOS host with full Xcode |
| `ios` | macOS host with full Xcode and simulator/device setup |
| `android` | macOS/Linux/Windows host with Android SDK configured |
| `linux` | Linux host |
| `windows` | Windows host, including Parallels Desktop Windows VM |
| `web` | macOS/Linux/Windows host with Flutter web enabled |

When a queue includes a target unsupported by the current host, the script
prints a blocker for that target and continues unless `--fail-fast` is passed.

On a new macOS machine, complete the native toolchain once:

```bash
brew install --cask flutter
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
flutter doctor
```

`sudo xcodebuild -license accept` requires the developer's macOS password and
must be run in a local Terminal session.

For quick UI-only browser preview:

```bash
bash scripts/local-app.sh start --target web
open http://127.0.0.1:3003
```

If the `macos/` target does not exist yet, `scripts/local-app.sh` generates it
with `flutter create --platforms=macos .`.

Flutter Web is served from `http://127.0.0.1:3003`, so Backend must allow that
origin for local browser auth/API calls. The local compose stack sets:

```text
CORS_ALLOWED_ORIGINS=http://127.0.0.1:3001,http://127.0.0.1:3002,http://127.0.0.1:3003,http://localhost:3001,http://localhost:3002,http://localhost:3003
```

For emulators or devices, use the platform-specific host mapping:

| Platform | Backend base URL |
| --- | --- |
| iOS simulator | `http://127.0.0.1:18080` |
| Android emulator | `http://10.0.2.2:18080` |
| Physical device | LAN IP of the developer machine |
| macOS / Windows / Linux desktop app | `http://127.0.0.1:18080` |

## 8. Default Development Users

Local dev seeds five fixed users when `DEV_SEED_USERS=true`. These accounts are
for local development, UI verification, and QA smoke only. They must not be
enabled in production.

| Role | Email | Password | Primary Surface |
| --- | --- | --- | --- |
| Admin | `admin@livemask.dev` | `AdminPass123!` | `/admin/*` |
| Sponsor ambassador | `sponsor@livemask.dev` | `SponsorPass123!` | `/sponsor/*` |
| Promotion ambassador | `ambassador@livemask.dev` | `AmbassadorPass123!` | `/ambassador/*` |
| Subscriber | `subscriber@livemask.dev` | `SubscriberPass123!` | App / Website user portal |
| Normal user | `user@livemask.dev` | `UserPass123!` | App / Website user portal |

The default values live in `livemask-ci-cd/infra/env/local.env.example` and can
be overridden through a local env file. Production env files must leave
`DEV_SEED_USERS` unset or `false`.

## 9. Local Runtime Is Required For Completion

For backend, admin, app, and nodeagent tasks, a completion report should include
one of:

- local runtime check passed
- local runtime not applicable, with reason
- local runtime blocked, with exact blocker

Example:

```text
Local Runtime:
- bash scripts/local-dev.sh start passed
- GET /api/v1/health returned status=ok
- Admin opened against local Backend
- Website opened against local Backend
- App web preview opened against local Backend
- NodeAgent /config/status returned current/degraded status
```

## 10. Troubleshooting

If NodeAgent is reachable but reports a `config_hash` mismatch after reusing an
old local PostgreSQL/Redis volume, refresh the local cache and restart only
NodeAgent:

```bash
cd ../livemask-ci-cd
docker compose --profile deps -f infra/docker-compose.local.yml exec -T redis redis-cli del config:nodeagent.runtime_config config:version:nodeagent.runtime_config
docker compose --profile nodeagent --profile deps -f infra/docker-compose.local.yml restart nodeagent
```

If Admin or Website is stuck in an `npm install` restart loop, the local compose
command automatically clears only the container `node_modules` volume and
reinstalls dependencies. Source files are not removed.

## 11. Relationship To Other Environments

| Environment | Trigger | Purpose |
| --- | --- | --- |
| `dev-local` | developer / AI window | local integrated runtime |
| `dev` CI | push / PR / task-unlocked | repo-level verification |
| `main` staging | dev -> main promotion | remote staging smoke |
| release production | GitHub Release / `v*` tag | production gate |

Do not use `task-unlocked` to deploy staging. It is only a development
coordination signal.

App validation belongs to `dev-local` and platform test pipelines. Staging and
production should validate Backend/Admin/Website/NodeAgent plus API smoke, not
start a long-running App service.

For the full local, staging, and production Docker runtime model, see
[DOCKER_RUNTIME_DEPLOYMENT.md](DOCKER_RUNTIME_DEPLOYMENT.md).
