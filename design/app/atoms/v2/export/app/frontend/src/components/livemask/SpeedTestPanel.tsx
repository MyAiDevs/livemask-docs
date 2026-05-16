import { useState, useCallback, useRef, useEffect } from 'react';
import { Activity, ArrowDown, ArrowUp, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SpeedGauge from './SpeedGauge';

type TestPhase = 'idle' | 'download' | 'upload' | 'complete';

interface SpeedResult {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
}

// Simulate realistic speed test with fluctuations
function simulateSpeed(baseSpeed: number, variance: number): number {
  const fluctuation = (Math.random() - 0.5) * 2 * variance;
  return Math.max(0.5, baseSpeed + fluctuation);
}

export default function SpeedTestPanel({ isConnected }: { isConnected: boolean }) {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [currentDownload, setCurrentDownload] = useState(0);
  const [currentUpload, setCurrentUpload] = useState(0);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startTest = useCallback(() => {
    if (!isConnected) return;

    setPhase('download');
    setCurrentDownload(0);
    setCurrentUpload(0);
    setResult(null);
    setProgress(0);

    // Simulate download test (3 seconds)
    const downloadBase = 45 + Math.random() * 80; // 45-125 Mbps
    const uploadBase = 15 + Math.random() * 40; // 15-55 Mbps
    const ping = Math.floor(12 + Math.random() * 35);
    const jitter = Math.floor(2 + Math.random() * 8);

    let step = 0;
    const totalDownloadSteps = 30;
    const totalUploadSteps = 25;

    // Download phase
    intervalRef.current = setInterval(() => {
      step++;
      const rampUp = Math.min(1, step / 8); // Ramp up over first 8 steps
      const speed = simulateSpeed(downloadBase * rampUp, downloadBase * 0.15);
      setCurrentDownload(speed);
      setProgress((step / (totalDownloadSteps + totalUploadSteps)) * 100);

      if (step >= totalDownloadSteps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const finalDownload = downloadBase + (Math.random() - 0.5) * 10;
        setCurrentDownload(finalDownload);

        // Switch to upload phase
        setPhase('upload');
        step = 0;

        timeoutRef.current = setTimeout(() => {
          intervalRef.current = setInterval(() => {
            step++;
            const rampUp = Math.min(1, step / 6);
            const speed = simulateSpeed(uploadBase * rampUp, uploadBase * 0.12);
            setCurrentUpload(speed);
            setProgress(((totalDownloadSteps + step) / (totalDownloadSteps + totalUploadSteps)) * 100);

            if (step >= totalUploadSteps) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              const finalUpload = uploadBase + (Math.random() - 0.5) * 8;
              setCurrentUpload(finalUpload);
              setProgress(100);

              setResult({
                download: finalDownload,
                upload: finalUpload,
                ping,
                jitter,
              });
              setPhase('complete');
            }
          }, 100);
        }, 300);
      }
    }, 100);
  }, [isConnected]);

  const maxGaugeValue = 150;

  return (
    <div className="mt-6 p-4 rounded-xl bg-card border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[hsl(174,62%,32%)]" />
          <span className="text-sm font-semibold text-foreground">Speed Test</span>
        </div>
        {phase !== 'idle' && phase !== 'complete' && (
          <Badge phase={phase} progress={progress} />
        )}
      </div>

      {/* Gauges */}
      {phase !== 'idle' || result ? (
        <div className="flex justify-center gap-4">
          <SpeedGauge
            value={phase === 'complete' && result ? result.download : currentDownload}
            maxValue={maxGaugeValue}
            label="Download"
            isActive={phase === 'download'}
          />
          <SpeedGauge
            value={phase === 'complete' && result ? result.upload : currentUpload}
            maxValue={maxGaugeValue}
            label="Upload"
            isActive={phase === 'upload'}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full border-4 border-dashed border-muted-foreground/20 flex items-center justify-center mb-3">
            <Zap className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Test your connection speed through the VPN
          </p>
        </div>
      )}

      {/* Results summary */}
      {result && phase === 'complete' && (
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
          <ResultItem icon={<ArrowDown className="h-3 w-3" />} label="Download" value={`${result.download.toFixed(1)}`} unit="Mbps" />
          <ResultItem icon={<ArrowUp className="h-3 w-3" />} label="Upload" value={`${result.upload.toFixed(1)}`} unit="Mbps" />
          <ResultItem icon={<Clock className="h-3 w-3" />} label="Ping" value={`${result.ping}`} unit="ms" />
          <ResultItem icon={<Activity className="h-3 w-3" />} label="Jitter" value={`${result.jitter}`} unit="ms" />
        </div>
      )}

      {/* Action Button */}
      <div className="mt-4">
        <Button
          onClick={startTest}
          disabled={!isConnected || (phase !== 'idle' && phase !== 'complete')}
          className={cn(
            'w-full h-10 text-sm font-medium',
            isConnected
              ? 'bg-[hsl(174,62%,32%)] hover:bg-[hsl(174,62%,28%)] text-white'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {phase === 'idle' && 'Start Speed Test'}
          {phase === 'download' && 'Testing Download...'}
          {phase === 'upload' && 'Testing Upload...'}
          {phase === 'complete' && 'Test Again'}
        </Button>
        {!isConnected && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Connect to a VPN node to run a speed test
          </p>
        )}
      </div>
    </div>
  );
}

function Badge({ phase, progress }: { phase: TestPhase; progress: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-[hsl(174,62%,32%)] animate-pulse" />
      <span className="text-xs text-muted-foreground capitalize">{phase}</span>
      <span className="text-xs font-medium text-foreground tabular-nums">{Math.round(progress)}%</span>
    </div>
  );
}

function ResultItem({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="text-sm font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{unit}</p>
    </div>
  );
}