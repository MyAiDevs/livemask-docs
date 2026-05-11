# 04 - Multi-Repository Development Rules

When working across repositories:

1. Always check the latest code in other related repos via the submodule `docs/`.
2. After changing shared logic (API contract, config structure, etc.), you **must** update the corresponding documentation in livemask-docs.
3. Use TASK-XXXX to coordinate work between App, Backend, NodeAgent, and Admin teams.
4. AI must proactively suggest checking the other end's implementation for compatibility.