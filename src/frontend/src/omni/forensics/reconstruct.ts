// Forensic reconstruction with merged segments support

import { OmniEvent, DerivedSegment } from '../types';
import { deriveSegments } from '../engine/timeEngine';
import { queryEvents } from '../engine/queries';
import { smartMergeSegments, MergedSegment } from '../analytics/smartMerging';

export interface ForensicReconstruction {
  rawEvents: OmniEvent[];
  segments: DerivedSegment[];
  mergedSegments: MergedSegment[];
  gaps: Array<{ start: number; end: number }>;
}

export async function reconstructTimeline(
  startTime: number,
  endTime: number
): Promise<ForensicReconstruction> {
  const events = await queryEvents({ startTime, endTime });
  const segments = deriveSegments(events);
  const mergedSegments = smartMergeSegments(events);

  // Find gaps
  const gaps: Array<{ start: number; end: number }> = [];
  const sortedSegments = [...segments].sort((a, b) => a.startTime - b.startTime);

  for (let i = 0; i < sortedSegments.length - 1; i++) {
    const current = sortedSegments[i];
    const next = sortedSegments[i + 1];
    
    if (next.startTime > current.endTime) {
      gaps.push({
        start: current.endTime,
        end: next.startTime,
      });
    }
  }

  return {
    rawEvents: events,
    segments: sortedSegments,
    mergedSegments,
    gaps,
  };
}
