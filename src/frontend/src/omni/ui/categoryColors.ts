// Neural Midnight harmonized category colors with Electric Indigo and Cyan Pulse accents

import { Category } from '../types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.WORK]: 'oklch(0.62 0.18 272)',        // Electric Indigo - primary focus
  [Category.STUDY]: 'oklch(0.70 0.16 240)',       // Blue-violet for learning
  [Category.DISTRACTION]: 'oklch(0.75 0.16 310)', // Magenta for interruptions
  [Category.REST]: 'oklch(0.78 0.14 192)',        // Cyan Pulse - recovery
  [Category.UNKNOWN]: 'oklch(0.50 0.05 260)',     // Very muted for unknown
};

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.WORK]: 'Work',
  [Category.STUDY]: 'Study',
  [Category.DISTRACTION]: 'Distraction',
  [Category.REST]: 'Rest',
  [Category.UNKNOWN]: 'Unknown',
};
