// Deterministic cognitive drift detection

import { OmniEvent, Category } from '../types';
import { deriveSegments } from '../engine/timeEngine';

export interface DriftRecommendation {
  message: string;
  confidence: 'low' | 'medium' | 'high';
}

export function detectCognitiveDrift(events: OmniEvent[]): DriftRecommendation | null {
  if (events.length < 20) {
    return null; // Not enough data
  }

  const segments = deriveSegments(events);
  const focusSegments = segments.filter(s =>
    s.category === Category.STUDY || s.category === Category.WORK
  );

  if (focusSegments.length < 3) {
    return null;
  }

  // Detect focus decay pattern
  const focusDurations = focusSegments.map(s => s.endTime - s.startTime);
  
  if (focusDurations.length >= 3) {
    const avgDuration = focusDurations.reduce((a, b) => a + b, 0) / focusDurations.length;
    const avgMinutes = Math.round(avgDuration / 60000);

    // Check if there's a consistent duration pattern
    const variance = focusDurations.reduce((sum, d) => 
      sum + Math.pow(d - avgDuration, 2), 0
    ) / focusDurations.length;

    const stdDev = Math.sqrt(variance);

    if (stdDev < avgDuration * 0.3) {
      // Consistent pattern detected
      return {
        message: `You usually lose focus after ${avgMinutes} minutes. Consider a break around that time.`,
        confidence: 'high',
      };
    }
  }

  // Detect distraction clustering
  const distractionEvents = events.filter(e => 
    e.category === Category.DISTRACTION
  );

  if (distractionEvents.length > 5) {
    // Check if distractions cluster in time
    const sortedDistractions = [...distractionEvents].sort((a, b) => a.timestamp - b.timestamp);
    let maxCluster = 0;
    let currentCluster = 1;

    for (let i = 1; i < sortedDistractions.length; i++) {
      const gap = sortedDistractions[i].timestamp - sortedDistractions[i - 1].timestamp;
      if (gap < 10 * 60 * 1000) { // Within 10 minutes
        currentCluster++;
      } else {
        maxCluster = Math.max(maxCluster, currentCluster);
        currentCluster = 1;
      }
    }
    maxCluster = Math.max(maxCluster, currentCluster);

    if (maxCluster >= 3) {
      return {
        message: 'Distractions tend to cluster together. A short break might help reset your attention.',
        confidence: 'medium',
      };
    }
  }

  return null;
}
