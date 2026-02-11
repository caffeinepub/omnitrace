// Deterministic time engine for segment derivation and queries

import { OmniEvent, DerivedSegment, Category, Confidence, EventType } from '../types';

export function deriveSegments(events: OmniEvent[]): DerivedSegment[] {
  const segments: DerivedSegment[] = [];
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  let currentActivity: string | null = null;
  let currentCategory: Category = Category.UNKNOWN;
  let currentConfidence: Confidence = Confidence.AUTO;
  let segmentStart: number | null = null;
  let sourceIds: string[] = [];

  for (let i = 0; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];

    // Manual events create explicit segments
    if (event.type === EventType.MANUAL_EVENT && event.title) {
      // Close previous segment if any
      if (segmentStart !== null && currentActivity) {
        segments.push({
          startTime: segmentStart,
          endTime: event.timestamp,
          activity: currentActivity,
          category: currentCategory,
          confidence: currentConfidence,
          sourceEventIds: sourceIds,
        });
      }

      // Create manual event segment
      const endTime = event.duration ? event.timestamp + event.duration : (sortedEvents[i + 1]?.timestamp || Date.now());
      segments.push({
        startTime: event.timestamp,
        endTime,
        activity: event.title,
        category: event.category || Category.UNKNOWN,
        confidence: Confidence.MANUAL,
        sourceEventIds: [event.id],
      });

      segmentStart = endTime;
      currentActivity = null;
      sourceIds = [];
    } else if (event.type === EventType.IDLE_START) {
      if (segmentStart !== null && currentActivity) {
        segments.push({
          startTime: segmentStart,
          endTime: event.timestamp,
          activity: currentActivity,
          category: currentCategory,
          confidence: currentConfidence,
          sourceEventIds: sourceIds,
        });
      }
      segmentStart = event.timestamp;
      currentActivity = 'Idle';
      currentCategory = Category.UNKNOWN;
      currentConfidence = Confidence.AUTO;
      sourceIds = [event.id];
    } else if (event.type === EventType.IDLE_END) {
      if (segmentStart !== null) {
        segments.push({
          startTime: segmentStart,
          endTime: event.timestamp,
          activity: 'Idle',
          category: Category.UNKNOWN,
          confidence: Confidence.AUTO,
          sourceEventIds: sourceIds,
        });
      }
      segmentStart = event.timestamp;
      currentActivity = 'Active';
      sourceIds = [event.id];
    } else {
      if (!currentActivity) {
        currentActivity = 'Active';
        segmentStart = event.timestamp;
      }
      sourceIds.push(event.id);
    }
  }

  return segments;
}

export function getActivityAt(timestamp: number, events: OmniEvent[]): DerivedSegment | null {
  const segments = deriveSegments(events);
  return segments.find(s => s.startTime <= timestamp && s.endTime >= timestamp) || null;
}
