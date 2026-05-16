# LiveMask Design Source

This directory is the design source of truth for LiveMask.

Use this rule:

```text
livemask-docs/design = design source of truth
each implementation repo = runtime code source of truth
```

Put Atoms exports, screenshots, design notes, and handoff documents here first.
Only move code or assets into `livemask-app`, `livemask-admin`, or
`livemask-website` when they are intentionally implemented.

## Directory Map

| Path | Owner | Purpose |
| --- | --- | --- |
| `design/app/` | App / Product / Design | Mobile App design source |
| `design/admin/` | Admin / Ops / Design | Admin console design source |
| `design/admin/sponsor-node/` | Admin / Revenue / Design | Sponsor node and ambassador revenue UI source |
| `design/website/` | Website / Growth / Design | Public website design source |
| `design/frontend-suite/` | Website / Admin / Growth / Ops | Combined Atoms export for public website, auth, sponsor/ambassador, and system admin UI |
| `design/shared/` | All teams | Brand, colors, typography, icons, shared assets |

## Versioning Rule

Never overwrite a previous Atoms export. Create a new version folder:

```text
design/app/atoms/v1
design/app/atoms/v2
design/admin/atoms/v1
design/website/atoms/v1
design/frontend-suite/atoms/v1
```

Each version should contain:

```text
prompt.md
notes.md
export/
screenshots/
handoff.md
```

## What Goes Where

| Artifact | Location |
| --- | --- |
| Atoms prompt | `design/<surface>/atoms/vN/prompt.md` |
| Atoms raw export | `design/<surface>/atoms/vN/export/` |
| Screenshots | `design/<surface>/atoms/vN/screenshots/` |
| Design decision notes | `design/<surface>/atoms/vN/notes.md` |
| Developer handoff | `design/<surface>/atoms/vN/handoff.md` |
| Shared brand tokens | `design/shared/brand/` |
| Shared assets | `design/shared/assets/` |

## Developer Reading Paths

App developers:

```text
design/app/
design/app/atoms/v2/export/
docs/app/LIVEMASK_APP_DESIGN_BRIEF_FOR_ATOMS.md
```

Admin developers:

```text
design/admin/
design/frontend-suite/atoms/v1/export/
docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md
```

Website developers:

```text
design/website/
design/frontend-suite/atoms/v1/export/
docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md
```

All developers:

```text
design/shared/
```
