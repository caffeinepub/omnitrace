// Deterministic Focus Score computation from local OMNITRACE events

import { OmniEvent, EventType, Category } from '../types';
import { deriveSegments } from '../engine/timeEngine';

export type FocusLabel = 'Deep Focus' | 'Flow' | 'Unstable' | 'Distracted';

export interface FocusScoreResult {
  score: number; // 0-100
  label: FocusLabel;
  hasEnoughData: boolean;
  reasons?: string[];
}

const MIN_EVENTS_FOR_SCORE = 5;
const MIN_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function computeFocusScore(events: OmniEvent[]): FocusScoreResult {
  // Check if we have enough data
  if (events.length < MIN_EVENTS_FOR_SCORE) {
    return {
      score: 0,
      label: 'Distracted',
      hasEnoughData: false,
      reasons: ['Not enough events recorded yet'],
    };
  }

  const segments = deriveSegments(events);
  const totalDuration = segments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0);

  if (totalDuration < MIN_DURATION_MS) {
    return {
      score: 0,
      label: 'Distracted',
      hasEnoughData: false,
      reasons: ['Not enough activity duration recorded yet'],
    };
  }

  let score = 50; // Start neutral
  const reasons: string[] = [];

  // Factor 1: Session duration quality (0-30 points)
  const focusSegments = segments.filter(s => 
    s.category === Category.STUDY || s.category === Category.WORK
  );
  
  if (focusSegments.length > 0) {
    const avgFocusDuration = focusSegments.reduce((sum, seg) => 
      sum + (seg.endTime - seg.startTime), 0
    ) / focusSegments.length;
    
    const focusDurationScore = Math.min(30, (avgFocusDuration / (30 * 60 * 1000)) * 30);
    score += focusDurationScore;
    
    if (avgFocusDuration > 20 * 60 * 1000) {
      reasons.push('Long focus sessions detected');
    }
  } else {
    score -= 15;
    reasons.push('No focused work sessions');
  }

  // Factor 2: Distraction frequency (-20 to 0 points)
  const navigationEvents = events.filter(e => e.type === EventType.NAVIGATION);
  const distractionRate = navigationEvents.length / (totalDuration / (60 * 1000)); // per minute
  
  if (distractionRate > 2) {
    score -= 20;
    reasons.push('High context-switching rate');
  } else if (distractionRate > 1) {
    score -= 10;
    reasons.push('Moderate context-switching');
  } else {
    reasons.push('Low distraction rate');
  }

  // Factor 3: Rest gaps quality (0-15 points)
  const restSegments = segments.filter(s => s.category === Category.REST);
  const idleSegments = segments.filter(s => s.activity === 'Idle');
  
  const totalRestTime = [...restSegments, ...idleSegments].reduce(
    (sum, seg) => sum + (seg.endTime - seg.startTime), 0
  );
  
  const restRatio = totalRestTime / totalDuration;
  
  if (restRatio > 0.1 && restRatio < 0.3) {
    score += 15;
    reasons.push('Healthy rest balance');
  } else if (restRatio >= 0.3) {
    score -= 10;
    reasons.push('Excessive idle time');
  }

  // Factor 4: App switching speed evidence (0-5 points)
  const rapidSwitches = events.filter((e, i) => {
    if (i === 0 || e.type !== EventType.NAVIGATION) return false;
    const prevEvent = events[i - 1];
    return e.timestamp - prevEvent.timestamp < 10000; // < 10 seconds
  });
  
  if (rapidSwitches.length > 5) {
    score -= 5;
    reasons.push('Rapid app switching detected');
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine label
  let label: FocusLabel;
  if (score >= 80) {
    label = 'Deep Focus';
  } else if (score >= 60) {
    label = 'Flow';
  } else if (score >= 40) {
    label = 'Unstable';
  } else {
    label = 'Distracted';
  }

  return {
    score,
    label,
    hasEnoughData: true,
    reasons,
  };
}
