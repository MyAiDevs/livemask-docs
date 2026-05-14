# GitHub Automation Setup

> This runbook explains how LiveMask uses GitHub Projects, Issues, Actions, CODEOWNERS, repository_dispatch, and multi-repo self-hosted runners.

## 1. Repository Roles

| Repo | Role |
| --- | --- |
| `livemask-docs` | Rules, TASK docs, contracts, GitHub dispatch source |
| `livemask-backend` | API, DB, Redis, Worker, Payment |
| `livemask-nodeagent` | NodeAgent, config sync, reports, degraded mode |
| `livemask-app` | App Client |
| `livemask-admin` | Admin console |
| `livemask-website` | Website |
| `livemask-ci-cd` | Staging, smoke, deployment |

## 2. Required GitHub Secrets

In `livemask-docs`:

- `LIVEMASK_BOT_TOKEN`: fine-grained token that can dispatch workflows in all child repos.

Recommended permissions:

- Contents: read
- Actions: read/write
- Metadata: read

## 3. GitHub Project

Create a project named `LiveMask Delivery` with fields:

- Status: Backlog, Ready, In Progress, Needs Contract, Cross-Repo Review, QA, Ready to Release, Done
- Repo: docs, backend, nodeagent, app, admin, website, ci-cd
- Task Type: API, Config, Payment, App, NodeAgent, Admin, Website, Ops, Docs, Security, QA
- Priority: P0, P1, P2

## 4. Install Child Repo Automation

From `livemask-docs`:

```bash
bash scripts/install-github-automation.sh ../livemask-backend backend
bash scripts/install-github-automation.sh ../livemask-nodeagent nodeagent
bash scripts/install-github-automation.sh ../livemask-admin frontend
bash scripts/install-github-automation.sh ../livemask-website frontend
bash scripts/install-github-automation.sh ../livemask-ci-cd ci-cd
```

For `livemask-app`, choose the correct workflow after the app stack is confirmed:

```bash
bash scripts/install-github-automation.sh ../livemask-app generic
```

## 5. Self-Hosted Runners

Use one staging server, but register one repository-level runner per repo. Each
runner has its own directory, service name, token, working directory, and labels.

| Repo | Runner directory | Required labels |
| --- | --- | --- |
| `livemask-backend` | `/opt/actions-runner/livemask-backend` | `self-hosted`, `linux`, `livemask`, `backend`, `docker` |
| `livemask-nodeagent` | `/opt/actions-runner/livemask-nodeagent` | `self-hosted`, `linux`, `livemask`, `nodeagent`, `docker` |
| `livemask-app` | `/opt/actions-runner/livemask-app` | `self-hosted`, `linux`, `livemask`, `app`, `frontend`, `docker` |
| `livemask-admin` | `/opt/actions-runner/livemask-admin` | `self-hosted`, `linux`, `livemask`, `admin`, `frontend`, `docker` |
| `livemask-website` | `/opt/actions-runner/livemask-website` | `self-hosted`, `linux`, `livemask`, `website`, `frontend`, `docker` |
| `livemask-ci-cd` | `/opt/actions-runner/livemask-ci-cd` | `self-hosted`, `linux`, `livemask`, `ci-cd`, `staging`, `docker` |

Repository-level runners are isolated by GitHub repository. A runner registered
to `livemask-backend` is not visible to `livemask-ci-cd`, even when the same
server hosts both runner services.

For each repo:

1. Open `Settings -> Actions -> Runners -> New self-hosted runner`.
2. Choose Linux x64.
3. Create a dedicated runner directory from the table above.
4. Run GitHub's `config.sh` command in that directory.
5. Add the repo-specific labels from the table.
6. Install and start the service.

Example service commands after configuration:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

All runner services on the same server must use different directories. Do not
reuse one runner directory for multiple repositories.

## 6. Runner Selection

```text
livemask-backend   -> runs-on: [self-hosted, linux, livemask, backend, docker]
livemask-nodeagent -> runs-on: [self-hosted, linux, livemask, nodeagent, docker]
livemask-app       -> runs-on: [self-hosted, linux, livemask, app, frontend, docker]
livemask-admin     -> runs-on: [self-hosted, linux, livemask, admin, frontend, docker]
livemask-website   -> runs-on: [self-hosted, linux, livemask, website, frontend, docker]
livemask-ci-cd     -> runs-on: [self-hosted, linux, livemask, ci-cd, staging, docker]
```

When a shared workflow template is used by several frontend repos, the
repository-level runner visibility still prevents cross-repo execution. Add the
repo-specific label in the copied workflow if a repo needs stricter routing.

## 7. Development Flow

1. Create a TASK issue in `livemask-docs`.
2. Add or update the TASK doc and contracts.
3. Docs PR runs `Docs Check`.
4. Merge docs PR.
5. `livemask-docs` dispatches `docs-contract-changed` to child repos.
6. Each child repo runs CI on its own repository-level self-hosted runner.
7. Implementation PRs reference the same TASK.
8. `livemask-ci-cd` runs staging smoke before release.
