# Lark Reporting

LiveMask sends two kinds of reports to Lark:

1. CI/CD completion reports from every repository workflow.
2. Multi-repo project progress reports from `livemask-docs`.

## Secrets

Configure organization secrets in `MyAiDevs -> Settings -> Secrets and variables -> Actions`:

| Secret | Purpose |
| --- | --- |
| `LARK_BOT_WEBHOOK` | Lark custom bot webhook URL |
| `LARK_BOT_SECRET` | Lark bot signing secret |

Do not commit webhook URLs or signing secrets.

## CI/CD Report Template

Every CI/CD report contains:

| Section | Content |
| --- | --- |
| Header | Workflow result with color status |
| Repository | GitHub repository name |
| Workflow | Workflow name and run number |
| Ref | Branch or tag |
| Actor | Triggering GitHub user |
| Commit | Short commit SHA |
| Result | `success`, `failure`, `cancelled`, or `skipped` |
| Error Log Summary | Extracted failure lines when the workflow fails |
| Action | Button linking to the GitHub run |

Failure notifications attempt to download the current GitHub Actions run logs
with `GITHUB_TOKEN`, extract likely error lines, and include a short log summary
in the Lark card. Full logs remain in GitHub Actions.

## Project Report Template

Use `livemask-docs -> Actions -> Lark Project Report -> Run workflow`.

Fields:

| Field | Usage |
| --- | --- |
| `title` | Report title, such as `LiveMask Daily Multi-Repo Report` |
| `summary` | Overall project state |
| `tasks` | Multi-repo task progress |
| `risks` | Blockers, decisions needed, cross-role risks |
| `next_steps` | Next execution plan |

Recommended `tasks` format:

```text
- livemask-docs: Contract changes merged, repository dispatch verified.
- livemask-backend: API task T001 in progress, DB migration pending review.
- livemask-nodeagent: Config sync implementation ready for integration.
- livemask-app: Waiting for auth API contract.
- livemask-ci-cd: Staging smoke runner online, smoke baseline passing.
```

Recommended `risks` format:

```text
- API and App auth response fields must be frozen before parallel implementation.
- Staging environment should not share production credentials.
```

Recommended `next_steps` format:

```text
1. Close API auth contract.
2. Implement backend auth endpoints.
3. Wire app login flow against staging.
4. Run staging smoke and review Lark failure summaries.
```
