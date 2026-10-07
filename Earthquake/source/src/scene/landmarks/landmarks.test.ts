import { describe, expect, it } from 'vitest';
import { createCityPropDefinitions } from '../cityProps';
import { getLandmarkDefinition } from './index';
import type { LandmarkDefinition } from '../sceneTypes';
import type { LandmarkId } from '../../simulation/types';

const landmarkIds: LandmarkId[] = ['eiffel', 'pisa', 'empire', 'twin-towers'];

describe('landmark definitions', () => {
  it('defines four uniquely titled recognizable structures', () => {
    const definitions = landmarkIds.map(getLandmarkDefinition);

    expect(new Set(definitions.map((definition) => definition.title)).size).toBe(4);
    expect(definitions.map((definition) => definition.title)).toEqual([
      'Eiffel Tower',
      'Tower of Pisa',
      'Empire State Building',
      'Twin Towers',
    ]);
  });

  it.each(landmarkIds)('%s uses normalized connected structural sections with a stable base', (id) => {
    const definition = getLandmarkDefinition(id);
    const sectionIds = new Set(definition.sections.map((section) => section.id));

    expect(definition.palette.primary).toMatch(/^#/);
    expect(definition.palette.detail).toMatch(/^#/);
    const artwork = (definition as LandmarkDefinition & { artwork?: string }).artwork;
    expect(artwork).toMatch(/^\/art\/landmark-.+-realistic\.png$/);
    const backgroundArtwork = (definition as LandmarkDefinition & { backgroundArtwork?: string }).backgroundArtwork;
    expect(backgroundArtwork).toMatch(/^\/art\/city-.+-realistic\.png$/);
    expect(definition.sections.length).toBeGreaterThanOrEqual(8);
    expect(definition.sections.some((section) => section.fixed && section.y > 0.8)).toBe(true);

    for (const section of definition.sections) {
      expect(section.x).toBeGreaterThanOrEqual(0);
      expect(section.x + section.width).toBeLessThanOrEqual(1);
      expect(section.y).toBeGreaterThanOrEqual(0);
      expect(section.y + section.height).toBeLessThanOrEqual(1.001);
    }

    for (const constraint of definition.constraints) {
      expect(sectionIds.has(constraint.a)).toBe(true);
      expect(sectionIds.has(constraint.b)).toBe(true);
      expect(constraint.breakThreshold).toBeGreaterThan(0);
    }
  });
});

describe('city prop definitions', () => {
  it('includes surrounding buildings, trees, lights, pedestrians, and varied traffic', () => {
    const props = createCityPropDefinitions({ width: 1200, height: 760 });

    expect(props.filter((prop) => prop.kind === 'building').length).toBeGreaterThanOrEqual(2);
    expect(props.filter((prop) => prop.kind === 'tree')).toHaveLength(2);
    expect(props.filter((prop) => prop.kind === 'streetlight')).toHaveLength(2);
    expect(props.filter((prop) => prop.kind === 'pedestrian').length).toBeGreaterThanOrEqual(4);
    expect(new Set(props.filter((prop) => prop.kind === 'vehicle').map((prop) => prop.variant))).toEqual(
      new Set(['ambulance', 'taxi', 'compact', 'large']),
    );
  });
});
