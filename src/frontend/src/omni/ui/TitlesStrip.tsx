// Subtle titles display component

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';
import { Title } from '../analytics/titles';

interface TitlesStripProps {
  titles: Title[];
}

export function TitlesStrip({ titles }: TitlesStripProps) {
  if (titles.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Award className="w-4 h-4 text-muted-foreground" />
      {titles.map(title => (
        <Badge key={title} variant="secondary" className="text-xs font-medium">
          {title}
        </Badge>
      ))}
    </div>
  );
}
