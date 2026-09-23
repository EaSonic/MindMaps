import test from 'node:test';
import assert from 'node:assert/strict';
import { zoneAt, roadCenter, roadHeight, roadWidth, roadsideAt, respawnCar } from './world.js';

test('the route starts in hills, reaches city, then follows the coast', () => {
  assert.equal(zoneAt(0), 'hills');
  assert.equal(zoneAt(600), 'city');
  assert.equal(zoneAt(1000), 'coast');
});

test('the road stays finite and wide enough along the route', () => {
  for (let z = 0; z <= 3000; z += 50) {
    assert.ok(Number.isFinite(roadCenter(z)));
    assert.ok(Number.isFinite(roadHeight(z)));
    assert.ok(roadWidth(z) >= 12);
  }
});

test('the coast keeps water on the right side of the road', () => {
  const right = roadsideAt(1500, 1);
  const left = roadsideAt(1500, -1);
  assert.equal(right, 'water');
  assert.notEqual(left, 'water');
});

test('a crash respawns on the road near its previous position', () => {
  const before = { x: 34, z: 1475, speed: 22, heading: 2 };
  const after = respawnCar(before);
  assert.equal(after.z, before.z);
  assert.equal(after.x, roadCenter(before.z));
  assert.equal(after.speed, 0);
  assert.notEqual(after.heading, before.heading);
});
