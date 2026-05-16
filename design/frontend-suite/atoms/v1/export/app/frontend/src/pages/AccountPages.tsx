import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, User, Smartphone, Monitor, Lock, CreditCard, CheckCircle, AlertTriangle, Plus, Trash2, ArrowLeft } from "lucide-react";

function PortalLayout({ children, title, backTo }: { children: React.ReactNode; title: string; backTo?: string }) {
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
            <Link to="/support" className="text-muted-foreground hover:text-foreground">Support</Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">Logout</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

export function AccountPage() {
  return (
    <PortalLayout title="Account">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, security, and devices</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
            <TabsTrigger value="devices" className="text-xs">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-teal-500/10 p-4">
                    <User className="h-8 w-8 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">alice@example.com</p>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs mt-1">Premium Plan</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">User ID:</span> <span className="text-foreground font-mono">usr_001</span></div>
                  <div><span className="text-muted-foreground">Member since:</span> <span className="text-foreground">Dec 2025</span></div>
                  <div><span className="text-muted-foreground">Plan:</span> <span className="text-foreground">Premium Monthly</span></div>
                  <div><span className="text-muted-foreground">Devices:</span> <span className="text-foreground">3 / 5</span></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-medium text-foreground">Security Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded border border-border bg-background/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="text-sm text-foreground">Password</p>
                        <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7">Change</Button>
                  </div>
                  <div className="flex items-center justify-between rounded border border-border bg-background/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">Two-Factor Authentication</p>
                        <p className="text-xs text-muted-foreground">Not enabled</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7">Enable</Button>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-foreground pt-2">Recent Login Activity</h3>
                <div className="space-y-2">
                  {[
                    { device: "iPhone 15 Pro", location: "New York, US", time: "Today, 10:30 AM", current: true },
                    { device: "MacBook Pro", location: "New York, US", time: "Yesterday, 8:15 PM", current: false },
                    { device: "iPad Air", location: "Boston, US", time: "May 14, 3:00 PM", current: false },
                  ].map((login, i) => (
                    <div key={i} className="flex items-center justify-between text-xs rounded border border-border bg-background/50 px-3 py-2">
                      <span className="text-foreground">{login.device}</span>
                      <span className="text-muted-foreground">{login.location}</span>
                      <span className="text-muted-foreground">{login.time}</span>
                      {login.current && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Current</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <DevicesSection />
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}

function DevicesSection() {
  const [revokeDialog, setRevokeDialog] = useState<string | null>(null);
  const devices = [
    { id: "dev_001", name: "iPhone 15 Pro", platform: "iOS 17.4", appVersion: "2.4.1", lastActive: "Now", trusted: true },
    { id: "dev_002", name: "MacBook Pro", platform: "macOS 14.3", appVersion: "2.4.1", lastActive: "2h ago", trusted: true },
    { id: "dev_003", name: "iPad Air", platform: "iPadOS 17.4", appVersion: "2.4.0", lastActive: "2 days ago", trusted: false },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">3 of 5 device slots used</p>
        </div>
        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7">
          <Plus className="h-3 w-3 mr-1" /> Add Device
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">Device</TableHead>
                <TableHead className="text-muted-foreground text-xs">Platform</TableHead>
                <TableHead className="text-muted-foreground text-xs">App Version</TableHead>
                <TableHead className="text-muted-foreground text-xs">Last Active</TableHead>
                <TableHead className="text-muted-foreground text-xs">Trust</TableHead>
                <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((dev) => (
                <TableRow key={dev.id} className="border-border hover:bg-muted/50">
                  <TableCell className="flex items-center gap-2">
                    {dev.platform.includes("iOS") || dev.platform.includes("iPad") ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : <Monitor className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm text-foreground">{dev.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{dev.platform}</TableCell>
                  <TableCell className="text-xs font-mono text-blue-400">{dev.appVersion}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{dev.lastActive}</TableCell>
                  <TableCell>{dev.trusted ? <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Trusted</Badge> : <Badge variant="outline" className="text-xs">Untrusted</Badge>}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setRevokeDialog(dev.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!revokeDialog} onOpenChange={() => setRevokeDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Revoke Device</DialogTitle>
            <DialogDescription>This device will be signed out and removed from your account. You can re-add it later if needed.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setRevokeDialog(null)}>Revoke Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function BillingPage() {
  return (
    <PortalLayout title="Billing">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">Manage your subscription and payment history</p>
        </div>

        {/* Current Subscription */}
        <Card className="bg-card border-border border-teal-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-5 w-5 text-teal-500" />
                  <h3 className="text-lg font-medium text-foreground">Premium Monthly</h3>
                </div>
                <p className="text-sm text-muted-foreground">$9.99/month • Renews May 30, 2026</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Active</Badge>
                  <span className="text-xs text-muted-foreground">5 devices • All nodes • WireGuard</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" className="text-xs h-7">Change Plan</Button>
                <Button size="sm" variant="outline" className="text-xs h-7 text-amber-400 border-amber-500/30">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Available Plans</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "Free", price: "$0", period: "/mo", features: ["1 device", "3 nodes", "Basic speed"], current: false },
              { name: "Premium", price: "$9.99", period: "/mo", features: ["5 devices", "All nodes", "Max speed", "WireGuard"], current: true },
              { name: "Enterprise", price: "$49.99", period: "/mo", features: ["Unlimited", "Dedicated nodes", "SLA", "Admin"], current: false },
            ].map((plan) => (
              <Card key={plan.name} className={`bg-card border-border ${plan.current ? "ring-1 ring-teal-500/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{plan.name}</h4>
                    {plan.current && <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-xs">Current</Badge>}
                  </div>
                  <p className="text-2xl font-bold text-foreground">{plan.price}<span className="text-sm text-muted-foreground font-normal">{plan.period}</span></p>
                  <div className="mt-3 space-y-1.5">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-teal-500" />{f}
                      </div>
                    ))}
                  </div>
                  {!plan.current && <Button size="sm" variant="outline" className="w-full mt-3 text-xs h-7">Select</Button>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Payment History</h3>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Description</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Amount</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Method</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { date: "May 15, 2026", desc: "Premium Monthly", amount: "$9.99", method: "USDT (TRC-20)", status: "Paid" },
                    { date: "Apr 15, 2026", desc: "Premium Monthly", amount: "$9.99", method: "USDT (TRC-20)", status: "Paid" },
                    { date: "Mar 15, 2026", desc: "Premium Monthly", amount: "$9.99", method: "USDT (TRC-20)", status: "Paid" },
                  ].map((tx, i) => (
                    <TableRow key={i} className="border-border hover:bg-muted/50">
                      <TableCell className="text-xs text-muted-foreground">{tx.date}</TableCell>
                      <TableCell className="text-sm text-foreground">{tx.desc}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{tx.amount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.method}</TableCell>
                      <TableCell><Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">{tx.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

export function SettingsPage() {
  return (
    <PortalLayout title="Admin Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>
          <p className="text-sm text-muted-foreground">Roles, permissions, and operational settings</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-sm font-medium">Roles and Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Role</TableHead>
                  <TableHead className="text-muted-foreground text-xs">URI Prefix</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Audience</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { role: "System Admin", prefix: "/admin/system/*", audience: "Platform super admins", members: 2 },
                  { role: "Operations Admin", prefix: "/admin/ops/*", audience: "Operations and support", members: 4 },
                  { role: "Finance Admin", prefix: "/admin/finance/*", audience: "Finance reviewers", members: 2 },
                  { role: "Sponsor Ambassador", prefix: "/sponsor/*", audience: "Node sponsors", members: 6 },
                  { role: "Promotion Ambassador", prefix: "/ambassador/*", audience: "Promotion ambassadors", members: 5 },
                ].map((r, i) => (
                  <TableRow key={i} className="border-border hover:bg-muted/50">
                    <TableCell className="text-sm font-medium text-foreground">{r.role}</TableCell>
                    <TableCell className="text-xs font-mono text-blue-400">{r.prefix}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.audience}</TableCell>
                    <TableCell className="text-sm text-foreground">{r.members}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-sm font-medium">Revenue Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">URI Prefix</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Action</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Permission Key</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { prefix: "/admin/finance/*", action: "View all sponsor revenue", perm: "revenue.read_all" },
                  { prefix: "/admin/finance/*", action: "Edit revenue config", perm: "revenue.config.write" },
                  { prefix: "/admin/finance/*", action: "Publish revenue config", perm: "revenue.config.publish" },
                  { prefix: "/admin/finance/*", action: "Run calculation", perm: "revenue.calculate.run" },
                  { prefix: "/admin/finance/*", action: "Run traceback", perm: "revenue.traceback.run" },
                  { prefix: "/admin/finance/*", action: "Approve payout adjustment", perm: "revenue.adjustment.approve" },
                  { prefix: "/sponsor/*", action: "View own sponsor revenue", perm: "sponsor.revenue.read_own" },
                  { prefix: "/ambassador/*", action: "View own commission", perm: "ambassador.commission.read_own" },
                ].map((p, i) => (
                  <TableRow key={i} className="border-border hover:bg-muted/50">
                    <TableCell className="text-xs font-mono text-blue-400">{p.prefix}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.action}</TableCell>
                    <TableCell className="text-xs font-mono text-foreground">{p.perm}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}