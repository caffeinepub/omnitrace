// Cognitive Mode state management with localStorage persistence

import { useState, useEffect } from 'react';

export type CognitiveMode = 'focus' | 'flow' | 'recovery' | 'analysis';

const STORAGE_KEY = 'omnitrace_cognitive_mode';
const DEFAULT_MODE: CognitiveMode = 'focus';

export function useCognitiveMode() {
  const [mode, setModeState] = useState<CognitiveMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['focus', 'flow', 'recovery', 'analysis'].includes(stored)) {
        return stored as CognitiveMode;
      }
    } catch (error) {
      console.error('Failed to read cognitive mode from localStorage:', error);
    }
    return DEFAULT_MODE;
  });

  const setMode = (newMode: CognitiveMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Failed to persist cognitive mode to localStorage:', error);
    }
  };

  return { mode, setMode };
}
