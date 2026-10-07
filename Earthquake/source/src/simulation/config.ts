import type { StrengthLevel } from './types';

export interface IntensityConfig {
  level: StrengthLevel;
  amplitude: number;
  frequency: number;
  verticalImpulse: number;
  stressMultiplier: number;
  cityDamageThreshold: number;
}

const intensityLevels: Record<StrengthLevel, IntensityConfig> = {
  1: { level: 1, amplitude: 0.7, frequency: 0.9, verticalImpulse: 0.04, stressMultiplier: 0.18, cityDamageThreshold: 0.98 },
  2: { level: 2, amplitude: 1.5, frequency: 1.25, verticalImpulse: 0.08, stressMultiplier: 0.34, cityDamageThreshold: 0.85 },
  3: { level: 3, amplitude: 2.8, frequency: 1.65, verticalImpulse: 0.14, stressMultiplier: 0.62, cityDamageThreshold: 0.66 },
  4: { level: 4, amplitude: 4.5, frequency: 2.05, verticalImpulse: 0.22, stressMultiplier: 1.05, cityDamageThreshold: 0.42 },
  5: { level: 5, amplitude: 7, frequency: 2.55, verticalImpulse: 0.34, stressMultiplier: 1.65, cityDamageThreshold: 0.22 },
};

export function intensityConfig(level: number): IntensityConfig {
  if (!Number.isInteger(level) || level < 1 || level > 5) {
    throw new RangeError('Earthquake strength must be between 1 and 5.');
  }

  return intensityLevels[level as StrengthLevel];
}
