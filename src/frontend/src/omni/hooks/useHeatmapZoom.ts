// Heatmap zoom state management with pinch/trackpad support

import { useState, useEffect, useCallback } from 'react';

export type ZoomLevel = 1 | 2 | 3 | 4 | 5;

const ZOOM_TO_BINS: Record<ZoomLevel, number> = {
  1: 50,   // Coarse
  2: 100,  // Default
  3: 200,  // Fine
  4: 400,  // Very fine
  5: 800,  // Ultra fine
};

export function useHeatmapZoom(containerRef: React.RefObject<HTMLElement | null>) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(2);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    
    e.preventDefault();
    
    setZoomLevel(prev => {
      if (e.deltaY < 0) {
        // Zoom in
        return Math.min(5, prev + 1) as ZoomLevel;
      } else {
        // Zoom out
        return Math.max(1, prev - 1) as ZoomLevel;
      }
    });
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    (e.target as any)._pinchStartDistance = distance;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    const startDistance = (e.target as any)._pinchStartDistance;
    if (!startDistance) return;
    
    const delta = distance - startDistance;
    
    if (Math.abs(delta) > 50) {
      setZoomLevel(prev => {
        if (delta > 0) {
          return Math.min(5, prev + 1) as ZoomLevel;
        } else {
          return Math.max(1, prev - 1) as ZoomLevel;
        }
      });
      
      (e.target as any)._pinchStartDistance = distance;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerRef, handleWheel, handleTouchStart, handleTouchMove]);

  return {
    zoomLevel,
    setZoomLevel,
    binCount: ZOOM_TO_BINS[zoomLevel],
  };
}
