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
App web preview via Docker Compose, mounted from local `livemask-app`
NodeAgent via Docker Compose, mounted from local `livemask-nodeagent`
```

This is not production and not staging. It is the developer integration
environment for `dev-local`.

App is intentionally local-only in this runtime. Pre-release and production do
not start an App container, because App is a client deliverable that is built,
packaged, installed, and tested through platform-specific flows. The Docker App
web preview exists only so developers can see and verify App UI/auth/config
integration against the local Backend.

## 2. Ports

| Service | URL / Port | Owner |
| --- | --- | --- |
| Backend API | `http://127.0.0.1:18080` | `livemask-backend` |
| PostgreSQL | `127.0.0.1:15432` | Docker compose |
| Redis | `127.0.0.1:16379` | Docker compose |
| Admin | `http://127.0.0.1:3001` | `livemask-admin` |
| Website | `http://127.0.0.1:3002` | `livemask-website` |
| App web preview | `http://127.0.0.1:3003` | `livemask-app` |
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
bash scripts/local-dev.sh start --app
bash scripts/local-dev.sh start --nodeagent
bash scripts/local-dev.sh start --all
```

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
APP_FLUTTER_IMAGE=<mirror>/cirruslabs/flutter:stable
NODEAGENT_GO_IMAGE=<mirror>/golang:1.26-alpine
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
curl -I http://127.0.0.1:3003
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
docker compose --profile app -f ../livemask-ci-cd/infra/docker-compose.local.yml logs app -f
docker compose --profile nodeagent -f ../livemask-ci-cd/infra/docker-compose.local.yml logs nodeagent -f
```

## 6. Stop

```bash
bash scripts/local-dev.sh stop
```

This stops and removes local Docker containers. Named volumes are preserved so
PostgreSQL data, Go module cache, and `node_modules` do not need to be rebuilt
on every start.

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

For emulators or devices, use the platform-specific host mapping:

| Platform | Backend base URL |
| --- | --- |
| iOS simulator | `http://127.0.0.1:18080` |
| Android emulator | `http://10.0.2.2:18080` |
| Physical device | LAN IP of the developer machine |
| macOS / Windows / Linux desktop app | `http://127.0.0.1:18080` |

## 8. Local Runtime Is Required For Completion

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

## 9. Troubleshooting

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

## 10. Relationship To Other Environments

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
