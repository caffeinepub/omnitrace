// Session Analysis Dashboard with Focus Score, Daily Summary, Titles, and Drift Detection

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { OmniEvent } from '../omni/types';
import { queryEvents } from '../omni/engine/queries';
import { computeMetrics } from '../omni/analytics/metrics';
import { computeInsights } from '../omni/analytics/insights';
import { generateDailySummary } from '../omni/analytics/dailySummary';
import { computeTitles } from '../omni/analytics/titles';
import { detectCognitiveDrift } from '../omni/analytics/driftDetection';
import { DailySummaryCard } from '../omni/ui/DailySummaryCard';
import { TitlesStrip } from '../omni/ui/TitlesStrip';
import { Calendar, TrendingUp, Clock, Zap, Target } from 'lucide-react';
import { LoadingState, EmptyState } from '../omni/ui/States';

interface DashboardScreenProps {
  isPrivate?: boolean;
}

export function DashboardScreen({ isPrivate }: DashboardScreenProps) {
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

  const metrics = computeMetrics(events);
  const insights = computeInsights(events);
  const dailySummary = generateDailySummary(events);
  const { earnedTitles } = computeTitles(events);
  const driftRecommendation = detectCognitiveDrift(events);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <LoadingState message="Loading dashboard metrics..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Deterministic metrics from recorded activity
          </p>
        </div>
        {!isPrivate && earnedTitles.length > 0 && (
          <TitlesStrip titles={earnedTitles} />
        )}
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

      {events.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-12 h-12" />}
          message="No activity data for the selected period. Start logging events to see your metrics."
        />
      ) : (
        <>
          <DailySummaryCard summary={dailySummary} />

          {driftRecommendation && dailySummary.hasEnoughData && (
            <Card className="shadow-sm border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  💡 {driftRecommendation.message}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Active Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.totalActiveTime)}</div>
                <p className="text-xs text-muted-foreground mt-1">Productive activity</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Background Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.totalBackgroundTime)}</div>
                <p className="text-xs text-muted-foreground mt-1">Passive periods</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Idle Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.totalIdleTime)}</div>
                <p className="text-xs text-muted-foreground mt-1">Inactive periods</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Context Switches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.contextSwitches}</div>
                <p className="text-xs text-muted-foreground mt-1">Activity transitions</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Focus Density</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Concentration level</span>
                  <span className="font-medium">{(metrics.focusDensity * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.focusDensity * 100} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  Ratio of active time to total time
                </p>
              </div>
            </CardContent>
          </Card>

          {insights.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Activity Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, i) => (
                    <div key={i}>
                      <h4 className="text-sm font-semibold mb-1">{insight.title}</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{insight.definition}</span>
                        <span className="font-medium">{insight.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
