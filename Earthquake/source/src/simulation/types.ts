export type LandmarkId = 'eiffel' | 'pisa' | 'empire' | 'twin-towers';

export type SimulationStatus = 'ready' | 'running' | 'finished';

export type StrengthLevel = 1 | 2 | 3 | 4 | 5;

export interface SimulationState {
  landmark: LandmarkId;
  status: SimulationStatus;
  strength: StrengthLevel;
  run: number;
}

export type SimulationAction =
  | { type: 'start' }
  | { type: 'finish' }
  | { type: 'smaller' }
  | { type: 'bigger' }
  | { type: 'select-landmark'; landmark: LandmarkId };
