import type { StrengthLevel } from '../simulation/types';

const labels: Record<StrengthLevel, string> = {
  1: 'Light',
  2: 'Moderate',
  3: 'Strong',
  4: 'Severe',
  5: 'Extreme',
};

export function StrengthIndicator({ value }: { value: StrengthLevel }) {
  return (
    <div
      className="strength-shell"
      role="meter"
      aria-label="Earthquake strength"
      aria-valuemin={1}
      aria-valuemax={5}
      aria-valuenow={value}
      aria-valuetext={labels[value]}
    >
      <div className="strength-label-row">
        <span>Earthquake Strength</span>
        <strong>{value} · {labels[value]}</strong>
      </div>
      <div className="strength-track" aria-hidden="true">
        <div className="strength-fill" style={{ width: `${value * 20}%` }} />
        <span className="strength-knob" style={{ left: `${value * 20}%` }} />
      </div>
    </div>
  );
}
