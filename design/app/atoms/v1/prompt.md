# App Atoms Prompt v1

Source brief:

```text
docs/app/LIVEMASK_APP_DESIGN_BRIEF_FOR_ATOMS.md
```

Copy the prompt from section `10. Atoms Prompt` in the source brief into
Atoms. After generation, save files into:

```text
design/app/atoms/v1/export/
design/app/atoms/v1/screenshots/
```

Do not overwrite this folder after implementation starts. Create `v2` for a new
design direction.

The generated design must include both mobile and desktop client surfaces:

```text
iOS / Android mobile screens
macOS desktop window + menu bar state
Windows desktop window + system tray state
Linux desktop window + tray/status fallback state
```

Desktop screens must not be stretched mobile screens. Use sidebar or split-view
navigation and include permission/helper recovery states.
