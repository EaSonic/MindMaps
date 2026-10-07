import { chainConstraints, type LandmarkDefinition, type LandmarkSection } from '../sceneTypes';

const sections: LandmarkSection[] = Array.from({ length: 10 }, (_, index) => ({
  id: `ring-${index}`,
  x: 0.41 + index * 0.008,
  y: 0.88 - index * 0.085,
  width: 0.2 - index * 0.004,
  height: 0.082,
  angle: -0.035,
  shape: index === 9 ? 'beam' : 'rect',
  fixed: index === 0,
  detail: 'columns',
}));

export const pisaDefinition: LandmarkDefinition = {
  id: 'pisa',
  title: 'Tower of Pisa',
  artwork: `${import.meta.env.BASE_URL}art/landmark-pisa-realistic.png`,
  backgroundArtwork: `${import.meta.env.BASE_URL}art/city-pisa-realistic.png`,
  palette: { primary: '#d9d0bd', secondary: '#b7ad99', detail: '#867d70', windows: '#3c4a52' },
  sections,
  constraints: chainConstraints('pisa', sections.map((section) => section.id), 1.3),
};
