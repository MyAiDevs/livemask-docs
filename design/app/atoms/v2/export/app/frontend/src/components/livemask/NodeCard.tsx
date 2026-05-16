import { Globe, Signal, Server, Star, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NodeCardProps {
  id: number;
  region: string;
  city: string;
  countryCode: string;
  latency: number;
  load: number;
  protocol: string;
  status: string;
  isFree: boolean;
  isFavorite?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onToggleFavorite?: () => void;
}

const statusColors: Record<string, string> = {
  healthy: 'bg-green-500',
  busy: 'bg-amber-500',
  degraded: 'bg-red-400',
};

const statusLabels: Record<string, string> = {
  healthy: 'Healthy',
  busy: 'Busy',
  degraded: 'Degraded',
};

function getLatencyColor(latency: number) {
  if (latency < 60) return 'text-green-600';
  if (latency < 100) return 'text-amber-600';
  return 'text-red-500';
}

function getLoadColor(load: number) {
  if (load < 50) return 'text-green-600';
  if (load < 80) return 'text-amber-600';
  return 'text-red-500';
}

export default function NodeCard({
  city,
  countryCode,
  latency,
  load,
  protocol,
  status,
  isFree,
  isFavorite = false,
  isSelected = false,
  onSelect,
  onToggleFavorite,
}: NodeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 rounded-lg border transition-all',
        isSelected
          ? 'border-[hsl(174,62%,32%)] bg-[hsl(174,62%,95%)] shadow-sm'
          : 'border-border bg-card hover:border-[hsl(174,62%,32%)]/40 hover:shadow-sm'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{city}</span>
              <span className="text-xs text-muted-foreground uppercase">
                {countryCode}
              </span>
              {isFree && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Free
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Signal className="h-3 w-3" />
                <span className={getLatencyColor(latency)}>{latency}ms</span>
              </span>
              <span className="flex items-center gap-1">
                <Server className="h-3 w-3" />
                <span className={getLoadColor(load)}>{load}%</span>
              </span>
              <span>{protocol}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', statusColors[status] || 'bg-gray-400')} />
            <span className="text-xs text-muted-foreground">
              {statusLabels[status] || status}
            </span>
          </div>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-1 hover:bg-muted rounded"
            >
              {isFavorite ? (
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>
    </button>
  );
}