import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';

export default function Splash() {
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState('Initializing...');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setStatusText('Checking session...');
        const user = await client.auth.me();

        if (cancelled) return;

        if (user?.data) {
          setStatusText('Loading configuration...');
          await new Promise((r) => setTimeout(r, 800));
          if (!cancelled) navigate('/home', { replace: true });
        } else {
          const hasOnboarded = localStorage.getItem('livemask_onboarded');
          if (!cancelled) {
            if (hasOnboarded) {
              navigate('/home', { replace: true });
            } else {
              navigate('/onboarding', { replace: true });
            }
          }
        }
      } catch {
        if (!cancelled) {
          const hasOnboarded = localStorage.getItem('livemask_onboarded');
          if (hasOnboarded) {
            navigate('/home', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        }
      }
    }

    const timer = setTimeout(init, 1200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-fade-up">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[hsl(174,62%,95%)] flex items-center justify-center">
            <Shield className="h-12 w-12 text-[hsl(174,62%,32%)]" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">LiveMask</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{statusText}</span>
        </div>
      </div>
    </div>
  );
}