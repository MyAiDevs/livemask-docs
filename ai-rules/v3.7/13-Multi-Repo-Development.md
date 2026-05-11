# 13 - Multi-Repository Development (v3.7)

This module defines how different development ends (App, Backend, NodeAgent, Admin, Website) collaborate using AI editors while maintaining consistency.

## Recommended Workflow

1. Central `livemask-docs` is the single source of truth.
2. Every development repo includes `livemask-docs` as git submodule.
3. Each repo has its own `.cursorrules` that loads the relevant rule modules from `docs/ai-rules/v3.7/`.
4. When implementing a feature that spans multiple ends, the AI must:
   - Load rules from all affected modules
   - Verify closed-loop across all layers
   - Suggest updates to documentation in livemask-docs

## How AI Editors Auto-Load Rules

- Cursor: Uses `.cursorrules` in repo root
- GitHub Copilot: Uses `.github/copilot-instructions.md`
- Each repo's `.cursorrules` explicitly references the needed modules from the submodule.