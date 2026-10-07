import { chainConstraints, type LandmarkDefinition, type LandmarkSection } from '../sceneTypes';

function makeTower(prefix: string, x: number): LandmarkSection[] {
  return Array.from({ length: 8 }, (_, index) => ({
    id: `${prefix}-${index}`,
    x,
    y: 0.86 - index * 0.105,
    width: 0.18,
    height: 0.108,
    fixed: index === 0,
    detail: 'windows',
  }));
}

const north = makeTower('north', 0.29);
const south = makeTower('south', 0.53);
const sections = [...north, ...south];

export const twinTowersDefinition: LandmarkDefinition = {
  id: 'twin-towers',
  title: 'Twin Towers',
  artwork: `${import.meta.env.BASE_URL}art/landmark-twin-towers-realistic.png`,
  backgroundArtwork: `${import.meta.env.BASE_URL}art/city-lower-manhattan-realistic.png`,
  palette: { primary: '#b9bdbe', secondary: '#d5d9d9', detail: '#767f82', windows: '#496b79' },
  sections,
  constraints: [
    ...chainConstraints('north', north.map((section) => section.id), 1.32),
    ...chainConstraints('south', south.map((section) => section.id), 1.32),
  ],
};
