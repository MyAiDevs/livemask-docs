import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShoppingCart, Wallet, AlertTriangle, Star, Gift, ArrowUpRight, ArrowDownLeft, MessageSquare, FileText, Bell, Plus, Clock, CheckCircle, XCircle } from "lucide-react";

function PortalLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/website" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-500" />
              <span className="text-sm font-bold text-foreground">LiveMask</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/account" className="text-muted-foreground hover:text-foreground">Account</Link>
            <Link to="/billing" className="text-muted-foreground hover:text-foreground">Billing</Link>
            <Link to="/market" className="text-muted-foreground hover:text-foreground">Market</Link>
            <Link to="/points" className="text-muted-foreground hover:text-foreground">Points</Link>
            <Link to="/support" className="text-muted-foreground hover:text-foreground">Support</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

export function MarketplacePage() {
  return (
    <PortalLayout title="C2C Marketplace">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
            <p className="text-sm text-muted-foreground">Buy and sell VPN credits, subscription time, and services</p>
          </div>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
            <Plus className="h-3 w-3 mr-1" /> Create Listing
          </Button>
        </div>

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="listings" className="text-xs">Listings</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs">My Orders</TabsTrigger>
            <TabsTrigger value="wallet" className="text-xs">Wallet</TabsTrigger>
            <TabsTrigger value="disputes" className="text-xs">Disputes</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs">Listing</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Seller</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Price</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Available</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Limits</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: "lst_001", title: "Premium 30-day code", seller: "trusted_seller", price: "$8.50", available: "12", limits: "1-3 per order", status: "available" },
                      { id: "lst_002", title: "Enterprise 7-day trial", seller: "vpn_deals", price: "$15.00", available: "5", limits: "1 per user", status: "available" },
                      { id: "lst_003", title: "Premium 90-day bundle", seller: "bulk_codes", price: "$24.99", available: "3", limits: "1-2 per order", status: "low_stock" },
                      { id: "lst_004", title: "Basic 30-day code", seller: "code_shop", price: "$3.50", available: "0", limits: "1-5 per order", status: "sold_out" },
                    ].map((listing) => (
                      <TableRow key={listing.id} className="border-border hover:bg-muted/50">
                        <TableCell className="text-sm text-foreground">{listing.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{listing.seller}</TableCell>
                        <TableCell className="text-sm font-medium text-foreground">{listing.price}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{listing.available}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{listing.limits}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${listing.status === "available" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : listing.status === "low_stock" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                            {listing.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="h-6 text-xs" disabled={listing.status === "sold_out"}>Buy</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    { id: "ord_001", listing: "Premium 30-day code", amount: "$8.50", date: "May 14, 2026", status: "completed", role: "buyer" },
                    { id: "ord_002", listing: "Basic 30-day code", amount: "$3.50", date: "May 10, 2026", status: "in_escrow", role: "buyer" },
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded border border-border bg-background/50 px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground">{order.listing}</p>
                        <p className="text-xs text-muted-foreground">{order.date} • {order.role}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{order.amount}</span>
                        <Badge variant="outline" className={`text-xs ${order.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-lg bg-teal-500/10 p-3">
                    <Wallet className="h-6 w-6 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">$12.00</p>
                    <p className="text-xs text-muted-foreground">Available Balance</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { desc: "Purchase: Premium 30-day code", amount: "-$8.50", date: "May 14", type: "debit" },
                    { desc: "Deposit: USDT (TRC-20)", amount: "+$20.50", date: "May 12", type: "credit" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between text-sm rounded border border-border bg-background/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        {tx.type === "credit" ? <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" /> : <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />}
                        <span className="text-foreground">{tx.desc}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{tx.date}</span>
                        <span className={`font-medium ${tx.type === "credit" ? "text-emerald-400" : "text-red-400"}`}>{tx.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground">No active disputes</p>
                <p className="text-xs text-muted-foreground mt-1">If you have an issue with an order, you can open a dispute from the order detail page.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}

export function PointsPage() {
  return (
    <PortalLayout title="Points">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Points</h1>
          <p className="text-sm text-muted-foreground">Earn and spend points across the LiveMask ecosystem</p>
        </div>

        {/* Balance */}
        <Card className="bg-card border-border border-teal-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-500/10 p-3">
                <Star className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">2,450</p>
                <p className="text-sm text-muted-foreground">Available Points</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">Pending: <span className="text-amber-400">150</span></p>
                <p className="text-xs text-muted-foreground">Expired this month: <span className="text-red-400">0</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
            <TabsTrigger value="earn" className="text-xs">Earn</TabsTrigger>
            <TabsTrigger value="spend" className="text-xs">Spend</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Description</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Points</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { date: "May 16", desc: "Daily login bonus", points: "+10", status: "credited" },
                      { date: "May 15", desc: "Referral: bob_dev subscribed", points: "+200", status: "credited" },
                      { date: "May 15", desc: "Daily login bonus", points: "+10", status: "credited" },
                      { date: "May 14", desc: "Spent: 1-day Premium extension", points: "-100", status: "spent" },
                      { date: "May 14", desc: "Feedback submitted", points: "+50", status: "pending" },
                      { date: "May 13", desc: "Daily login bonus", points: "+10", status: "credited" },
                    ].map((tx, i) => (
                      <TableRow key={i} className="border-border hover:bg-muted/50">
                        <TableCell className="text-xs text-muted-foreground">{tx.date}</TableCell>
                        <TableCell className="text-sm text-foreground">{tx.desc}</TableCell>
                        <TableCell className={`text-sm font-medium ${tx.points.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{tx.points}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${tx.status === "credited" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : tx.status === "spent" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earn">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Gift, title: "Daily Login", desc: "Log in every day to earn 10 points", reward: "+10/day" },
                { icon: MessageSquare, title: "Submit Feedback", desc: "Report bugs or suggest features", reward: "+50/report" },
                { icon: Star, title: "Refer a Friend", desc: "Earn points when they subscribe", reward: "+200/referral" },
                { icon: ShoppingCart, title: "Marketplace Activity", desc: "Complete C2C transactions", reward: "+25/order" },
              ].map((source, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="rounded-lg bg-amber-500/10 p-2">
                      <source.icon className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{source.title}</p>
                      <p className="text-xs text-muted-foreground">{source.desc}</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">{source.reward}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="spend">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { title: "1-Day Premium Extension", cost: "100 pts", available: true },
                { title: "7-Day Premium Extension", cost: "600 pts", available: true },
                { title: "Marketplace Credit ($1)", cost: "200 pts", available: true },
                { title: "Priority Support Ticket", cost: "150 pts", available: true },
              ].map((item, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.cost}</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7">Redeem</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}

export function SupportPage() {
  return (
    <PortalLayout title="Support">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support</h1>
            <p className="text-sm text-muted-foreground">Get help, submit tickets, and view diagnostics</p>
          </div>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
            <Plus className="h-3 w-3 mr-1" /> New Ticket
          </Button>
        </div>

        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="tickets" className="text-xs">Tickets</TabsTrigger>
            <TabsTrigger value="diagnostics" className="text-xs">Diagnostics</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs">Ticket</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Subject</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Created</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                      <TableHead className="text-muted-foreground text-xs">Last Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: "TKT-001", subject: "Connection drops on WiFi", created: "May 16", status: "open", lastUpdate: "Awaiting response" },
                      { id: "TKT-002", subject: "Payment not reflected", created: "May 14", status: "resolved", lastUpdate: "Resolved by support" },
                      { id: "TKT-003", subject: "Cannot add 5th device", created: "May 10", status: "closed", lastUpdate: "Resolved" },
                    ].map((ticket) => (
                      <TableRow key={ticket.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-mono text-xs text-blue-400">{ticket.id}</TableCell>
                        <TableCell className="text-sm text-foreground">{ticket.subject}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{ticket.created}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${ticket.status === "open" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : ticket.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{ticket.lastUpdate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnostics">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-medium">Historical Diagnostic Reports</CardTitle>
                <p className="text-xs text-muted-foreground">Reports sent from the LiveMask app. Live tunnel diagnostics are available in-app only.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { id: "diag_001", date: "May 16, 10:30 AM", node: "AP-East-1", issue: "High latency (145ms)", protocol: "OpenVPN" },
                    { id: "diag_002", date: "May 15, 3:00 PM", node: "US-East-1", issue: "Reconnection failure", protocol: "WireGuard" },
                    { id: "diag_003", date: "May 13, 8:45 AM", node: "EU-West-1", issue: "Slow throughput", protocol: "WireGuard" },
                  ].map((report) => (
                    <div key={report.id} className="flex items-center justify-between rounded border border-border bg-background/50 px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground">{report.issue}</p>
                        <p className="text-xs text-muted-foreground">{report.date} • {report.node} • {report.protocol}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs h-7"><FileText className="h-3 w-3 mr-1" /> View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-medium">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Service status updates", enabled: true },
                  { label: "Payment confirmations", enabled: true },
                  { label: "Subscription renewal reminders", enabled: true },
                  { label: "Security alerts", enabled: true },
                  { label: "Product updates and news", enabled: false },
                  { label: "Marketplace activity", enabled: false },
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between rounded border border-border bg-background/50 px-4 py-2.5">
                    <span className="text-sm text-foreground">{pref.label}</span>
                    <Badge variant="outline" className={`text-xs ${pref.enabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                      {pref.enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border mt-4">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-medium">Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { title: "Payment confirmed", desc: "Your Premium Monthly subscription has been renewed.", time: "2h ago", read: true },
                    { title: "Node maintenance", desc: "SA-East-1 will undergo maintenance on May 17.", time: "5h ago", read: false },
                    { title: "Security alert", desc: "New device login from MacBook Pro.", time: "1d ago", read: true },
                  ].map((msg, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded border border-border px-4 py-3 ${!msg.read ? "bg-blue-500/5 border-blue-500/20" : "bg-background/50"}`}>
                      <Bell className={`h-4 w-4 shrink-0 ${!msg.read ? "text-blue-400" : "text-muted-foreground"}`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{msg.title}</p>
                        <p className="text-xs text-muted-foreground">{msg.desc}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{msg.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}