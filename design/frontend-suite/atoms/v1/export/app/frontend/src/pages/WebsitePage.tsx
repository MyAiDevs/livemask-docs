import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Globe, Server, Gauge, Lock, CreditCard, Download, CheckCircle, Smartphone, Monitor, ChevronRight, Zap, Eye, Database, RefreshCw, MessageSquare } from "lucide-react";

function WebsiteNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-teal-500" />
          <span className="text-lg font-bold text-foreground">LiveMask</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#product" className="text-muted-foreground hover:text-foreground transition-colors">Product</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#download" className="text-muted-foreground hover:text-foreground transition-colors">Download</a>
          <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</a>
          <a href="#support" className="text-muted-foreground hover:text-foreground transition-colors">Support</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden md:block">Admin Login</Link>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">Get LiveMask</Button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section id="product" className="pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <Badge variant="outline" className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/20">Secure - Private - Reliable</Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">LiveMask Secure VPN</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Private, reliable network access with smart node selection, clear diagnostics, and a calm app experience.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
            <Download className="h-4 w-4 mr-2" /> Get LiveMask
          </Button>
          <Button size="lg" variant="outline">
            View Pricing <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-500" />
                <span className="font-medium text-foreground">LiveMask</span>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Connected</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="rounded-lg bg-background/80 p-3 text-center">
                <p className="text-xs text-muted-foreground">Latency</p>
                <p className="text-lg font-bold text-emerald-400">12ms</p>
              </div>
              <div className="rounded-lg bg-background/80 p-3 text-center">
                <p className="text-xs text-muted-foreground">Node</p>
                <p className="text-lg font-bold text-foreground">US-East</p>
              </div>
              <div className="rounded-lg bg-background/80 p-3 text-center">
                <p className="text-xs text-muted-foreground">Protocol</p>
                <p className="text-lg font-bold text-foreground">WireGuard</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[85%] bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Connection quality: Excellent</p>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3 text-left">
          {[
            { icon: Globe, title: "Smart Node Selection", desc: "Automatically connects to the fastest, most reliable node based on your location and network conditions." },
            { icon: Gauge, title: "Clear Diagnostics", desc: "Real-time connection quality metrics, latency monitoring, and transparent status reporting." },
            { icon: Lock, title: "Privacy-First Design", desc: "No browsing history in diagnostics. Encrypted local storage. Certificate pinning for secure connections." },
          ].map((f, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <f.icon className="h-8 w-8 text-teal-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">Choose the plan that fits your needs. Cancel anytime.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Free</CardTitle>
              <p className="text-3xl font-bold text-foreground">$0<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
            </CardHeader>
            <CardContent className="space-y-3">
              {["1 device", "3 node locations", "Basic speed", "Community support"].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-teal-500 shrink-0" />{f}
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-teal-500/50 ring-1 ring-teal-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Premium</CardTitle>
                <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20">Popular</Badge>
              </div>
              <p className="text-3xl font-bold text-foreground">$9.99<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
              <p className="text-xs text-muted-foreground">or $99.99/year (save 17%)</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {["5 devices", "All node locations", "Maximum speed", "WireGuard protocol", "Priority support", "Smart node selection"].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-teal-500 shrink-0" />{f}
                </div>
              ))}
              <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white">Get Premium</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Enterprise</CardTitle>
              <p className="text-3xl font-bold text-foreground">$49.99<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Unlimited devices", "Dedicated nodes", "Custom protocols", "SLA guarantee", "Dedicated support", "Admin dashboard"].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-teal-500 shrink-0" />{f}
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Payment via USDT (TRC-20, ERC-20), BTC, ETH. 7-day refund policy for annual plans.</p>
        </div>
      </div>
    </section>
  );
}

function DownloadSection() {
  return (
    <section id="download" className="py-20 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Download LiveMask</h2>
          <p className="text-muted-foreground">Available on all major platforms.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Smartphone className="h-10 w-10 text-teal-500 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">iOS</h3>
              <p className="text-xs text-muted-foreground mb-3">Version 2.4.1 - iOS 15+</p>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white w-full">App Store</Button>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Smartphone className="h-10 w-10 text-teal-500 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Android</h3>
              <p className="text-xs text-muted-foreground mb-3">Version 2.4.1 - Android 10+</p>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white w-full">Google Play</Button>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Monitor className="h-10 w-10 text-teal-500 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Desktop</h3>
              <p className="text-xs text-muted-foreground mb-3">Coming Soon - macOS and Windows</p>
              <Button size="sm" variant="outline" className="w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Release notes and SHA-256 checksums available for desktop builds</p>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="py-20 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Security and Privacy</h2>
          <p className="text-muted-foreground">Built with privacy at the core. No compromises.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {[
            { icon: Eye, title: "No Browsing History in Diagnostics", desc: "Our diagnostic system never captures, stores, or transmits your browsing history. Connection quality metrics are anonymized." },
            { icon: Database, title: "Encrypted Local Storage", desc: "All local app data is encrypted at rest using platform-native encryption APIs. Your settings and credentials are protected." },
            { icon: RefreshCw, title: "Dynamic Configuration", desc: "Configs are delivered securely with version control and integrity verification. No static secrets in the app binary." },
            { icon: Lock, title: "Certificate Pinning", desc: "TLS certificate pinning prevents man-in-the-middle attacks. Connections are verified against known certificates." },
            { icon: Zap, title: "Privacy-First Diagnostics", desc: "When you report an issue, we collect only connection metadata (latency, node, protocol) — never traffic content." },
            { icon: Shield, title: "WireGuard Protocol", desc: "Modern, audited protocol with minimal attack surface. Fast, secure, and battery-efficient on mobile devices." },
          ].map((f, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5 flex gap-4">
                <f.icon className="h-6 w-6 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            We do not claim to provide absolute anonymity. LiveMask provides reliable, private network access with strong security practices. For threat models requiring higher assurance, please evaluate accordingly.
          </p>
        </div>
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section id="support" className="py-20 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Support</h2>
          <p className="text-muted-foreground">We are here to help you get connected.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="connection" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">Connection Troubleshooting</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                If you are experiencing connection issues, try: 1) Switch to a different node. 2) Change protocol (WireGuard to OpenVPN or vice versa). 3) Check your network allows VPN traffic. 4) Update to the latest app version. 5) Restart the app.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="payment" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">Payment Help</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Payments are processed via cryptocurrency (USDT, BTC, ETH). Allow up to 15 minutes for blockchain confirmations. If your payment shows as expired, please create a new order. For underpaid transactions, contact support.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feedback" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">Submit Feedback</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Use the in-app feedback button to report bugs, request features, or submit complaints. Include your node, protocol, and app version for faster resolution.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="status" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">Service Status</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Check our status page for real-time node availability and any ongoing incidents. We post updates for planned maintenance and unexpected outages.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="contact" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">Contact Support</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Email: support@livemask.io. Response time: within 24 hours for free users, within 4 hours for Premium and Enterprise. Include your user ID and a description of the issue.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="py-10 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-500" />
          <span className="font-semibold text-foreground">LiveMask</span>
          <span className="text-xs text-muted-foreground ml-2">Secure VPN</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
          <a href="#" className="hover:text-foreground">Terms of Service</a>
          <a href="#" className="hover:text-foreground">Status Page</a>
        </div>
        <p className="text-xs text-muted-foreground">2026 LiveMask. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function WebsitePage() {
  return (
    <div className="min-h-screen bg-background">
      <WebsiteNav />
      <HeroSection />
      <PricingSection />
      <DownloadSection />
      <SecuritySection />
      <SupportSection />
      <FooterSection />
    </div>
  );
}