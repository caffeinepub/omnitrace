// Deterministic time-window helpers for Today/Week/All time

import { OmniEvent } from '../types';
import { queryEvents } from '../engine/queries';

export type ContextScope = 'today' | 'week' | 'all';

export function getScopeTimeRange(scope: ContextScope): { startTime?: number; endTime?: number } {
  const now = new Date();
  
  switch (scope) {
    case 'today': {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { startTime: today.getTime(), endTime: tomorrow.getTime() };
    }
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      return { startTime: weekAgo.getTime(), endTime: now.getTime() };
    }
    case 'all':
      return {};
  }
}

export async function loadEventsForScope(scope: ContextScope): Promise<OmniEvent[]> {
  const range = getScopeTimeRange(scope);
  return queryEvents(range);
}
