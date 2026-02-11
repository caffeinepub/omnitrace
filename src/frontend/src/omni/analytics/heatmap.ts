// Deterministic mental-load heatmap generation from events

import { OmniEvent, Category } from '../types';
import { deriveSegments } from '../engine/timeEngine';

export interface HeatmapBin {
  timestamp: number;
  intensity: number; // 0-1
}

export function generateHeatmap(
  events: OmniEvent[],
  startTime: number,
  endTime: number,
  binCount: number = 100
): HeatmapBin[] {
  const segments = deriveSegments(events);
  const binDuration = (endTime - startTime) / binCount;
  const bins: HeatmapBin[] = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = startTime + i * binDuration;
    const binEnd = binStart + binDuration;
    const binCenter = binStart + binDuration / 2;

    // Find segments that overlap with this bin
    const overlappingSegments = segments.filter(seg =>
      seg.startTime < binEnd && seg.endTime > binStart
    );

    let intensity = 0;

    if (overlappingSegments.length > 0) {
      // Calculate intensity based on category and overlap
      overlappingSegments.forEach(seg => {
        const overlapStart = Math.max(seg.startTime, binStart);
        const overlapEnd = Math.min(seg.endTime, binEnd);
        const overlapRatio = (overlapEnd - overlapStart) / binDuration;

        let categoryWeight = 0.3; // Default for UNKNOWN
        
        switch (seg.category) {
          case Category.WORK:
          case Category.STUDY:
            categoryWeight = 0.9; // High mental load
            break;
          case Category.DISTRACTION:
            categoryWeight = 0.6; // Medium-high load
            break;
          case Category.REST:
            categoryWeight = 0.1; // Low load
            break;
        }

        intensity += categoryWeight * overlapRatio;
      });

      // Clamp to 0-1
      intensity = Math.min(1, intensity);
    }

    bins.push({
      timestamp: binCenter,
      intensity,
    });
  }

  // Smooth the bins to avoid sudden jumps
  return smoothBins(bins);
}

function smoothBins(bins: HeatmapBin[]): HeatmapBin[] {
  if (bins.length < 3) return bins;

  const smoothed: HeatmapBin[] = [];

  for (let i = 0; i < bins.length; i++) {
    if (i === 0 || i === bins.length - 1) {
      smoothed.push(bins[i]);
    } else {
      const prev = bins[i - 1].intensity;
      const curr = bins[i].intensity;
      const next = bins[i + 1].intensity;
      
      smoothed.push({
        timestamp: bins[i].timestamp,
        intensity: (prev + curr * 2 + next) / 4,
      });
    }
  }

  return smoothed;
}
