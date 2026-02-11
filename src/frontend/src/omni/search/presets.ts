// One-click anomaly presets

import { SearchFilters } from './index';

export interface SearchPreset {
  name: string;
  description: string;
  filters: SearchFilters;
}

export const SEARCH_PRESETS: SearchPreset[] = [
  {
    name: 'Long Idle Periods',
    description: 'Idle periods longer than 15 minutes',
    filters: {
      keyword: 'idle',
      minDuration: 15 * 60 * 1000,
    },
  },
  {
    name: 'Manual Events',
    description: 'All manually logged events',
    filters: {
      confidence: 'manual' as any,
    },
  },
  {
    name: 'Today',
    description: 'All events from today',
    filters: {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  },
];
