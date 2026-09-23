import test from 'node:test';
import assert from 'node:assert/strict';
import { impactEffect } from './impact.js';

test('buildings stay intact while the player respawns', () => {
  assert.deepEqual(impactEffect('building'), { player: 'respawn', object: 'stay', effect: 'crash' });
});

test('a traffic collision burns the player car and removes the other car', () => {
  assert.deepEqual(impactEffect('traffic'), { player: 'respawn', object: 'remove', effect: 'fire' });
});

test('a bumped tree falls while driving continues', () => {
  assert.deepEqual(impactEffect('tree'), { player: 'continue', object: 'fall', effect: 'leaves' });
});

test('water blocks the car without allowing entry', () => {
  assert.deepEqual(impactEffect('water'), { player: 'block', object: 'stay', effect: 'splash' });
});
