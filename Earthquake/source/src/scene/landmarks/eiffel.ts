import { chainConstraints, type LandmarkDefinition } from '../sceneTypes';

const sections = [
  { id: 'base-left', x: 0.25, y: 0.9, width: 0.2, height: 0.08, angle: -0.08, shape: 'beam' as const, fixed: true, detail: 'lattice' as const },
  { id: 'base-right', x: 0.55, y: 0.9, width: 0.2, height: 0.08, angle: 0.08, shape: 'beam' as const, fixed: true, detail: 'lattice' as const },
  { id: 'arch', x: 0.34, y: 0.82, width: 0.32, height: 0.1, shape: 'beam' as const, detail: 'lattice' as const },
  { id: 'lower-left', x: 0.33, y: 0.68, width: 0.15, height: 0.18, angle: -0.1, shape: 'trapezoid' as const, detail: 'lattice' as const },
  { id: 'lower-right', x: 0.52, y: 0.68, width: 0.15, height: 0.18, angle: 0.1, shape: 'trapezoid' as const, detail: 'lattice' as const },
  { id: 'deck-one', x: 0.35, y: 0.64, width: 0.3, height: 0.055, shape: 'beam' as const, detail: 'lattice' as const },
  { id: 'mid', x: 0.405, y: 0.45, width: 0.19, height: 0.2, shape: 'trapezoid' as const, detail: 'lattice' as const },
  { id: 'deck-two', x: 0.4, y: 0.415, width: 0.2, height: 0.045, shape: 'beam' as const, detail: 'lattice' as const },
  { id: 'upper', x: 0.445, y: 0.22, width: 0.11, height: 0.2, shape: 'trapezoid' as const, detail: 'lattice' as const },
  { id: 'crown', x: 0.455, y: 0.17, width: 0.09, height: 0.055, shape: 'beam' as const, detail: 'lattice' as const },
  { id: 'spire', x: 0.485, y: 0.055, width: 0.03, height: 0.12, shape: 'spire' as const, detail: 'plain' as const },
];

const core = ['base-left', 'arch', 'lower-left', 'deck-one', 'mid', 'deck-two', 'upper', 'crown', 'spire'];

export const eiffelDefinition: LandmarkDefinition = {
  id: 'eiffel',
  title: 'Eiffel Tower',
  artwork: `${import.meta.env.BASE_URL}art/landmark-eiffel-realistic.png`,
  backgroundArtwork: `${import.meta.env.BASE_URL}art/city-paris-realistic.png`,
  palette: { primary: '#3e4145', secondary: '#6b6861', detail: '#20262d', windows: '#9dc5df' },
  sections,
  constraints: [
    ...chainConstraints('eiffel-core', core, 1.22),
    { id: 'eiffel-base-right', a: 'base-right', b: 'arch', stiffness: 0.94, damping: 0.16, breakThreshold: 1.22 },
    { id: 'eiffel-lower-right', a: 'lower-right', b: 'deck-one', stiffness: 0.92, damping: 0.16, breakThreshold: 1.18 },
  ],
};
