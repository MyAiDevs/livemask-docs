import { Shield, ShieldCheck, ShieldAlert, ShieldX, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConnectionState } from '@/lib/connection-store';

interface ConnectionStatusProps {
  status: ConnectionState;
}

const statusConfig: Record<
  ConnectionState,
  {
    icon: typeof Shield;
    label: string;
    description: string;
    colorClass: string;
    bgClass: string;
    ringClass: string;
  }
> = {
  disconnected: {
    icon: Shield,
    label: 'Disconnected',
    description: 'Your connection is not protected.',
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    ringClass: 'ring-muted-foreground/20',
  },
  connecting: {
    icon: Loader2,
    label: 'Connecting',
    description: 'Finding the best secure route...',
    colorClass: 'text-[hsl(174,62%,32%)]',
    bgClass: 'bg-[hsl(174,62%,95%)]',
    ringClass: 'ring-[hsl(174,62%,32%)]/20',
  },
  connected: {
    icon: ShieldCheck,
    label: 'Connected',
    description: 'Your connection is protected.',
    colorClass: 'text-[hsl(142,71%,45%)]',
    bgClass: 'bg-green-50',
    ringClass: 'ring-green-500/20',
  },
  degraded: {
    icon: ShieldAlert,
    label: 'Degraded',
    description: 'This node is slower than usual.',
    colorClass: 'text-[hsl(38,92%,50%)]',
    bgClass: 'bg-amber-50',
    ringClass: 'ring-amber-500/20',
  },
  failed: {
    icon: ShieldX,
    label: 'Failed',
    description: 'We could not connect to this node.',
    colorClass: 'text-[hsl(0,84%,60%)]',
    bgClass: 'bg-red-50',
    ringClass: 'ring-red-500/20',
  },
  config_updating: {
    icon: RefreshCw,
    label: 'Updating Config',
    description: 'Using the last verified configuration.',
    colorClass: 'text-[hsl(174,62%,32%)]',
    bgClass: 'bg-[hsl(174,62%,95%)]',
    ringClass: 'ring-[hsl(174,62%,32%)]/20',
  },
};

export default function ConnectionStatusDisplay({ status }: ConnectionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isAnimating = status === 'connecting' || status === 'config_updating';

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          'relative flex items-center justify-center w-32 h-32 rounded-full ring-4',
          config.bgClass,
          config.ringClass
        )}
      >
        {(status === 'connecting' || status === 'connected') && (
          <div
            className={cn(
              'absolute inset-0 rounded-full',
              status === 'connecting' && 'animate-pulse-ring bg-[hsl(174,62%,32%)]/10',
              status === 'connected' && 'animate-pulse-ring bg-green-500/10'
            )}
          />
        )}
        <Icon
          className={cn(
            'h-14 w-14 relative z-10',
            config.colorClass,
            isAnimating && status === 'connecting' && 'animate-spin'
          )}
          strokeWidth={1.5}
        />
      </div>
      <div className="text-center">
        <h2 className={cn('text-xl font-bold', config.colorClass)}>
          {config.label}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
      </div>
    </div>
  );
}