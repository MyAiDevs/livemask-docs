// Revenue Operations mock data

export interface Sponsor {
  id: string;
  name: string;
  accountEmail: string;
  status: "healthy" | "degraded" | "blocked" | "traceback_required" | "stale";
  activeNodes: number;
  healthyNodes: number;
  trafficGb: number;
  qualityScore: number;
  uptimeScore: number;
  networkQualityScore: number;
  nodeCountScore: number;
  tierBonus: number;
  tier: string;
  estimatedRevenue: number;
  payoutStatus: "eligible" | "pending_review" | "blocked" | "traceback_required" | "paid";
  lastCalculation: string;
  riskFlag: boolean;
}

export interface Ambassador {
  id: string;
  name: string;
  email: string;
  tier: string;
  invitedActiveUsers: number;
  averageInvitedUserTier: string;
  loyaltyBonusFactor: number;
  consumptionBase: number;
  c2cCommission: number;
  estimatedCommission: number;
  status: "healthy" | "degraded" | "blocked" | "traceback_required" | "stale";
  lastCalculation: string;
}

export interface RevenueJob {
  id: string;
  periodStart: string;
  periodEnd: string;
  triggeredBy: string;
  forceRecalc: boolean;
  status: "queued" | "running" | "completed" | "completed_with_warnings" | "failed" | "cancelled";
  sponsorsProcessed: number;
  sponsorsBlocked: number;
  totalPayout: number;
  errorCount: number;
  startedAt: string;
  finishedAt: string;
}

export interface TracebackRecord {
  id: string;
  sponsorId: string;
  sponsorName: string;
  affectedPeriod: string;
  reason: string;
  sourceEventId: string;
  appealId?: string;
  oldQualityScore: number;
  newQualityScore: number;
  oldRevenue: number;
  newRevenue: number;
  delta: number;
  reviewer: string;
  auditId: string;
  status: "draft" | "preview" | "confirming" | "completed" | "failed";
  createdAt: string;
}

export interface RevenueConfig {
  key: string;
  version: string;
  baseGbPerUnit: number;
  qualityWeights: {
    uptimeScore: number;
    networkQualityScore: number;
    nodeCountScore: number;
  };
  tierRules: { tier: string; minNodes: number; bonus: number }[];
  minQualityForPayout: number;
  payoutCycle: string;
  platformShareRate: number;
}

export const mockSponsors: Sponsor[] = [
  { id: "sp_001", name: "NetRelay Corp", accountEmail: "ops@netrelay.io", status: "healthy", activeNodes: 12, healthyNodes: 11, trafficGb: 4520, qualityScore: 0.92, uptimeScore: 0.95, networkQualityScore: 0.90, nodeCountScore: 0.88, tierBonus: 1.2, tier: "Gold", estimatedRevenue: 1245.60, payoutStatus: "eligible", lastCalculation: "2026-05-15T23:00:00Z", riskFlag: false },
  { id: "sp_002", name: "CloudBridge Ltd", accountEmail: "admin@cloudbridge.net", status: "healthy", activeNodes: 8, healthyNodes: 8, trafficGb: 3100, qualityScore: 0.88, uptimeScore: 0.92, networkQualityScore: 0.85, nodeCountScore: 0.82, tierBonus: 1.1, tier: "Silver", estimatedRevenue: 842.30, payoutStatus: "eligible", lastCalculation: "2026-05-15T23:00:00Z", riskFlag: false },
  { id: "sp_003", name: "EdgeNode Systems", accountEmail: "finance@edgenode.co", status: "degraded", activeNodes: 5, healthyNodes: 3, trafficGb: 1800, qualityScore: 0.65, uptimeScore: 0.70, networkQualityScore: 0.60, nodeCountScore: 0.72, tierBonus: 1.0, tier: "Bronze", estimatedRevenue: 390.00, payoutStatus: "pending_review", lastCalculation: "2026-05-15T23:00:00Z", riskFlag: false },
  { id: "sp_004", name: "PrivateNet Inc", accountEmail: "ops@privatenet.io", status: "blocked", activeNodes: 3, healthyNodes: 0, trafficGb: 200, qualityScore: 0.25, uptimeScore: 0.30, networkQualityScore: 0.20, nodeCountScore: 0.40, tierBonus: 1.0, tier: "Bronze", estimatedRevenue: 0, payoutStatus: "blocked", lastCalculation: "2026-05-15T23:00:00Z", riskFlag: true },
  { id: "sp_005", name: "GlobalMesh", accountEmail: "team@globalmesh.dev", status: "traceback_required", activeNodes: 6, healthyNodes: 5, trafficGb: 2400, qualityScore: 0.78, uptimeScore: 0.82, networkQualityScore: 0.75, nodeCountScore: 0.80, tierBonus: 1.1, tier: "Silver", estimatedRevenue: 620.40, payoutStatus: "traceback_required", lastCalculation: "2026-05-14T23:00:00Z", riskFlag: false },
  { id: "sp_006", name: "SecureHop", accountEmail: "admin@securehop.net", status: "stale", activeNodes: 4, healthyNodes: 4, trafficGb: 1500, qualityScore: 0.80, uptimeScore: 0.85, networkQualityScore: 0.78, nodeCountScore: 0.75, tierBonus: 1.0, tier: "Bronze", estimatedRevenue: 400.00, payoutStatus: "eligible", lastCalculation: "2026-05-10T23:00:00Z", riskFlag: false },
];

export const mockAmbassadors: Ambassador[] = [
  { id: "amb_001", name: "Sarah Chen", email: "sarah@promo.io", tier: "Gold", invitedActiveUsers: 145, averageInvitedUserTier: "Premium", loyaltyBonusFactor: 1.3, consumptionBase: 2800, c2cCommission: 120.50, estimatedCommission: 485.20, status: "healthy", lastCalculation: "2026-05-15T23:00:00Z" },
  { id: "amb_002", name: "Marcus Lee", email: "marcus@influence.co", tier: "Silver", invitedActiveUsers: 82, averageInvitedUserTier: "Basic", loyaltyBonusFactor: 1.1, consumptionBase: 1200, c2cCommission: 45.00, estimatedCommission: 198.50, status: "healthy", lastCalculation: "2026-05-15T23:00:00Z" },
  { id: "amb_003", name: "Aisha Patel", email: "aisha@network.dev", tier: "Gold", invitedActiveUsers: 210, averageInvitedUserTier: "Premium", loyaltyBonusFactor: 1.4, consumptionBase: 4100, c2cCommission: 230.00, estimatedCommission: 720.80, status: "healthy", lastCalculation: "2026-05-15T23:00:00Z" },
  { id: "amb_004", name: "Tom Wilson", email: "tom@growth.io", tier: "Bronze", invitedActiveUsers: 28, averageInvitedUserTier: "Free", loyaltyBonusFactor: 1.0, consumptionBase: 350, c2cCommission: 10.00, estimatedCommission: 42.00, status: "degraded", lastCalculation: "2026-05-15T23:00:00Z" },
  { id: "amb_005", name: "Elena Volkov", email: "elena@partners.net", tier: "Silver", invitedActiveUsers: 65, averageInvitedUserTier: "Premium", loyaltyBonusFactor: 1.2, consumptionBase: 1800, c2cCommission: 85.00, estimatedCommission: 310.40, status: "traceback_required", lastCalculation: "2026-05-14T23:00:00Z" },
];

export const mockRevenueJobs: RevenueJob[] = [
  { id: "job_001", periodStart: "2026-05-01", periodEnd: "2026-05-15", triggeredBy: "system (scheduled)", forceRecalc: false, status: "completed", sponsorsProcessed: 6, sponsorsBlocked: 1, totalPayout: 3498.30, errorCount: 0, startedAt: "2026-05-15T23:00:00Z", finishedAt: "2026-05-15T23:12:00Z" },
  { id: "job_002", periodStart: "2026-04-16", periodEnd: "2026-04-30", triggeredBy: "system (scheduled)", forceRecalc: false, status: "completed", sponsorsProcessed: 6, sponsorsBlocked: 0, totalPayout: 3210.50, errorCount: 0, startedAt: "2026-04-30T23:00:00Z", finishedAt: "2026-04-30T23:10:00Z" },
  { id: "job_003", periodStart: "2026-05-01", periodEnd: "2026-05-15", triggeredBy: "admin@livemask.io (manual)", forceRecalc: true, status: "completed_with_warnings", sponsorsProcessed: 6, sponsorsBlocked: 1, totalPayout: 3498.30, errorCount: 2, startedAt: "2026-05-16T08:00:00Z", finishedAt: "2026-05-16T08:08:00Z" },
  { id: "job_004", periodStart: "2026-05-16", periodEnd: "2026-05-31", triggeredBy: "admin@livemask.io (dry run)", forceRecalc: false, status: "queued", sponsorsProcessed: 0, sponsorsBlocked: 0, totalPayout: 0, errorCount: 0, startedAt: "2026-05-16T10:00:00Z", finishedAt: "" },
];

export const mockTracebacks: TracebackRecord[] = [
  { id: "tb_001", sponsorId: "sp_005", sponsorName: "GlobalMesh", affectedPeriod: "2026-04-16 to 2026-04-30", reason: "Late traffic data received from AP-East nodes", sourceEventId: "evt_late_traffic_042", appealId: undefined, oldQualityScore: 0.72, newQualityScore: 0.78, oldRevenue: 580.20, newRevenue: 620.40, delta: 40.20, reviewer: "finance@livemask.io", auditId: "aud_tb_001", status: "completed", createdAt: "2026-05-14T10:00:00Z" },
  { id: "tb_002", sponsorId: "sp_003", sponsorName: "EdgeNode Systems", affectedPeriod: "2026-05-01 to 2026-05-15", reason: "Appeal: node downtime was due to upstream provider outage", sourceEventId: "evt_appeal_051", appealId: "apl_003", oldQualityScore: 0.55, newQualityScore: 0.65, oldRevenue: 320.00, newRevenue: 390.00, delta: 70.00, reviewer: "admin@livemask.io", auditId: "aud_tb_002", status: "completed", createdAt: "2026-05-16T06:00:00Z" },
  { id: "tb_003", sponsorId: "sp_005", sponsorName: "GlobalMesh", affectedPeriod: "2026-05-01 to 2026-05-15", reason: "Config correction: wrong quality weight applied", sourceEventId: "evt_cfg_correction_052", appealId: undefined, oldQualityScore: 0.78, newQualityScore: 0.78, oldRevenue: 620.40, newRevenue: 620.40, delta: 0, reviewer: "", auditId: "", status: "preview", createdAt: "2026-05-16T09:00:00Z" },
];

export const mockRevenueConfig: RevenueConfig = {
  key: "sponsor_node_revenue_config",
  version: "v1.3.0",
  baseGbPerUnit: 100,
  qualityWeights: {
    uptimeScore: 0.4,
    networkQualityScore: 0.35,
    nodeCountScore: 0.25,
  },
  tierRules: [
    { tier: "Bronze", minNodes: 1, bonus: 1.0 },
    { tier: "Silver", minNodes: 5, bonus: 1.1 },
    { tier: "Gold", minNodes: 10, bonus: 1.2 },
    { tier: "Platinum", minNodes: 20, bonus: 1.35 },
  ],
  minQualityForPayout: 0.5,
  payoutCycle: "bi-monthly",
  platformShareRate: 0.20,
};