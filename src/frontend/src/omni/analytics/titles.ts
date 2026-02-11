// Deterministic micro-gamification titles

import { OmniEvent, Category } from '../types';
import { deriveSegments } from '../engine/timeEngine';
import { smartMergeSegments } from './smartMerging';

export type Title = 'Flow Architect' | 'Focus Breaker' | 'Distraction Survivor';

export interface TitleResult {
  earnedTitles: Title[];
  reasons: Record<Title, string>;
}

export function computeTitles(events: OmniEvent[]): TitleResult {
  const earnedTitles: Title[] = [];
  const reasons: Record<Title, string> = {} as any;

  if (events.length < 10) {
    return { earnedTitles, reasons };
  }

  const segments = deriveSegments(events);
  const mergedSegments = smartMergeSegments(events);

  // Flow Architect: Long uninterrupted focus sessions
  const focusSegments = segments.filter(s =>
    s.category === Category.STUDY || s.category === Category.WORK
  );

  const longFocusSessions = focusSegments.filter(s =>
    (s.endTime - s.startTime) > 30 * 60 * 1000 // > 30 minutes
  );

  if (longFocusSessions.length >= 2) {
    earnedTitles.push('Flow Architect');
    reasons['Flow Architect'] = `Achieved ${longFocusSessions.length} deep focus sessions over 30 minutes`;
  }

  // Focus Breaker: High context switching but still productive
  const distractions = mergedSegments.filter(s => s.label === 'Micro-Distraction');
  const totalFocusTime = focusSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);

  if (distractions.length > 5 && totalFocusTime > 60 * 60 * 1000) {
    earnedTitles.push('Focus Breaker');
    reasons['Focus Breaker'] = 'Maintained productivity despite frequent context switches';
  }

  // Distraction Survivor: Overcame many distractions
  const explorationSessions = mergedSegments.filter(s => s.label === 'Exploration Session');
  
  if (explorationSessions.length >= 2 && focusSegments.length > 0) {
    earnedTitles.push('Distraction Survivor');
    reasons['Distraction Survivor'] = 'Navigated through distractions and returned to focus';
  }

  return { earnedTitles, reasons };
}
