import type { PhysicsSnapshot } from './PhysicsScene';
import type { IntensityConfig } from './config';

export type StreetlightState = 'on' | 'flicker' | 'off';

export interface DamageSnapshot {
  brokenConstraintIds: string[];
  toppledTreeIds: string[];
  lightStates: Record<string, StreetlightState>;
}

export class DamageController {
  private readonly seed: number;

  constructor(seed = 1) {
    this.seed = seed;
  }

  update(snapshot: PhysicsSnapshot, elapsedMs: number, intensity: IntensityConfig): DamageSnapshot {
    const strengthTime = (elapsedMs / 1000) * intensity.stressMultiplier;
    const damageBudget = intensity.level >= 3 ? Math.max(0, Math.floor(strengthTime * 0.95 + (this.seed % 3) * 0.1)) : 0;
    const breakable = snapshot.constraints.filter((constraint) => !constraint.broken);
    const brokenConstraintIds = breakable
      .filter((constraint, index) => index < damageBudget && strengthTime > constraint.breakThreshold)
      .map((constraint) => constraint.id);

    const treeIds = snapshot.cityProps.filter((prop) => prop.kind === 'tree').map((prop) => prop.id);
    const toppledTreeIds = intensity.level >= 5 && elapsedMs >= 3800 ? treeIds : [];

    const lights = snapshot.cityProps.filter((prop) => prop.kind === 'streetlight');
    const lightStates = Object.fromEntries(
      lights.map((light): [string, StreetlightState] => {
        if (intensity.level < 4 || elapsedMs < 900) return [light.id, 'on'];
        if (intensity.level >= 5 && elapsedMs >= 4800) return [light.id, 'off'];
        return [light.id, 'flicker'];
      }),
    );

    return { brokenConstraintIds, toppledTreeIds, lightStates };
  }
}
