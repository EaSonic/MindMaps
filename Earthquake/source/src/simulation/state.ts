import type { SimulationAction, SimulationState, StrengthLevel } from './types';

export function createInitialState(): SimulationState {
  return {
    landmark: 'eiffel',
    status: 'ready',
    strength: 2,
    run: 0,
  };
}

function clampStrength(value: number): StrengthLevel {
  return Math.max(1, Math.min(5, value)) as StrengthLevel;
}

export function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'start':
      if (state.status === 'running') return state;
      return { ...state, status: 'running', run: state.run + 1 };
    case 'finish':
      if (state.status !== 'running') return state;
      return { ...state, status: 'finished' };
    case 'smaller': {
      const strength = clampStrength(state.strength - 1);
      return strength === state.strength ? state : { ...state, strength };
    }
    case 'bigger': {
      const strength = clampStrength(state.strength + 1);
      return strength === state.strength ? state : { ...state, strength };
    }
    case 'select-landmark':
      return {
        landmark: action.landmark,
        status: 'ready',
        strength: 2,
        run: state.run,
      };
  }
}
