# LiveMask Docs

Central documentation repository for the LiveMask stealth VPN project.

This is the **Single Source of Truth** for:
- System architecture & design
- AI development rules & workflow
- Multi-repository development setup
- Task tracking & milestones
- All operational, commercial, and technical specifications

## Repository Structure

```
livemask-docs/
├── README.md
├── ai-rules/
│   ├── v3.7/
│   │   ├── 00-Core-Principles.md
│   │   ├── ...
│   │   └── 13-Multi-Repo-Development.md
│   └── ...
├── docs/
│   ├── LiveMask_系统设计文档_v3.6.md
│   ├── LiveMask_开发任务清单与里程碑_v3.6.md
│   ├── LiveMask_运营手册_v3.6.md
│   └── ...
├── templates/
│   └── repositories/
└── .cursorrules
└── .github/
    └── copilot-instructions.md
```

## Quick Start for Developers

1. Clone this repo as submodule in your development repositories:
   ```bash
   git submodule add https://github.com/sammytan/livemask-docs.git docs
   ```

2. Copy the appropriate `.cursorrules` and `.github/copilot-instructions.md` from `templates/repositories/` into your repo root.

3. Run the sync script to keep AI rules up to date.

## AI Development Rules (v3.7 Final)

All AI-assisted development **must** follow the rules in `ai-rules/v3.7/`.

Start every new conversation by loading:
- `ai-rules/v3.7/00-Core-Principles.md`
- Current TASK-XXXX from the task list

## Multi-Repository Development

See `docs/LiveMask_Multi-Repo-AI-Development-Setup_v3.7.md` for the complete guide on how different ends (App, Backend, NodeAgent, Admin, Website) work together with AI editors.

## License
Internal project - All rights reserved.