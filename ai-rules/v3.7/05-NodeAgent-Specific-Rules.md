# 05 - NodeAgent Specific Rules

NodeAgent work must preserve runtime safety and controllable rollback.

- Treat Backend config as the source of truth, but keep a local last-known-good config.
- Never apply a remote config without schema, version, and hash validation.
- NodeAgent must support degraded mode when Backend, Redis notification, or config fetch is unavailable.
- Runtime changes must define rollback behavior before implementation.
- Do not log user traffic content, visited domains, destination IP history, or secret material.
- Completion reports must state App and Backend compatibility impact.

