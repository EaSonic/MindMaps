import type { SimulationStatus, StrengthLevel } from '../simulation/types';
import { StrengthIndicator } from './StrengthIndicator';

interface ControlBarProps {
  status: SimulationStatus;
  strength: StrengthLevel;
  onStart: () => void;
  onFinish: () => void;
  onSmaller: () => void;
  onBigger: () => void;
}

export function ControlBar({ status, strength, onStart, onFinish, onSmaller, onBigger }: ControlBarProps) {
  return (
    <footer className="control-bar" role="group" aria-label="Earthquake controls">
      <button className="control-button control-button--start" onClick={onStart} disabled={status === 'running'} type="button">
        <span className="control-icon control-icon--play" aria-hidden="true" />
        Start
      </button>
      <button className="control-button control-button--finish" onClick={onFinish} disabled={status !== 'running'} type="button">
        <span className="control-icon control-icon--stop" aria-hidden="true" />
        Finish
      </button>
      <StrengthIndicator value={strength} />
      <button className="control-button control-button--blue" onClick={onSmaller} disabled={strength === 1} type="button">
        <span className="control-icon control-icon--minus" aria-hidden="true" />
        Smaller
      </button>
      <button className="control-button control-button--blue" onClick={onBigger} disabled={strength === 5} type="button">
        <span className="control-icon control-icon--plus" aria-hidden="true" />
        Bigger
      </button>
    </footer>
  );
}
