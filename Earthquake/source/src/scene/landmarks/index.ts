import type { LandmarkId } from '../../simulation/types';
import type { LandmarkDefinition } from '../sceneTypes';
import { eiffelDefinition } from './eiffel';
import { empireDefinition } from './empire';
import { pisaDefinition } from './pisa';
import { twinTowersDefinition } from './twinTowers';

const definitions: Record<LandmarkId, LandmarkDefinition> = {
  eiffel: eiffelDefinition,
  pisa: pisaDefinition,
  empire: empireDefinition,
  'twin-towers': twinTowersDefinition,
};

export function getLandmarkDefinition(id: LandmarkId): LandmarkDefinition {
  return definitions[id];
}

export const landmarkDefinitions = definitions;
