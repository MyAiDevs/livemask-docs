# GitHub Automation Setup

> This runbook explains how LiveMask uses GitHub Projects, Issues, Actions, CODEOWNERS, repository_dispatch, and a self-hosted runner.

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

## 5. Self-Hosted Runner

Install one runner on the staging server with labels:

```text
self-hosted
livemask
docker
staging
```

The child repo workflows expect these labels.

## 6. Development Flow

1. Create a TASK issue in `livemask-docs`.
2. Add or update the TASK doc and contracts.
3. Docs PR runs `Docs Check`.
4. Merge docs PR.
5. `livemask-docs` dispatches `docs-contract-changed` to child repos.
6. Child repos run CI on the self-hosted runner.
7. Implementation PRs reference the same TASK.
8. `livemask-ci-cd` runs staging smoke before release.
