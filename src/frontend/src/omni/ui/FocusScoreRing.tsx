// Focus Score ring UI component with soft glow and smooth transitions

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { FocusLabel } from '../analytics/focusScore';

interface FocusScoreRingProps {
  score: number;
  label: FocusLabel;
  hasEnoughData: boolean;
}

export function FocusScoreRing({ score, label, hasEnoughData }: FocusScoreRingProps) {
  if (!hasEnoughData) {
    return (
      <Card className="focus-ring-container focus-ring-insufficient">
        <div className="focus-ring-content">
          <Brain className="w-5 h-5 text-muted-foreground" />
          <div className="focus-ring-text">
            <div className="text-xs text-muted-foreground font-medium">Focus Score</div>
            <div className="text-sm text-muted-foreground">Not enough data yet</div>
          </div>
        </div>
      </Card>
    );
  }

  const stateClass = `focus-ring-${label.toLowerCase().replace(' ', '-')}`;

  return (
    <Card className={`focus-ring-container ${stateClass}`}>
      <div className="focus-ring-glow" />
      <div className="focus-ring-content">
        <div className="focus-ring-score">{score}</div>
        <div className="focus-ring-text">
          <div className="text-xs text-muted-foreground font-medium">Focus Score</div>
          <Badge variant="outline" className="focus-ring-badge">
            {label}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
