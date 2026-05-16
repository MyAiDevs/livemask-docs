# LiveMask Docker Runtime Deployment

> This runbook defines one runtime model for local development, staging, and
> production. The goal is to avoid one-off scripts per environment.

## 1. Runtime Model

LiveMask supports two Docker runtime modes:

| Mode | Compose file | Purpose |
| --- | --- | --- |
| `local` | `livemask-ci-cd/infra/docker-compose.local.yml` | Source-mounted containers for daily development and staging-style debugging |
| `runtime` | `livemask-ci-cd/infra/docker-compose.runtime.yml` | Image-based one-click deployment for staging or production |

Both modes are controlled by:

```bash
cd livemask-ci-cd
bash scripts/runtime.sh <command> [options]
```

Important App boundary:

- `app` is supported only in `--mode local`.
- Pre-release and production must not start App as a server/container.
- App validation is done by local developer preview, simulator/device testing,
  and platform build pipelines.
- `--mode runtime --services all` expands to Backend, Admin, Website, and
  NodeAgent only.

Supported commands:

```text
start
stop
restart
status
pull
logs
```

## 2. Local / Staging Docker Runtime

Local mode runs all services in containers but mounts local source code:

```bash
cd livemask-ci-cd
bash scripts/runtime.sh start --mode local --services all
```

Backend hot reload:

```bash
bash scripts/runtime.sh restart --mode local --services backend --auto-reload
```

Split service startup:

```bash
bash scripts/runtime.sh start --mode local --services backend
bash scripts/runtime.sh start --mode local --services admin
bash scripts/runtime.sh start --mode local --services website
bash scripts/runtime.sh start --mode local --services app
bash scripts/runtime.sh start --mode local --services nodeagent
```

The docs shortcut uses the same runtime script:

```bash
cd livemask-docs
bash scripts/local-dev.sh start --all
bash scripts/local-dev.sh status
bash scripts/local-dev.sh stop
```

## 3. Production One-Click Docker Runtime

Production mode runs release images and reads a separate environment file:

```bash
cd livemask-ci-cd
cp infra/env/production.env.example infra/env/production.env
```

Edit `infra/env/production.env` on the server. Then deploy:

```bash
bash scripts/runtime.sh start \
  --mode runtime \
  --env-file infra/env/production.env \
  --services backend,admin,nodeagent \
  --no-deps \
  --pull
```

This means:

- PostgreSQL is provided by a cloud vendor through `DB_DSN`
- Redis is provided by a cloud vendor through `REDIS_ADDR`
- Backend/Admin/NodeAgent run as containers from release image tags
- the script pulls images before starting

## 4. Internal PostgreSQL / Redis

For small private deployments or staging servers, use internal dependency
containers. This still does not start App; App is local-only:

```bash
bash scripts/runtime.sh start \
  --mode runtime \
  --env-file infra/env/staging.env \
  --services all \
  --pull
```

Do not pass `--no-deps` in this mode. The script starts:

```text
postgres
redis
backend
admin
website
nodeagent
```

## 5. External Cloud PostgreSQL / Redis

When using cloud PostgreSQL / Redis, configure:

```text
DB_DSN=postgres://user:password@cloud-postgres.example.com:5432/livemask?sslmode=require
REDIS_ADDR=cloud-redis.example.com:6379
```

Then start without internal dependencies:

```bash
bash scripts/runtime.sh start \
  --mode runtime \
  --env-file infra/env/production.env \
  --services backend,admin \
  --no-deps
```

## 6. Split Service Operations

Backend only:

```bash
bash scripts/runtime.sh restart --mode runtime --env-file infra/env/production.env --services backend --no-deps
```

Admin only:

```bash
bash scripts/runtime.sh restart --mode runtime --env-file infra/env/production.env --services admin --no-deps
```

NodeAgent only:

```bash
bash scripts/runtime.sh restart --mode runtime --env-file infra/env/production.env --services nodeagent --no-deps
```

Logs:

```bash
bash scripts/runtime.sh logs --mode runtime --env-file infra/env/production.env --services backend --no-deps
```

Status:

```bash
bash scripts/runtime.sh status --mode runtime --env-file infra/env/production.env --services all --no-deps
```

## 7. API Smoke Test

API tests must not care whether Backend is running as a local process, a local
container, a staging container, or a production container. They should only use
`API_BASE_URL`.

Default local check:

```bash
cd livemask-ci-cd
bash scripts/api-smoke.sh
```

This defaults to:

```text
http://127.0.0.1:18080
```

Point it to another Backend:

```bash
API_BASE_URL=http://127.0.0.1:18080 bash scripts/api-smoke.sh
API_BASE_URL=https://staging-api.example.com bash scripts/api-smoke.sh
```

Add future API paths in:

```text
livemask-ci-cd/scripts/api-smoke-cases.tsv
```

Each row is:

```text
name<TAB>method<TAB>path<TAB>expected_status<TAB>assertions
```

Examples:

```text
Health API	GET	/api/v1/health	200	json.status=ok;json.db_connected=true
Admin Config List	GET	/admin/api/v1/configs	200	json.configs.length>=2
```

Supported JSON assertions:

```text
json.status=ok
json.db_connected=true
json.config_version>=1
json.config_hash~^sha256:
json.configs.length>=2
```

## 8. Docker Pull Acceleration

The preferred server-level acceleration is Docker daemon registry mirrors:

```json
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://dockerproxy.net",
    "https://proxy.vvvv.ee",
    "https://dockerproxy.link",
    "https://docker.m.daocloud.io"
  ]
}
```

After editing `/etc/docker/daemon.json`:

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
docker info | sed -n '/Registry Mirrors/,+10p'
```

If daemon-level mirror configuration is not available, use image overrides in
the environment file:

```text
POSTGRES_IMAGE=<mirror>/postgres:16-alpine
REDIS_IMAGE=<mirror>/redis:7-alpine
BACKEND_GO_IMAGE=<mirror>/golang:1.22-alpine
ADMIN_NODE_IMAGE=<mirror>/node:22-alpine
WEBSITE_NODE_IMAGE=<mirror>/node:22-alpine
APP_FLUTTER_IMAGE=<mirror>/cirruslabs/flutter:stable
NODEAGENT_GO_IMAGE=<mirror>/golang:1.26-alpine
```

For production release images, configure the CI image push target rather than
rewriting image names manually on every server.

## 9. Environment Rules

| Environment | Runtime command | Dependency mode |
| --- | --- | --- |
| `dev-local` | `--mode local` | internal containers by default |
| `staging` | `--mode runtime` or existing staging smoke compose | internal or cloud |
| `production` | `--mode runtime --env-file infra/env/production.env` | cloud preferred |

Production must use immutable image tags such as `v0.1.0`. Do not deploy
production from `dev`, `main`, or floating `latest`.
