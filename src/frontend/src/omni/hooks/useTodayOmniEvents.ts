// Offline-first hook to load and refresh today's local events

import { useState, useEffect } from 'react';
import { OmniEvent } from '../types';
import { queryEvents } from '../engine/queries';

export function useTodayOmniEvents(refreshInterval = 30000) {
  const [events, setEvents] = useState<OmniEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTodayEvents = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const results = await queryEvents({
        startTime: today.getTime(),
        endTime: tomorrow.getTime(),
      });

      setEvents(results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load events'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayEvents();

    // Set up periodic refresh
    const interval = setInterval(loadTodayEvents, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    events,
    isLoading,
    error,
    refresh: loadTodayEvents,
  };
}
