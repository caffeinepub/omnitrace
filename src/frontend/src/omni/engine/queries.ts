// Optimized query helpers for timeline and forensic views

import { OmniEvent, Category, Confidence } from '../types';
import { readAllEvents, readEventsByRange } from '../storage/ledger';

export async function queryEvents(filters: {
  startTime?: number;
  endTime?: number;
  category?: Category;
  confidence?: Confidence;
  keyword?: string;
}): Promise<OmniEvent[]> {
  let events: OmniEvent[];

  if (filters.startTime !== undefined && filters.endTime !== undefined) {
    events = await readEventsByRange(filters.startTime, filters.endTime);
  } else {
    events = await readAllEvents();
  }

  // Apply filters
  if (filters.category) {
    events = events.filter(e => e.category === filters.category);
  }

  if (filters.confidence) {
    events = events.filter(e => e.confidence === filters.confidence);
  }

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    events = events.filter(e => 
      e.title?.toLowerCase().includes(keyword) ||
      e.keywords?.some(k => k.toLowerCase().includes(keyword)) ||
      e.note?.toLowerCase().includes(keyword)
    );
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export async function findNearestEvent(timestamp: number): Promise<OmniEvent | null> {
  const events = await readAllEvents();
  if (events.length === 0) return null;

  return events.reduce((nearest, event) => {
    const currentDiff = Math.abs(event.timestamp - timestamp);
    const nearestDiff = Math.abs(nearest.timestamp - timestamp);
    return currentDiff < nearestDiff ? event : nearest;
  });
}
