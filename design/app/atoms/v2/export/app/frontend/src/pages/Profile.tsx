import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Settings,
  MessageCircle,
  FileText,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Lock,
  Trash2,
  Globe,
  Palette,
  Wifi,
  AlertTriangle,
  BarChart3,
  Moon,
  Sun,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import AppLayout from '@/components/livemask/AppLayout';
import { client } from '@/lib/api';
import { useThemeStore } from '@/lib/theme-store';

interface SettingItem {
  icon: typeof User;
  label: string;
  description?: string;
  action?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  badge?: string;
  badgeColor?: string;
  destructive?: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [autoConnect, setAutoConnect] = useState(false);
  const [threatWarning, setThreatWarning] = useState(true);
  const [diagnosticSharing, setDiagnosticSharing] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await client.auth.me();
        if (user?.data) setIsLoggedIn(true);
      } catch { /* not logged in */ }
    }
    checkAuth();

    // Load settings from localStorage
    setAutoConnect(localStorage.getItem('livemask_auto_connect') === 'true');
    setThreatWarning(localStorage.getItem('livemask_threat_warning') !== 'false');
    setDiagnosticSharing(localStorage.getItem('livemask_diag_sharing') !== 'false');
  }, []);

  function handleToggle(key: string, value: boolean, setter: (v: boolean) => void) {
    setter(value);
    localStorage.setItem(`livemask_${key}`, String(value));
  }

  async function handleLogout() {
    try {
      await client.auth.logout();
    } catch { /* ignore */ }
    setIsLoggedIn(false);
    navigate('/', { replace: true });
  }

  async function handleLogin() {
    await client.auth.toLogin();
  }

  function clearCache() {
    localStorage.removeItem('livemask_cached_nodes');
    localStorage.removeItem('livemask_favorites');
    alert('Cached configuration cleared.');
  }

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        ...(isLoggedIn
          ? [
              {
                icon: User,
                label: 'Account',
                description: 'Manage your account',
                action: () => {},
              } as SettingItem,
            ]
          : [
              {
                icon: User,
                label: 'Sign In',
                description: 'Sign in to access all features',
                action: handleLogin,
              } as SettingItem,
            ]),
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: ShieldCheck,
          label: 'Certificate Pinning',
          badge: 'Active',
          badgeColor: 'bg-green-100 text-green-800',
        },
        {
          icon: Smartphone,
          label: 'Device Trust',
          badge: 'Verified',
          badgeColor: 'bg-green-100 text-green-800',
        },
        {
          icon: Lock,
          label: 'Local Data Protection',
          badge: 'Enabled',
          badgeColor: 'bg-[hsl(174,62%,95%)] text-[hsl(174,62%,25%)]',
        },
        {
          icon: Trash2,
          label: 'Clear Cached Config',
          description: 'Remove stored node and config data',
          action: clearCache,
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          icon: Globe,
          label: 'Language',
          description: 'English',
          action: () => {},
        },
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Dark Mode',
          description: theme === 'dark' ? 'Dark theme active' : 'Light theme active',
          toggle: true,
          toggleValue: theme === 'dark',
          onToggle: () => toggleTheme(),
        },
        {
          icon: Wifi,
          label: 'Auto Connect',
          description: 'Connect automatically on app launch',
          toggle: true,
          toggleValue: autoConnect,
          onToggle: (v) => handleToggle('auto_connect', v, setAutoConnect),
        },
        {
          icon: AlertTriangle,
          label: 'Threat Warnings',
          description: 'Show alerts for security threats',
          toggle: true,
          toggleValue: threatWarning,
          onToggle: (v) => handleToggle('threat_warning', v, setThreatWarning),
        },
        {
          icon: BarChart3,
          label: 'Diagnostic Sharing',
          description: 'Help improve LiveMask with anonymous data',
          toggle: true,
          toggleValue: diagnosticSharing,
          onToggle: (v) => handleToggle('diag_sharing', v, setDiagnosticSharing),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: MessageCircle,
          label: 'Send Diagnostic Report',
          action: () => navigate('/diagnostics'),
        },
        {
          icon: FileText,
          label: 'Privacy Policy',
          action: () => {},
        },
        {
          icon: FileText,
          label: 'Terms of Service',
          action: () => {},
        },
      ],
    },
    ...(isLoggedIn
      ? [
          {
            title: '',
            items: [
              {
                icon: LogOut,
                label: 'Sign Out',
                action: handleLogout,
                destructive: true,
              } as SettingItem,
            ],
          },
        ]
      : []),
  ];

  return (
    <AppLayout>
    <div className="min-h-screen bg-background pb-20 xl:pb-0">
      <header className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              {section.items.map((item, ii) => {
                const Icon = item.icon;
                return (
                  <button
                    key={ii}
                    onClick={item.toggle ? undefined : item.action}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      !item.toggle && 'hover:bg-muted/50',
                      item.destructive && 'text-red-500'
                    )}
                    disabled={!item.action && !item.toggle}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        item.destructive ? 'text-red-500' : 'text-muted-foreground'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          item.destructive ? 'text-red-500' : 'text-foreground'
                        )}
                      >
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.badge && (
                      <Badge className={cn('text-[10px]', item.badgeColor)}>
                        {item.badge}
                      </Badge>
                    )}
                    {item.toggle && item.onToggle && (
                      <Switch
                        checked={item.toggleValue}
                        onCheckedChange={item.onToggle}
                      />
                    )}
                    {!item.toggle && !item.badge && item.action && !item.destructive && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <p className="text-center text-xs text-muted-foreground pb-4">
          LiveMask v1.0.0 · Config v3.6.2
        </p>
      </div>
    </div>
    </AppLayout>
  );
}