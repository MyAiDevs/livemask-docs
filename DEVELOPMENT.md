# LiveMask Multi-Window AI Development Workflow (v3.7)

## Overview
This document explains how to develop efficiently when using AI editors (Cursor, Windsurf, VS Code + Copilot) with **multiple project windows open at the same time**.

## Core Principle
Each window should only focus on **one repository** at a time. The AI rules in each repository are designed to automatically guide the AI to the correct context.

## How It Works

1. **Each repository has its own `.cursorrules`**
   - When you open a folder in Cursor, it automatically loads that folder's `.cursorrules`.
   - The `.cursorrules` file tells the AI which rule modules from `docs/ai-rules/v3.7/` to load.

2. **Central Source of Truth**
   - All repositories include `livemask-docs` as a git submodule under the `docs/` folder.
   - This gives every window access to the same central task list, AI rules, and documentation.

3. **Multi-Repo Linkage is Enforced**
   - Every `.cursorrules` includes `@docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md` and `@docs/ai-rules/v3.7/13-Multi-Repo-Development.md`.
   - The AI is instructed to check cross-repository impact when making changes.

## Recommended Daily Workflow

### When starting a new task
1. Open the relevant repository folder in a new Cursor window.
2. In the chat, first ask the AI to read the current `TASK-XXXX` from the central task list.
3. The AI will automatically load the correct rule modules for that repository.

### When making changes that affect other ends
- The AI will remind you (because of the Multi-Repo rules) to consider impact on Backend / NodeAgent / App / Admin.
- You should open the affected repository in another window if needed and coordinate the changes.

### For CI/CD changes
- Always open `livemask-ci-cd` in its own window.
- The AI will focus on reusable workflows and cross-repo impact.

## Quick Commands

```bash
# Initialize submodule in any repo
git submodule add https://github.com/MyAiDevs/livemask-docs.git docs
git submodule update --init --recursive

# Sync latest AI rules
bash scripts/sync-ai-rules.sh
```

## Summary
- One window = One repository
- Central docs provide shared truth
- AI rules enforce cross-repo awareness
- All changes must be linked to TASK-XXXX

This setup allows safe, parallel, multi-end development with strong traceability.
