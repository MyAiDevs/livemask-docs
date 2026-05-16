// Mock data for the LiveMask Backend Admin Dashboard

export interface User {
  id: string;
  email: string;
  username: string;
  plan: "free" | "basic" | "premium" | "enterprise";
  status: "active" | "suspended" | "expired";
  createdAt: string;
  lastLogin: string;
}

export interface Node {
  id: string;
  name: string;
  region: string;
  location: string;
  status: "healthy" | "busy" | "degraded" | "offline" | "quarantine" | "stale_report";
  load: number;
  connections: number;
  maxConnections: number;
  latency: number;
  uptime: string;
  lastReport: string;
  configVersion: string;
  protocol: string;
  degradedReason?: string;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  username: string;
  amount: number;
  currency: string;
  chain: string;
  status: "waiting" | "confirming" | "finished" | "failed" | "expired" | "manual_review";
  provider: string;
  providerRef: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
  webhookHistory: { time: string; event: string; status: string }[];
}

export interface ConfigEntry {
  id: string;
  key: string;
  version: string;
  hash: string;
  publishedAt: string;
  publishedBy: string;
  status: "active" | "draft" | "archived" | "pending_approval";
  affectedVersions: string;
  validationResult?: "pass" | "fail" | "pending";
  approvalState?: "approved" | "rejected" | "pending" | "none";
  diff?: { added: string[]; removed: string[]; changed: string[] };
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  requestId: string;
  approvalId?: string;
  before?: string;
  after?: string;
}

export interface FeedbackReport {
  id: string;
  userId: string;
  username: string;
  category: "bug" | "feature" | "complaint" | "appeal";
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "dismissed";
  subject: string;
  description: string;
  createdAt: string;
  node?: string;
  protocol?: string;
  errorCode?: string;
  appVersion?: string;
  configVersion?: string;
  assignedOperator?: string;
}

export const mockUsers: User[] = [
  { id: "usr_001", email: "alice@example.com", username: "alice_m", plan: "premium", status: "active", createdAt: "2025-12-01", lastLogin: "2026-05-16" },
  { id: "usr_002", email: "bob@example.com", username: "bob_dev", plan: "basic", status: "active", createdAt: "2026-01-15", lastLogin: "2026-05-15" },
  { id: "usr_003", email: "carol@example.com", username: "carol_x", plan: "enterprise", status: "active", createdAt: "2025-10-20", lastLogin: "2026-05-16" },
  { id: "usr_004", email: "dave@example.com", username: "dave_net", plan: "free", status: "expired", createdAt: "2026-02-10", lastLogin: "2026-04-01" },
  { id: "usr_005", email: "eve@example.com", username: "eve_sec", plan: "premium", status: "active", createdAt: "2025-11-05", lastLogin: "2026-05-14" },
  { id: "usr_006", email: "frank@example.com", username: "frank_ops", plan: "basic", status: "suspended", createdAt: "2026-03-01", lastLogin: "2026-05-10" },
  { id: "usr_007", email: "grace@example.com", username: "grace_ui", plan: "premium", status: "active", createdAt: "2025-09-15", lastLogin: "2026-05-16" },
  { id: "usr_008", email: "henry@example.com", username: "henry_k", plan: "free", status: "active", createdAt: "2026-04-20", lastLogin: "2026-05-13" },
];

export const mockNodes: Node[] = [
  { id: "node_us_east_01", name: "US-East-1", region: "North America", location: "Virginia, US", status: "healthy", load: 42, connections: 1250, maxConnections: 3000, latency: 12, uptime: "99.98%", lastReport: "2026-05-16T10:30:00Z", configVersion: "v2.4.1", protocol: "WireGuard" },
  { id: "node_us_west_01", name: "US-West-1", region: "North America", location: "Oregon, US", status: "healthy", load: 38, connections: 980, maxConnections: 3000, latency: 18, uptime: "99.95%", lastReport: "2026-05-16T10:29:00Z", configVersion: "v2.4.1", protocol: "WireGuard" },
  { id: "node_eu_west_01", name: "EU-West-1", region: "Europe", location: "Frankfurt, DE", status: "busy", load: 85, connections: 2550, maxConnections: 3000, latency: 22, uptime: "99.92%", lastReport: "2026-05-16T10:30:00Z", configVersion: "v2.4.1", protocol: "WireGuard" },
  { id: "node_ap_east_01", name: "AP-East-1", region: "Asia Pacific", location: "Tokyo, JP", status: "degraded", load: 78, connections: 2340, maxConnections: 3000, latency: 145, uptime: "98.50%", lastReport: "2026-05-16T10:28:00Z", configVersion: "v2.4.0", protocol: "OpenVPN", degradedReason: "High latency detected, possible upstream congestion" },
  { id: "node_ap_south_01", name: "AP-South-1", region: "Asia Pacific", location: "Singapore, SG", status: "healthy", load: 31, connections: 930, maxConnections: 3000, latency: 28, uptime: "99.97%", lastReport: "2026-05-16T10:30:00Z", configVersion: "v2.4.1", protocol: "WireGuard" },
  { id: "node_sa_east_01", name: "SA-East-1", region: "South America", location: "São Paulo, BR", status: "offline", load: 0, connections: 0, maxConnections: 3000, latency: 0, uptime: "95.20%", lastReport: "2026-05-16T08:15:00Z", configVersion: "v2.4.0", protocol: "WireGuard", degradedReason: "Node unreachable since 08:15 UTC" },
  { id: "node_eu_north_01", name: "EU-North-1", region: "Europe", location: "Stockholm, SE", status: "healthy", load: 25, connections: 750, maxConnections: 3000, latency: 15, uptime: "99.99%", lastReport: "2026-05-16T10:30:00Z", configVersion: "v2.4.1", protocol: "WireGuard" },
  { id: "node_af_south_01", name: "AF-South-1", region: "Africa", location: "Johannesburg, ZA", status: "quarantine", load: 5, connections: 50, maxConnections: 3000, latency: 200, uptime: "92.10%", lastReport: "2026-05-16T09:00:00Z", configVersion: "v2.3.9", protocol: "OpenVPN", degradedReason: "Quarantined: suspected config mismatch" },
  { id: "node_me_west_01", name: "ME-West-1", region: "Middle East", location: "Dubai, AE", status: "stale_report", load: 45, connections: 1350, maxConnections: 3000, latency: 55, uptime: "97.80%", lastReport: "2026-05-16T06:00:00Z", configVersion: "v2.4.0", protocol: "WireGuard", degradedReason: "No report received for >4 hours" },
];

export const mockPayments: PaymentOrder[] = [
  { id: "pay_001", userId: "usr_001", username: "alice_m", amount: 9.99, currency: "USDT", chain: "TRC-20", status: "finished", provider: "NOWPayments", providerRef: "NP-2026051501", plan: "Premium Monthly", createdAt: "2026-05-15T14:00:00Z", updatedAt: "2026-05-15T14:05:00Z", webhookHistory: [{ time: "2026-05-15T14:01:00Z", event: "payment_created", status: "waiting" }, { time: "2026-05-15T14:03:00Z", event: "payment_confirming", status: "confirming" }, { time: "2026-05-15T14:05:00Z", event: "payment_finished", status: "finished" }] },
  { id: "pay_002", userId: "usr_003", username: "carol_x", amount: 49.99, currency: "USDT", chain: "ERC-20", status: "finished", provider: "NOWPayments", providerRef: "NP-2026051402", plan: "Enterprise Monthly", createdAt: "2026-05-14T09:30:00Z", updatedAt: "2026-05-14T09:38:00Z", webhookHistory: [{ time: "2026-05-14T09:31:00Z", event: "payment_created", status: "waiting" }, { time: "2026-05-14T09:35:00Z", event: "payment_confirming", status: "confirming" }, { time: "2026-05-14T09:38:00Z", event: "payment_finished", status: "finished" }] },
  { id: "pay_003", userId: "usr_005", username: "eve_sec", amount: 9.99, currency: "USDT", chain: "TRC-20", status: "confirming", provider: "NOWPayments", providerRef: "NP-2026051603", plan: "Premium Monthly", createdAt: "2026-05-16T08:00:00Z", updatedAt: "2026-05-16T08:02:00Z", webhookHistory: [{ time: "2026-05-16T08:01:00Z", event: "payment_created", status: "waiting" }, { time: "2026-05-16T08:02:00Z", event: "payment_confirming", status: "confirming" }] },
  { id: "pay_004", userId: "usr_002", username: "bob_dev", amount: 4.99, currency: "USDT", chain: "TRC-20", status: "waiting", provider: "NOWPayments", providerRef: "NP-2026051604", plan: "Basic Monthly", createdAt: "2026-05-16T09:45:00Z", updatedAt: "2026-05-16T09:45:00Z", webhookHistory: [{ time: "2026-05-16T09:45:00Z", event: "payment_created", status: "waiting" }] },
  { id: "pay_005", userId: "usr_007", username: "grace_ui", amount: 9.99, currency: "BTC", chain: "Bitcoin", status: "failed", provider: "NOWPayments", providerRef: "NP-2026051305", plan: "Premium Monthly", createdAt: "2026-05-13T16:20:00Z", updatedAt: "2026-05-13T16:35:00Z", webhookHistory: [{ time: "2026-05-13T16:21:00Z", event: "payment_created", status: "waiting" }, { time: "2026-05-13T16:30:00Z", event: "payment_confirming", status: "confirming" }, { time: "2026-05-13T16:35:00Z", event: "payment_failed", status: "failed" }] },
  { id: "pay_006", userId: "usr_004", username: "dave_net", amount: 4.99, currency: "USDT", chain: "TRC-20", status: "expired", provider: "NOWPayments", providerRef: "NP-2026051006", plan: "Basic Monthly", createdAt: "2026-05-10T11:00:00Z", updatedAt: "2026-05-10T12:00:00Z", webhookHistory: [{ time: "2026-05-10T11:01:00Z", event: "payment_created", status: "waiting" }, { time: "2026-05-10T12:00:00Z", event: "payment_expired", status: "expired" }] },
  { id: "pay_007", userId: "usr_008", username: "henry_k", amount: 9.99, currency: "ETH", chain: "ERC-20", status: "manual_review", provider: "NOWPayments", providerRef: "NP-2026051207", plan: "Premium Monthly", createdAt: "2026-05-12T07:15:00Z", updatedAt: "2026-05-12T07:22:00Z", webhookHistory: [{ time: "2026-05-12T07:16:00Z", event: "payment_created", status: "waiting" }, { time: "2026-05-12T07:20:00Z", event: "payment_confirming", status: "confirming" }, { time: "2026-05-12T07:22:00Z", event: "underpaid_detected", status: "manual_review" }] },
];

export const mockConfigs: ConfigEntry[] = [
  { id: "cfg_001", key: "client_config", version: "v2.4.1", hash: "a3f8c2d1", publishedAt: "2026-05-15T12:00:00Z", publishedBy: "admin@livemask.io", status: "active", affectedVersions: "App ≥ 2.4.0", validationResult: "pass", approvalState: "approved", diff: { added: ["reconnect_max_retries: 5"], removed: ["reconnect_max_retries: 3"], changed: ["fallback_nodes updated"] } },
  { id: "cfg_002", key: "agent_config", version: "v1.8.0", hash: "b7e4f9a2", publishedAt: "2026-05-14T09:00:00Z", publishedBy: "admin@livemask.io", status: "active", affectedVersions: "NodeAgent ≥ 1.7.0", validationResult: "pass", approvalState: "approved", diff: { added: ["auto_scale_enabled: true"], removed: [], changed: ["max_connections_soft_limit: 2000 → 2500"] } },
  { id: "cfg_003", key: "client_config", version: "v2.4.0", hash: "c1d5e8f3", publishedAt: "2026-05-10T15:30:00Z", publishedBy: "ops@livemask.io", status: "archived", affectedVersions: "App ≥ 2.3.0", validationResult: "pass", approvalState: "approved", diff: { added: [], removed: [], changed: ["recommended_protocol: openvpn → wireguard"] } },
  { id: "cfg_004", key: "rate_limit_config", version: "v1.2.0", hash: "d9a3b6c4", publishedAt: "2026-05-13T11:00:00Z", publishedBy: "admin@livemask.io", status: "active", affectedVersions: "All services", validationResult: "pass", approvalState: "approved", diff: { added: ["recommendation_rate_limit: 30/min"], removed: [], changed: [] } },
  { id: "cfg_005", key: "node_routing_config", version: "v3.1.0", hash: "e2f7a8b5", publishedAt: "2026-05-16T06:00:00Z", publishedBy: "ops@livemask.io", status: "draft", affectedVersions: "NodeAgent ≥ 1.8.0", validationResult: "pending", approvalState: "pending", diff: { added: ["geo_routing_enabled: true", "latency_weight: 0.7"], removed: [], changed: ["load_balance_algo: round_robin → weighted_latency"] } },
  { id: "cfg_006", key: "security_config", version: "v2.0.1", hash: "f1a2b3c4", publishedAt: "2026-05-16T09:00:00Z", publishedBy: "admin@livemask.io", status: "pending_approval", affectedVersions: "App ≥ 2.4.0, NodeAgent ≥ 1.8.0", validationResult: "pass", approvalState: "pending", diff: { added: ["cert_pin_rotation_days: 30"], removed: ["legacy_tls_fallback: true"], changed: ["min_tls_version: 1.2 → 1.3"] } },
];

export const mockAuditLogs: AuditLog[] = [
  { id: "aud_001", actor: "admin@livemask.io", action: "config.publish", target: "client_config v2.4.1", details: "Published new client config", timestamp: "2026-05-15T12:00:00Z", ipAddress: "10.0.1.5", requestId: "req_a1b2c3", approvalId: "apr_001", before: '{"reconnect_max_retries": 3}', after: '{"reconnect_max_retries": 5}' },
  { id: "aud_002", actor: "admin@livemask.io", action: "user.suspend", target: "usr_006 (frank_ops)", details: "Suspended for TOS violation", timestamp: "2026-05-14T16:30:00Z", ipAddress: "10.0.1.5", requestId: "req_d4e5f6", before: '{"status": "active"}', after: '{"status": "suspended"}' },
  { id: "aud_003", actor: "ops@livemask.io", action: "node.restart", target: "node_sa_east_01", details: "Manual restart due to connectivity issues", timestamp: "2026-05-16T08:20:00Z", ipAddress: "10.0.2.3", requestId: "req_g7h8i9", before: '{"status": "offline"}', after: '{"status": "restarting"}' },
  { id: "aud_004", actor: "system", action: "payment.webhook", target: "pay_001", details: "Payment confirmed via NOWPayments webhook", timestamp: "2026-05-15T14:05:00Z", ipAddress: "203.0.113.50", requestId: "req_j0k1l2" },
  { id: "aud_005", actor: "admin@livemask.io", action: "entitlement.upgrade", target: "usr_005 (eve_sec)", details: "Manual upgrade to premium", timestamp: "2026-05-13T10:00:00Z", ipAddress: "10.0.1.5", requestId: "req_m3n4o5", before: '{"plan": "basic"}', after: '{"plan": "premium"}' },
  { id: "aud_006", actor: "system", action: "node.degraded", target: "node_ap_east_01", details: "Auto-detected high latency, marked degraded", timestamp: "2026-05-16T09:00:00Z", ipAddress: "10.0.0.1", requestId: "req_p6q7r8", before: '{"status": "healthy", "latency": 28}', after: '{"status": "degraded", "latency": 145}' },
  { id: "aud_007", actor: "ops@livemask.io", action: "config.draft", target: "node_routing_config v3.1.0", details: "Draft created for new routing rules", timestamp: "2026-05-16T06:00:00Z", ipAddress: "10.0.2.3", requestId: "req_s9t0u1", approvalId: "apr_005" },
  { id: "aud_008", actor: "admin@livemask.io", action: "feedback.resolve", target: "fb_002", details: "Resolved user complaint about connection drops", timestamp: "2026-05-15T09:00:00Z", ipAddress: "10.0.1.5", requestId: "req_v2w3x4" },
  { id: "aud_009", actor: "admin@livemask.io", action: "node.quarantine", target: "node_af_south_01", details: "Quarantined due to config mismatch", timestamp: "2026-05-15T22:00:00Z", ipAddress: "10.0.1.5", requestId: "req_y5z6a7", before: '{"status": "degraded"}', after: '{"status": "quarantine"}' },
  { id: "aud_010", actor: "system", action: "config.approve", target: "security_config v2.0.1", details: "Auto-approved after validation pass", timestamp: "2026-05-16T09:05:00Z", ipAddress: "10.0.0.1", requestId: "req_b8c9d0", approvalId: "apr_006" },
];

export const mockFeedback: FeedbackReport[] = [
  { id: "fb_001", userId: "usr_002", username: "bob_dev", category: "bug", priority: "high", status: "open", subject: "Connection drops every 30 minutes", description: "VPN connection drops consistently after 30 minutes of use. Happens on both WiFi and cellular.", createdAt: "2026-05-16T07:00:00Z", node: "node_ap_east_01", protocol: "OpenVPN", errorCode: "ERR_CONN_TIMEOUT", appVersion: "2.4.0", configVersion: "v2.4.0" },
  { id: "fb_002", userId: "usr_004", username: "dave_net", category: "complaint", priority: "medium", status: "resolved", subject: "Slow speeds on EU nodes", description: "Download speeds significantly lower than expected on EU-West-1.", createdAt: "2026-05-14T11:00:00Z", node: "node_eu_west_01", protocol: "WireGuard", appVersion: "2.4.1", configVersion: "v2.4.1", assignedOperator: "ops@livemask.io" },
  { id: "fb_003", userId: "usr_006", username: "frank_ops", category: "appeal", priority: "high", status: "in_progress", subject: "Account suspension appeal", description: "I believe my account was suspended in error. I did not violate TOS.", createdAt: "2026-05-15T08:00:00Z", assignedOperator: "admin@livemask.io" },
  { id: "fb_004", userId: "usr_008", username: "henry_k", category: "feature", priority: "low", status: "open", subject: "Request for split tunneling", description: "Would love to have split tunneling support to route only specific apps through VPN.", createdAt: "2026-05-15T14:00:00Z", appVersion: "2.4.1" },
  { id: "fb_005", userId: "usr_001", username: "alice_m", category: "bug", priority: "medium", status: "open", subject: "App crashes on reconnect", description: "App crashes when trying to reconnect after switching networks.", createdAt: "2026-05-16T06:30:00Z", protocol: "WireGuard", errorCode: "ERR_CRASH_RECONNECT", appVersion: "2.4.1", configVersion: "v2.4.1" },
  { id: "fb_006", userId: "usr_007", username: "grace_ui", category: "feature", priority: "low", status: "dismissed", subject: "Dark mode for mobile app", description: "Please add dark mode support for the mobile app.", createdAt: "2026-05-12T09:00:00Z", appVersion: "2.3.9", assignedOperator: "admin@livemask.io" },
];

// Chart data
export const apiLatencyData = [
  { time: "00:00", latency: 45, errors: 2 },
  { time: "02:00", latency: 38, errors: 1 },
  { time: "04:00", latency: 42, errors: 0 },
  { time: "06:00", latency: 55, errors: 3 },
  { time: "08:00", latency: 68, errors: 5 },
  { time: "10:00", latency: 52, errors: 2 },
  { time: "12:00", latency: 61, errors: 4 },
  { time: "14:00", latency: 48, errors: 1 },
  { time: "16:00", latency: 72, errors: 6 },
  { time: "18:00", latency: 65, errors: 3 },
  { time: "20:00", latency: 58, errors: 2 },
  { time: "22:00", latency: 41, errors: 1 },
];

export const connectionData = [
  { time: "00:00", successful: 4200, failed: 45 },
  { time: "02:00", successful: 3100, failed: 22 },
  { time: "04:00", successful: 2800, failed: 18 },
  { time: "06:00", successful: 5500, failed: 65 },
  { time: "08:00", successful: 8200, failed: 120 },
  { time: "10:00", successful: 9500, failed: 85 },
  { time: "12:00", successful: 9800, failed: 92 },
  { time: "14:00", successful: 8900, failed: 78 },
  { time: "16:00", successful: 10200, failed: 145 },
  { time: "18:00", successful: 9100, failed: 98 },
  { time: "20:00", successful: 7600, failed: 62 },
  { time: "22:00", successful: 5200, failed: 35 },
];

export const nodeLoadData = [
  { name: "US-East-1", load: 42 },
  { name: "US-West-1", load: 38 },
  { name: "EU-West-1", load: 85 },
  { name: "AP-East-1", load: 78 },
  { name: "AP-South-1", load: 31 },
  { name: "SA-East-1", load: 0 },
  { name: "EU-North-1", load: 25 },
  { name: "AF-South-1", load: 5 },
  { name: "ME-West-1", load: 45 },
];