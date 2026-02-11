// Horizontal heatmap bar with smooth Indigo→Cyan→Red gradient

import React, { useRef, useEffect } from 'react';
import { HeatmapBin } from '../analytics/heatmap';

interface HeatmapBarProps {
  bins: HeatmapBin[];
  height?: number;
}

export function HeatmapBar({ bins, height = 80 }: HeatmapBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bins.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    
    ctx.scale(dpr, dpr);

    const barWidth = rect.width / bins.length;

    bins.forEach((bin, i) => {
      const x = i * barWidth;
      
      // Map intensity to color: Indigo (low) → Cyan (medium) → Red (high)
      const color = getHeatmapColor(bin.intensity);
      
      ctx.fillStyle = color;
      ctx.fillRect(x, 0, barWidth + 1, height); // +1 to avoid gaps
    });
  }, [bins, height]);

  if (bins.length === 0) {
    return (
      <div className="heatmap-empty" style={{ height }}>
        <p className="text-sm text-muted-foreground">No activity data for this period</p>
      </div>
    );
  }

  return (
    <div className="heatmap-container">
      <canvas
        ref={canvasRef}
        className="heatmap-canvas"
        style={{ width: '100%', height }}
      />
    </div>
  );
}

function getHeatmapColor(intensity: number): string {
  // Indigo → Cyan → Red progression using OKLCH
  if (intensity < 0.5) {
    // Indigo to Cyan
    const t = intensity * 2;
    const l = 0.5 + t * 0.2; // 0.5 to 0.7
    const c = 0.15 + t * 0.05; // 0.15 to 0.2
    const h = 260 - t * 80; // 260 (indigo) to 180 (cyan)
    return `oklch(${l} ${c} ${h})`;
  } else {
    // Cyan to Red
    const t = (intensity - 0.5) * 2;
    const l = 0.7 - t * 0.1; // 0.7 to 0.6
    const c = 0.2 + t * 0.05; // 0.2 to 0.25
    const h = 180 + t * 180; // 180 (cyan) to 360/0 (red)
    return `oklch(${l} ${c} ${h})`;
  }
}
