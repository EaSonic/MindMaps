import type { CityPropDefinition, ViewportSize } from './sceneTypes';

export function createCityPropDefinitions(viewport: ViewportSize): CityPropDefinition[] {
  const streetTop = viewport.height * 0.78;
  const laneY = viewport.height * 0.88;
  const sidewalkY = viewport.height * 0.82;

  return [
    { id: 'building-left', kind: 'building', variant: 'stone', x: viewport.width * 0.02, y: streetTop - 210, width: viewport.width * 0.19, height: 210, color: '#b9aa95' },
    { id: 'building-right', kind: 'building', variant: 'glass', x: viewport.width * 0.8, y: streetTop - 240, width: viewport.width * 0.18, height: 240, color: '#708995' },
    { id: 'tree-left', kind: 'tree', variant: 'oak', x: viewport.width * 0.22, y: sidewalkY - 88, width: 52, height: 88, color: '#48703d' },
    { id: 'tree-right', kind: 'tree', variant: 'oak', x: viewport.width * 0.76, y: sidewalkY - 92, width: 54, height: 92, color: '#3f6a39' },
    { id: 'light-left', kind: 'streetlight', variant: 'lamp', x: viewport.width * 0.29, y: sidewalkY - 82, width: 18, height: 82, color: '#29343e' },
    { id: 'light-right', kind: 'streetlight', variant: 'lamp', x: viewport.width * 0.7, y: sidewalkY - 82, width: 18, height: 82, color: '#29343e' },
    ...Array.from({ length: 6 }, (_, index): CityPropDefinition => ({
      id: `pedestrian-${index}`,
      kind: 'pedestrian',
      variant: 'walker',
      x: viewport.width * (0.24 + index * 0.1),
      y: sidewalkY - 32,
      width: 13,
      height: 32,
      color: ['#b44b42', '#315b7f', '#d4a336', '#536b4b', '#75558a', '#8a5f42'][index],
      direction: index % 2 === 0 ? -1 : 1,
    })),
    { id: 'ambulance', kind: 'vehicle', variant: 'ambulance', x: viewport.width * 0.08, y: laneY - 34, width: 76, height: 34, color: '#f2f2ed', direction: 1 },
    { id: 'taxi', kind: 'vehicle', variant: 'taxi', x: viewport.width * 0.34, y: laneY - 28, width: 64, height: 28, color: '#e6b424', direction: 1 },
    { id: 'compact', kind: 'vehicle', variant: 'compact', x: viewport.width * 0.58, y: laneY - 26, width: 55, height: 26, color: '#6a8796', direction: -1 },
    { id: 'large', kind: 'vehicle', variant: 'large', x: viewport.width * 0.82, y: laneY - 42, width: 92, height: 42, color: '#3c7b82', direction: -1 },
  ];
}
