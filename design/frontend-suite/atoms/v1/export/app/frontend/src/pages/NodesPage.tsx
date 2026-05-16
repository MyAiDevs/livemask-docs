import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockNodes } from "@/lib/mock-data";
import { Server, Eye, ShieldOff, RotateCcw, RefreshCw, FileText } from "lucide-react";

const statusConfig: Record<string, { badge: string; label: string }> = {
  healthy: { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Healthy" },
  busy: { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Busy" },
  degraded: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Degraded" },
  offline: { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Offline" },
  quarantine: { badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: "Quarantine" },
  stale_report: { badge: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Stale Report" },
};

export default function NodesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: string; node: string }>({ open: false, action: "", node: "" });
  const [detailNode, setDetailNode] = useState<string | null>(null);

  const regions = [...new Set(mockNodes.map((n) => n.region))];

  const filteredNodes = mockNodes.filter((node) => {
    const matchesStatus = statusFilter === "all" || node.status === statusFilter;
    const matchesRegion = regionFilter === "all" || node.region === regionFilter;
    return matchesStatus && matchesRegion;
  });

  const selectedNode = mockNodes.find((n) => n.id === detailNode);

  const handleAction = (action: string, nodeName: string) => {
    setActionDialog({ open: true, action, node: nodeName });
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Node Operations</h1>
          <p className="text-sm text-muted-foreground">Node inventory, health, and operational management</p>
        </div>

        {/* Summary */}
        <div className="grid gap-3 grid-cols-3 lg:grid-cols-6">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = mockNodes.filter((n) => n.status === key).length;
            return (
              <Card key={key} className="bg-card border-border">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{count}</p>
                  <Badge variant="outline" className={`${cfg.badge} text-xs mt-1`}>{cfg.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-card border-border h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[160px] bg-card border-border h-8 text-xs">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">{filteredNodes.length} nodes</span>
        </div>

        {/* Nodes Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Node</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Region</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Latency</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Load</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Last Report</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Config</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Protocol</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Degraded Reason</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNodes.map((node) => (
                  <TableRow key={node.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground text-sm">{node.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{node.region}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusConfig[node.status]?.badge} text-xs`}>
                        {statusConfig[node.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-sm font-mono ${node.latency > 100 ? "text-red-400" : node.latency > 50 ? "text-amber-400" : "text-emerald-400"}`}>
                      {node.latency > 0 ? `${node.latency}ms` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{node.load}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(node.lastReport).toLocaleTimeString()}</TableCell>
                    <TableCell className="text-xs font-mono text-blue-400">{node.configVersion}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{node.protocol}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{node.degradedReason || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailNode(node.id)} title="View Details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {node.status !== "quarantine" && node.status !== "offline" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-400 hover:text-amber-300" onClick={() => handleAction("quarantine", node.name)} title="Quarantine">
                            <ShieldOff className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {(node.status === "quarantine" || node.status === "offline") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400 hover:text-emerald-300" onClick={() => handleAction("restore", node.name)} title="Restore">
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAction("force_config", node.name)} title="Force Config Refresh">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="View Reports">
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Node Detail Dialog */}
        <Dialog open={!!detailNode} onOpenChange={() => setDetailNode(null)}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Server className="h-5 w-5 text-blue-500" />
                {selectedNode?.name} Details
              </DialogTitle>
            </DialogHeader>
            {selectedNode && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Location:</span> <span className="text-foreground ml-1">{selectedNode.location}</span></div>
                  <div><span className="text-muted-foreground">Region:</span> <span className="text-foreground ml-1">{selectedNode.region}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={`${statusConfig[selectedNode.status]?.badge} text-xs ml-1`}>{statusConfig[selectedNode.status]?.label}</Badge></div>
                  <div><span className="text-muted-foreground">Protocol:</span> <span className="text-foreground ml-1">{selectedNode.protocol}</span></div>
                  <div><span className="text-muted-foreground">Latency:</span> <span className="text-foreground ml-1">{selectedNode.latency}ms</span></div>
                  <div><span className="text-muted-foreground">Load:</span> <span className="text-foreground ml-1">{selectedNode.load}%</span></div>
                  <div><span className="text-muted-foreground">Connections:</span> <span className="text-foreground ml-1">{selectedNode.connections}/{selectedNode.maxConnections}</span></div>
                  <div><span className="text-muted-foreground">Uptime:</span> <span className="text-foreground ml-1">{selectedNode.uptime}</span></div>
                  <div><span className="text-muted-foreground">Config:</span> <span className="text-blue-400 font-mono ml-1">{selectedNode.configVersion}</span></div>
                  <div><span className="text-muted-foreground">Last Report:</span> <span className="text-foreground ml-1">{new Date(selectedNode.lastReport).toLocaleString()}</span></div>
                </div>
                {selectedNode.degradedReason && (
                  <div className="rounded border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-xs text-amber-400 font-medium mb-1">Degraded Reason</p>
                    <p className="text-sm text-foreground">{selectedNode.degradedReason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Confirm: {actionDialog.action === "quarantine" ? "Quarantine Node" : actionDialog.action === "restore" ? "Restore Node" : "Force Config Refresh"}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.action === "quarantine"
                  ? `Are you sure you want to quarantine ${actionDialog.node}? This will stop routing traffic to this node.`
                  : actionDialog.action === "restore"
                  ? `Are you sure you want to restore ${actionDialog.node}? Traffic will resume routing to this node.`
                  : `Force push the latest config to ${actionDialog.node}? The node will restart its agent.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ ...actionDialog, open: false })}>Cancel</Button>
              <Button
                variant={actionDialog.action === "quarantine" ? "destructive" : "default"}
                onClick={() => setActionDialog({ ...actionDialog, open: false })}
              >
                {actionDialog.action === "quarantine" ? "Quarantine" : actionDialog.action === "restore" ? "Restore" : "Force Refresh"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}