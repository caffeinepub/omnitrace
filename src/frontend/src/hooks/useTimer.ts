import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerState {
  remainingMs: number;
  isRunning: boolean;
  isCompleted: boolean;
}

export function useTimer(initialDurationMs: number = 0) {
  const [state, setState] = useState<TimerState>({
    remainingMs: initialDurationMs,
    isRunning: false,
    isCompleted: false,
  });
  const [durationMs, setDurationMs] = useState(initialDurationMs);
  const startTimeRef = useRef<number | null>(null);
  const remainingAtStartRef = useRef<number>(initialDurationMs);
  const rafRef = useRef<number | null>(null);

  const updateRemaining = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, remainingAtStartRef.current - elapsed);
      
      setState(prev => ({ 
        ...prev, 
        remainingMs: remaining,
        isCompleted: remaining === 0,
        isRunning: remaining > 0,
      }));

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(updateRemaining);
      } else {
        startTimeRef.current = null;
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    }
  }, []);

  const start = useCallback(() => {
    if (!state.isRunning && state.remainingMs > 0) {
      startTimeRef.current = performance.now();
      remainingAtStartRef.current = state.remainingMs;
      setState(prev => ({ ...prev, isRunning: true, isCompleted: false }));
    }
  }, [state.isRunning, state.remainingMs]);

  const pause = useCallback(() => {
    if (state.isRunning && startTimeRef.current !== null) {
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, remainingAtStartRef.current - elapsed);
      startTimeRef.current = null;
      setState(prev => ({ ...prev, remainingMs: remaining, isRunning: false }));
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
    remainingAtStartRef.current = durationMs;
    setState({ remainingMs: durationMs, isRunning: false, isCompleted: false });
  }, [durationMs]);

  const setDuration = useCallback((ms: number) => {
    if (!state.isRunning) {
      setDurationMs(ms);
      remainingAtStartRef.current = ms;
      setState({ remainingMs: ms, isRunning: false, isCompleted: false });
    }
  }, [state.isRunning]);

  useEffect(() => {
    if (state.isRunning) {
      rafRef.current = requestAnimationFrame(updateRemaining);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [state.isRunning, updateRemaining]);

  return {
    remainingMs: state.remainingMs,
    isRunning: state.isRunning,
    isCompleted: state.isCompleted,
    start,
    pause,
    reset,
    setDuration,
  };
}
