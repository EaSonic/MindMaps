import type { LandmarkId } from '../simulation/types';

export type SectionShape = 'rect' | 'trapezoid' | 'beam' | 'spire';

export interface LandmarkSection {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  shape?: SectionShape;
  fixed?: boolean;
  detail?: 'lattice' | 'windows' | 'columns' | 'plain';
}

export interface ConstraintDefinition {
  id: string;
  a: string;
  b: string;
  stiffness: number;
  damping: number;
  breakThreshold: number;
}

export interface LandmarkDefinition {
  id: LandmarkId;
  title: string;
  artwork: string;
  backgroundArtwork: string;
  palette: {
    primary: string;
    secondary: string;
    detail: string;
    windows: string;
  };
  sections: LandmarkSection[];
  constraints: ConstraintDefinition[];
}

export type CityPropKind = 'building' | 'tree' | 'streetlight' | 'pedestrian' | 'vehicle';

export type CityPropVariant =
  | 'stone'
  | 'glass'
  | 'oak'
  | 'lamp'
  | 'walker'
  | 'ambulance'
  | 'taxi'
  | 'compact'
  | 'large';

export interface CityPropDefinition {
  id: string;
  kind: CityPropKind;
  variant: CityPropVariant;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  direction?: -1 | 1;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export function chainConstraints(
  prefix: string,
  sectionIds: string[],
  breakThreshold = 1,
): ConstraintDefinition[] {
  return sectionIds.slice(1).map((id, index) => ({
    id: `${prefix}-${index}`,
    a: sectionIds[index],
    b: id,
    stiffness: 0.92,
    damping: 0.16,
    breakThreshold: breakThreshold + index * 0.035,
  }));
}
