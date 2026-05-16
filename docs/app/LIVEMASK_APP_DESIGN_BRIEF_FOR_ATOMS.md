# LiveMask App Design Brief for Atoms

> This document is a design prompt and product brief for generating LiveMask
> client prototypes in Atoms. It covers mobile clients and desktop clients
> including macOS, Windows, and Linux. It focuses on product experience, visual
> direction, screen structure, interaction states, and development handoff
> requirements.

## 1. Design Goal

Design polished cross-platform VPN clients named **LiveMask**.

Primary targets:

| Platform | Form factor | Design output |
| --- | --- | --- |
| iOS | Mobile | MVP mobile client |
| Android | Mobile | MVP mobile client |
| macOS | Desktop | Windowed app + menu bar status |
| Windows | Desktop | Windowed app + system tray status |
| Linux | Desktop | Windowed app + tray/status indicator where supported |

LiveMask should feel:

- secure but not intimidating
- premium but not decorative
- fast and operational
- calm during failures
- suitable for repeated daily use

The first design target is the **MVP client app**:

```text
Onboarding
-> Login
-> Home / Connect
-> Node selection
-> Connection status
-> Subscription / entitlement
-> Diagnostics / feedback
-> Profile / settings
```

Important implementation boundary:

- Flutter owns cross-platform UI, state, API calls, local cache, and diagnostics.
- Real VPN connection control is not pure Dart. It must be backed by native
  platform runtime code through MethodChannel or a dedicated Flutter plugin.
- Android requires native `VpnService`.
- iOS requires NetworkExtension / PacketTunnelProvider entitlement and native
  extension code.
- macOS, Windows, and Linux require their own native service / extension /
  daemon integration.
- Flutter Web must not show fake VPN connect/disconnect behavior.

Designs may show VPN connection UI, but handoff notes must label it as
`requires native VPN runtime` unless the platform-native implementation has
already been delivered and verified.

This design should support future modules such as points economy, ambassador
revenue, C2C trading, and multi-payment, but those modules must not dominate the
MVP navigation.

## 2. Product Positioning

LiveMask is a privacy and secure network access app for users who want stable,
low-friction VPN connectivity across regions.

The product should communicate:

| Value | UX implication |
| --- | --- |
| Privacy | No traffic content shown, no scary surveillance visuals |
| Trust | Clear state, transparent errors, visible security posture |
| Speed | Connection status must be glanceable in one second |
| Control | Users can switch nodes, see latency, retry, report issues |
| Recovery | Failed connections provide clear next actions |

Avoid a hacker / cyberpunk / neon-dark stereotype. LiveMask should feel like a
serious modern network utility with a premium consumer app finish.

## 3. Target Users

| User type | Need | Design response |
| --- | --- | --- |
| New user | Understand value quickly | Short onboarding, no technical overload |
| Daily user | Connect fast | One primary connect action, last node remembered |
| Power user | Choose region/node | Searchable node list, latency and load visible |
| Paying user | Know entitlement | Clear plan status, renewal, data/usage summaries |
| Troubled user | Fix failure | Error explanation, retry, switch node, send feedback |

## 4. Design Principles

1. **Connection first**  
   The home screen must make the current connection state obvious.

2. **One primary action per screen**  
   Use one dominant action such as Connect, Retry, Upgrade, or Send Feedback.

3. **Status is visual and textual**  
   Never rely on color alone. Always pair color with labels such as Connected,
   Connecting, Failed, Degraded.

4. **Errors are recoverable**  
   Every error state must include a user action: retry, switch node, refresh
   config, contact support, or send diagnostic report.

5. **No fake technical detail**  
   Do not show meaningless charts or random packet animations. Show latency,
   region, protocol, plan, status, and real user-facing diagnostics.

6. **Privacy by design**  
   Do not show visited domains, destination IPs, browsing categories, or traffic
   content.

## 5. Visual Direction

### 5.1 Overall Style

Use a clean, modern cross-platform client style:

- light-first interface with optional dark mode concept
- high contrast text
- soft but not overly rounded components
- 8px card radius maximum unless required by platform convention
- clear hierarchy for primary status, secondary metrics, and actions
- restrained animation only for connection transitions
- mobile screens should feel native to phones
- desktop screens should feel like real desktop utilities, not stretched phone
  screens

The design should feel closer to:

```text
premium network utility + consumer fintech clarity
```

and not:

```text
gaming VPN, hacker dashboard, crypto trading app, generic SaaS landing page
```

### 5.2 Color System

Recommended palette:

| Token | Purpose | Suggested color |
| --- | --- | --- |
| `primary` | Connect, selected state | Deep teal / cyan-green |
| `success` | Connected | Green |
| `warning` | Degraded, slow node | Amber |
| `danger` | Failed, blocked | Red |
| `surface` | Main background | Off-white / near-black in dark mode |
| `ink` | Main text | Near-black / near-white |
| `muted` | Secondary text | Neutral gray |

Avoid a UI dominated by purple gradients, black neon, or blue-only palettes.

### 5.3 Typography

Use platform-native readable typography:

- large status text on Home
- compact technical details
- no negative letter spacing
- no viewport-based font scaling
- numbers such as latency and duration should align cleanly

### 5.4 Icon Direction

Use familiar icons:

| Function | Icon idea |
| --- | --- |
| Connect | power |
| Secure | shield |
| Region | globe |
| Node | server |
| Speed | gauge |
| Subscription | badge / credit card |
| Settings | gear |
| Feedback | message circle |
| Warning | triangle alert |

Do not use skulls, masks, hacker symbols, or aggressive threat imagery.

## 6. App Navigation

### 6.1 Mobile Navigation

Use bottom navigation with 4 tabs:

| Tab | Purpose |
| --- | --- |
| Home | Connect, current status, selected node |
| Nodes | Region and node selection |
| Plan | Subscription, entitlement, usage summary |
| Profile | Settings, security, diagnostics, feedback |

Optional MVP shortcut:

- Diagnostics can live inside Profile first.
- Payments can live inside Plan first.
- Points / rewards should be hidden or shown as a small future-ready section,
  not a primary tab.

### 6.2 Desktop Navigation

Use a left sidebar or compact split-view navigation instead of mobile bottom
tabs.

Recommended desktop sections:

| Section | Purpose |
| --- | --- |
| Connect | Primary VPN connection state and selected node |
| Nodes | Region, node, latency, protocol, favorites |
| Plan | Subscription, entitlement, payment status |
| Diagnostics | Feedback, reports, error history |
| Settings | Account, security, app preferences, advanced network settings |

Desktop status entry:

| Platform | Required status surface |
| --- | --- |
| macOS | Menu bar item with connected/disconnected/degraded status |
| Windows | System tray item with connected/disconnected/degraded status |
| Linux | Tray/status indicator where supported, with in-app fallback |

Desktop tray/menu actions:

```text
Connect / Disconnect
Current node
Switch recent node
Open LiveMask
Send diagnostic report
Quit
```

Rules:

- Tray/menu actions must never hide dangerous or unclear state.
- If connection failed, tray/menu should offer Open LiveMask and Retry, not a
  silent reconnect loop.
- Full node selection stays in the main window, not only in the tray/menu.

## 7. Required Screens

### 7.1 Splash / Launch

Purpose:

- show LiveMask brand
- check local session
- check cached config
- route to onboarding, login, or home

States:

| State | UI |
| --- | --- |
| Loading | Brand mark + subtle progress |
| Config check failed | Continue with cached config / Retry |
| Security mode | Explain limited mode without panic |

### 7.2 Onboarding

Use 3 concise slides:

1. **Private access, made simple**  
   Explain secure connection without technical jargon.

2. **Fast nodes across regions**  
   Show region/node concept, latency, and smart recommendation.

3. **Clear recovery when networks fail**  
   Show retry, switch node, report issue.

Primary CTA:

```text
Get Started
```

Secondary:

```text
I already have an account
```

Avoid long privacy/legal copy here. Put detailed policy in Profile / Settings.

### 7.3 Login / Sign Up

Required:

- email login
- password field
- forgot password
- sign up
- optional OAuth placeholder if needed later
- loading state
- inline validation
- backend error mapping

Error examples:

| Backend condition | UX copy |
| --- | --- |
| invalid credentials | Email or password is incorrect. |
| account locked | Account temporarily locked. Try again later. |
| network timeout | Network timed out. Check connection or retry. |
| server unavailable | Service is temporarily unavailable. |

### 7.4 Home / Connect

This is the most important screen.

Above the fold:

- connection status
- selected region/node
- primary connect button
- latency
- protocol
- plan badge

Primary states:

| State | Visual behavior | Primary action |
| --- | --- | --- |
| Disconnected | Calm neutral state | Connect |
| Connecting | Progress ring / step text | Cancel |
| Connected | Success state, duration visible | Disconnect |
| Degraded | Warning state, explain issue | Switch Node |
| Failed | Error state, show reason | Retry |
| Config updating | Subtle loading | Wait / Retry |

Recommended Home layout:

```text
Top bar:
  LiveMask logo, plan badge, settings shortcut

Status area:
  Shield / power visual
  Connected / Disconnected / Connecting
  Selected region and node

Primary action:
  Large connect button

Metrics:
  Latency
  Protocol
  Session duration
  Config version

Recovery / feedback:
  Visible only when degraded or failed
```

### 7.5 Nodes

Purpose:

- select region
- select node
- show smart recommendation

Required elements:

- search
- region filter
- recommended node
- latency
- load indicator
- status: healthy, busy, degraded, quarantine hidden
- favorite node

Node card fields:

```text
Region name
City
Latency
Load
Protocol
Status
```

Rules:

- Do not show `quarantine` nodes to paid users.
- Free users may see limited free nodes.
- If node list fails, show cached nodes with stale indicator.

### 7.6 Plan / Subscription

Purpose:

- display current plan
- subscription status
- renewal date
- upgrade entry
- payment history entry

Required states:

| State | UI |
| --- | --- |
| Free | Free plan limits, upgrade CTA |
| Active paid | Plan badge, renewal date, benefits |
| Expiring soon | Renewal warning |
| Payment pending | Waiting state |
| Payment failed | Retry payment / choose another method |
| Suspended | Explain access limitation |

Do not overemphasize future points/C2C modules in MVP. Add a small placeholder:

```text
Rewards are coming soon
```

only if needed.

### 7.7 Diagnostics / Feedback

Purpose:

- give users a way to report connection problems
- collect safe metadata
- avoid collecting browsing content

Required fields:

- issue type
- current node
- protocol
- network type
- app version
- config version
- error code
- optional user description

CTA:

```text
Send Diagnostic Report
```

Privacy note:

```text
Diagnostic reports never include browsing history or traffic content.
```

### 7.8 Profile / Settings

Required sections:

- Account
- Security
- App settings
- Diagnostics
- Legal
- Logout

Security settings:

- certificate pinning status
- device trust status
- local data protection status
- clear cached config

App settings:

- language
- theme
- auto connect
- threat warning toggle
- diagnostic sharing toggle

### 7.9 Desktop Main Window

Purpose:

- provide the same core LiveMask client functions in a desktop-appropriate
  layout

Required layout:

```text
Sidebar:
  Connect
  Nodes
  Plan
  Diagnostics
  Settings

Main area:
  Current connection state
  Selected node
  Primary action
  Metrics
  Recovery actions
```

Window requirements:

- minimum usable width: 960px
- minimum usable height: 640px
- must remain usable at 1280x720
- support compact window mode around 420px width for quick connect
- do not use mobile bottom tabs on desktop
- do not stretch mobile cards into empty wide panels

Desktop-specific states:

| State | UI requirement |
| --- | --- |
| System permission needed | Explain VPN/network permission and next action |
| Helper/daemon unavailable | Explain service repair/restart action |
| Auto-start disabled | Show optional enable action |
| Update available | Show release note and update action |
| Tray unavailable | Show in-app status fallback |

### 7.10 Desktop Platform Screens

#### macOS

Required:

- menu bar status item
- Network Extension permission explanation
- keychain credential storage explanation
- launch at login setting
- quit vs disconnect copy

Design notes:

- Follow macOS window and sidebar conventions.
- Use native-feeling toolbar density.
- Do not make the window look like a stretched phone screen.

#### Windows

Required:

- system tray status item
- VPN adapter / service permission explanation
- Windows notification state
- launch on startup setting
- repair service action when helper is unavailable

Design notes:

- Keep controls readable at common laptop resolutions.
- Avoid tiny tray-only controls for critical recovery.

#### Linux

Required:

- tray/status indicator where desktop environment supports it
- fallback in-app connection status when tray is unavailable
- permission/service explanation for NetworkManager/systemd-based setups where
  applicable
- log export entry for diagnostics

Design notes:

- Linux UI must avoid assumptions about one desktop shell.
- Do not depend on tray availability for primary actions.

## 8. Critical Interaction Flows

### 8.1 First Successful Connection

```text
Open app
-> onboarding
-> login
-> pull config
-> select recommended node
-> connect
-> connected state
-> show duration and latency
```

Design requirement:

- Make the first connection feel fast and confidence-building.
- Do not show too many network details before success.

### 8.2 Connection Failure

```text
Connect
-> connecting
-> failed
-> show reason
-> offer retry
-> offer switch node
-> offer diagnostic report
```

Design requirement:

- No dead ends.
- Show user-friendly reason and technical error code separately.

### 8.3 Config Update Failure

```text
App opens
-> config update starts
-> hash mismatch / timeout
-> rollback to cached config
-> show warning
-> allow retry
```

Design requirement:

- User should understand the app can still work with cached config.

### 8.4 Subscription Upgrade

```text
Plan tab
-> select plan
-> payment method
-> pending
-> active
-> plan badge updated on Home
```

Design requirement:

- Show entitlement change after payment.
- Payment pending should not look like failure.

### 8.5 Desktop Quick Connect

```text
Open menu bar / tray
-> see current state
-> connect or disconnect
-> notification confirms result
-> main window available for details
```

Design requirement:

- Quick connect should be fast, but failure recovery should open the main app.
- Menu/tray copy must distinguish Disconnect from Quit.

### 8.6 Desktop Permission Recovery

```text
Connect
-> permission/helper missing
-> explain required system action
-> open system settings or repair flow
-> retry connection
```

Design requirement:

- Be explicit about platform permission without alarming the user.
- Do not bury repair actions in advanced settings only.

## 9. Screen Copy Guidelines

Tone:

- calm
- concise
- trustworthy
- non-technical by default

Examples:

| Context | Copy |
| --- | --- |
| Connected | Your connection is protected. |
| Connecting | Finding the best secure route... |
| Failed | We could not connect to this node. |
| Degraded | This node is slower than usual. |
| Cached config | Using the last verified configuration. |
| Diagnostic privacy | Reports never include browsing history. |

Avoid:

- military/security panic language
- exaggerated claims like 100% anonymous
- technical protocol names as primary user-facing copy

## 10. Atoms Prompt

Copy this prompt into Atoms as the main design generation request:

```text
Design polished cross-platform client app prototypes for "LiveMask", a premium privacy VPN and secure network access app. Include mobile screens and desktop screens for macOS, Windows, and Linux.

The app should feel secure, calm, fast, and trustworthy. Avoid hacker, cyberpunk, gaming VPN, crypto, or neon-dark aesthetics. Use a modern light-first UI with optional dark mode direction, strong typography, clear hierarchy, restrained motion, and familiar icons such as shield, power, globe, server, gauge, credit card, settings, and message.

Primary product goal:
Users should be able to open the client, understand connection status in one second, connect or retry quickly, switch nodes, understand their subscription entitlement, and send diagnostics when connection fails.

Required mobile bottom navigation:
1. Home
2. Nodes
3. Plan
4. Profile

Required desktop navigation:
1. Connect
2. Nodes
3. Plan
4. Diagnostics
5. Settings

Desktop requirements:
- macOS windowed app with menu bar status item.
- Windows windowed app with system tray status item.
- Linux windowed app with tray/status indicator where supported and an in-app fallback when unsupported.
- Desktop main window uses a sidebar or split-view layout, not mobile bottom tabs.
- Desktop quick actions: Connect / Disconnect, current node, recent node switch, Open LiveMask, Send diagnostic report, Quit.
- Show platform states: permission needed, helper/daemon unavailable, auto-start disabled, update available, tray unavailable.
- Distinguish Disconnect from Quit.
- Keep full node selection and recovery actions in the main window.

Required screens:
1. Splash / launch with config check
2. 3-step onboarding
3. Login / sign up
4. Home / Connect
5. Nodes / region selection
6. Plan / subscription
7. Diagnostics / feedback
8. Profile / settings
9. Desktop main window
10. macOS menu bar flow
11. Windows system tray flow
12. Linux tray/status fallback flow

Home screen requirements:
- LiveMask logo and plan badge
- Large connection status area
- Main connect button
- Selected region and node
- Latency, protocol, session duration, config version
- States: disconnected, connecting, connected, degraded, failed, config updating
- Failed state must show retry, switch node, and send diagnostic report

Nodes screen requirements:
- Search
- Region filters
- Recommended node
- Node cards with city, latency, load, protocol, status
- Favorite node option
- Hide quarantined nodes
- Show cached node list with stale indicator when refresh fails

Plan screen requirements:
- Current plan
- Renewal date
- Benefits
- Upgrade CTA
- Payment pending and payment failed states
- Small future-ready rewards placeholder only, not a main feature

Diagnostics screen requirements:
- Issue type
- Current node
- Protocol
- Network type
- App version
- Config version
- Error code
- Optional user description
- Privacy note: diagnostic reports never include browsing history or traffic content

Profile screen requirements:
- Account
- Security
- App settings
- Diagnostics
- Legal
- Logout
- Include certificate pinning status, device trust status, clear cached config, theme, language, auto-connect, threat warning toggle

Desktop screen requirements:
- Main window minimum target: usable at 960x640 and 1280x720.
- Compact desktop mode around 420px width for quick connect.
- Sidebar navigation.
- Connection status, selected node, primary action, latency, protocol, session duration, config version.
- Permission/help panel for macOS Network Extension, Windows service/adapter, and Linux NetworkManager/systemd-style setups.
- Menu bar/tray status with connected, disconnected, degraded, failed states.

Visual style:
- Premium network utility + consumer fintech clarity
- Primary color: deep teal / cyan-green
- Success green, warning amber, danger red, neutral surfaces
- High contrast text
- Maximum 8px card radius unless platform convention requires otherwise
- No meaningless charts, packet animations, skulls, masks, or hacker symbols
- Do not show visited domains, destination IPs, browsing categories, or traffic content

Output should include a consistent design system, reusable components, high-fidelity mobile screens, and high-fidelity desktop screens for macOS, Windows, and Linux ready for developer handoff.
```

## 11. Follow-Up Atoms Prompts

Use these after the first generation if the design needs refinement.

### 11.1 Improve Home Screen

```text
Refine the Home / Connect screen. Make connection state readable in one second.
Show six explicit visual states: disconnected, connecting, connected, degraded,
failed, and config updating. Keep one dominant primary action per state. Add
latency, selected node, protocol, session duration, and config version without
making the screen feel technical or cluttered.
```

### 11.2 Improve Failure UX

```text
Improve all connection failure states. Every failure must include a plain-language
reason, technical error code, Retry, Switch Node, and Send Diagnostic Report.
The tone should be calm and helpful, not alarming.
```

### 11.3 Improve Node Selection

```text
Refine the Nodes screen for fast scanning. Add region filters, search, favorite
nodes, recommended node, latency, load, protocol, and node status. Make healthy,
busy, degraded, and cached-stale states visually distinct.
```

### 11.4 Improve Premium Feel

```text
Make the UI feel more premium and trustworthy without adding decorative clutter.
Use better spacing, typography, icon consistency, and subtle state transitions.
Avoid dark neon, purple gradients, and generic SaaS cards.
```

## 12. Developer Handoff Requirements

The design must produce components that map cleanly to implementation:

| Component | Required states |
| --- | --- |
| `ConnectionStatusPanel` | disconnected, connecting, connected, degraded, failed, configUpdating |
| `ConnectButton` | connect, cancel, disconnect, retry |
| `NodeCard` | healthy, busy, degraded, selected, favorite, cached |
| `PlanBadge` | free, active, expiring, suspended |
| `DiagnosticForm` | empty, submitting, submitted, failed |
| `ErrorBanner` | info, warning, danger |
| `SettingRow` | default, toggle, destructive |
| `DesktopSidebar` | default, selected, collapsed |
| `TrayStatusMenu` | disconnected, connecting, connected, degraded, failed |
| `PermissionPanel` | macOS, Windows, Linux, resolved, failed |
| `DesktopCompactConnect` | disconnected, connecting, connected, failed |

Each component should have:

- normal state
- loading state
- disabled state
- error state where applicable
- mobile-safe layout
- desktop-safe layout where applicable

Desktop handoff must include:

- default window layout
- compact window layout
- tray/menu bar states
- permission recovery states
- helper/service unavailable state
- update available state
- platform-specific copy for macOS, Windows, and Linux

## 13. Acceptance Checklist

- [ ] Home screen makes connection state obvious within one second.
- [ ] Connect / retry / disconnect actions are unambiguous.
- [ ] Failure states have recovery actions.
- [ ] Node selection supports search, filter, latency, load, and status.
- [ ] Subscription status is visible but not distracting.
- [ ] Diagnostics explicitly states privacy protection.
- [ ] No user browsing history, domains, destination IPs, or traffic content are shown.
- [ ] Visual direction avoids hacker/cyberpunk/neon stereotypes.
- [ ] Bottom navigation supports MVP without overexposing future modules.
- [ ] Desktop sidebar navigation supports the same MVP sections.
- [ ] macOS menu bar, Windows tray, and Linux tray/fallback states are designed.
- [ ] Desktop permission/helper recovery states are designed.
- [ ] Desktop design does not look like a stretched mobile screen.
- [ ] Components are reusable for Flutter implementation.
- [ ] Design can support future dark mode.

## 14. Links to Development Docs

- `docs/app/README.md`
- `docs/app/LiveMask_客户端开发文档_v3.6.md`
- `docs/app/LiveMask_App客户端开发与加密安全规范_v3.6.md`
- `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`
- `docs/contracts/api/core-mvp.md`
- `docs/contracts/error-codes.md`
- `docs/contracts/state-machines.md`
