// Category breakdown computation

import { OmniEvent, Category } from '../types';
import { deriveSegments } from '../engine/timeEngine';

export interface CategoryBreakdown {
  category: Category;
  duration: number;
  percentage: number;
}

export function computeCategoryBreakdown(events: OmniEvent[]): CategoryBreakdown[] {
  const segments = deriveSegments(events);
  const categoryTotals = new Map<Category, number>();

  let totalDuration = 0;

  segments.forEach(segment => {
    const duration = segment.endTime - segment.startTime;
    totalDuration += duration;
    
    const current = categoryTotals.get(segment.category) || 0;
    categoryTotals.set(segment.category, current + duration);
  });

  const breakdown: CategoryBreakdown[] = [];
  
  Object.values(Category).forEach(category => {
    const duration = categoryTotals.get(category) || 0;
    breakdown.push({
      category,
      duration,
      percentage: totalDuration > 0 ? (duration / totalDuration) * 100 : 0,
    });
  });

  return breakdown.sort((a, b) => b.duration - a.duration);
}
