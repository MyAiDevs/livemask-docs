import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SpeedGaugeProps {
  value: number; // Current speed in Mbps
  maxValue: number; // Max gauge value
  label: string; // "Download" or "Upload"
  isActive: boolean; // Whether currently testing
  className?: string;
}

export default function SpeedGauge({ value, maxValue, label, isActive, className }: SpeedGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatedValue = useRef(0);
  const animationFrame = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 160;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2 + 10;
      const radius = 60;
      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 2.25;
      const totalAngle = endAngle - startAngle;

      // Background arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = 'hsl(210, 10%, 88%)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Animated value arc
      const targetValue = Math.min(value, maxValue);
      const easingSpeed = 0.08;
      animatedValue.current += (targetValue - animatedValue.current) * easingSpeed;

      const progress = animatedValue.current / maxValue;
      const currentAngle = startAngle + totalAngle * progress;

      if (progress > 0.001) {
        // Gradient for the active arc
        const gradient = ctx.createLinearGradient(
          centerX - radius, centerY,
          centerX + radius, centerY
        );
        gradient.addColorStop(0, 'hsl(174, 62%, 42%)');
        gradient.addColorStop(0.5, 'hsl(174, 62%, 32%)');
        gradient.addColorStop(1, 'hsl(160, 70%, 28%)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Tick marks
      const numTicks = 10;
      for (let i = 0; i <= numTicks; i++) {
        const tickAngle = startAngle + (totalAngle * i) / numTicks;
        const innerRadius = radius - 14;
        const outerRadius = radius - 10;
        const x1 = centerX + Math.cos(tickAngle) * innerRadius;
        const y1 = centerY + Math.sin(tickAngle) * innerRadius;
        const x2 = centerX + Math.cos(tickAngle) * outerRadius;
        const y2 = centerY + Math.sin(tickAngle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i <= Math.floor(progress * numTicks) ? 'hsl(174, 62%, 32%)' : 'hsl(210, 10%, 78%)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Needle
      const needleAngle = startAngle + totalAngle * progress;
      const needleLength = radius - 20;
      const needleX = centerX + Math.cos(needleAngle) * needleLength;
      const needleY = centerY + Math.sin(needleAngle) * needleLength;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(needleX, needleY);
      ctx.strokeStyle = 'hsl(174, 62%, 32%)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(174, 62%, 32%)';
      ctx.fill();

      // Continue animation if not settled
      if (Math.abs(animatedValue.current - targetValue) > 0.1) {
        animationFrame.current = requestAnimationFrame(draw);
      }
    }

    animationFrame.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, maxValue]);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <canvas ref={canvasRef} className="mb-1" />
      <div className="text-center -mt-4">
        <p className={cn(
          'text-2xl font-bold tabular-nums transition-colors',
          isActive ? 'text-[hsl(174,62%,32%)]' : 'text-foreground'
        )}>
          {value.toFixed(1)}
        </p>
        <p className="text-xs text-muted-foreground">Mbps</p>
      </div>
      <p className={cn(
        'text-xs font-medium mt-1 uppercase tracking-wider',
        isActive ? 'text-[hsl(174,62%,32%)]' : 'text-muted-foreground'
      )}>
        {label}
      </p>
    </div>
  );
}