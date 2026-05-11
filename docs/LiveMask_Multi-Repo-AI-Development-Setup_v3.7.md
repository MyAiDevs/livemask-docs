# LiveMask Multi-Repository AI Development Setup (v3.7 Final)

This document describes the recommended way to develop the LiveMask project across multiple repositories using AI editors (Cursor, GitHub Copilot, etc.) while keeping everything consistent and maintaining closed loops.

## Recommended Repository Structure

- `livemask-docs` (this repo) — Central documentation and AI rules (Single Source of Truth)
- `livemask-backend` — Go backend, API, services, payment, monitoring
- `livemask-nodeagent` — Go NodeAgent + sing-box controller
- `livemask-app` — Flutter multi-platform client
- `livemask-admin` — React admin dashboard
- `livemask-website` — Marketing website / SEO

## How to Set Up AI Rule Auto-Loading

1. In each development repository, add this docs repo as submodule:
   ```bash
   git submodule add https://github.com/sammytan/livemask-docs.git docs
   git submodule update --init --recursive
   ```

2. Copy the template files from `templates/repositories/` into your repo root.

3. Customize `.cursorrules` to load the modules relevant to that repo (Backend loads payment + retention + production rules, NodeAgent loads NodeAgent-specific rules, etc.).

## Cross-Repository Development Workflow

When a feature spans multiple ends (e.g. a new retention intervention that affects both Backend and App):

1. AI must load rules from all affected modules.
2. Verify the four-layer closed loop.
3. Update documentation in `livemask-docs` as part of the same TASK.
4. Coordinate via shared TASK-XXXX in the central task list.

This ensures synchronous development without breaking compatibility.