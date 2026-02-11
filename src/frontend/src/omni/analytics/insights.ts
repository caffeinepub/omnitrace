// Deterministic activity intelligence insights

import { OmniEvent, EventType, Category } from '../types';
import { deriveSegments } from '../engine/timeEngine';

export interface Insight {
  title: string;
  value: string;
  definition: string;
}

export function computeInsights(events: OmniEvent[]): Insight[] {
  const insights: Insight[] = [];
  const segments = deriveSegments(events);

  // Most frequent activity
  const activityCounts = new Map<string, number>();
  segments.forEach(seg => {
    activityCounts.set(seg.activity, (activityCounts.get(seg.activity) || 0) + 1);
  });
  
  let maxActivity = '';
  let maxCount = 0;
  activityCounts.forEach((count, activity) => {
    if (count > maxCount) {
      maxCount = count;
      maxActivity = activity;
    }
  });

  if (maxActivity) {
    insights.push({
      title: 'Most Frequent Activity',
      value: `${maxActivity} (${maxCount} times)`,
      definition: 'Activity that occurred most frequently in recorded segments',
    });
  }

  // Longest uninterrupted focus
  const focusSegments = segments.filter(s => 
    s.category === Category.STUDY || s.category === Category.WORK
  );
  
  if (focusSegments.length > 0) {
    const longest = focusSegments.reduce((max, seg) => {
      const duration = seg.endTime - seg.startTime;
      const maxDuration = max.endTime - max.startTime;
      return duration > maxDuration ? seg : max;
    });

    const durationMin = Math.floor((longest.endTime - longest.startTime) / 60000);
    insights.push({
      title: 'Longest Focus Session',
      value: `${durationMin} minutes`,
      definition: 'Longest continuous segment categorized as Study or Work without interruption',
    });
  }

  // Common interruption source
  const navigationEvents = events.filter(e => e.type === EventType.NAVIGATION);
  if (navigationEvents.length > 0) {
    insights.push({
      title: 'Context Switches',
      value: `${navigationEvents.length} switches`,
      definition: 'Number of times you navigated between different screens',
    });
  }

  // Peak productivity hours
  const hourCounts = new Map<number, number>();
  segments.filter(s => s.category === Category.STUDY || s.category === Category.WORK)
    .forEach(seg => {
      const hour = new Date(seg.startTime).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

  if (hourCounts.size > 0) {
    let peakHour = 0;
    let peakCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
    });

    insights.push({
      title: 'Peak Productivity Hour',
      value: `${peakHour}:00 - ${peakHour + 1}:00`,
      definition: 'Hour with the most Study/Work activity segments',
    });
  }

  return insights;
}
