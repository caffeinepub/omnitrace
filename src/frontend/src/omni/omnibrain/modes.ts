// OMNIBRAIN Intelligence Mode definitions

export type IntelligenceMode = 'explain' | 'analyze' | 'coach' | 'silent';

export interface ModeConfig {
  label: string;
  description: string;
}

export const MODE_CONFIGS: Record<IntelligenceMode, ModeConfig> = {
  explain: {
    label: 'Explain',
    description: 'Clear, detailed explanations with context',
  },
  analyze: {
    label: 'Analyze',
    description: 'Data-driven insights with patterns',
  },
  coach: {
    label: 'Coach',
    description: 'Supportive guidance and recommendations',
  },
  silent: {
    label: 'Silent',
    description: 'Brief, minimal output',
  },
};

export function renderWithMode(facts: string[], mode: IntelligenceMode): string {
  if (facts.length === 0) return '';

  switch (mode) {
    case 'explain':
      // Concise: first 2-3 facts as a paragraph
      return facts.slice(0, 3).join(' ');
      
    case 'analyze':
      // Verbose: all facts as numbered list
      return facts.map((fact, i) => `${i + 1}. ${fact}`).join('\n');
      
    case 'coach':
      // Gentle: all facts with supportive emoji
      return facts.map(fact => `💡 ${fact}`).join('\n\n');
      
    case 'silent':
      // Minimal: only first fact as bullet
      return `• ${facts[0]}`;
  }
}
