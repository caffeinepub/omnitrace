// React hook managing OMNIBRAIN runtime mode (Local vs API) with localStorage persistence and immediate cross-component updates

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'omnibrain-runtime-mode';
const CUSTOM_EVENT_NAME = 'omnibrain-runtime-mode-changed';

export type OmniBrainRuntimeMode = 'local' | 'api';

export interface RuntimeModeLabels {
  local: string;
  api: string;
  apiUnavailableNote: string;
}

export const RUNTIME_MODE_LABELS: RuntimeModeLabels = {
  local: 'Local (Offline)',
  api: 'API (Online)',
  apiUnavailableNote: 'Not supported in this build',
};

function validateMode(value: unknown): OmniBrainRuntimeMode {
  if (value === 'local' || value === 'api') {
    return value;
  }
  return 'local'; // Safe default
}

function loadMode(): OmniBrainRuntimeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return validateMode(stored);
  } catch {
    return 'local';
  }
}

function saveMode(mode: OmniBrainRuntimeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
    // Dispatch custom event for cross-component updates
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: mode }));
  } catch (error) {
    console.error('Failed to save OMNIBRAIN runtime mode:', error);
  }
}

export function useOmniBrainRuntimeMode() {
  const [mode, setModeState] = useState<OmniBrainRuntimeMode>(loadMode);

  useEffect(() => {
    // Listen for changes from other components or tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setModeState(validateMode(e.newValue));
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<OmniBrainRuntimeMode>;
      setModeState(validateMode(customEvent.detail));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);
    };
  }, []);

  const setMode = (newMode: OmniBrainRuntimeMode) => {
    const validated = validateMode(newMode);
    setModeState(validated);
    saveMode(validated);
  };

  return {
    mode,
    setMode,
    isLocal: mode === 'local',
    isAPI: mode === 'api',
    displayLabel: RUNTIME_MODE_LABELS[mode],
  };
}
