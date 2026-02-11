// Deterministic metrics computation

import { OmniEvent, EventType } from '../types';

export interface SessionMetrics {
  totalActiveTime: number;
  totalBackgroundTime: number;
  totalIdleTime: number;
  contextSwitches: number;
  focusDensity: number;
}

export function computeMetrics(events: OmniEvent[]): SessionMetrics {
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
  
  let activeTime = 0;
  let backgroundTime = 0;
  let idleTime = 0;
  let contextSwitches = 0;
  
  let lastForegroundTime: number | null = null;
  let lastIdleEndTime: number | null = null;
  let lastScreen: string | null = null;

  for (let i = 0; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];
    const nextEvent = sortedEvents[i + 1];

    if (event.type === EventType.FOREGROUND) {
      lastForegroundTime = event.timestamp;
    } else if (event.type === EventType.BACKGROUND && lastForegroundTime) {
      backgroundTime += event.timestamp - lastForegroundTime;
      lastForegroundTime = null;
    } else if (event.type === EventType.IDLE_START && lastIdleEndTime) {
      activeTime += event.timestamp - lastIdleEndTime;
    } else if (event.type === EventType.IDLE_END) {
      if (nextEvent) {
        idleTime += nextEvent.timestamp - event.timestamp;
      }
      lastIdleEndTime = event.timestamp;
    } else if (event.type === EventType.NAVIGATION) {
      if (lastScreen && event.context.toScreen !== lastScreen) {
        contextSwitches++;
      }
      lastScreen = event.context.toScreen || null;
    }
  }

  const totalTime = activeTime + idleTime || 1;
  const focusDensity = activeTime / totalTime;

  return {
    totalActiveTime: activeTime,
    totalBackgroundTime: backgroundTime,
    totalIdleTime: idleTime,
    contextSwitches,
    focusDensity,
  };
}
