import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockConfigs } from "@/lib/mock-data";
import { Settings, GitBranch, Clock, Upload, RotateCcw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  draft: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  pending_approval: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const approvalColors: Record<string, string> = {
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  none: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const validationColors: Record<string, string> = {
  pass: "text-emerald-400",
  fail: "text-red-400",
  pending: "text-amber-400",
};

export default function ConfigPage() {
  const [publishDialog, setPublishDialog] = useState<string | null>(null);
  const [rollbackDialog, setRollbackDialog] = useState<string | null>(null);
  const [diffView, setDiffView] = useState<string | null>(null);

  const selectedConfig = mockConfigs.find((c) => c.id === diffView);
  const publishConfig = mockConfigs.find((c) => c.id === publishDialog);
  const rollbackConfig = mockConfigs.find((c) => c.id === rollbackDialog);

  const activeConfigs = mockConfigs.filter((c) => c.status === "active");
  const pendingConfigs = mockConfigs.filter((c) => c.status === "draft" || c.status === "pending_approval");

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Config Management</h1>
          <p className="text-sm text-muted-foreground">Manage system configurations with version control and approval workflow</p>
        </div>

        {/* Current Active Configs */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {activeConfigs.map((cfg) => (
            <Card key={cfg.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{cfg.key}</span>
                  <Badge variant="outline" className={statusColors[cfg.status]}>active</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Version:</span><span className="font-mono text-blue-400">{cfg.version}</span></div>
                  <div className="flex justify-between"><span>Hash:</span><span className="font-mono">{cfg.hash}</span></div>
                  <div className="flex justify-between"><span>Affects:</span><span>{cfg.affectedVersions}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Approval Panel */}
        {pendingConfigs.length > 0 && (
          <Card className="bg-card border-border border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Pending Approval ({pendingConfigs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingConfigs.map((cfg) => (
                  <div key={cfg.id} className="flex items-center justify-between rounded border border-border bg-background/50 p-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{cfg.key} <span className="font-mono text-blue-400">{cfg.version}</span></p>
                        <p className="text-xs text-muted-foreground">By {cfg.publishedBy} • Affects: {cfg.affectedVersions}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${cfg.validationResult === "pass" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                        {cfg.validationResult === "pass" ? "✓ Valid" : "⏳ Validating"}
                      </Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setDiffView(cfg.id)}>View Diff</Button>
                      <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setPublishDialog(cfg.id)}>Approve & Publish</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs">Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Config Registry Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-sm font-medium">Configuration Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Config Key</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Version</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Hash</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Validation</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Approval</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Published By</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockConfigs.map((config) => (
                  <TableRow key={config.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground text-sm">{config.key}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-blue-400">
                        <GitBranch className="h-3 w-3" />{config.version}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{config.hash}</TableCell>
                    <TableCell><Badge variant="outline" className={`${statusColors[config.status]} text-xs`}>{config.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>
                      {config.validationResult && (
                        <span className={`text-xs font-medium ${validationColors[config.validationResult]}`}>
                          {config.validationResult === "pass" ? "✓ Pass" : config.validationResult === "fail" ? "✗ Fail" : "⏳ Pending"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {config.approvalState && config.approvalState !== "none" && (
                        <Badge variant="outline" className={`${approvalColors[config.approvalState]} text-xs`}>{config.approvalState}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{config.publishedBy}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(config.publishedAt).toLocaleDateString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {config.diff && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setDiffView(config.id)}>Diff</Button>
                        )}
                        {config.status === "active" && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-amber-400" onClick={() => setRollbackDialog(config.id)}>Rollback</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Diff Viewer Dialog */}
        <Dialog open={!!diffView} onOpenChange={() => setDiffView(null)}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">Config Diff — {selectedConfig?.key} {selectedConfig?.version}</DialogTitle>
              <DialogDescription>Changes from previous version</DialogDescription>
            </DialogHeader>
            {selectedConfig?.diff && (
              <div className="space-y-3">
                {selectedConfig.diff.added.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-emerald-400 mb-1">+ Added</p>
                    {selectedConfig.diff.added.map((line, i) => (
                      <div key={i} className="rounded bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 text-xs font-mono text-emerald-300 mb-1">+ {line}</div>
                    ))}
                  </div>
                )}
                {selectedConfig.diff.removed.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-400 mb-1">− Removed</p>
                    {selectedConfig.diff.removed.map((line, i) => (
                      <div key={i} className="rounded bg-red-500/5 border border-red-500/20 px-3 py-1.5 text-xs font-mono text-red-300 mb-1">− {line}</div>
                    ))}
                  </div>
                )}
                {selectedConfig.diff.changed.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-amber-400 mb-1">~ Changed</p>
                    {selectedConfig.diff.changed.map((line, i) => (
                      <div key={i} className="rounded bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 text-xs font-mono text-amber-300 mb-1">~ {line}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Publish Confirmation Dialog */}
        <Dialog open={!!publishDialog} onOpenChange={() => setPublishDialog(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Upload className="h-5 w-5 text-emerald-500" />
                Publish Configuration
              </DialogTitle>
              <DialogDescription>
                You are about to publish <strong>{publishConfig?.key} {publishConfig?.version}</strong>. This will affect: {publishConfig?.affectedVersions}. This action is audited and cannot be undone without a rollback.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishDialog(null)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setPublishDialog(null)}>
                <CheckCircle className="h-4 w-4 mr-1" /> Confirm Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rollback Confirmation Dialog */}
        <Dialog open={!!rollbackDialog} onOpenChange={() => setRollbackDialog(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <RotateCcw className="h-5 w-5 text-amber-500" />
                Rollback Configuration
              </DialogTitle>
              <DialogDescription>
                You are about to rollback <strong>{rollbackConfig?.key} {rollbackConfig?.version}</strong>. This will revert to the previous active version. Affected: {rollbackConfig?.affectedVersions}. This is a dangerous operation.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRollbackDialog(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => setRollbackDialog(null)}>
                <XCircle className="h-4 w-4 mr-1" /> Confirm Rollback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}