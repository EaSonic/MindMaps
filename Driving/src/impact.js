const effects = {
  building: { player: 'respawn', object: 'stay', effect: 'crash' },
  traffic: { player: 'respawn', object: 'remove', effect: 'fire' },
  person: { player: 'respawn', object: 'remove', effect: 'red-spark' },
  tree: { player: 'continue', object: 'fall', effect: 'leaves' },
  water: { player: 'block', object: 'stay', effect: 'splash' },
};

export function impactEffect(type) {
  if (!effects[type]) throw new Error(`Unknown impact: ${type}`);
  return { ...effects[type] };
}
