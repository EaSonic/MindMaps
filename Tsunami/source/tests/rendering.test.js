import test from 'node:test';
import assert from 'node:assert/strict';
import {createBuilding,createDam,createPerson,createBoat,createShip} from '../src/rendering/models.js';
test('buildings contain volumetric detailed structure, roof and window recesses',()=>{const b=createBuilding({width:10,height:22,color:0xd8cba4},0,'shanghai');let mesh=0;let depth=0;b.traverse(o=>{if(o.isMesh){mesh++;o.geometry.computeBoundingBox();depth=Math.max(depth,o.geometry.boundingBox.max.z-o.geometry.boundingBox.min.z);}});assert.ok(mesh>30);assert.ok(depth>3);});
test('dam height edits create solid geometry with thickness and no transparent drawing',()=>{const d=createDam(30);let depth=0;d.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();depth=Math.max(depth,o.geometry.boundingBox.max.z-o.geometry.boundingBox.min.z);assert.ok(!o.material.transparent);}});assert.ok(depth>5);});
test('people and vessels have distinct detailed models',()=>{for(const g of [createPerson({color:0x557799,skin:0xc99a75}),createBoat('skiff'),createBoat('cabin'),createBoat('rescue'),createShip()]){let meshes=0;g.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>8);}});
