# 06 - Client App Specific Rules

Client work must protect user trust, connection stability, and privacy.

- App must keep a last-known-good remote config and continue safely when Backend is unavailable.
- Do not expose browsing history, visited domains, destination IP history, or traffic content in UI or logs.
- Connection, onboarding, subscription, and degraded states must have explicit empty/error/loading behavior.
- API contract changes must be checked against Backend and NodeAgent before claiming completion.
- Any NetworkExtension, VPN profile, certificate pinning, or device trust behavior must include rollback notes.
- Completion reports must state Backend, NodeAgent, and CI/CD impact.

