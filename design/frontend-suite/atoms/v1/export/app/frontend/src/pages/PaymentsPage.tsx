import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockPayments } from "@/lib/mock-data";
import { CreditCard, DollarSign, CheckCircle, XCircle, Eye, RefreshCw, AlertCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  waiting: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  confirming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  finished: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  expired: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  manual_review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [webhookView, setWebhookView] = useState<string | null>(null);
  const [reviewDialog, setReviewDialog] = useState<string | null>(null);

  const filteredPayments = mockPayments.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  const selectedPayment = mockPayments.find((p) => p.id === webhookView);
  const reviewPayment = mockPayments.find((p) => p.id === reviewDialog);

  const totalRevenue = mockPayments.filter((p) => p.status === "finished").reduce((sum, p) => sum + p.amount, 0);
  const finishedCount = mockPayments.filter((p) => p.status === "finished").length;
  const failedCount = mockPayments.filter((p) => p.status === "failed" || p.status === "expired").length;
  const reviewCount = mockPayments.filter((p) => p.status === "manual_review").length;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground">Order tracking, webhook history, and manual review</p>
        </div>

        {/* Summary */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2"><DollarSign className="h-5 w-5 text-blue-500" /></div>
              <div><p className="text-xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p><p className="text-xs text-muted-foreground">Total Revenue</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2"><CheckCircle className="h-5 w-5 text-emerald-500" /></div>
              <div><p className="text-xl font-bold text-foreground">{finishedCount}</p><p className="text-xs text-muted-foreground">Finished</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2"><XCircle className="h-5 w-5 text-red-500" /></div>
              <div><p className="text-xl font-bold text-foreground">{failedCount}</p><p className="text-xs text-muted-foreground">Failed/Expired</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2"><AlertCircle className="h-5 w-5 text-purple-500" /></div>
              <div><p className="text-xl font-bold text-foreground">{reviewCount}</p><p className="text-xs text-muted-foreground">Manual Review</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-card border-border h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="confirming">Confirming</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="manual_review">Manual Review</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">{filteredPayments.length} orders</span>
        </div>

        {/* Payments Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Order ID</TableHead>
                  <TableHead className="text-muted-foreground text-xs">User</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Plan</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Amount</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Chain/Currency</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Provider Ref</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Created</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">{payment.id}</TableCell>
                    <TableCell className="text-sm text-foreground">{payment.username}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{payment.plan}</TableCell>
                    <TableCell className="font-medium text-foreground text-sm">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{payment.chain} / {payment.currency}</TableCell>
                    <TableCell><Badge variant="outline" className={`${statusColors[payment.status]} text-xs`}>{payment.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{payment.providerRef}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWebhookView(payment.id)} title="Webhook History">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {payment.status === "manual_review" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-400" onClick={() => setReviewDialog(payment.id)} title="Manual Review">
                            <AlertCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {(payment.status === "failed" || payment.status === "expired") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400" title="Retry">
                            <RefreshCw className="h-3.5 w-3.5" />
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

        {/* Webhook History Dialog */}
        <Dialog open={!!webhookView} onOpenChange={() => setWebhookView(null)}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Webhook History — {selectedPayment?.id}</DialogTitle>
              <DialogDescription>Provider: {selectedPayment?.provider} • Ref: {selectedPayment?.providerRef}</DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-2">
                {selectedPayment.webhookHistory.map((wh, i) => (
                  <div key={i} className="flex items-center gap-3 rounded border border-border bg-background/50 px-3 py-2">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${wh.status === "finished" ? "bg-emerald-500" : wh.status === "failed" || wh.status === "expired" ? "bg-red-500" : wh.status === "manual_review" ? "bg-purple-500" : "bg-blue-500"}`} />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{wh.event}</p>
                      <p className="text-xs text-muted-foreground">{new Date(wh.time).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className={`${statusColors[wh.status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"} text-xs`}>{wh.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Manual Review Dialog */}
        <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-purple-500" />
                Manual Review — {reviewPayment?.id}
              </DialogTitle>
              <DialogDescription>
                User: {reviewPayment?.username} • Amount: ${reviewPayment?.amount.toFixed(2)} {reviewPayment?.currency} • Chain: {reviewPayment?.chain}
              </DialogDescription>
            </DialogHeader>
            <div className="rounded border border-border bg-background/50 p-3 text-sm text-muted-foreground">
              <p>This payment was flagged for manual review due to an underpaid amount detected by the payment provider. Please verify the transaction on-chain before approving.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialog(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => setReviewDialog(null)}>Reject</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setReviewDialog(null)}>Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}