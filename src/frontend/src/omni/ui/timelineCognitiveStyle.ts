// Cognitive Time Flow utility with enhanced duration-reactive glow

import { Category, Confidence } from '../types';

export interface CognitiveStyle {
  intensity: number; // 0-1
  glowColor: string;
  glowStrength: number; // 0-1
  elevation: number;
}

export function getCognitiveStyle(
  duration: number | undefined,
  category: Category | undefined,
  confidence: Confidence
): CognitiveStyle {
  let intensity = 0.3; // Base intensity
  
  // Duration factor (monotonic relationship)
  if (duration) {
    const durationMinutes = duration / 60000;
    // Longer sessions = higher intensity (capped at 1.0)
    intensity += Math.min(0.5, durationMinutes / 60);
  }
  
  // Category factor
  if (category === Category.WORK || category === Category.STUDY) {
    intensity += 0.2;
  } else if (category === Category.DISTRACTION) {
    intensity += 0.1;
  }
  
  // Clamp intensity
  intensity = Math.min(1, intensity);
  
  // Determine glow color based on confidence
  let glowColor: string;
  if (confidence === Confidence.AUTO) {
    glowColor = 'oklch(0.7 0.2 260)'; // Electric Indigo
  } else if (confidence === Confidence.MANUAL) {
    glowColor = 'oklch(0.75 0.18 180)'; // Cyan Pulse
  } else {
    glowColor = 'oklch(0.6 0.15 30)'; // Amber for recovered
  }
  
  // Glow strength is directly tied to intensity
  const glowStrength = intensity;
  
  // Elevation based on intensity
  const elevation = Math.round(intensity * 3);
  
  return {
    intensity,
    glowColor,
    glowStrength,
    elevation,
  };
}

export function getCognitiveStyleVars(style: CognitiveStyle): React.CSSProperties {
  return {
    '--cognitive-intensity': style.intensity.toString(),
    '--cognitive-glow-color': style.glowColor,
    '--cognitive-glow-strength': style.glowStrength.toString(),
    '--cognitive-elevation': style.elevation.toString(),
  } as React.CSSProperties;
}
