# 01 - Architecture Guard

Before implementing any feature, answer these questions:

1. Which layer does this change belong to? (App / Backend / NodeAgent / Database)
2. Does it break any existing closed loop?
3. Can I reuse existing modules (ConfigManager, RiskEngine, AlertOrchestrator, etc.)?
4. Is there a Feature Flag or config-driven way instead of hardcoding?

If any answer is unclear, stop and ask the user for clarification.