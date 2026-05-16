import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockSponsors, mockAmbassadors, mockRevenueJobs, mockTracebacks, mockRevenueConfig } from "@/lib/revenue-data";
import { DollarSign, Users, Server, TrendingUp, Play, RotateCcw, FileText, AlertTriangle, CheckCircle, Clock, Eye, Calculator } from "lucide-react";

const sponsorStatusColors: Record<string, string> = {
  healthy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  degraded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  blocked: "bg-red-500/10 text-red-400 border-red-500/20",
  traceback_required: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  stale: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const payoutStatusColors: Record<string, string> = {
  eligible: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  blocked: "bg-red-500/10 text-red-400 border-red-500/20",
  traceback_required: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const jobStatusColors: Record<string, string> = {
  queued: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed_with_warnings: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

function SponsorTab() {
  const [detailId, setDetailId] = useState<string | null>(null);
  const sponsor = mockSponsors.find((s) => s.id === detailId);

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">Sponsor</TableHead>
                <TableHead className="text-muted-foreground text-xs">Active Nodes</TableHead>
                <TableHead className="text-muted-foreground text-xs">Healthy</TableHead>
                <TableHead className="text-muted-foreground text-xs">Traffic GB</TableHead>
                <TableHead className="text-muted-foreground text-xs">Quality</TableHead>
                <TableHead className="text-muted-foreground text-xs">Tier</TableHead>
                <TableHead className="text-muted-foreground text-xs">Est. Revenue</TableHead>
                <TableHead className="text-muted-foreground text-xs">Payout</TableHead>
                <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSponsors.map((sp) => (
                <TableRow key={sp.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{sp.name}</p>
                      <p className="text-xs text-muted-foreground">{sp.accountEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{sp.activeNodes}</TableCell>
                  <TableCell className="text-sm text-foreground">{sp.healthyNodes}</TableCell>
                  <TableCell className="text-sm text-foreground">{sp.trafficGb.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-mono ${sp.qualityScore >= 0.8 ? "text-emerald-400" : sp.qualityScore >= 0.5 ? "text-amber-400" : "text-red-400"}`}>
                      {(sp.qualityScore * 100).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{sp.tier}</Badge></TableCell>
                  <TableCell className="text-sm font-medium text-foreground">${sp.estimatedRevenue.toFixed(2)}</TableCell>
                  <TableCell><Badge variant="outline" className={`${payoutStatusColors[sp.payoutStatus]} text-xs`}>{sp.payoutStatus.replace("_", " ")}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={`${sponsorStatusColors[sp.status]} text-xs`}>{sp.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(sp.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{sponsor?.name} — Sponsor Detail</DialogTitle>
            <DialogDescription>{sponsor?.accountEmail} • {sponsor?.tier} Tier {sponsor?.riskFlag && "• ⚠️ Risk Flag"}</DialogDescription>
          </DialogHeader>
          {sponsor && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded border border-border p-2 text-center">
                  <p className="text-xs text-muted-foreground">Traffic</p>
                  <p className="text-lg font-bold text-foreground">{sponsor.trafficGb} GB</p>
                </div>
                <div className="rounded border border-border p-2 text-center">
                  <p className="text-xs text-muted-foreground">Active Nodes</p>
                  <p className="text-lg font-bold text-foreground">{sponsor.activeNodes}</p>
                </div>
                <div className="rounded border border-border p-2 text-center">
                  <p className="text-xs text-muted-foreground">Quality Score</p>
                  <p className={`text-lg font-bold ${sponsor.qualityScore >= 0.8 ? "text-emerald-400" : sponsor.qualityScore >= 0.5 ? "text-amber-400" : "text-red-400"}`}>{(sponsor.qualityScore * 100).toFixed(0)}%</p>
                </div>
                <div className="rounded border border-border p-2 text-center">
                  <p className="text-xs text-muted-foreground">Est. Revenue</p>
                  <p className="text-lg font-bold text-foreground">${sponsor.estimatedRevenue.toFixed(2)}</p>
                </div>
              </div>

              <Card className="bg-background/50 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">Quality Composite Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Uptime Score (weight: 0.4)</span><span className="text-foreground">{(sponsor.uptimeScore * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Network Quality Score (weight: 0.35)</span><span className="text-foreground">{(sponsor.networkQualityScore * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Node Count Score (weight: 0.25)</span><span className="text-foreground">{(sponsor.nodeCountScore * 100).toFixed(0)}%</span></div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-xs font-medium"><span className="text-muted-foreground">Final Quality Score</span><span className="text-foreground">{(sponsor.qualityScore * 100).toFixed(0)}%</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">Revenue Formula</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs text-blue-400 block bg-blue-500/5 rounded p-2 border border-blue-500/10">
                    revenue = (traffic_gb / base_gb_per_unit) × quality_score × tier_bonus
                  </code>
                  <div className="mt-2 text-xs text-muted-foreground">
                    = ({sponsor.trafficGb} / {mockRevenueConfig.baseGbPerUnit}) × {sponsor.qualityScore.toFixed(2)} × {sponsor.tierBonus} = <span className="text-foreground font-medium">${sponsor.estimatedRevenue.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AmbassadorTab() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs">Ambassador</TableHead>
              <TableHead className="text-muted-foreground text-xs">Tier</TableHead>
              <TableHead className="text-muted-foreground text-xs">Invited Users</TableHead>
              <TableHead className="text-muted-foreground text-xs">Avg User Tier</TableHead>
              <TableHead className="text-muted-foreground text-xs">Loyalty Bonus</TableHead>
              <TableHead className="text-muted-foreground text-xs">Consumption</TableHead>
              <TableHead className="text-muted-foreground text-xs">C2C Commission</TableHead>
              <TableHead className="text-muted-foreground text-xs">Est. Commission</TableHead>
              <TableHead className="text-muted-foreground text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAmbassadors.map((amb) => (
              <TableRow key={amb.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-foreground">{amb.name}</p>
                    <p className="text-xs text-muted-foreground">{amb.email}</p>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{amb.tier}</Badge></TableCell>
                <TableCell className="text-sm text-foreground">{amb.invitedActiveUsers}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{amb.averageInvitedUserTier}</TableCell>
                <TableCell className="text-sm font-mono text-foreground">×{amb.loyaltyBonusFactor.toFixed(1)}</TableCell>
                <TableCell className="text-sm text-foreground">${amb.consumptionBase.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-foreground">${amb.c2cCommission.toFixed(2)}</TableCell>
                <TableCell className="text-sm font-medium text-foreground">${amb.estimatedCommission.toFixed(2)}</TableCell>
                <TableCell><Badge variant="outline" className={`${sponsorStatusColors[amb.status]} text-xs`}>{amb.status.replace("_", " ")}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ConfigTab() {
  const [mode, setMode] = useState<"form" | "json" | "impact">("form");
  const cfg = mockRevenueConfig;

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-sm font-medium">sponsor_node_revenue_config — {cfg.version}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant={mode === "form" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setMode("form")}>Form</Button>
              <Button size="sm" variant={mode === "json" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setMode("json")}>JSON</Button>
              <Button size="sm" variant={mode === "impact" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setMode("impact")}>Impact Preview</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mode === "form" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Base GB per Unit</label>
                  <div className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground">{cfg.baseGbPerUnit}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Min Quality for Payout</label>
                  <div className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground">{cfg.minQualityForPayout}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Payout Cycle</label>
                  <div className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground">{cfg.payoutCycle}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Platform Share Rate</label>
                  <div className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground">{(cfg.platformShareRate * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Quality Weights (must sum to 1.0)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded border border-border bg-background px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Uptime</p>
                    <p className="text-sm font-mono text-foreground">{cfg.qualityWeights.uptimeScore}</p>
                  </div>
                  <div className="rounded border border-border bg-background px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Network Quality</p>
                    <p className="text-sm font-mono text-foreground">{cfg.qualityWeights.networkQualityScore}</p>
                  </div>
                  <div className="rounded border border-border bg-background px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Node Count</p>
                    <p className="text-sm font-mono text-foreground">{cfg.qualityWeights.nodeCountScore}</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-400">✓ Weight sum: {(cfg.qualityWeights.uptimeScore + cfg.qualityWeights.networkQualityScore + cfg.qualityWeights.nodeCountScore).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Tier Rules</label>
                <div className="space-y-1">
                  {cfg.tierRules.map((rule) => (
                    <div key={rule.tier} className="flex items-center justify-between rounded border border-border bg-background px-3 py-1.5 text-xs">
                      <span className="text-foreground font-medium">{rule.tier}</span>
                      <span className="text-muted-foreground">Min Nodes: {rule.minNodes}</span>
                      <span className="text-blue-400 font-mono">Bonus: ×{rule.bonus}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Publish</Button>
                <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/30">Rollback</Button>
              </div>
            </div>
          )}
          {mode === "json" && (
            <pre className="rounded border border-border bg-background p-4 text-xs font-mono text-foreground overflow-auto max-h-80">
              {JSON.stringify(cfg, null, 2)}
            </pre>
          )}
          {mode === "impact" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Estimated impact on top sponsors if current config is applied:</p>
              {mockSponsors.filter((s) => s.status !== "blocked").slice(0, 4).map((sp) => (
                <div key={sp.id} className="flex items-center justify-between rounded border border-border bg-background px-3 py-2">
                  <span className="text-sm text-foreground">{sp.name}</span>
                  <span className="text-xs text-muted-foreground">Quality: {(sp.qualityScore * 100).toFixed(0)}%</span>
                  <span className="text-sm font-medium text-foreground">${sp.estimatedRevenue.toFixed(2)}</span>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">No change</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function JobsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" className="h-7 text-xs"><Play className="h-3 w-3 mr-1" /> Dry Run</Button>
        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"><Calculator className="h-3 w-3 mr-1" /> Run Calculation</Button>
      </div>
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">Job ID</TableHead>
                <TableHead className="text-muted-foreground text-xs">Period</TableHead>
                <TableHead className="text-muted-foreground text-xs">Triggered By</TableHead>
                <TableHead className="text-muted-foreground text-xs">Force</TableHead>
                <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs">Processed</TableHead>
                <TableHead className="text-muted-foreground text-xs">Blocked</TableHead>
                <TableHead className="text-muted-foreground text-xs">Total Payout</TableHead>
                <TableHead className="text-muted-foreground text-xs">Errors</TableHead>
                <TableHead className="text-muted-foreground text-xs">Duration</TableHead>
                <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRevenueJobs.map((job) => (
                <TableRow key={job.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-mono text-xs text-muted-foreground">{job.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{job.periodStart} — {job.periodEnd}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{job.triggeredBy}</TableCell>
                  <TableCell className="text-xs">{job.forceRecalc ? <span className="text-amber-400">Yes</span> : "No"}</TableCell>
                  <TableCell><Badge variant="outline" className={`${jobStatusColors[job.status]} text-xs`}>{job.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm text-foreground">{job.sponsorsProcessed}</TableCell>
                  <TableCell className="text-sm text-foreground">{job.sponsorsBlocked}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">{job.totalPayout > 0 ? `$${job.totalPayout.toFixed(2)}` : "—"}</TableCell>
                  <TableCell className={`text-sm ${job.errorCount > 0 ? "text-red-400" : "text-muted-foreground"}`}>{job.errorCount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{job.finishedAt ? `${Math.round((new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime()) / 60000)}m` : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {job.status === "failed" && <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400"><RotateCcw className="h-3.5 w-3.5" /></Button>}
                      <Button variant="ghost" size="icon" className="h-7 w-7"><FileText className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function TracebackTab() {
  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-sm font-medium">Traceback Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTracebacks.map((tb) => (
              <div key={tb.id} className="rounded border border-border bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{tb.sponsorName}</p>
                    <p className="text-xs text-muted-foreground">{tb.affectedPeriod} • {tb.reason}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${tb.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : tb.status === "failed" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                    {tb.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded bg-red-500/5 border border-red-500/10 p-2">
                    <p className="text-xs text-red-400 mb-1">Before</p>
                    <p className="text-xs text-muted-foreground">Quality: {(tb.oldQualityScore * 100).toFixed(0)}% • Revenue: ${tb.oldRevenue.toFixed(2)}</p>
                  </div>
                  <div className="rounded bg-emerald-500/5 border border-emerald-500/10 p-2">
                    <p className="text-xs text-emerald-400 mb-1">After</p>
                    <p className="text-xs text-muted-foreground">Quality: {(tb.newQualityScore * 100).toFixed(0)}% • Revenue: ${tb.newRevenue.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Delta: <span className={tb.delta > 0 ? "text-emerald-400" : tb.delta < 0 ? "text-red-400" : "text-muted-foreground"}>{tb.delta > 0 ? "+" : ""}{tb.delta.toFixed(2)}</span></span>
                  {tb.appealId && <span>Appeal: {tb.appealId}</span>}
                  {tb.reviewer && <span>Reviewer: {tb.reviewer}</span>}
                  {tb.auditId && <span className="font-mono">Audit: {tb.auditId}</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RevenuePage() {
  const totalPayout = mockSponsors.reduce((s, sp) => s + sp.estimatedRevenue, 0);
  const totalCommission = mockAmbassadors.reduce((s, a) => s + a.estimatedCommission, 0);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue Operations</h1>
          <p className="text-sm text-muted-foreground">/admin/finance/revenue — Sponsor nodes, ambassador commissions, config, jobs, traceback</p>
        </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2"><DollarSign className="h-5 w-5 text-blue-500" /></div>
              <div><p className="text-xl font-bold text-foreground">${totalPayout.toFixed(0)}</p><p className="text-xs text-muted-foreground">Sponsor Payout (est.)</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2"><Users className="h-5 w-5 text-purple-500" /></div>
              <div><p className="text-xl font-bold text-foreground">${totalCommission.toFixed(0)}</p><p className="text-xs text-muted-foreground">Ambassador Commission</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2"><Server className="h-5 w-5 text-emerald-500" /></div>
              <div><p className="text-xl font-bold text-foreground">{mockSponsors.reduce((s, sp) => s + sp.activeNodes, 0)}</p><p className="text-xs text-muted-foreground">Total Sponsor Nodes</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2"><TrendingUp className="h-5 w-5 text-amber-500" /></div>
              <div><p className="text-xl font-bold text-foreground">{mockTracebacks.filter((t) => t.status !== "completed").length}</p><p className="text-xs text-muted-foreground">Pending Tracebacks</p></div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sponsors" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="sponsors" className="text-xs">Sponsor Nodes</TabsTrigger>
            <TabsTrigger value="ambassadors" className="text-xs">Ambassadors</TabsTrigger>
            <TabsTrigger value="config" className="text-xs">Revenue Config</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs">Calculation Jobs</TabsTrigger>
            <TabsTrigger value="traceback" className="text-xs">Traceback</TabsTrigger>
          </TabsList>
          <TabsContent value="sponsors"><SponsorTab /></TabsContent>
          <TabsContent value="ambassadors"><AmbassadorTab /></TabsContent>
          <TabsContent value="config"><ConfigTab /></TabsContent>
          <TabsContent value="jobs"><JobsTab /></TabsContent>
          <TabsContent value="traceback"><TracebackTab /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}