import { useState, useEffect, useRef, useCallback } from 'react';

interface StopwatchState {
  elapsedMs: number;
  isRunning: boolean;
}

export function useStopwatch() {
  const [state, setState] = useState<StopwatchState>({
    elapsedMs: 0,
    isRunning: false,
  });
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const updateElapsed = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = performance.now();
      const elapsed = accumulatedRef.current + (now - startTimeRef.current);
      setState(prev => ({ ...prev, elapsedMs: elapsed }));
      rafRef.current = requestAnimationFrame(updateElapsed);
    }
  }, []);

  const start = useCallback(() => {
    if (!state.isRunning) {
      startTimeRef.current = performance.now();
      setState(prev => ({ ...prev, isRunning: true }));
    }
  }, [state.isRunning]);

  const pause = useCallback(() => {
    if (state.isRunning && startTimeRef.current !== null) {
      const now = performance.now();
      accumulatedRef.current += now - startTimeRef.current;
      startTimeRef.current = null;
      setState(prev => ({ ...prev, isRunning: false }));
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  }, [state.isRunning]);

  const reset = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    setState({ elapsedMs: 0, isRunning: false });
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      rafRef.current = requestAnimationFrame(updateElapsed);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [state.isRunning, updateElapsed]);

  return {
    elapsedMs: state.elapsedMs,
    isRunning: state.isRunning,
    start,
    pause,
    reset,
  };
}
