import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Power, Globe, Gauge, Lock, Settings, FileText, ArrowRightLeft, RotateCcw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useConnectionStore } from '@/lib/connection-store';
import type { ConnectionState } from '@/lib/connection-store';
import ConnectionStatusDisplay from '@/components/livemask/ConnectionStatus';
import SpeedTestPanel from '@/components/livemask/SpeedTestPanel';
import AppLayout from '@/components/livemask/AppLayout';
import { client } from '@/lib/api';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const actionConfig: Record<
  ConnectionState,
  { label: string; action: string; variant: 'default' | 'destructive' | 'outline' }
> = {
  disconnected: { label: 'Connect', action: 'connect', variant: 'default' },
  connecting: { label: 'Cancel', action: 'disconnect', variant: 'outline' },
  connected: { label: 'Disconnect', action: 'disconnect', variant: 'destructive' },
  degraded: { label: 'Switch Node', action: 'switch', variant: 'outline' },
  failed: { label: 'Retry', action: 'retry', variant: 'default' },
  config_updating: { label: 'Retry', action: 'retry', variant: 'outline' },
};

export default function Home() {
  const navigate = useNavigate();
  const {
    status,
    selectedNode,
    sessionStart,
    errorMessage,
    errorCode,
    configVersion,
    connect,
    disconnect,
    retry,
  } = useConnectionStore();

  const [duration, setDuration] = useState('00:00:00');
  const [planName, setPlanName] = useState('Free');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      try {
        const user = await client.auth.me();
        if (!cancelled && user?.data) {
          setIsLoggedIn(true);
          // Try to get user subscription
          try {
            const subRes = await client.entities.user_subscriptions.query({ query: {}, limit: 1 });
            if (subRes?.data?.items?.length > 0) {
              const sub = subRes.data.items[0];
              // Get plan details
              try {
                const planRes = await client.entities.subscription_plans.get({ id: String(sub.plan_id) });
                if (planRes?.data?.name) {
                  setPlanName(planRes.data.name);
                }
              } catch { /* use default */ }
            }
          } catch { /* use default */ }
        }
      } catch { /* not logged in */ }
    }
    checkAuth();
    return () => { cancelled = true; };
  }, []);

  // Duration timer
  useEffect(() => {
    if (!sessionStart || (status !== 'connected' && status !== 'degraded')) {
      setDuration('00:00:00');
      return;
    }
    const interval = setInterval(() => {
      setDuration(formatDuration(Date.now() - sessionStart));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart, status]);

  const handleAction = useCallback(() => {
    const config = actionConfig[status];
    switch (config.action) {
      case 'connect':
        if (!selectedNode) {
          navigate('/nodes');
          return;
        }
        connect();
        break;
      case 'disconnect':
        disconnect();
        break;
      case 'retry':
        retry();
        break;
      case 'switch':
        navigate('/nodes');
        break;
    }
  }, [status, selectedNode, connect, disconnect, retry, navigate]);

  const handleLogin = useCallback(async () => {
    await client.auth.toLogin();
  }, []);

  const config = actionConfig[status];

  return (
    <AppLayout>
    <div className="min-h-screen bg-background pb-20 xl:pb-0">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[hsl(174,62%,32%)]" strokeWidth={2} />
          <span className="font-bold text-lg text-foreground">LiveMask</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              'text-xs font-medium',
              planName === 'Premium' && 'bg-amber-100 text-amber-800',
              planName === 'Pro' && 'bg-[hsl(174,62%,95%)] text-[hsl(174,62%,25%)]'
            )}
          >
            {planName}
          </Badge>
          <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-muted rounded-lg">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="max-w-sm mx-auto px-4 pt-8">
        {/* Login prompt for unauthenticated users */}
        {!isLoggedIn && (
          <div className="mb-6 p-3 rounded-lg bg-[hsl(174,62%,95%)] border border-[hsl(174,62%,32%)]/20">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[hsl(174,62%,25%)]">Sign in for full access</p>
              <Button
                size="sm"
                onClick={handleLogin}
                className="bg-[hsl(174,62%,32%)] hover:bg-[hsl(174,62%,28%)] text-white text-xs h-7"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex flex-col items-center py-6">
          <ConnectionStatusDisplay status={status} />
        </div>

        {/* Selected Node */}
        {selectedNode ? (
          <button
            onClick={() => navigate('/nodes')}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-[hsl(174,62%,32%)]/40 transition-colors mb-4"
          >
            <Globe className="h-5 w-5 text-[hsl(174,62%,32%)]" />
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-foreground">
                {selectedNode.city}, {selectedNode.country_code}
              </p>
              <p className="text-xs text-muted-foreground">{selectedNode.region}</p>
            </div>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : (
          <button
            onClick={() => navigate('/nodes')}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-[hsl(174,62%,32%)]/40 transition-colors mb-4"
          >
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Select a node to connect</span>
          </button>
        )}

        {/* Primary Action Button */}
        <Button
          onClick={handleAction}
          variant={config.variant}
          className={cn(
            'w-full h-14 text-base font-semibold rounded-xl',
            config.variant === 'default' &&
              'bg-[hsl(174,62%,32%)] hover:bg-[hsl(174,62%,28%)] text-white',
            config.variant === 'destructive' &&
              'bg-red-500 hover:bg-red-600 text-white'
          )}
        >
          <Power className="h-5 w-5 mr-2" />
          {config.label}
        </Button>

        {/* Error Banner */}
        {errorMessage && (status === 'failed' || status === 'degraded') && (
          <div
            className={cn(
              'mt-4 p-3 rounded-lg border',
              status === 'failed'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            )}
          >
            <p className="text-sm font-medium">{errorMessage}</p>
            {errorCode && (
              <p className="text-xs mt-1 opacity-70">Error code: {errorCode}</p>
            )}
            <div className="flex gap-2 mt-3">
              {status === 'failed' && (
                <>
                  <Button size="sm" variant="outline" onClick={retry} className="text-xs h-7">
                    <RotateCcw className="h-3 w-3 mr-1" /> Retry
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/nodes')} className="text-xs h-7">
                    <ArrowRightLeft className="h-3 w-3 mr-1" /> Switch Node
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/diagnostics')} className="text-xs h-7">
                    <MessageCircle className="h-3 w-3 mr-1" /> Report
                  </Button>
                </>
              )}
              {status === 'degraded' && (
                <Button size="sm" variant="outline" onClick={() => navigate('/nodes')} className="text-xs h-7">
                  <ArrowRightLeft className="h-3 w-3 mr-1" /> Switch Node
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Gauge className="h-3.5 w-3.5" />
              <span className="text-xs">Latency</span>
            </div>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {selectedNode ? `${selectedNode.latency}ms` : '—'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Lock className="h-3.5 w-3.5" />
              <span className="text-xs">Protocol</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {selectedNode?.protocol || '—'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Power className="h-3.5 w-3.5" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="text-lg font-semibold tabular-nums text-foreground">{duration}</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs">Config</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{configVersion}</p>
          </div>
        </div>

        {/* Speed Test */}
        <SpeedTestPanel isConnected={status === 'connected' || status === 'degraded'} />
      </div>
    </div>
    </AppLayout>
  );
}