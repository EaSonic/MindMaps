import test from 'node:test';import assert from 'node:assert/strict';
import {terrainHeight} from '../src/terrain.js';
test('city approach, river and runway remain at ground level',()=>{assert.equal(terrainHeight(0,0),0);assert.equal(terrainHeight(1150,-700),0);});
test('wilderness mountains have substantial height and match both sides',()=>{assert.ok(terrainHeight(5500,0)>100);assert.ok(terrainHeight(-5500,0)>100);assert.ok(Number.isFinite(terrainHeight(8000,-3000)));});
