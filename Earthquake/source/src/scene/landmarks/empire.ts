import { chainConstraints, type LandmarkDefinition, type LandmarkSection } from '../sceneTypes';

const sections: LandmarkSection[] = [
  { id: 'base', x: 0.34, y: 0.86, width: 0.32, height: 0.12, fixed: true, detail: 'windows' },
  { id: 'lower-1', x: 0.37, y: 0.76, width: 0.26, height: 0.11, detail: 'windows' },
  { id: 'lower-2', x: 0.385, y: 0.66, width: 0.23, height: 0.11, detail: 'windows' },
  { id: 'shaft-1', x: 0.4, y: 0.56, width: 0.2, height: 0.11, detail: 'windows' },
  { id: 'shaft-2', x: 0.4, y: 0.46, width: 0.2, height: 0.11, detail: 'windows' },
  { id: 'shaft-3', x: 0.4, y: 0.36, width: 0.2, height: 0.11, detail: 'windows' },
  { id: 'setback-1', x: 0.425, y: 0.29, width: 0.15, height: 0.08, detail: 'windows' },
  { id: 'setback-2', x: 0.445, y: 0.225, width: 0.11, height: 0.07, detail: 'windows' },
  { id: 'crown-1', x: 0.46, y: 0.17, width: 0.08, height: 0.06, detail: 'windows' },
  { id: 'crown-2', x: 0.47, y: 0.125, width: 0.06, height: 0.05, detail: 'windows' },
  { id: 'mast', x: 0.485, y: 0.055, width: 0.03, height: 0.075, shape: 'spire', detail: 'plain' },
];

export const empireDefinition: LandmarkDefinition = {
  id: 'empire',
  title: 'Empire State Building',
  artwork: `${import.meta.env.BASE_URL}art/landmark-empire-realistic.png`,
  backgroundArtwork: `${import.meta.env.BASE_URL}art/city-midtown-realistic.png`,
  palette: { primary: '#aaa69c', secondary: '#c9c4b9', detail: '#77746d', windows: '#6fa4bc' },
  sections,
  constraints: chainConstraints('empire', sections.map((section) => section.id), 1.38),
};
