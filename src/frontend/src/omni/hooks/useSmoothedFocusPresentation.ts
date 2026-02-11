// Smoothed focus score presentation with lerp-based animation

import { useState, useEffect, useRef } from 'react';
import { FocusLabel } from '../analytics/focusScore';

interface SmoothedFocusState {
  displayScore: number;
  displayLabel: FocusLabel;
}

const LERP_SPEED = 0.05; // Slower = smoother

export function useSmoothedFocusPresentation(
  targetScore: number,
  targetLabel: FocusLabel
): SmoothedFocusState {
  const [displayScore, setDisplayScore] = useState(targetScore);
  const [displayLabel, setDisplayLabel] = useState(targetLabel);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      // Snap immediately if reduced motion is preferred
      setDisplayScore(targetScore);
      setDisplayLabel(targetLabel);
      return;
    }

    let currentScore = displayScore;

    const animate = () => {
      const diff = targetScore - currentScore;
      
      if (Math.abs(diff) < 0.5) {
        setDisplayScore(targetScore);
        setDisplayLabel(targetLabel);
        return;
      }

      currentScore += diff * LERP_SPEED;
      setDisplayScore(Math.round(currentScore));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetScore, targetLabel, prefersReducedMotion]);

  return { displayScore, displayLabel };
}
