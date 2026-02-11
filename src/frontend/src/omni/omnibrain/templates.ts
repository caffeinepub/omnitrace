// Deterministic English-only response templates

import { OmniEvent, Category, EventType } from '../types';
import { deriveSegments } from '../engine/timeEngine';
import { computeMetrics } from '../analytics/metrics';

export interface FactPayload {
  facts: string[];
  confidence: 'high' | 'medium' | 'low';
}

export function generateDistractionFacts(events: OmniEvent[]): FactPayload {
  const segments = deriveSegments(events);
  const distractionSegments = segments.filter(s => s.category === Category.DISTRACTION);
  
  if (distractionSegments.length === 0) {
    return { facts: ['No significant distractions detected in this period.'], confidence: 'high' };
  }

  const facts: string[] = [];
  const totalDistraction = distractionSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
  const minutes = Math.round(totalDistraction / 60000);
  
  facts.push(`You had ${distractionSegments.length} distraction periods totaling ${minutes} minutes.`);
  
  // Find most common distraction time
  const hourCounts = new Map<number, number>();
  distractionSegments.forEach(seg => {
    const hour = new Date(seg.startTime).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });
  
  if (hourCounts.size > 0) {
    let peakHour = 0;
    let peakCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
    });
    facts.push(`Most distractions occurred around ${peakHour}:00.`);
    
    // Additional detail for Analyze mode
    const avgDuration = Math.round(totalDistraction / distractionSegments.length / 60000);
    facts.push(`Average distraction duration was ${avgDuration} minutes.`);
    
    // Time distribution
    const morningCount = distractionSegments.filter(s => {
      const h = new Date(s.startTime).getHours();
      return h >= 6 && h < 12;
    }).length;
    const afternoonCount = distractionSegments.filter(s => {
      const h = new Date(s.startTime).getHours();
      return h >= 12 && h < 18;
    }).length;
    const eveningCount = distractionSegments.filter(s => {
      const h = new Date(s.startTime).getHours();
      return h >= 18 || h < 6;
    }).length;
    
    if (morningCount > 0 || afternoonCount > 0 || eveningCount > 0) {
      facts.push(`Distribution: ${morningCount} morning, ${afternoonCount} afternoon, ${eveningCount} evening.`);
    }
  }

  return { facts, confidence: 'high' };
}

export function generateFocusDropFacts(events: OmniEvent[], afterTime: Date): FactPayload {
  const afterTimestamp = afterTime.getTime();
  const relevantEvents = events.filter(e => e.timestamp >= afterTimestamp);
  
  if (relevantEvents.length === 0) {
    return { 
      facts: ['Insufficient data after the specified time. Could you clarify which day or time period you mean?'], 
      confidence: 'low' 
    };
  }

  const segments = deriveSegments(relevantEvents);
  const distractionSegments = segments.filter(s => s.category === Category.DISTRACTION);
  const idleEvents = relevantEvents.filter(e => e.type === EventType.IDLE_START);
  const focusSegments = segments.filter(s => s.category === Category.WORK || s.category === Category.STUDY);
  
  const facts: string[] = [];
  
  if (distractionSegments.length > 0) {
    const totalDistraction = distractionSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
    const minutes = Math.round(totalDistraction / 60000);
    facts.push(`After ${afterTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, you had ${distractionSegments.length} distraction periods totaling ${minutes} minutes.`);
  }
  
  if (idleEvents.length > 0) {
    facts.push(`There were ${idleEvents.length} idle periods detected.`);
  }
  
  if (focusSegments.length > 0) {
    const totalFocus = focusSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
    const minutes = Math.round(totalFocus / 60000);
    facts.push(`You maintained ${minutes} minutes of focus work after that time.`);
  }
  
  // Session fragmentation via navigation events
  const navigationEvents = relevantEvents.filter(e => e.type === EventType.NAVIGATION).length;
  if (navigationEvents > 0) {
    facts.push(`Session fragmentation: ${navigationEvents} screen changes detected.`);
  }
  
  if (facts.length === 0) {
    facts.push(`Activity after ${afterTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} appears stable with no major focus drops.`);
  }

  return { facts, confidence: distractionSegments.length > 0 ? 'high' : 'medium' };
}

export function generateBestFocusTimeFacts(events: OmniEvent[]): FactPayload {
  const segments = deriveSegments(events);
  const focusSegments = segments.filter(s => 
    s.category === Category.STUDY || s.category === Category.WORK
  );
  
  if (focusSegments.length === 0) {
    return { 
      facts: ['Not enough focus activity recorded to determine best times. Try asking about a specific day or activity type.'], 
      confidence: 'low' 
    };
  }

  const hourCounts = new Map<number, number>();
  focusSegments.forEach(seg => {
    const hour = new Date(seg.startTime).getHours();
    const duration = seg.endTime - seg.startTime;
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + duration);
  });

  let peakHour = 0;
  let peakDuration = 0;
  hourCounts.forEach((duration, hour) => {
    if (duration > peakDuration) {
      peakDuration = duration;
      peakHour = hour;
    }
  });

  const facts: string[] = [];
  facts.push(`Your best focus time is around ${peakHour}:00 - ${peakHour + 1}:00.`);
  facts.push(`You spent ${Math.round(peakDuration / 60000)} minutes in focused work during this hour.`);
  
  // Additional details for Analyze mode
  const totalFocusTime = focusSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
  const peakPercentage = Math.round((peakDuration / totalFocusTime) * 100);
  facts.push(`This represents ${peakPercentage}% of your total focus time.`);
  
  // Find second-best hour
  const sortedHours = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1]);
  if (sortedHours.length > 1) {
    const secondBest = sortedHours[1];
    facts.push(`Second-best focus window: ${secondBest[0]}:00 with ${Math.round(secondBest[1] / 60000)} minutes.`);
  }

  return { facts, confidence: 'high' };
}

export function generateImprovementFacts(events: OmniEvent[]): FactPayload {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  const thisWeekEvents = events.filter(e => e.timestamp >= weekAgo);
  const lastWeekEvents = events.filter(e => e.timestamp < weekAgo && e.timestamp >= weekAgo - 7 * 24 * 60 * 60 * 1000);
  
  if (thisWeekEvents.length === 0 || lastWeekEvents.length === 0) {
    return { 
      facts: ['Not enough data to compare weekly progress. Try asking about today or a specific time period.'], 
      confidence: 'low' 
    };
  }

  const thisWeekMetrics = computeMetrics(thisWeekEvents);
  const lastWeekMetrics = computeMetrics(lastWeekEvents);
  
  const facts: string[] = [];
  
  const focusChange = thisWeekMetrics.focusDensity - lastWeekMetrics.focusDensity;
  if (Math.abs(focusChange) > 0.05) {
    if (focusChange > 0) {
      facts.push(`Your focus density improved by ${Math.round(focusChange * 100)}% this week.`);
    } else {
      facts.push(`Your focus density decreased by ${Math.round(Math.abs(focusChange) * 100)}% this week.`);
    }
  } else {
    facts.push('Your focus density remained stable this week.');
  }
  
  const switchChange = thisWeekMetrics.contextSwitches - lastWeekMetrics.contextSwitches;
  if (switchChange < 0) {
    facts.push(`You reduced context switches by ${Math.abs(switchChange)}.`);
  } else if (switchChange > 0) {
    facts.push(`Context switches increased by ${switchChange}.`);
  }
  
  // Additional comparison details
  const activeTimeChange = thisWeekMetrics.totalActiveTime - lastWeekMetrics.totalActiveTime;
  const activeMinutesChange = Math.round(activeTimeChange / 60000);
  if (Math.abs(activeMinutesChange) > 30) {
    facts.push(`Active time ${activeMinutesChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(activeMinutesChange)} minutes.`);
  }

  return { facts, confidence: 'medium' };
}

export function generateDailySummaryFacts(events: OmniEvent[]): FactPayload {
  if (events.length === 0) {
    return { 
      facts: ['No activity recorded today.'], 
      confidence: 'high' 
    };
  }

  const segments = deriveSegments(events);
  const metrics = computeMetrics(events);
  
  const facts: string[] = [];
  
  const activeMinutes = Math.round(metrics.totalActiveTime / 60000);
  const idleMinutes = Math.round(metrics.totalIdleTime / 60000);
  
  facts.push(`You were active for ${activeMinutes} minutes with ${idleMinutes} minutes of idle time.`);
  
  const categoryBreakdown = new Map<Category, number>();
  segments.forEach(seg => {
    const duration = seg.endTime - seg.startTime;
    categoryBreakdown.set(seg.category, (categoryBreakdown.get(seg.category) || 0) + duration);
  });
  
  const sortedCategories = Array.from(categoryBreakdown.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (sortedCategories.length > 0) {
    const topCategory = sortedCategories[0];
    const minutes = Math.round(topCategory[1] / 60000);
    facts.push(`Most time spent on ${topCategory[0]} (${minutes} minutes).`);
  }
  
  facts.push(`You had ${metrics.contextSwitches} context switches today.`);
  
  // Additional details
  if (sortedCategories.length > 1) {
    const breakdown = sortedCategories.map(([cat, dur]) => 
      `${cat}: ${Math.round(dur / 60000)}min`
    ).join(', ');
    facts.push(`Category breakdown: ${breakdown}.`);
  }

  return { facts, confidence: 'high' };
}

export function generateLongestFocusFacts(events: OmniEvent[]): FactPayload {
  const segments = deriveSegments(events);
  const focusSegments = segments.filter(s => 
    s.category === Category.STUDY || s.category === Category.WORK
  );
  
  if (focusSegments.length === 0) {
    return { 
      facts: ['No focus sessions recorded yet. Try asking about a different time period.'], 
      confidence: 'low' 
    };
  }

  let longestSegment = focusSegments[0];
  let longestDuration = longestSegment.endTime - longestSegment.startTime;
  
  for (const seg of focusSegments) {
    const duration = seg.endTime - seg.startTime;
    if (duration > longestDuration) {
      longestDuration = duration;
      longestSegment = seg;
    }
  }

  const facts: string[] = [];
  const minutes = Math.round(longestDuration / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    facts.push(`Your longest focus session was ${hours} hour${hours > 1 ? 's' : ''} and ${remainingMinutes} minutes.`);
  } else {
    facts.push(`Your longest focus session was ${minutes} minutes.`);
  }
  
  const startTime = new Date(longestSegment.startTime);
  facts.push(`It occurred at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${startTime.toLocaleDateString()}.`);
  
  // Additional context
  const avgFocusDuration = focusSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0) / focusSegments.length;
  const avgMinutes = Math.round(avgFocusDuration / 60000);
  facts.push(`Your average focus session is ${avgMinutes} minutes.`);
  
  facts.push(`Total focus sessions recorded: ${focusSegments.length}.`);

  return { facts, confidence: 'high' };
}

export function generateMainDistractionsFacts(events: OmniEvent[]): FactPayload {
  const segments = deriveSegments(events);
  const distractionSegments = segments.filter(s => s.category === Category.DISTRACTION);
  
  if (distractionSegments.length === 0) {
    return { 
      facts: ['No distractions detected in this period.'], 
      confidence: 'high' 
    };
  }

  const facts: string[] = [];
  
  // Time-based analysis
  const hourCounts = new Map<number, number>();
  distractionSegments.forEach(seg => {
    const hour = new Date(seg.startTime).getHours();
    const duration = seg.endTime - seg.startTime;
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + duration);
  });
  
  const sortedHours = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1]);
  const topHour = sortedHours[0];
  const topMinutes = Math.round(topHour[1] / 60000);
  
  facts.push(`Main distraction window: ${topHour[0]}:00 - ${topHour[0] + 1}:00 with ${topMinutes} minutes.`);
  
  // Frequency analysis
  const totalDistraction = distractionSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
  const totalMinutes = Math.round(totalDistraction / 60000);
  facts.push(`Total distraction time: ${totalMinutes} minutes across ${distractionSegments.length} periods.`);
  
  // Pattern analysis
  const avgDuration = Math.round(totalDistraction / distractionSegments.length / 60000);
  facts.push(`Average distraction length: ${avgDuration} minutes.`);
  
  // Top 3 distraction hours
  if (sortedHours.length > 1) {
    const top3 = sortedHours.slice(0, 3).map(([h, d]) => 
      `${h}:00 (${Math.round(d / 60000)}min)`
    ).join(', ');
    facts.push(`Top distraction hours: ${top3}.`);
  }

  return { facts, confidence: 'high' };
}

export function generateMostProductiveFacts(events: OmniEvent[]): FactPayload {
  const segments = deriveSegments(events);
  const productiveSegments = segments.filter(s => 
    s.category === Category.STUDY || s.category === Category.WORK
  );
  
  if (productiveSegments.length === 0) {
    return { 
      facts: ['Not enough productive activity recorded. Try asking about a different time period.'], 
      confidence: 'low' 
    };
  }

  const facts: string[] = [];
  
  // Find most productive hour
  const hourCounts = new Map<number, number>();
  productiveSegments.forEach(seg => {
    const hour = new Date(seg.startTime).getHours();
    const duration = seg.endTime - seg.startTime;
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + duration);
  });
  
  let peakHour = 0;
  let peakDuration = 0;
  hourCounts.forEach((duration, hour) => {
    if (duration > peakDuration) {
      peakDuration = duration;
      peakHour = hour;
    }
  });
  
  const peakMinutes = Math.round(peakDuration / 60000);
  facts.push(`Most productive time: ${peakHour}:00 - ${peakHour + 1}:00 with ${peakMinutes} minutes of focused work.`);
  
  // Find most productive day
  const dayCounts = new Map<string, number>();
  productiveSegments.forEach(seg => {
    const date = new Date(seg.startTime).toLocaleDateString();
    const duration = seg.endTime - seg.startTime;
    dayCounts.set(date, (dayCounts.get(date) || 0) + duration);
  });
  
  if (dayCounts.size > 1) {
    let peakDay = '';
    let peakDayDuration = 0;
    dayCounts.forEach((duration, day) => {
      if (duration > peakDayDuration) {
        peakDayDuration = duration;
        peakDay = day;
      }
    });
    const dayMinutes = Math.round(peakDayDuration / 60000);
    facts.push(`Most productive day: ${peakDay} with ${dayMinutes} minutes.`);
  }
  
  // Overall productivity stats
  const totalProductive = productiveSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
  const totalMinutes = Math.round(totalProductive / 60000);
  facts.push(`Total productive time: ${totalMinutes} minutes across ${productiveSegments.length} sessions.`);
  
  // Top 3 productive hours
  const sortedHours = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1]);
  if (sortedHours.length > 1) {
    const top3 = sortedHours.slice(0, 3).map(([h, d]) => 
      `${h}:00 (${Math.round(d / 60000)}min)`
    ).join(', ');
    facts.push(`Top productive hours: ${top3}.`);
  }

  return { facts, confidence: 'high' };
}
