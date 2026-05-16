# LiveMask Frontend Suite Design

This directory stores combined Atoms exports that cover more than one frontend
surface.

Current export:

```text
design/frontend-suite/atoms/v1/export/
```

Source folder moved here:

```text
LiveMask Backend Brief
```

Despite the original folder name, this export contains UI code and files for:

- public website
- login and registration
- sponsor ambassador surfaces
- promotion ambassador surfaces
- system administrator backend surfaces

## Developer Reading Paths

Website developers should read:

```text
design/frontend-suite/atoms/v1/export/
design/website/
docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md
```

Admin developers should read:

```text
design/frontend-suite/atoms/v1/export/
design/admin/
docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md
```

## Split Rule

The raw Atoms export remains here as a single source artifact. Implementation
work should split the generated ideas into the correct runtime repositories:

| UI surface | Runtime repository |
| --- | --- |
| Public website, auth, user portal, C2C market, subscription pages | `livemask-website` |
| System admin, operations, finance, audit, sponsor/ambassador administration | `livemask-admin` |

Do not copy the raw export wholesale into a runtime repo. Treat it as design
source material and implement intentionally against the current contracts.
