import test from 'node:test';
import assert from 'node:assert/strict';
import { qualityProfile, surfaceStyle } from './visual-style.js';

test('desktop rendering uses high quality shadows and dense scenery', () => {
  assert.deepEqual(qualityProfile(1280, 1), {
    shadowMapSize: 2048,
    pixelRatioLimit: 1.7,
    sceneryScale: 1,
  });
});

test('small screens reduce GPU load without disabling shadows', () => {
  assert.deepEqual(qualityProfile(390, 3), {
    shadowMapSize: 1024,
    pixelRatioLimit: 1.35,
    sceneryScale: 0.72,
  });
});

test('car paint is glossier than asphalt and grass', () => {
  assert.ok(surfaceStyle('car').roughness < surfaceStyle('road').roughness);
  assert.ok(surfaceStyle('car').metalness > surfaceStyle('grass').metalness);
  assert.equal(surfaceStyle('glass').transparent, true);
});
