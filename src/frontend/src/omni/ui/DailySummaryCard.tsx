// Daily summary card with calm English insights

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { DailySummary } from '../analytics/dailySummary';

interface DailySummaryCardProps {
  summary: DailySummary;
}

export function DailySummaryCard({ summary }: DailySummaryCardProps) {
  return (
    <Card className="daily-summary-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          What happened today?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {summary.insights.map((insight, i) => (
            <p key={i} className="text-sm text-foreground/90 leading-relaxed">
              {insight}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
