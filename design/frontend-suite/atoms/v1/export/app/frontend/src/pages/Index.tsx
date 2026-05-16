import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Server, CreditCard, MessageSquare, Activity, AlertTriangle, Shield, Wifi, Settings } from "lucide-react";
import { apiLatencyData, connectionData, nodeLoadData, mockNodes, mockUsers, mockPayments, mockFeedback, mockConfigs } from "@/lib/mock-data";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type MetricState = "normal" | "warning" | "critical";

function MetricTile({
  title,
  value,
  subtitle,
  icon: Icon,
  state = "normal",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  state?: MetricState;
}) {
  const stateStyles: Record<MetricState, string> = {
    normal: "bg-blue-500/10",
    warning: "bg-amber-500/10",
    critical: "bg-red-500/10",
  };
  const iconStyles: Record<MetricState, string> = {
    normal: "text-blue-500",
    warning: "text-amber-500",
    critical: "text-red-500",
  };
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${stateStyles[state]}`}>
            <Icon className={`h-5 w-5 ${iconStyles[state]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Index() {
  const [timeRange, setTimeRange] = useState("24h");
  const [region, setRegion] = useState("all");

  const activeUsers = mockUsers.filter((u) => u.status === "active").length;
  const healthyNodes = mockNodes.filter((n) => n.status === "healthy").length;
  const degradedNodes = mockNodes.filter((n) => n.status === "degraded" || n.status === "busy").length;
  const offlineNodes = mockNodes.filter((n) => n.status === "offline" || n.status === "quarantine").length;
  const finishedPayments = mockPayments.filter((p) => p.status === "finished").length;
  const openFeedback = mockFeedback.filter((f) => f.status === "open" || f.status === "in_progress").length;
  const latestConfig = mockConfigs.find((c) => c.status === "active" && c.key === "client_config");

  const totalConnections = connectionData.reduce((s, d) => s + d.successful + d.failed, 0);
  const totalFailed = connectionData.reduce((s, d) => s + d.failed, 0);
  const failRate = ((totalFailed / totalConnections) * 100).toFixed(2);

  const alerts = [
    { message: "Node AP-East-1 degraded: high latency (145ms)", level: "warning" as const },
    { message: "Node SA-East-1 offline since 08:15 UTC", level: "critical" as const },
    { message: "Payment pay_007 requires manual review (underpaid)", level: "warning" as const },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header with filters */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Overview</h1>
            <p className="text-sm text-muted-foreground">Global health and business status</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px] bg-card border-border h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last 1h</SelectItem>
                <SelectItem value="6h">Last 6h</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7d</SelectItem>
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[140px] bg-card border-border h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="na">North America</SelectItem>
                <SelectItem value="eu">Europe</SelectItem>
                <SelectItem value="ap">Asia Pacific</SelectItem>
                <SelectItem value="sa">South America</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alert Strip */}
        {alerts.length > 0 && (
          <div className="space-y-1.5">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  alert.level === "critical"
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <MetricTile title="Active Users" value={activeUsers} subtitle="of 8 total" icon={Users} state="normal" />
          <MetricTile title="Connections" value="94.2K" subtitle={`${failRate}% failure rate`} icon={Wifi} state={parseFloat(failRate) > 2 ? "warning" : "normal"} />
          <MetricTile title="Healthy Nodes" value={`${healthyNodes}/${mockNodes.length}`} subtitle={`${degradedNodes} degraded, ${offlineNodes} down`} icon={Server} state={offlineNodes > 0 ? "critical" : degradedNodes > 0 ? "warning" : "normal"} />
          <MetricTile title="Payment Success" value={`${Math.round((finishedPayments / mockPayments.length) * 100)}%`} subtitle={`${finishedPayments} finished`} icon={CreditCard} state="normal" />
          <MetricTile title="Open Feedback" value={openFeedback} subtitle="2 high priority" icon={MessageSquare} state={openFeedback > 3 ? "warning" : "normal"} />
        </div>

        {/* Second row metrics */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <MetricTile title="Degraded Nodes" value={degradedNodes} subtitle="Requires attention" icon={AlertTriangle} state={degradedNodes > 0 ? "warning" : "normal"} />
          <MetricTile title="Latest Client Config" value={latestConfig?.version || "—"} subtitle={`Hash: ${latestConfig?.hash || "—"}`} icon={Settings} state="normal" />
          <MetricTile title="Active Alerts" value={alerts.length} subtitle="1 critical, 2 warnings" icon={Shield} state={alerts.some((a) => a.level === "critical") ? "critical" : "warning"} />
          <MetricTile title="Failed Connections" value={totalFailed.toLocaleString()} subtitle="Last 24h" icon={Activity} state={parseFloat(failRate) > 2 ? "warning" : "normal"} />
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground text-sm font-medium">
                <Activity className="h-4 w-4 text-blue-500" />
                API Latency (ms) — {timeRange}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={apiLatencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis dataKey="time" stroke="hsl(215, 20%, 65%)" fontSize={11} />
                  <YAxis stroke="hsl(215, 20%, 65%)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220, 40%, 7%)", border: "1px solid hsl(217, 33%, 17%)", borderRadius: "6px", color: "hsl(210, 40%, 98%)" }} />
                  <Area type="monotone" dataKey="latency" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground text-sm font-medium">
                <Server className="h-4 w-4 text-teal-500" />
                Node Load Distribution (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={nodeLoadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 20%, 65%)" fontSize={10} />
                  <YAxis stroke="hsl(215, 20%, 65%)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220, 40%, 7%)", border: "1px solid hsl(217, 33%, 17%)", borderRadius: "6px", color: "hsl(210, 40%, 98%)" }} />
                  <Bar dataKey="load" fill="hsl(174, 60%, 40%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-sm font-medium">Recent System Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { time: "10:30", event: "Node AP-East-1 marked as degraded (high latency: 145ms)", type: "warning" },
                { time: "09:45", event: "Payment pay_004 created by bob_dev — waiting", type: "info" },
                { time: "09:05", event: "Config security_config v2.0.1 submitted for approval", type: "info" },
                { time: "09:00", event: "Node AF-South-1 quarantined: config mismatch", type: "critical" },
                { time: "08:20", event: "Node SA-East-1 manually restarted by ops@livemask.io", type: "action" },
                { time: "08:02", event: "Payment pay_003 status: confirming", type: "info" },
                { time: "07:00", event: "High priority feedback: Connection drops every 30 minutes", type: "warning" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded border border-border bg-background/50 px-3 py-2">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${item.type === "critical" ? "bg-red-500" : item.type === "warning" ? "bg-amber-500" : item.type === "action" ? "bg-emerald-500" : "bg-blue-500"}`} />
                  <span className="text-xs text-muted-foreground w-11 shrink-0">{item.time}</span>
                  <span className="text-sm text-foreground">{item.event}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}