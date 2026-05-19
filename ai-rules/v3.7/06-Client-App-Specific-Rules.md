# 06 - Client App Specific Rules

Client work must protect user trust, connection stability, and privacy.

- App must keep a last-known-good remote config and continue safely when Backend is unavailable.
- App runtime performance/resource tuning must follow
  `docs/contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md`; do not
  hardcode memory, reconnect, health-check, circuit breaker, cache, or local
  queue limits when a governed config exists.
- Do not expose browsing history, visited domains, destination IP history, or traffic content in UI or logs.
- Connection, onboarding, subscription, and degraded states must have explicit empty/error/loading behavior.
- API contract changes must be checked against Backend and NodeAgent before claiming completion.
- Flutter/Dart must not be claimed as the system VPN runtime. Real VPN connect,
  disconnect, node switching, tunnel state, and permission/profile flows require
  platform-native implementation through MethodChannel or a Flutter plugin.
- Required native runtime owners:
  - Android: `VpnService`
  - iOS: NetworkExtension / PacketTunnelProvider
  - macOS: NetworkExtension or approved privileged helper
  - Windows/Linux: local service / daemon / TUN integration
  - Web: no system VPN runtime support
- If native VPN runtime is missing, completion reports must say: "Flutter
  UI/interface ready; native VPN runtime remains blocked for <platform>."
- Any NetworkExtension, VPN profile, certificate pinning, or device trust behavior must include rollback notes.
- Completion reports must state Backend, NodeAgent, and CI/CD impact.
