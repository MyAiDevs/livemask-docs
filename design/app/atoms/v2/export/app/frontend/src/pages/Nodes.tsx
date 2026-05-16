import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Sparkles, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import NodeCard from '@/components/livemask/NodeCard';
import AppLayout from '@/components/livemask/AppLayout';
import { useConnectionStore } from '@/lib/connection-store';
import { client } from '@/lib/api';

interface VpnNode {
  id: number;
  region: string;
  city: string;
  country_code: string;
  latency: number;
  load: number;
  protocol: string;
  status: string;
  is_free: boolean;
}

const regions = ['All', 'Asia Pacific', 'Europe', 'North America', 'South America', 'Middle East'];

export default function Nodes() {
  const navigate = useNavigate();
  const { selectedNode, setSelectedNode, setStatus } = useConnectionStore();
  const [nodes, setNodes] = useState<VpnNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    async function fetchNodes() {
      try {
        setLoading(true);
        const res = await client.entities.vpn_nodes.query({
          query: {},
          limit: 50,
          sort: 'latency',
        });
        if (res?.data?.items) {
          const filtered = (res.data.items as VpnNode[]).filter(
            (n) => n.status !== 'quarantine'
          );
          setNodes(filtered);
          localStorage.setItem('livemask_cached_nodes', JSON.stringify(filtered));
          setIsStale(false);
        }
      } catch {
        // Try cached nodes
        const cached = localStorage.getItem('livemask_cached_nodes');
        if (cached) {
          setNodes(JSON.parse(cached));
          setIsStale(true);
        } else {
          setError('Unable to load nodes. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchNodes();

    // Load favorites
    const savedFavs = localStorage.getItem('livemask_favorites');
    if (savedFavs) {
      setFavoriteIds(new Set(JSON.parse(savedFavs)));
    }
  }, []);

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesSearch =
        !search ||
        node.city.toLowerCase().includes(search.toLowerCase()) ||
        node.country_code.toLowerCase().includes(search.toLowerCase()) ||
        node.region.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = activeRegion === 'All' || node.region === activeRegion;
      return matchesSearch && matchesRegion;
    });
  }, [nodes, search, activeRegion]);

  const recommended = useMemo(() => {
    const healthy = nodes.filter((n) => n.status === 'healthy');
    if (healthy.length === 0) return null;
    return healthy.reduce((best, n) => (n.latency < best.latency ? n : best), healthy[0]);
  }, [nodes]);

  function handleSelectNode(node: VpnNode) {
    setSelectedNode({
      id: node.id,
      region: node.region,
      city: node.city,
      country_code: node.country_code,
      latency: node.latency,
      protocol: node.protocol,
    });
    setStatus('disconnected');
    navigate('/home');
  }

  function toggleFavorite(nodeId: number) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      localStorage.setItem('livemask_favorites', JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <AppLayout>
    <div className="min-h-screen bg-background pb-20 xl:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground mb-3">Nodes</h1>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search city, region, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Region Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={cn(
                'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                activeRegion === region
                  ? 'bg-[hsl(174,62%,32%)] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Filter className="h-3 w-3 inline mr-1" />
              {region}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        {isStale && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Showing cached nodes. Pull to refresh.</span>
          </div>
        )}

        {/* Recommended */}
        {recommended && activeRegion === 'All' && !search && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[hsl(174,62%,32%)]">
              <Sparkles className="h-3.5 w-3.5" />
              Recommended
            </div>
            <NodeCard
              id={recommended.id}
              region={recommended.region}
              city={recommended.city}
              countryCode={recommended.country_code}
              latency={recommended.latency}
              load={recommended.load}
              protocol={recommended.protocol}
              status={recommended.status}
              isFree={recommended.is_free}
              isFavorite={favoriteIds.has(recommended.id)}
              isSelected={selectedNode?.id === recommended.id}
              onSelect={() => handleSelectNode(recommended)}
              onToggleFavorite={() => toggleFavorite(recommended.id)}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-[hsl(174,62%,32%)] border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading nodes...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Favorites */}
        {!loading && !error && favoriteIds.size > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground pt-2">Favorites</p>
            {filteredNodes
              .filter((n) => favoriteIds.has(n.id))
              .map((node) => (
                <NodeCard
                  key={`fav-${node.id}`}
                  id={node.id}
                  region={node.region}
                  city={node.city}
                  countryCode={node.country_code}
                  latency={node.latency}
                  load={node.load}
                  protocol={node.protocol}
                  status={node.status}
                  isFree={node.is_free}
                  isFavorite={true}
                  isSelected={selectedNode?.id === node.id}
                  onSelect={() => handleSelectNode(node)}
                  onToggleFavorite={() => toggleFavorite(node.id)}
                />
              ))}
          </>
        )}

        {/* All Nodes */}
        {!loading && !error && (
          <>
            <p className="text-xs font-medium text-muted-foreground pt-2">
              All Nodes ({filteredNodes.length})
            </p>
            {filteredNodes.map((node) => (
              <NodeCard
                key={node.id}
                id={node.id}
                region={node.region}
                city={node.city}
                countryCode={node.country_code}
                latency={node.latency}
                load={node.load}
                protocol={node.protocol}
                status={node.status}
                isFree={node.is_free}
                isFavorite={favoriteIds.has(node.id)}
                isSelected={selectedNode?.id === node.id}
                onSelect={() => handleSelectNode(node)}
                onToggleFavorite={() => toggleFavorite(node.id)}
              />
            ))}
            {filteredNodes.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No nodes match your search.
              </p>
            )}
          </>
        )}
      </div>
    </div>
    </AppLayout>
  );
}