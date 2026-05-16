import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockFeedback } from "@/lib/mock-data";
import { MessageSquare, AlertCircle, CheckCircle2, Clock, UserPlus, Link2, Server } from "lucide-react";

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  dismissed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const categoryColors: Record<string, string> = {
  bug: "bg-red-500/10 text-red-400 border-red-500/20",
  feature: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  complaint: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  appeal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function FeedbackPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [detailView, setDetailView] = useState<string | null>(null);
  const [assignDialog, setAssignDialog] = useState<string | null>(null);

  const filteredFeedback = mockFeedback.filter((fb) => {
    const matchesStatus = statusFilter === "all" || fb.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || fb.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const selectedFeedback = mockFeedback.find((f) => f.id === detailView);

  const openCount = mockFeedback.filter((f) => f.status === "open").length;
  const inProgressCount = mockFeedback.filter((f) => f.status === "in_progress").length;
  const resolvedCount = mockFeedback.filter((f) => f.status === "resolved").length;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback Queue</h1>
          <p className="text-sm text-muted-foreground">User feedback, bug reports, and support appeals</p>
        </div>

        {/* Summary */}
        <div className="grid gap-3 grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2"><AlertCircle className="h-5 w-5 text-blue-500" /></div>
              <div><p className="text-xl font-bold text-foreground">{openCount}</p><p className="text-xs text-muted-foreground">Open</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2"><Clock className="h-5 w-5 text-amber-500" /></div>
              <div><p className="text-xl font-bold text-foreground">{inProgressCount}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /></div>
              <div><p className="text-xl font-bold text-foreground">{resolvedCount}</p><p className="text-xs text-muted-foreground">Resolved</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-card border-border h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] bg-card border-border h-8 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">{filteredFeedback.length} reports</span>
        </div>

        {/* Feedback Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">ID</TableHead>
                  <TableHead className="text-muted-foreground text-xs">User</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Category</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Priority</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Subject</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Node</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Error</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Assigned</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((fb) => (
                  <TableRow key={fb.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">{fb.id}</TableCell>
                    <TableCell className="text-sm text-foreground">{fb.username}</TableCell>
                    <TableCell><Badge variant="outline" className={`${categoryColors[fb.category]} text-xs`}>{fb.category}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={`${priorityColors[fb.priority]} text-xs`}>{fb.priority}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{fb.subject}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fb.node || "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-red-400">{fb.errorCode || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className={`${statusColors[fb.status]} text-xs`}>{fb.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fb.assignedOperator || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailView(fb.id)} title="View Details">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                        {!fb.assignedOperator && fb.status === "open" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400" onClick={() => setAssignDialog(fb.id)} title="Assign">
                            <UserPlus className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {fb.node && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-teal-400" title="Link to Node">
                            <Link2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!detailView} onOpenChange={() => setDetailView(null)}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">{selectedFeedback?.subject}</DialogTitle>
              <DialogDescription>
                {selectedFeedback?.username} • {selectedFeedback?.category} • {selectedFeedback?.priority} priority
              </DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="rounded border border-border bg-background/50 p-3">
                  <p className="text-sm text-foreground">{selectedFeedback.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedFeedback.node && (
                    <div className="flex items-center gap-1.5">
                      <Server className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Node:</span>
                      <span className="text-foreground">{selectedFeedback.node}</span>
                    </div>
                  )}
                  {selectedFeedback.protocol && (
                    <div><span className="text-muted-foreground">Protocol:</span> <span className="text-foreground">{selectedFeedback.protocol}</span></div>
                  )}
                  {selectedFeedback.errorCode && (
                    <div><span className="text-muted-foreground">Error:</span> <span className="text-red-400 font-mono">{selectedFeedback.errorCode}</span></div>
                  )}
                  {selectedFeedback.appVersion && (
                    <div><span className="text-muted-foreground">App Version:</span> <span className="text-foreground">{selectedFeedback.appVersion}</span></div>
                  )}
                  {selectedFeedback.configVersion && (
                    <div><span className="text-muted-foreground">Config:</span> <span className="text-blue-400 font-mono">{selectedFeedback.configVersion}</span></div>
                  )}
                  {selectedFeedback.assignedOperator && (
                    <div><span className="text-muted-foreground">Assigned:</span> <span className="text-foreground">{selectedFeedback.assignedOperator}</span></div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="text-xs h-7">Mark Resolved</Button>
                  <Button size="sm" variant="outline" className="text-xs h-7">Create Node Incident</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Dialog */}
        <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Assign Operator</DialogTitle>
              <DialogDescription>Select an operator to handle this feedback report.</DialogDescription>
            </DialogHeader>
            <Select defaultValue="admin@livemask.io">
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin@livemask.io">admin@livemask.io</SelectItem>
                <SelectItem value="ops@livemask.io">ops@livemask.io</SelectItem>
                <SelectItem value="support@livemask.io">support@livemask.io</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
              <Button onClick={() => setAssignDialog(null)}>Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}