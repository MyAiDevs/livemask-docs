# App VPN Native Runtime Contract

> This contract prevents a common implementation mistake: Flutter can provide
> the cross-platform product UI, but Flutter/Dart alone must not be treated as
> the system VPN runtime.

## 1. Hard Rule

`livemask-app` uses Flutter for UI, state, API integration, local cache, account
flows, subscriptions, diagnostics, and cross-platform presentation.

Actual VPN connection control must be implemented through platform-native
runtime layers:

```text
Flutter UI
  -> MethodChannel / platform plugin boundary
    -> Android VpnService
    -> iOS PacketTunnelProvider / NetworkExtension
    -> macOS NetworkExtension or privileged helper
    -> Windows local service / driver-backed tunnel runtime
    -> Linux daemon / NetworkManager or system service integration
  -> Backend API for auth, config, entitlement, node list, diagnostics
```

Flutter Web must never expose or simulate system VPN connect/disconnect.

## 2. Platform Ownership

| Platform | VPN runtime owner | Required system capability |
| --- | --- | --- |
| Android | Kotlin/Java native module | `VpnService`, user consent, foreground service |
| iOS | Swift native extension | NetworkExtension entitlement, `PacketTunnelProvider`, App Group |
| macOS | Swift native layer | NetworkExtension entitlement or approved privileged helper |
| Windows | Native desktop layer | local service, tunnel engine process, installer permissions |
| Linux | Native desktop layer | daemon/service integration, TUN permissions, distro-specific fallback |
| Web | Not supported | no VPN runtime capability |

## 3. Flutter Boundary

Flutter may call native VPN runtime code only through a typed boundary:

- MethodChannel or a dedicated Flutter plugin package
- request VPN permission / profile installation
- connect
- disconnect
- switch node
- read connection state
- read last error
- collect privacy-safe diagnostics

Flutter must not:

- shell out directly from Dart for mobile VPN control
- fake connected state without native confirmation
- store raw node private secrets in plain text
- expose visited domains, destination IP history, or traffic content
- implement platform entitlement / permission flows only as UI mockups and call
  the task complete

## 4. Minimum Native Runtime API

Each platform implementation should expose the same semantic operations to
Flutter:

```text
vpn.prepare() -> permission/profile status
vpn.connect(node_id, config_version, config_hash) -> connection attempt id
vpn.disconnect(reason)
vpn.status() -> disconnected | preparing | connecting | connected | degraded | failed
vpn.switchNode(node_id)
vpn.diagnostics() -> privacy-safe metadata only
```

The native layer must return structured errors with stable codes so App UI,
Backend diagnostics, and QA smoke cases can share the same state model.

## 5. Validation Requirements

Any TASK that claims VPN connection runtime completion must include:

- platform tested: Android / iOS / macOS / Windows / Linux
- native permission flow result
- connect/disconnect evidence from the native runtime, not only Flutter UI
- config hash/version used for the connection
- failure path tested: permission denied, invalid config, tunnel start failed
- privacy check: no browsing history or traffic content logged
- rollback: how to disable the native runtime path and keep account/config UI
  available

## 6. AI Editor Constraint

If an AI editor is working in `livemask-app`, it may implement Flutter UI,
state, API clients, secure storage, and MethodChannel interface definitions.

It must not claim real VPN support until the corresponding platform-native
module is implemented and verified. If the native module is missing, the correct
completion status is:

```text
Flutter UI/interface ready; native VPN runtime remains blocked for <platform>.
```

