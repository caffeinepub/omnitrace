// Local search/query engine with composable filters

import { OmniEvent, Category, Confidence } from '../types';
import { queryEvents } from '../engine/queries';

export interface SearchFilters {
  keyword?: string;
  category?: Category;
  confidence?: Confidence;
  startDate?: Date;
  endDate?: Date;
  minDuration?: number;
  maxDuration?: number;
}

export async function search(filters: SearchFilters): Promise<OmniEvent[]> {
  const queryFilters: Parameters<typeof queryEvents>[0] = {};

  if (filters.startDate) {
    queryFilters.startTime = filters.startDate.getTime();
  }

  if (filters.endDate) {
    queryFilters.endTime = filters.endDate.getTime();
  }

  if (filters.category) {
    queryFilters.category = filters.category;
  }

  if (filters.confidence) {
    queryFilters.confidence = filters.confidence;
  }

  if (filters.keyword) {
    queryFilters.keyword = filters.keyword;
  }

  let results = await queryEvents(queryFilters);

  // Duration filters
  if (filters.minDuration !== undefined) {
    results = results.filter(e => (e.duration || 0) >= filters.minDuration!);
  }

  if (filters.maxDuration !== undefined) {
    results = results.filter(e => (e.duration || 0) <= filters.maxDuration!);
  }

  return results;
}
