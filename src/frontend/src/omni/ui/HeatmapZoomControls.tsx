// Accessible zoom controls for heatmap

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { ZoomLevel } from '../hooks/useHeatmapZoom';

interface HeatmapZoomControlsProps {
  zoomLevel: ZoomLevel;
  onZoomChange: (level: ZoomLevel) => void;
}

export function HeatmapZoomControls({ zoomLevel, onZoomChange }: HeatmapZoomControlsProps) {
  const handleZoomIn = () => {
    onZoomChange(Math.min(5, zoomLevel + 1) as ZoomLevel);
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(1, zoomLevel - 1) as ZoomLevel);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        disabled={zoomLevel === 1}
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-[200px]">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Zoom</span>
        <Slider
          value={[zoomLevel]}
          onValueChange={([value]) => onZoomChange(value as ZoomLevel)}
          min={1}
          max={5}
          step={1}
          className="flex-1"
        />
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        disabled={zoomLevel === 5}
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
    </div>
  );
}
