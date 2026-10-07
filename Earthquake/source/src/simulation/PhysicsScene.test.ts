import { describe, expect, it } from 'vitest';
import { getLandmarkDefinition } from '../scene/landmarks';
import { intensityConfig } from './config';
import { PhysicsScene } from './PhysicsScene';

const viewport = { width: 1200, height: 760 };

describe('PhysicsScene', () => {
  it('owns one engine and replaces every body when a new landmark mounts', () => {
    const scene = new PhysicsScene(7);
    scene.mount(getLandmarkDefinition('eiffel'), viewport);
    const eiffel = scene.snapshot();

    scene.mount(getLandmarkDefinition('pisa'), viewport);
    const pisa = scene.snapshot();

    expect(eiffel.engineId).toBe(pisa.engineId);
    expect(eiffel.landmarkId).toBe('eiffel');
    expect(pisa.landmarkId).toBe('pisa');
    expect(pisa.bodies.every((body) => !body.id.startsWith('eiffel:'))).toBe(true);
    expect(pisa.bodies.filter((body) => body.kind === 'landmark')).toHaveLength(
      getLandmarkDefinition('pisa').sections.length,
    );
  });

  it('freezes a final snapshot and makes destroy idempotent', () => {
    const scene = new PhysicsScene(8);
    scene.mount(getLandmarkDefinition('empire'), viewport);
    scene.step(16, intensityConfig(3));
    scene.freeze();
    const frozen = scene.snapshot();

    scene.step(500, intensityConfig(5));
    expect(scene.snapshot()).toEqual(frozen);

    scene.destroy();
    scene.destroy();
    expect(scene.snapshot()).toMatchObject({ mounted: false, bodies: [], constraints: [] });
  });
});
