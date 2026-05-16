import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAuditLogs } from "@/lib/mock-data";
import { FileText, Filter, ChevronDown, ChevronUp } from "lucide-react";

const actionColors: Record<string, string> = {
  "config.publish": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "config.draft": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "config.approve": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "user.suspend": "bg-red-500/10 text-red-400 border-red-500/20",
  "node.restart": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "node.degraded": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "node.quarantine": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "payment.webhook": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "entitlement.upgrade": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "feedback.resolve": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const actions = [...new Set(mockAuditLogs.map((log) => log.action))];

  const filteredLogs = mockAuditLogs.filter(
    (log) => actionFilter === "all" || log.action === actionFilter
  );

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Immutable record of all admin and system actions</p>
        </div>

        {/* Filter */}
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[200px] bg-background border-border h-8 text-xs">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                {filteredLogs.length} entries • Immutable from UI
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Audit Timeline */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-foreground text-sm font-medium">
              <FileText className="h-4 w-4 text-blue-500" />
              Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {filteredLogs.map((log) => {
                const isExpanded = expandedRows.has(log.id);
                return (
                  <div key={log.id} className="rounded border border-border bg-background/50">
                    {/* Main row */}
                    <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30" onClick={() => toggleExpand(log.id)}>
                      <div className="flex items-center gap-2 shrink-0">
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className="text-xs text-muted-foreground w-[130px] shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="text-sm text-foreground font-medium w-[140px] shrink-0 truncate">{log.actor}</span>
                      <Badge variant="outline" className={`${actionColors[log.action] || "bg-gray-500/10 text-gray-400 border-gray-500/20"} text-xs shrink-0`}>
                        {log.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate flex-1">{log.target}</span>
                      <span className="text-xs text-muted-foreground shrink-0 font-mono">{log.requestId}</span>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Details:</span> <span className="text-foreground">{log.details}</span></div>
                          <div><span className="text-muted-foreground">IP Address:</span> <span className="text-foreground font-mono">{log.ipAddress}</span></div>
                          <div><span className="text-muted-foreground">Request ID:</span> <span className="text-blue-400 font-mono">{log.requestId}</span></div>
                          {log.approvalId && (
                            <div><span className="text-muted-foreground">Approval ID:</span> <span className="text-purple-400 font-mono">{log.approvalId}</span></div>
                          )}
                        </div>

                        {/* Before/After Diff */}
                        {(log.before || log.after) && (
                          <div className="grid grid-cols-2 gap-3">
                            {log.before && (
                              <div>
                                <p className="text-xs font-medium text-red-400 mb-1">Before</p>
                                <pre className="rounded bg-red-500/5 border border-red-500/20 p-2 text-xs font-mono text-red-300 overflow-auto max-h-24">{log.before}</pre>
                              </div>
                            )}
                            {log.after && (
                              <div>
                                <p className="text-xs font-medium text-emerald-400 mb-1">After</p>
                                <pre className="rounded bg-emerald-500/5 border border-emerald-500/20 p-2 text-xs font-mono text-emerald-300 overflow-auto max-h-24">{log.after}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}