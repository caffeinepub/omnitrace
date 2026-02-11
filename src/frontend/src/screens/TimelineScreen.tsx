// Live Timeline with Heatmap mode, Smart Merging, Private Mode, Cognitive Mode awareness, and enhanced visual rules

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Activity } from 'lucide-react';
import { OmniEvent, Category, Confidence } from '../omni/types';
import { readAllEvents } from '../omni/storage/ledger';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../omni/ui/categoryColors';
import { ManualEventDialog } from './ManualEventDialog';
import { EmptyState } from '../omni/ui/States';
import { getCognitiveStyle, getCognitiveStyleVars } from '../omni/ui/timelineCognitiveStyle';
import { generateHeatmap } from '../omni/analytics/heatmap';
import { HeatmapBar } from '../omni/ui/HeatmapBar';
import { HeatmapZoomControls } from '../omni/ui/HeatmapZoomControls';
import { useHeatmapZoom } from '../omni/hooks/useHeatmapZoom';
import { smartMergeSegments } from '../omni/analytics/smartMerging';
import { useCognitiveMode } from '../omni/hooks/useCognitiveMode';

interface TimelineScreenProps {
  isPrivate?: boolean;
}

const MODE_DESCRIPTIONS: Record<string, string> = {
  focus: 'Aggressively groups distractions',
  flow: 'Prioritizes long sessions',
  recovery: 'Highlights rest & burnout signals',
  analysis: 'Raw data, no AI filtering',
};

export function TimelineScreen({ isPrivate }: TimelineScreenProps) {
  const [events, setEvents] = useState<OmniEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<OmniEvent[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<Confidence | 'all'>('all');
  const [jumpToDate, setJumpToDate] = useState('');
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'heatmap'>('timeline');
  const [mergeMode, setMergeMode] = useState<'raw' | 'smart'>('raw');
  
  const { mode } = useCognitiveMode();
  
  const heatmapContainerRef = useRef<HTMLDivElement | null>(null);
  const { zoomLevel, setZoomLevel, binCount } = useHeatmapZoom(heatmapContainerRef);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, categoryFilter, confidenceFilter]);

  const loadEvents = async () => {
    const allEvents = await readAllEvents();
    setEvents(allEvents);
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (confidenceFilter !== 'all') {
      filtered = filtered.filter(e => e.confidence === confidenceFilter);
    }

    setFilteredEvents(filtered.sort((a, b) => b.timestamp - a.timestamp));
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getEventAge = (timestamp: number) => {
    const now = Date.now();
    const age = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return Math.min(1, age / maxAge);
  };

  const handleManualEventSaved = () => {
    loadEvents();
  };

  const handleJumpToDate = () => {
    if (!jumpToDate) return;
    const targetDate = new Date(jumpToDate).getTime();
    const element = document.querySelector(`[data-timestamp="${targetDate}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Prepare heatmap data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const heatmapBins = generateHeatmap(
    filteredEvents,
    today.getTime(),
    tomorrow.getTime(),
    binCount
  );

  // Prepare merged segments with cognitive mode
  const mergedSegments = mergeMode === 'smart' ? smartMergeSegments(filteredEvents, mode) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Live Timeline</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time activity stream with cognitive intensity
          </p>
        </div>
        <Button onClick={() => setShowManualDialog(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Log Event
        </Button>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode:</span>{' '}
              {MODE_DESCRIPTIONS[mode]}
            </div>
          </div>

          {viewMode === 'timeline' && (
            <div className="flex gap-3 items-end flex-wrap">
              <div className="space-y-2 flex-1 min-w-[150px]">
                <label className="text-sm text-muted-foreground">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Categories</option>
                  {Object.values(Category).map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 flex-1 min-w-[150px]">
                <label className="text-sm text-muted-foreground">Confidence</label>
                <select
                  value={confidenceFilter}
                  onChange={(e) => setConfidenceFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Confidence</option>
                  <option value={Confidence.AUTO}>Auto</option>
                  <option value={Confidence.MANUAL}>Manual</option>
                  <option value={Confidence.RECOVERED}>Recovered</option>
                </select>
              </div>

              <div className="space-y-2 flex-1 min-w-[150px]">
                <label className="text-sm text-muted-foreground">View Mode</label>
                <select
                  value={mergeMode}
                  onChange={(e) => setMergeMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="raw">Raw Events</option>
                  <option value="smart">Smart Merged</option>
                </select>
              </div>

              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm text-muted-foreground">Jump to Date</label>
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={jumpToDate}
                    onChange={(e) => setJumpToDate(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleJumpToDate} variant="outline" size="icon">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'heatmap' && (
            <HeatmapZoomControls
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
            />
          )}
        </div>
      </Card>

      {viewMode === 'timeline' && (
        <>
          {mergeMode === 'smart' && mergedSegments && mergedSegments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Smart Merged View</h3>
                <Badge variant="outline" className="text-xs">
                  {mergedSegments.length} segments
                </Badge>
              </div>
              
              <ScrollArea className="h-[600px] rounded-md border border-border/50">
                <div className="p-4 space-y-3">
                  {mergedSegments.map((segment, idx) => {
                    const duration = segment.endTime - segment.startTime;
                    const cognitiveStyle = getCognitiveStyle(duration, segment.category, segment.confidence);
                    const cognitiveVars = getCognitiveStyleVars(cognitiveStyle);
                    
                    return (
                      <Card
                        key={idx}
                        className="timeline-event-card p-4 border-l-4"
                        style={{
                          ...cognitiveVars,
                          borderLeftColor: CATEGORY_COLORS[segment.category],
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`font-semibold ${isPrivate ? 'blur-sm' : ''}`}>
                                {segment.label}
                              </h4>
                              <Badge
                                variant="outline"
                                style={{ backgroundColor: `${CATEGORY_COLORS[segment.category]}20` }}
                              >
                                {CATEGORY_LABELS[segment.category]}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {segment.rawSegmentCount} raw
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatTime(segment.startTime)}</span>
                              <span>→</span>
                              <span>{formatTime(segment.endTime)}</span>
                              <span className="font-mono font-semibold">
                                {formatDuration(duration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {mergeMode === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Raw Events</h3>
                <Badge variant="outline" className="text-xs">
                  {filteredEvents.length} events
                </Badge>
              </div>

              {filteredEvents.length === 0 ? (
                <EmptyState
                  icon={<Activity className="w-12 h-12" />}
                  title="No events found"
                  message="Try adjusting your filters or log a new event."
                />
              ) : (
                <ScrollArea className="h-[600px] rounded-md border border-border/50">
                  <div className="p-4 space-y-3">
                    {filteredEvents.map((event) => {
                      const age = getEventAge(event.timestamp);
                      const cognitiveStyle = getCognitiveStyle(event.duration, event.category, event.confidence);
                      const cognitiveVars = getCognitiveStyleVars(cognitiveStyle);
                      
                      return (
                        <Card
                          key={event.id}
                          data-timestamp={event.timestamp}
                          className="timeline-event-card p-4 border-l-4"
                          style={{
                            ...cognitiveVars,
                            borderLeftColor: event.category ? CATEGORY_COLORS[event.category] : CATEGORY_COLORS[Category.UNKNOWN],
                            opacity: 1 - age * 0.3,
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-semibold ${isPrivate ? 'blur-sm' : ''}`}>
                                  {event.title || event.type}
                                </h4>
                                {event.category && (
                                  <Badge
                                    variant="outline"
                                    style={{ backgroundColor: `${CATEGORY_COLORS[event.category]}20` }}
                                  >
                                    {CATEGORY_LABELS[event.category]}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {event.confidence}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{formatTime(event.timestamp)}</span>
                                {event.duration && (
                                  <span className="font-mono font-semibold">
                                    {formatDuration(event.duration)}
                                  </span>
                                )}
                              </div>

                              {event.keywords && event.keywords.length > 0 && (
                                <div className={`flex gap-1.5 flex-wrap ${isPrivate ? 'blur-sm' : ''}`}>
                                  {event.keywords.map((kw, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {kw}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {event.note && (
                                <p className={`text-sm text-muted-foreground ${isPrivate ? 'blur-sm' : ''}`}>
                                  {event.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </>
      )}

      {viewMode === 'heatmap' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Mental Load Heatmap</h3>
            <Badge variant="outline" className="text-xs">
              Today
            </Badge>
          </div>

          <div ref={heatmapContainerRef}>
            {heatmapBins.length > 0 ? (
              <HeatmapBar bins={heatmapBins} height={120} />
            ) : (
              <div className="heatmap-empty h-[120px] rounded-md">
                <p className="text-sm text-muted-foreground">No activity data for today</p>
              </div>
            )}
          </div>

          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              The heatmap shows cognitive load intensity throughout the day. Warmer colors indicate higher mental load.
            </p>
          </div>
        </div>
      )}

      <ManualEventDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
        onEventCreated={handleManualEventSaved}
      />
    </div>
  );
}
