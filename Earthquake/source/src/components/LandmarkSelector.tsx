import type { LandmarkId } from '../simulation/types';

const landmarks: Array<{ id: LandmarkId; label: string; monogram: string }> = [
  { id: 'eiffel', label: 'Eiffel Tower', monogram: 'EI' },
  { id: 'pisa', label: 'Tower of Pisa', monogram: 'PI' },
  { id: 'empire', label: 'Empire State', monogram: 'ES' },
  { id: 'twin-towers', label: 'Twin Towers', monogram: 'TT' },
];

interface LandmarkSelectorProps {
  value: LandmarkId;
  onChange: (id: LandmarkId) => void;
}

export function LandmarkSelector({ value, onChange }: LandmarkSelectorProps) {
  return (
    <nav className="landmark-nav" aria-label="Landmark choices">
      {landmarks.map((landmark) => (
        <button
          className="landmark-button"
          aria-pressed={value === landmark.id}
          data-monogram={landmark.monogram}
          key={landmark.id}
          onClick={() => onChange(landmark.id)}
          type="button"
        >
          <span>{landmark.label}</span>
        </button>
      ))}
    </nav>
  );
}
