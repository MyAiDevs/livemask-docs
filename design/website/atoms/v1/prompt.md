# Website Atoms Prompt v1

Source brief:

```text
docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md
```

Copy the prompt from section `4.5 Website Atoms Prompt` in the source brief into
Atoms.

The generated website design must include public login and registration flows:

```text
/login
/register
/forgot-password
/verify-email
/auth/callback
```

These routes are public website auth entry pages. They must not be designed as
internal `/admin/*`, sponsor `/sponsor/*`, ambassador `/ambassador/*`, account
`/account/*`, or billing `/billing/*` pages.

Save generated files into:

```text
design/website/atoms/v1/export/
design/website/atoms/v1/screenshots/
```
