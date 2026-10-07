import { describe, expect, it } from 'vitest';
import { createCityPropDefinitions } from '../scene/cityProps';
import { intensityConfig } from './config';
import { EvacuationController } from './EvacuationController';

const viewport = { width: 1200, height: 760 };

describe('EvacuationController', () => {
  it('remains idle while the scene is ready', () => {
    const controller = new EvacuationController(createCityPropDefinitions(viewport), viewport, 4);
    const initial = controller.snapshot();
    const ready = controller.update(1000, 'ready', intensityConfig(3));

    expect(ready.active).toBe(false);
    expect(ready).toEqual(initial);
  });

  it('sounds the alarm before evacuation begins, then releases people in waves', () => {
    const controller = new EvacuationController(createCityPropDefinitions(viewport), viewport, 4);
    const initial = controller.snapshot();
    const alarmOnly = controller.update(400, 'running', intensityConfig(3));

    expect(alarmOnly.active).toBe(true);
    expect(alarmOnly.people).toEqual(initial.people);
    expect(alarmOnly.occupants).toEqual(initial.occupants);
    expect(alarmOnly.vehicles).toEqual(initial.vehicles);

    const firstWave = controller.update(500, 'running', intensityConfig(3));
    const movingPeople = firstWave.people.filter((person, index) => person.x !== initial.people[index].x);
    expect(movingPeople.length).toBeGreaterThan(0);
    expect(movingPeople.length).toBeLessThan(firstWave.people.length);
    expect(firstWave.occupants).toEqual(initial.occupants);
  });

  it('moves pedestrians, occupants, and most vehicles toward safety after the response window', () => {
    const controller = new EvacuationController(createCityPropDefinitions(viewport), viewport, 4);
    const initial = controller.snapshot();
    controller.update(1000, 'running', intensityConfig(3));
    const running = controller.update(1000, 'running', intensityConfig(3));

    expect(running.active).toBe(true);
    expect(running.people.some((person, index) => person.x !== initial.people[index].x)).toBe(true);
    expect(running.occupants.every((occupant) => occupant.y > initial.occupants[0].y)).toBe(true);
    expect(running.vehicles.some((vehicle, index) => vehicle.x !== initial.vehicles[index].x)).toBe(true);
  });

  it('breaks down only a seeded minority at high strength while most vehicles escape', () => {
    const controller = new EvacuationController(createCityPropDefinitions(viewport), viewport, 9);
    let result = controller.snapshot();

    for (let index = 0; index < 18; index += 1) {
      result = controller.update(500, 'running', intensityConfig(5));
    }

    const broken = result.vehicles.filter((vehicle) => vehicle.broken);
    const escaped = result.vehicles.filter((vehicle) => vehicle.escaped);
    expect(broken.length).toBeGreaterThanOrEqual(1);
    expect(broken.length).toBeLessThan(result.vehicles.length / 2);
    expect(escaped.length).toBeGreaterThan(result.vehicles.length / 2);
  });
});
