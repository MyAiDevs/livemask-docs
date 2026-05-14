# GitHub Automation Setup

> This runbook explains how LiveMask uses GitHub Projects, Issues, Actions, CODEOWNERS, repository_dispatch, and organization-level self-hosted runners.
>
> For the design rationale, examples, troubleshooting, and scaling rules, read
> `docs/operations/GITHUB_ACTIONS_RUNNER_ARCHITECTURE.md`.

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

In `MyAiDevs -> Settings -> Secrets and variables -> Actions`, configure these
organization secrets and allow access from all LiveMask repos:

- `LIVEMASK_BOT_TOKEN`: fine-grained token that can dispatch workflows in all child repos.
- `LARK_BOT_WEBHOOK`: Lark custom bot webhook URL.
- `LARK_BOT_SECRET`: Lark custom bot signing secret.

Recommended permissions:

- Contents: read
- Actions: read/write
- Metadata: read

Do not commit webhook URLs or signing secrets into any repository. All CI/CD
workflows call `.github/scripts/lark-notify.sh` or the docs template copy of
that script. If Lark secrets are missing, the notification step is skipped and
the workflow result is not changed.

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

Use organization-level runners under the `MyAiDevs` GitHub organization. A
runner is registered to the organization, then runner groups decide which repos
can use it.

| Runner group | Runner name | Repository access | Required labels |
| --- | --- | --- | --- |
| `livemask-ci` | `livemask-ci-runner-01` | `livemask-docs`, `livemask-backend`, `livemask-nodeagent`, `livemask-app`, `livemask-admin`, `livemask-website` | `self-hosted`, `linux`, `livemask`, `docker`, `ci` |
| `livemask-staging` | `livemask-staging-runner-01` | `livemask-ci-cd` | `self-hosted`, `linux`, `livemask`, `docker`, `staging` |

Both runners may run on the same server. Keep separate runner directories:

```text
/opt/actions-runner/livemask-ci
/opt/actions-runner/livemask-staging
```

CI runner registration:

```bash
./config.sh \
  --url https://github.com/MyAiDevs \
  --token <github-runner-token> \
  --name livemask-ci-runner-01 \
  --runnergroup livemask-ci \
  --labels livemask,docker,ci \
  --work _work
```

Staging runner registration:

```bash
./config.sh \
  --url https://github.com/MyAiDevs \
  --token <github-runner-token> \
  --name livemask-staging-runner-01 \
  --runnergroup livemask-staging \
  --labels livemask,docker,staging \
  --work _work
```

After each runner is configured:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

Do not reuse one runner directory for both runner groups.

## 6. Runner Selection

Regular CI:

```yaml
runs-on:
  group: livemask-ci
  labels: [self-hosted, linux, livemask, docker, ci]
```

Staging and smoke:

```yaml
runs-on:
  group: livemask-staging
  labels: [self-hosted, linux, livemask, docker, staging]
```

If a job stays queued, check both the runner group repository access and the
labels listed in the workflow.

## 7. Development Flow

1. Create a TASK issue in `livemask-docs`.
2. Add or update the TASK doc and contracts.
3. Docs PR runs `Docs Check`.
4. Merge docs PR.
5. `livemask-docs` dispatches `docs-contract-changed` to child repos.
6. Each child repo runs CI on the `livemask-ci` organization runner group.
7. Implementation PRs reference the same TASK.
8. `livemask-ci-cd` runs staging smoke before release.
