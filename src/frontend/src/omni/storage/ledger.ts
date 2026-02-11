// Crash-safe append/commit strategy on top of IndexedDB

import { storage } from './idb';
import { OmniEvent } from '../types';

export async function appendEvent(event: OmniEvent): Promise<void> {
  await storage.addEvent(event);
}

export async function appendEvents(events: OmniEvent[]): Promise<void> {
  await storage.addEvents(events);
}

export async function readEventsByRange(startTime: number, endTime: number): Promise<OmniEvent[]> {
  return storage.getEventsByTimeRange(startTime, endTime);
}

export async function readAllEvents(): Promise<OmniEvent[]> {
  return storage.getAllEvents();
}
