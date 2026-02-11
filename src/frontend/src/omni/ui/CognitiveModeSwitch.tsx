// Cognitive Mode pill-style switch UI component

import React from 'react';
import { CognitiveMode } from '../hooks/useCognitiveMode';

interface CognitiveModeSwitchProps {
  mode: CognitiveMode;
  onChange: (mode: CognitiveMode) => void;
}

const MODE_LABELS: Record<CognitiveMode, string> = {
  focus: 'Focus',
  flow: 'Flow',
  recovery: 'Recovery',
  analysis: 'Analysis',
};

export function CognitiveModeSwitch({ mode, onChange }: CognitiveModeSwitchProps) {
  const modes: CognitiveMode[] = ['focus', 'flow', 'recovery', 'analysis'];

  return (
    <div className="flex items-center gap-1 bg-muted/30 rounded-full p-1 border border-border/50">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`
            px-3 py-1.5 rounded-full text-xs font-semibold transition-all
            ${
              mode === m
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
          `}
          aria-pressed={mode === m}
          aria-label={`Switch to ${MODE_LABELS[m]} mode`}
        >
          {MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
