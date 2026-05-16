import { Power, Globe, CreditCard, Stethoscope, Settings, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useConnectionStore } from '@/lib/connection-store';

const navItems = [
  { path: '/home', label: 'Connect', icon: Power },
  { path: '/nodes', label: 'Nodes', icon: Globe },
  { path: '/plan', label: 'Plan', icon: CreditCard },
  { path: '/diagnostics', label: 'Diagnostics', icon: Stethoscope },
  { path: '/profile', label: 'Settings', icon: Settings },
];

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { status } = useConnectionStore();

  const statusColor =
    status === 'connected'
      ? 'bg-green-500'
      : status === 'connecting'
        ? 'bg-amber-500 animate-pulse'
        : status === 'degraded'
          ? 'bg-amber-500'
          : status === 'failed'
            ? 'bg-red-500'
            : 'bg-muted-foreground/40';

  return (
    <aside className="hidden xl:flex w-[240px] flex-col border-r border-border bg-card h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <Shield className="h-7 w-7 text-[hsl(174,62%,32%)]" strokeWidth={2} />
        <span className="font-bold text-lg text-foreground">LiveMask</span>
      </div>

      {/* Connection Status Indicator */}
      <div className="px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={cn('h-2.5 w-2.5 rounded-full', statusColor)} />
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {status === 'config_updating' ? 'Updating' : status}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/home' && location.pathname === '/');
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[hsl(174,62%,95%)] text-[hsl(174,62%,25%)] dark:bg-[hsl(174,40%,15%)] dark:text-[hsl(174,62%,70%)]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground">LiveMask v1.0.0</p>
        <p className="text-[10px] text-muted-foreground">Config v3.6.2</p>
      </div>
    </aside>
  );
}