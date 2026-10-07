import { describe, expect, it } from 'vitest';
import { getLandmarkDefinition } from '../scene/landmarks';
import { intensityConfig } from './config';
import { DamageController } from './DamageController';
import { PhysicsScene } from './PhysicsScene';

function createSnapshot() {
  const scene = new PhysicsScene(12);
  scene.mount(getLandmarkDefinition('eiffel'), { width: 1200, height: 760 });
  return scene.snapshot();
}

describe('DamageController', () => {
  it('keeps a strong landmark and city intact during brief light shaking', () => {
    const damage = new DamageController(12);
    const result = damage.update(createSnapshot(), 1000, intensityConfig(1));

    expect(result.brokenConstraintIds).toHaveLength(0);
    expect(result.toppledTreeIds).toHaveLength(0);
    expect(Object.values(result.lightStates)).toEqual(['on', 'on']);
  });

  it('progressively breaks constraints, topples trees, and cuts lights during sustained strong shaking', () => {
    const damage = new DamageController(12);
    const snapshot = createSnapshot();
    const flickering = damage.update(snapshot, 1700, intensityConfig(5));
    const failed = damage.update(snapshot, 6200, intensityConfig(5));

    expect(flickering.brokenConstraintIds.length).toBeGreaterThan(0);
    expect(Object.values(flickering.lightStates)).toContain('flicker');
    expect(failed.brokenConstraintIds.length).toBeGreaterThan(flickering.brokenConstraintIds.length);
    expect(failed.toppledTreeIds).toHaveLength(2);
    expect(Object.values(failed.lightStates)).toEqual(['off', 'off']);
  });
});
