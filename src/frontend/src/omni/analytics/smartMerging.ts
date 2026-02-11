// Deterministic smart auto-merging with Cognitive Mode awareness

import { OmniEvent, EventType, Category, Confidence, DerivedSegment } from '../types';
import { deriveSegments } from '../engine/timeEngine';
import { CognitiveMode } from '../hooks/useCognitiveMode';

export interface MergedSegment {
  label: string;
  startTime: number;
  endTime: number;
  category: Category;
  confidence: Confidence;
  sourceEventIds: string[];
  rawSegmentCount: number;
}

export function smartMergeSegments(events: OmniEvent[], mode: CognitiveMode = 'focus'): MergedSegment[] {
  const rawSegments = deriveSegments(events);
  
  // Analysis mode: return raw segments without merging
  if (mode === 'analysis') {
    return rawSegments.map(segment => ({
      label: segment.activity,
      startTime: segment.startTime,
      endTime: segment.endTime,
      category: segment.category,
      confidence: segment.confidence,
      sourceEventIds: segment.sourceEventIds,
      rawSegmentCount: 1,
    }));
  }
  
  const merged: MergedSegment[] = [];
  
  // Mode-specific thresholds
  const thresholds = getModeThresholds(mode);
  
  let i = 0;
  while (i < rawSegments.length) {
    const segment = rawSegments[i];
    
    // Check for navigation burst → "Exploration Session"
    if (isNavigationSegment(segment, events)) {
      const burst = collectNavigationBurst(rawSegments, i, events, thresholds.navigationGap);
      if (burst.count >= thresholds.navigationMinCount) {
        merged.push({
          label: 'Exploration Session',
          startTime: burst.segments[0].startTime,
          endTime: burst.segments[burst.segments.length - 1].endTime,
          category: Category.UNKNOWN,
          confidence: Confidence.AUTO,
          sourceEventIds: burst.segments.flatMap(s => s.sourceEventIds),
          rawSegmentCount: burst.count,
        });
        i += burst.count;
        continue;
      }
    }
    
    // Check for rapid switches → "Micro-Distraction"
    if (i < rawSegments.length - 1) {
      const next = rawSegments[i + 1];
      const gap = next.startTime - segment.endTime;
      const duration = segment.endTime - segment.startTime;
      
      if (gap < thresholds.switchGap && duration < thresholds.switchDuration) {
        // Collect rapid switches
        const switches = collectRapidSwitches(rawSegments, i, thresholds);
        if (switches.count >= thresholds.switchMinCount) {
          merged.push({
            label: 'Micro-Distraction',
            startTime: switches.segments[0].startTime,
            endTime: switches.segments[switches.segments.length - 1].endTime,
            category: Category.DISTRACTION,
            confidence: Confidence.AUTO,
            sourceEventIds: switches.segments.flatMap(s => s.sourceEventIds),
            rawSegmentCount: switches.count,
          });
          i += switches.count;
          continue;
        }
      }
    }
    
    // Check for idle/background → "Recovery Gap"
    if (segment.activity === 'Idle' || segment.category === Category.REST) {
      const duration = segment.endTime - segment.startTime;
      if (duration > thresholds.recoveryMinDuration) {
        merged.push({
          label: 'Recovery Gap',
          startTime: segment.startTime,
          endTime: segment.endTime,
          category: Category.REST,
          confidence: segment.confidence,
          sourceEventIds: segment.sourceEventIds,
          rawSegmentCount: 1,
        });
        i++;
        continue;
      }
    }
    
    // Default: keep as-is
    merged.push({
      label: segment.activity,
      startTime: segment.startTime,
      endTime: segment.endTime,
      category: segment.category,
      confidence: segment.confidence,
      sourceEventIds: segment.sourceEventIds,
      rawSegmentCount: 1,
    });
    i++;
  }
  
  return merged;
}

interface ModeThresholds {
  navigationGap: number;
  navigationMinCount: number;
  switchGap: number;
  switchDuration: number;
  switchMinCount: number;
  recoveryMinDuration: number;
}

function getModeThresholds(mode: CognitiveMode): ModeThresholds {
  switch (mode) {
    case 'focus':
      // Aggressive distraction merging
      return {
        navigationGap: 30000, // 30s
        navigationMinCount: 4,
        switchGap: 8000, // 8s
        switchDuration: 15000, // 15s
        switchMinCount: 2,
        recoveryMinDuration: 60000, // 1min
      };
    
    case 'flow':
      // De-emphasize micro-distraction merging
      return {
        navigationGap: 30000,
        navigationMinCount: 5,
        switchGap: 3000, // 3s (stricter)
        switchDuration: 8000, // 8s (stricter)
        switchMinCount: 3, // require more switches
        recoveryMinDuration: 60000,
      };
    
    case 'recovery':
      // Emphasize recovery/rest gaps
      return {
        navigationGap: 30000,
        navigationMinCount: 5,
        switchGap: 5000,
        switchDuration: 10000,
        switchMinCount: 2,
        recoveryMinDuration: 30000, // 30s (more sensitive)
      };
    
    default:
      // Default (focus) behavior
      return {
        navigationGap: 30000,
        navigationMinCount: 5,
        switchGap: 5000,
        switchDuration: 10000,
        switchMinCount: 2,
        recoveryMinDuration: 60000,
      };
  }
}

function isNavigationSegment(segment: DerivedSegment, events: OmniEvent[]): boolean {
  return segment.sourceEventIds.some(id => {
    const event = events.find(e => e.id === id);
    return event?.type === EventType.NAVIGATION;
  });
}

function collectNavigationBurst(
  segments: DerivedSegment[],
  startIndex: number,
  events: OmniEvent[],
  maxGap: number
): { segments: DerivedSegment[]; count: number } {
  const burst: DerivedSegment[] = [];
  let i = startIndex;
  
  while (i < segments.length && isNavigationSegment(segments[i], events)) {
    burst.push(segments[i]);
    i++;
    
    // Stop if gap is too large
    if (i < segments.length) {
      const gap = segments[i].startTime - segments[i - 1].endTime;
      if (gap > maxGap) break;
    }
  }
  
  return { segments: burst, count: burst.length };
}

function collectRapidSwitches(
  segments: DerivedSegment[],
  startIndex: number,
  thresholds: ModeThresholds
): { segments: DerivedSegment[]; count: number } {
  const switches: DerivedSegment[] = [segments[startIndex]];
  let i = startIndex + 1;
  
  while (i < segments.length) {
    const prev = segments[i - 1];
    const curr = segments[i];
    const gap = curr.startTime - prev.endTime;
    const duration = curr.endTime - curr.startTime;
    
    if (gap < thresholds.switchGap && duration < thresholds.switchDuration) {
      switches.push(curr);
      i++;
    } else {
      break;
    }
  }
  
  return { segments: switches, count: switches.length };
}
