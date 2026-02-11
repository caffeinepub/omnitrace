// OMNITRACE Core Data Model with MergedSegment type

export const SCHEMA_VERSION = '1.0.0';

export enum EventType {
  // User-initiated actions
  NAVIGATION = 'navigation',
  BUTTON_CLICK = 'button_click',
  MODE_CHANGE = 'mode_change',
  MANUAL_EVENT = 'manual_event',
  EDIT = 'edit',
  SETTINGS_CHANGE = 'settings_change',
  
  // Session/device context
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  FOREGROUND = 'foreground',
  BACKGROUND = 'background',
  IDLE_START = 'idle_start',
  IDLE_END = 'idle_end',
  
  // System events
  RECOVERY = 'recovery',
  WIPE = 'wipe',
}

export enum Category {
  STUDY = 'study',
  WORK = 'work',
  DISTRACTION = 'distraction',
  REST = 'rest',
  UNKNOWN = 'unknown',
}

export enum Confidence {
  AUTO = 'auto',
  MANUAL = 'manual',
  RECOVERED = 'recovered',
}

export interface EventContext {
  screen?: string;
  mode?: string;
  state?: Record<string, unknown>;
  fromScreen?: string;
  toScreen?: string;
}

export interface OmniEvent {
  id: string;
  type: EventType;
  timestamp: number; // ms precision
  context: EventContext;
  duration?: number; // ms
  category?: Category;
  confidence: Confidence;
  title?: string;
  keywords?: string[];
  note?: string;
}

export interface Session {
  id: string;
  startTime: number;
  endTime?: number;
  recovered?: boolean;
}

export interface DerivedSegment {
  startTime: number;
  endTime: number;
  activity: string;
  category: Category;
  confidence: Confidence;
  sourceEventIds: string[];
}

export interface MergedSegment {
  label: string;
  startTime: number;
  endTime: number;
  category: Category;
  confidence: Confidence;
  sourceEventIds: string[];
  rawSegmentCount: number;
}

export interface StorageMetadata {
  schemaVersion: string;
  lastCompaction?: number;
  eventCount: number;
}

export interface ExportData {
  schemaVersion: string;
  exportTime: number;
  events: OmniEvent[];
  sessions: Session[];
  metadata: StorageMetadata;
}
