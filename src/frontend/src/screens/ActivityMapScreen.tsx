// Activity Map with refined category breakdown and consistent progress bars

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OmniEvent } from '../omni/types';
import { queryEvents } from '../omni/engine/queries';
import { computeCategoryBreakdown } from '../omni/analytics/categoryBreakdown';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../omni/ui/categoryColors';
import { Calendar, Map } from 'lucide-react';
import { LoadingState, EmptyState } from '../omni/ui/States';

export function ActivityMapScreen() {
  const [events, setEvents] = useState<OmniEvent[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTodayEvents();
  }, []);

  const loadTodayEvents = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomRange = async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true);
    try {
      const results = await queryEvents({
        startTime: new Date(startDate).getTime(),
        endTime: new Date(endDate).getTime(),
      });

      setEvents(results);
    } finally {
      setIsLoading(false);
    }
  };

  const breakdown = computeCategoryBreakdown(events);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <LoadingState message="Loading activity breakdown..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Activity Map</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Category breakdown with time distribution
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-2 flex-1 min-w-[180px]">
              <label className="text-sm text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1 min-w-[180px]">
              <label className="text-sm text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button 
              onClick={loadCustomRange} 
              disabled={!startDate || !endDate || isLoading}
              className="gap-2 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Apply Range
            </Button>
            <Button variant="outline" onClick={loadTodayEvents} disabled={isLoading}>
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {breakdown.length === 0 ? (
        <EmptyState
          icon={<Map className="w-12 h-12" />}
          message="No activity data for the selected period. Start logging events to see your breakdown."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {breakdown.map((item) => (
            <Card key={item.category} className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                  />
                  {CATEGORY_LABELS[item.category]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">{formatDuration(item.duration)}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.percentage.toFixed(1)}% of total
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: CATEGORY_COLORS[item.category],
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

