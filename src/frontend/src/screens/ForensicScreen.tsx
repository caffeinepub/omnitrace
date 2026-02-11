// Forensic Mode for exact timeline reconstruction with refined UI

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { reconstructTimeline, ForensicReconstruction } from '../omni/forensics/reconstruct';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../omni/ui/categoryColors';
import { Search, Microscope } from 'lucide-react';
import { EmptyState, InlineNotice } from '../omni/ui/States';

export function ForensicScreen() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reconstruction, setReconstruction] = useState<ForensicReconstruction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReconstruct = async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true);
    try {
      const result = await reconstructTimeline(
        new Date(startDate).getTime(),
        new Date(endDate).getTime()
      );
      setReconstruction(result);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Forensic Mode</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Exact timeline reconstruction from recorded events
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Select Time Window</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground">Start</label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground">End</label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleReconstruct} 
              disabled={isLoading || !startDate || !endDate} 
              className="gap-2 shadow-sm"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Reconstructing...' : 'Reconstruct'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reconstruction && (
        <>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Derived Segments</CardTitle>
            </CardHeader>
            <CardContent>
              {reconstruction.segments.length === 0 ? (
                <InlineNotice message="No segments found in this time window." />
              ) : (
                <div className="space-y-2">
                  {reconstruction.segments.map((segment, i) => (
                    <Accordion key={i} type="single" collapsible>
                      <AccordionItem value={`segment-${i}`} className="border border-border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-4 flex-1 text-left flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">
                              {formatTime(segment.startTime)}
                            </span>
                            <span className="font-medium text-sm">{segment.activity}</span>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: CATEGORY_COLORS[segment.category],
                                color: CATEGORY_COLORS[segment.category],
                                backgroundColor: `${CATEGORY_COLORS[segment.category]}15`,
                              }}
                            >
                              {CATEGORY_LABELS[segment.category]}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">{segment.confidence}</Badge>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatDuration(segment.endTime - segment.startTime)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4 pt-2 pb-2 space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Source Events ({segment.sourceEventIds.length}):
                            </p>
                            <div className="space-y-1">
                              {segment.sourceEventIds.map(id => {
                                const event = reconstruction.rawEvents.find(e => e.id === id);
                                return event ? (
                                  <div key={id} className="text-xs font-mono bg-muted/50 p-2 rounded">
                                    {event.type} @ {formatTime(event.timestamp)}
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {reconstruction.gaps.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Gaps (Unknown Intervals)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reconstruction.gaps.map((gap, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded border border-border">
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatTime(gap.start)} → {formatTime(gap.end)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Gap: {formatDuration(gap.end - gap.start)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!reconstruction && (
        <EmptyState
          icon={<Microscope className="w-12 h-12" />}
          message="Select a time window and click Reconstruct to analyze your timeline."
        />
      )}
    </div>
  );
}

