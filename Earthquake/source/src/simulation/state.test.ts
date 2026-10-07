import { describe, expect, it } from 'vitest';
import { intensityConfig } from './config';
import { createInitialState, simulationReducer } from './state';

describe('simulation state', () => {
  it('starts ready with the Eiffel Tower at strength two', () => {
    expect(createInitialState()).toEqual({
      landmark: 'eiffel',
      status: 'ready',
      strength: 2,
      run: 0,
    });
  });

  it('clamps the earthquake strength between one and five', () => {
    let state = createInitialState();

    for (let index = 0; index < 10; index += 1) {
      state = simulationReducer(state, { type: 'smaller' });
    }
    expect(state.strength).toBe(1);

    for (let index = 0; index < 10; index += 1) {
      state = simulationReducer(state, { type: 'bigger' });
    }
    expect(state.strength).toBe(5);
  });

  it('moves between ready, running, and finished without duplicate runs', () => {
    const ready = createInitialState();
    const running = simulationReducer(ready, { type: 'start' });
    const repeatedStart = simulationReducer(running, { type: 'start' });
    const finished = simulationReducer(repeatedStart, { type: 'finish' });
    const repeatedFinish = simulationReducer(finished, { type: 'finish' });
    const restarted = simulationReducer(repeatedFinish, { type: 'start' });

    expect(running).toMatchObject({ status: 'running', run: 1 });
    expect(repeatedStart).toBe(running);
    expect(finished).toMatchObject({ status: 'finished', run: 1 });
    expect(repeatedFinish).toBe(finished);
    expect(restarted).toMatchObject({ status: 'running', run: 2 });
  });

  it('selects a landmark and resets the scene to ready', () => {
    const running = simulationReducer(createInitialState(), { type: 'start' });
    const selected = simulationReducer(running, { type: 'select-landmark', landmark: 'pisa' });

    expect(selected).toEqual({ landmark: 'pisa', status: 'ready', strength: 2, run: 1 });
  });
});

describe('earthquake intensity configuration', () => {
  it('maps all five levels to progressively stronger bounded values', () => {
    const levels = [1, 2, 3, 4, 5].map(intensityConfig);

    expect(levels.map((level) => level.level)).toEqual([1, 2, 3, 4, 5]);
    expect(levels[0].amplitude).toBeLessThan(levels[4].amplitude);
    expect(levels[0].frequency).toBeLessThan(levels[4].frequency);
    expect(levels[0].verticalImpulse).toBeLessThan(levels[4].verticalImpulse);
    expect(levels[0].stressMultiplier).toBeLessThan(levels[4].stressMultiplier);
    expect(levels[0].cityDamageThreshold).toBeGreaterThan(levels[4].cityDamageThreshold);
    expect(() => intensityConfig(0)).toThrow(/between 1 and 5/i);
    expect(() => intensityConfig(6)).toThrow(/between 1 and 5/i);
  });
});
