// Deterministic daily summary generation with calm English insights

import { OmniEvent, Category } from '../types';
import { deriveSegments } from '../engine/timeEngine';
import { smartMergeSegments } from './smartMerging';

export interface DailySummary {
  insights: string[];
  hasEnoughData: boolean;
}

const MIN_EVENTS_FOR_SUMMARY = 10;
const MIN_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function generateDailySummary(events: OmniEvent[]): DailySummary {
  if (events.length < MIN_EVENTS_FOR_SUMMARY) {
    return {
      insights: ['Not enough activity recorded today to generate insights.'],
      hasEnoughData: false,
    };
  }

  const segments = deriveSegments(events);
  const totalDuration = segments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0);

  if (totalDuration < MIN_DURATION_MS) {
    return {
      insights: ['Activity duration too short for meaningful insights.'],
      hasEnoughData: false,
    };
  }

  const insights: string[] = [];
  const mergedSegments = smartMergeSegments(events);

  // Find best focus window
  const focusSegments = segments.filter(s =>
    s.category === Category.STUDY || s.category === Category.WORK
  );

  if (focusSegments.length > 0) {
    const longest = focusSegments.reduce((max, seg) =>
      (seg.endTime - seg.startTime) > (max.endTime - max.startTime) ? seg : max
    );

    const startTime = new Date(longest.startTime);
    const endTime = new Date(longest.endTime);
    const duration = Math.round((longest.endTime - longest.startTime) / 60000);

    insights.push(
      `You were most focused between ${formatTime(startTime)} and ${formatTime(endTime)} (${duration} minutes).`
    );
  }

  // Detect distraction patterns
  const distractionSegments = mergedSegments.filter(s => s.label === 'Micro-Distraction');
  
  if (distractionSegments.length > 0) {
    const eveningDistractions = distractionSegments.filter(s => {
      const hour = new Date(s.startTime).getHours();
      return hour >= 18;
    });

    if (eveningDistractions.length > distractionSegments.length / 2) {
      insights.push('Distractions increased after 6 PM.');
    } else {
      insights.push(`${distractionSegments.length} micro-distraction periods detected.`);
    }
  }

  // Rest and focus correlation
  const restSegments = segments.filter(s => s.category === Category.REST);
  
  if (restSegments.length > 0 && focusSegments.length > 0) {
    // Check if focus sessions tend to follow rest
    let restFollowedByFocus = 0;
    
    restSegments.forEach(rest => {
      const nextFocus = focusSegments.find(f => 
        f.startTime > rest.endTime && f.startTime - rest.endTime < 30 * 60 * 1000
      );
      if (nextFocus) restFollowedByFocus++;
    });

    if (restFollowedByFocus > restSegments.length / 2) {
      insights.push('Best focus sessions followed rest periods.');
    }
  }

  // Recovery gaps
  const recoveryGaps = mergedSegments.filter(s => s.label === 'Recovery Gap');
  if (recoveryGaps.length > 0) {
    const totalRecovery = recoveryGaps.reduce((sum, g) => sum + (g.endTime - g.startTime), 0);
    const recoveryMinutes = Math.round(totalRecovery / 60000);
    insights.push(`${recoveryMinutes} minutes spent in recovery periods.`);
  }

  if (insights.length === 0) {
    insights.push('Activity patterns are still developing. Keep logging to see deeper insights.');
  }

  return {
    insights,
    hasEnoughData: true,
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
