import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Server,
  CreditCard,
  Settings,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Shield,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/users", label: "Users", icon: Users },
  { path: "/nodes", label: "Nodes", icon: Server },
  { path: "/config", label: "Config", icon: Settings },
  { path: "/payments", label: "Payments", icon: CreditCard },
  { path: "/revenue", label: "Revenue", icon: CreditCard },
  { path: "/feedback", label: "Feedback", icon: MessageSquare },
  { path: "/audit-logs", label: "Audit", icon: FileText },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-sidebar-background transition-all duration-300",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-500" />
              <span className="text-sm font-bold text-foreground">LiveMask Admin</span>
            </div>
          )}
          {collapsed && <Shield className="mx-auto h-5 w-5 text-teal-500" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          <Link
            to="/website"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Globe className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Public Website</span>}
          </Link>
          {!collapsed && (
            <div className="px-3 pt-2 text-xs text-muted-foreground">
              <p>LiveMask Admin v1.0</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}