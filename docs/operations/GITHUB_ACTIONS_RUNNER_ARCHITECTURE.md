# GitHub Actions Runner Architecture

> This document explains why LiveMask uses GitHub Actions, organization-level
> runner groups, and multiple self-hosted runners on one server. It also gives
> concrete setup examples, workflow examples, security boundaries, failure
> diagnosis, and future scaling rules.

## 1. Goal

LiveMask is a multi-repository project:

| Repo | Responsibility |
| --- | --- |
| `livemask-docs` | Project rules, contracts, TASK definitions, dispatch source |
| `livemask-backend` | API, DB, Redis, workers, payment, business state |
| `livemask-nodeagent` | NodeAgent runtime, config sync, quality reports |
| `livemask-app` | Client app |
| `livemask-admin` | Admin console |
| `livemask-website` | Public website |
| `livemask-ci-cd` | Staging orchestration, smoke tests, release gates |

The CI/CD design must support:

- Parallel development across multiple repos.
- Shared project rules from `livemask-docs`.
- Real tests on a controlled server.
- CI and staging separation.
- Lark notifications for success, failure, and project reports.
- A simple path for future expansion.

## 2. Final Architecture

```text
GitHub Organization: MyAiDevs

  Runner group: livemask-ci
    Runner: livemask-ci-runner-01
    Directory: /opt/actions-runner/livemask-ci
    Allowed repos:
      - livemask-docs
      - livemask-backend
      - livemask-nodeagent
      - livemask-app
      - livemask-admin
      - livemask-website
    Labels:
      - self-hosted
      - linux
      - livemask
      - docker
      - ci

  Runner group: livemask-staging
    Runner: livemask-staging-runner-01
    Directory: /opt/actions-runner/livemask-staging
    Allowed repos:
      - livemask-ci-cd
    Labels:
      - self-hosted
      - linux
      - livemask
      - docker
      - staging
```

The two runner services can run on the same physical server. The separation is
not about server count; it is about repository access, workflow intent, and
credential boundaries.

## 3. Why GitHub Actions

GitHub Actions is the orchestration layer because the source of truth is already
GitHub:

| Need | GitHub Actions role |
| --- | --- |
| Pull request validation | Run checks before merge |
| Contract changes | Dispatch affected repos |
| Multi-repo consistency | Use shared templates from `livemask-docs` |
| Staging smoke | Run real environment tests on self-hosted runner |
| Reports | Send Lark cards with run status and error summaries |
| Release gates | Block release until smoke passes |

Example:

1. A contract changes in `livemask-docs`.
2. `Docs Check` validates links, task traceability, role handoffs, and chain coverage.
3. `Dispatch Affected Repos` sends `docs-contract-changed` to child repos.
4. Child repos run their own CI.
5. `livemask-ci-cd` runs staging smoke when a release candidate is ready.
6. Every workflow sends a Lark report.

This keeps documentation, code, CI, and reporting connected.

## 4. Why Organization-Level Runners

LiveMask moved repositories into the `MyAiDevs` organization. Organization-level
runners are better than repository-level runners for this project because one
runner can be shared by multiple repos through runner groups.

| Option | Result |
| --- | --- |
| Repository-level runner per repo | More setup, more services, more duplicated maintenance |
| One organization runner shared by all repos | Simple, but staging and CI are mixed |
| Organization runner groups | Shared capacity with controlled access |

The chosen model is:

```text
Organization runner
  -> Runner group controls repository access
  -> Workflow labels select the correct runner
```

Example:

```yaml
runs-on:
  group: livemask-ci
  labels: [self-hosted, linux, livemask, docker, ci]
```

This means:

- The workflow must be in a repository allowed by `livemask-ci`.
- The runner must have all listed labels.
- If either condition fails, the job stays queued.

## 5. Why Two Runner Groups On One Server

There is only one server, but two runner groups are still useful because a group
is a permission boundary, not a machine boundary.

### 5.1 CI Group

`livemask-ci` is for regular validation:

- Docs checks
- Backend tests
- NodeAgent tests
- Frontend builds
- Contract-triggered checks

It should not own staging deployment secrets or production-like credentials.

### 5.2 Staging Group

`livemask-staging` is for environment operations:

- Start staging compose stack
- Run smoke tests
- Prepare release candidate checks
- Later: deploy staging, migrate staging DB, run E2E

Only `livemask-ci-cd` should access this group.

### 5.3 Concrete Risk Example

If all repos can use the same staging runner, a normal frontend PR could modify
its workflow to run:

```yaml
run: docker ps && cat .env
```

If the runner has staging secrets or mounted deployment files, that PR could
expose sensitive data. By restricting `livemask-staging` to `livemask-ci-cd`,
ordinary app/admin/website workflows cannot directly run on the staging runner.

This does not make the single server magically isolated, but it creates a strong
GitHub-side access boundary and a clear operational rule:

```text
normal repos -> livemask-ci
staging operations -> livemask-ci-cd -> livemask-staging
```

## 6. Why Multiple Runner Directories

Each self-hosted runner installation has its own configuration, service, working
directory, token registration, and service name. Reusing one directory for two
runners causes service and config conflicts.

Use:

```text
/opt/actions-runner/livemask-ci
/opt/actions-runner/livemask-staging
```

Do not use:

```text
/opt/actions-runner
```

for both runner registrations.

Example service names:

```text
actions.runner.MyAiDevs.livemask-ci-runner-01.service
actions.runner.MyAiDevs.livemask-staging-runner-01.service
```

Useful server checks:

```bash
sudo systemctl status actions.runner.MyAiDevs.livemask-ci-runner-01.service
sudo systemctl status actions.runner.MyAiDevs.livemask-staging-runner-01.service
systemctl list-units "*actions.runner*" --type=service
```

## 7. Registration Example

GitHub path:

```text
MyAiDevs
-> Settings
-> Actions
-> Runners
-> New self-hosted runner
```

Choose Linux x64 and follow the download instructions from GitHub.

CI runner:

```bash
cd /opt/actions-runner/livemask-ci

./config.sh \
  --url https://github.com/MyAiDevs \
  --token <github-runner-token> \
  --name livemask-ci-runner-01 \
  --runnergroup livemask-ci \
  --labels livemask,docker,ci \
  --work _work

sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

Staging runner:

```bash
cd /opt/actions-runner/livemask-staging

./config.sh \
  --url https://github.com/MyAiDevs \
  --token <github-runner-token> \
  --name livemask-staging-runner-01 \
  --runnergroup livemask-staging \
  --labels livemask,docker,staging \
  --work _work

sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

Notes:

- `--url` is the organization URL, not a repository URL.
- `--runnergroup` must already exist in the organization.
- GitHub runner tokens expire quickly; generate a fresh token when registering.
- GitHub automatically adds labels such as `self-hosted`, `linux`, and `x64`.
- Custom labels are added with `--labels`.

## 8. Runner Group Repository Access

Configure repository access in:

```text
MyAiDevs
-> Settings
-> Actions
-> Runner groups
-> livemask-ci / livemask-staging
-> Repository access
```

Recommended access:

| Runner group | Allowed repos | Reason |
| --- | --- | --- |
| `livemask-ci` | `livemask-docs`, `livemask-backend`, `livemask-nodeagent`, `livemask-app`, `livemask-admin`, `livemask-website` | Regular checks and builds |
| `livemask-staging` | `livemask-ci-cd` | Staging deployment and smoke only |

Do not grant `livemask-staging` to app/admin/website/backend by default. Those
repos should request staging validation by triggering or depending on
`livemask-ci-cd`.

## 9. Workflow Examples

### 9.1 Regular CI

Use in docs/backend/nodeagent/app/admin/website:

```yaml
jobs:
  build:
    runs-on:
      group: livemask-ci
      labels: [self-hosted, linux, livemask, docker, ci]
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

### 9.2 Staging Smoke

Use in `livemask-ci-cd`:

```yaml
jobs:
  smoke:
    runs-on:
      group: livemask-staging
      labels: [self-hosted, linux, livemask, docker, staging]
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f infra/docker-compose.staging.yml up -d
      - run: bash scripts/smoke.sh
```

### 9.3 Lark Notification

Every workflow should finish with a notification job:

```yaml
notify-lark:
  needs: [build]
  if: always()
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Notify Lark
      env:
        GITHUB_TOKEN: ${{ github.token }}
        LARK_BOT_WEBHOOK: ${{ secrets.LARK_BOT_WEBHOOK }}
        LARK_BOT_SECRET: ${{ secrets.LARK_BOT_SECRET }}
        WORKFLOW_RESULT: ${{ needs.build.result }}
      run: bash .github/scripts/lark-notify.sh "$WORKFLOW_RESULT"
```

Use `if: always()` so failure and cancellation still generate a report.

## 10. Lark Reporting

CI/CD notifications include:

- Repository
- Workflow name
- Run number
- Branch or tag
- Actor
- Commit SHA
- Result
- Error log summary when the run fails
- Button linking to the GitHub run

The notifier attempts to download the GitHub Actions log archive and extract
likely error lines. If log download fails, notification still succeeds and the
GitHub run remains the source of full logs.

Manual project reports are sent from:

```text
livemask-docs
-> Actions
-> Lark Project Report
-> Run workflow
```

Use project reports for multi-repo status:

```text
Summary:
Backend auth API is ready for app integration. NodeAgent config sync is blocked
by config version field confirmation.

Tasks:
- livemask-backend: auth endpoint implemented, tests passing.
- livemask-app: login UI ready, waiting for staging API.
- livemask-ci-cd: staging smoke baseline passing.

Risks:
- App and Backend must freeze auth error codes before parallel work continues.

Next steps:
1. Merge auth contract.
2. Trigger backend and app CI.
3. Run staging smoke.
```

## 11. Secrets

Configure organization secrets:

```text
MyAiDevs
-> Settings
-> Secrets and variables
-> Actions
```

Required:

| Secret | Used by | Purpose |
| --- | --- | --- |
| `LIVEMASK_BOT_TOKEN` | `livemask-docs` | Dispatch events to child repos |
| `LARK_BOT_WEBHOOK` | All repos | Send Lark bot message |
| `LARK_BOT_SECRET` | All repos | Sign Lark bot message |

Rules:

- Never commit secrets into any repo.
- Prefer organization secrets with explicit repository access.
- Limit `LIVEMASK_BOT_TOKEN` to the permissions required for dispatch.
- Rotate tokens if they appear in logs, chat, screenshots, or local shell history.

## 12. Multi-Repo Development Flow

```text
1. Create GitHub Issue / TASK.
2. Update livemask-docs contracts and task docs.
3. Docs Check validates documentation closure.
4. Dispatch Affected Repos notifies child repos.
5. Child repos run CI on livemask-ci.
6. Developers implement in parallel.
7. Each repo reports CI result to Lark.
8. livemask-ci-cd runs staging smoke on livemask-staging.
9. Staging result and failure logs are reported to Lark.
10. Project owner sends Lark Project Report when a milestone changes.
```

This flow avoids the common multi-repo failure where each repo appears healthy
alone but the full App -> NodeAgent -> API -> DB/Redis chain is broken.

## 13. Troubleshooting

### 13.1 Job stays queued

Check:

1. Runner is online in `MyAiDevs -> Settings -> Actions -> Runners`.
2. Runner group allows the repository.
3. Workflow `group` matches the runner group.
4. Workflow labels are all present on the runner.
5. Runner service is running on the server.

Server command:

```bash
systemctl list-units "*actions.runner*" --type=service
```

### 13.2 Error: runner group not found

Cause:

```text
--runnergroup livemask-runners
```

was used, but the organization only has:

```text
livemask-ci
livemask-staging
```

Fix:

```bash
--runnergroup livemask-ci
```

or:

```bash
--runnergroup livemask-staging
```

### 13.3 Error: no such file or directory in staging smoke

Example:

```text
infra/docker-compose.staging.yml: no such file or directory
```

Cause:

The workflow references a deployment artifact that is not committed to
`livemask-ci-cd`.

Fix:

1. Commit the missing compose file or update the workflow path.
2. Run:

```bash
docker compose -f infra/docker-compose.staging.yml config
```

3. Push and rerun `Staging Smoke`.

### 13.4 Lark notification does not arrive

Check:

1. `LARK_BOT_WEBHOOK` is configured.
2. `LARK_BOT_SECRET` matches the bot signing secret.
3. Organization secret repository access includes the repo.
4. The workflow reached the `notify-lark` job.
5. The Lark bot is still enabled in the target group.

The notification script intentionally skips sending if `LARK_BOT_WEBHOOK` is
missing, so missing secrets do not fail CI.

### 13.5 Push rejected with fetch first

Cause:

Remote `main` has commits that local `main` does not have.

Fix:

```bash
git fetch origin main
git rebase origin/main
git push origin main
```

Do not force push unless the project owner explicitly approves it.

## 14. Scaling Rules

Start with two runner services on one server:

```text
livemask-ci-runner-01
livemask-staging-runner-01
```

When CI waits too long, add another CI runner:

```text
livemask-ci-runner-02
```

with the same group and labels:

```text
group: livemask-ci
labels: livemask,docker,ci
```

When staging becomes sensitive or resource-heavy, move `livemask-staging` to a
separate server without changing workflow files. The runner group and labels
remain the same.

When production deployment begins, create a separate group:

```text
livemask-production
```

and allow only the release/deployment repository to use it.

## 15. Acceptance Checklist

- [ ] `livemask-ci-runner-01` is online.
- [ ] `livemask-staging-runner-01` is online.
- [ ] `livemask-ci` allows docs/backend/nodeagent/app/admin/website.
- [ ] `livemask-staging` allows only ci-cd.
- [ ] Regular CI workflows use `group: livemask-ci`.
- [ ] Staging workflows use `group: livemask-staging`.
- [ ] `LARK_BOT_WEBHOOK` and `LARK_BOT_SECRET` are organization secrets.
- [ ] Failed CI/CD run produces a Lark card with an error summary.
- [ ] `Lark Project Report` can send a manual multi-repo report.
- [ ] `livemask-ci-cd` staging smoke can start and run.
