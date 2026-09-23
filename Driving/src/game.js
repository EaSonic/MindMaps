import { createRenderer } from './render.js';
import { ROAD_HALF_WIDTH, hash, roadCenter, roadHeading, roadHeight, respawnCar, zoneAt } from './world.js';
import { impactEffect } from './impact.js';

const canvas = document.getElementById('world');
const loading = document.getElementById('loading');
const distanceLabel = document.getElementById('distance');
const bestLabel = document.getElementById('best');
const zoneLabel = document.getElementById('zone');
const toast = document.getElementById('toast');
const tip = document.getElementById('tip');

const C = {
  road: [0.27, 0.30, 0.35], roadEdge: [0.90, 0.91, 0.88], yellow: [1.0, 0.75, 0.21],
  grass: [0.44, 0.69, 0.29], grassLight: [0.57, 0.76, 0.35], darkGrass: [0.31, 0.57, 0.28],
  sand: [0.92, 0.82, 0.56], sidewalk: [0.77, 0.80, 0.80], water: [0.11, 0.57, 0.80],
  deepWater: [0.07, 0.43, 0.68], trunk: [0.42, 0.29, 0.19], leaf: [0.22, 0.51, 0.23],
  leafLight: [0.35, 0.67, 0.30], blue: [0.06, 0.38, 0.90], blueTop: [0.10, 0.48, 0.98],
  glass: [0.13, 0.29, 0.40], tire: [0.09, 0.11, 0.14], light: [1.0, 0.94, 0.75],
  red: [0.95, 0.16, 0.12], orange: [1.0, 0.43, 0.07], flame: [1.0, 0.77, 0.08],
};

let renderer;
try {
  renderer = createRenderer(canvas);
  loading.classList.add('done');
  loading.setAttribute('aria-hidden', 'true');
} catch (error) {
  loading.textContent = error.message;
  throw error;
}

const input = { up: false, down: false, left: false, right: false };
const car = { x: roadCenter(0), z: 0, speed: 0, heading: 0 };
const fallenTrees = new Map();
const removedTraffic = new Set();
const removedPeople = new Set();
let elapsed = 0;
let runDistance = 0;
let bestDistance = 0;
let crashTimer = 0;
let crashEffect = '';
let toastTimer = 0;
let bumpCooldown = 0;
let firstDrive = false;
let frameDt = 0;
const cameraState = { x: car.x, y: roadHeight(car.z) + 6.4, z: car.z - 16.5 };

try { bestDistance = Number(localStorage.getItem('coastline-drive-best')) || 0; } catch { /* private mode */ }

function setToast(message, seconds = 1.4) {
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = seconds;
}

function hideToast() {
  toast.classList.remove('show');
}

function saveBest() {
  if (runDistance > bestDistance) {
    bestDistance = runDistance;
    try { localStorage.setItem('coastline-drive-best', String(bestDistance)); } catch { /* private mode */ }
  }
}

function resetToStart() {
  saveBest();
  car.z = 0;
  car.x = roadCenter(0);
  car.speed = 0;
  car.heading = roadHeading(0);
  runDistance = 0;
  crashTimer = 0;
  crashEffect = '';
  fallenTrees.clear();
  removedTraffic.clear();
  removedPeople.clear();
  setToast('Back to the hills', 1.3);
}

document.getElementById('restart').addEventListener('click', resetToStart);

const keyMap = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
window.addEventListener('keydown', (event) => {
  const control = keyMap[event.code];
  if (!control) return;
  event.preventDefault();
  input[control] = true;
  document.querySelector(`[data-control="${control}"]`)?.classList.add('pressed');
});
window.addEventListener('keyup', (event) => {
  const control = keyMap[event.code];
  if (!control) return;
  event.preventDefault();
  input[control] = false;
  document.querySelector(`[data-control="${control}"]`)?.classList.remove('pressed');
});
window.addEventListener('blur', () => {
  for (const key of Object.keys(input)) input[key] = false;
  document.querySelectorAll('.drive-button').forEach((button) => button.classList.remove('pressed'));
});
document.querySelectorAll('.drive-button').forEach((button) => {
  const control = button.dataset.control;
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    input[control] = true;
    button.classList.add('pressed');
  });
  const release = () => { input[control] = false; button.classList.remove('pressed'); };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
});

function treeAt(index, side) {
  const z = index * 29 + 13;
  const zone = zoneAt(z);
  if (zone === 'city' && index % 3 !== 0) return null;
  const offset = zone === 'hills' ? 13 + hash(index * 9 + side) * 6 : 12.5 + hash(index * 7 + side) * 2;
  return { id: `${index}:${side}`, z, x: roadCenter(z) + side * offset, side, height: 4.2 + hash(index * 5) * 2.4 };
}

function buildingAt(index, side) {
  const z = index * 34 + 19;
  const zone = zoneAt(z);
  if (zone === 'hills' || (zone === 'coast' && side > 0)) return null;
  const width = 9 + hash(index * 15 + side) * 4;
  const height = 12 + hash(index * 23 + side) * 22;
  return { z, x: roadCenter(z) + side * (18.5 + hash(index * 8 + side) * 2), width, height, side, shade: hash(index * 12 + side) };
}

function personAt(index, side) {
  const z = index * 31 + 11;
  const zone = zoneAt(z);
  if (zone === 'hills' || (zone === 'coast' && side > 0)) return null;
  return { id: `${index}:${side}`, z, x: roadCenter(z) + side * (9.1 + hash(index * 17 + side) * 1.1), side };
}

function trafficAt(index) {
  const z = 85 + index * 78 + elapsed * 6.7;
  const lane = hash(index * 41) > .5 ? 1 : -1;
  return { id: index, z, x: roadCenter(z) + lane * 3.25, color: [[.86,.18,.13],[.95,.78,.21],[.89,.91,.94],[.23,.62,.64]][Math.floor(hash(index * 31) * 4)] };
}

function startCrash(type, id) {
  if (crashTimer > 0) return;
  const effect = impactEffect(type);
  if (effect.object === 'remove' && type === 'traffic') removedTraffic.add(id);
  if (effect.object === 'remove' && type === 'person') removedPeople.add(id);
  crashEffect = effect.effect;
  crashTimer = type === 'traffic' ? 1.5 : 1.05;
  car.speed = 0;
  saveBest();
  setToast(type === 'traffic' ? 'Car crash! Respawning…' : type === 'person' ? 'Crash! Respawning…' : 'Building crash! Respawning…', crashTimer);
}

function checkCollisions() {
  if (crashTimer > 0 || bumpCooldown > 0) return;
  const zone = zoneAt(car.z);
  const lateral = car.x - roadCenter(car.z);
  if (zone === 'coast' && lateral > 23) {
    impactEffect('water');
    car.x = roadCenter(car.z) + 23;
    car.speed = Math.min(car.speed, 0);
    setToast('Water is off limits', .9);
    bumpCooldown = .6;
    return;
  }
  if (Math.abs(lateral) > 34) {
    car.x = roadCenter(car.z) + Math.sign(lateral) * 34;
    car.speed = 0;
  }
  for (let i = Math.floor((car.z - 20) / 34); i <= Math.ceil((car.z + 20) / 34); i++) {
    for (const side of [-1, 1]) {
      const item = buildingAt(i, side);
      if (item && Math.abs(car.z - item.z) < 12 && Math.abs(car.x - item.x) < item.width / 2 + 1.1) {
        startCrash('building');
        return;
      }
    }
  }
  for (let i = Math.floor((car.z - elapsed * 6.7 - 100) / 78); i <= Math.ceil((car.z - elapsed * 6.7 - 70) / 78); i++) {
    if (i < 0) continue;
    if (removedTraffic.has(i)) continue;
    const item = trafficAt(i);
    if (Math.abs(car.z - item.z) < 3.3 && Math.abs(car.x - item.x) < 2.35) {
      startCrash('traffic', i);
      return;
    }
  }
  for (let i = Math.floor((car.z - 15) / 31); i <= Math.ceil((car.z + 15) / 31); i++) {
    for (const side of [-1, 1]) {
      const item = personAt(i, side);
      if (!item || removedPeople.has(item.id)) continue;
      if (Math.abs(car.z - item.z) < 1.8 && Math.abs(car.x - item.x) < 1.5) {
        startCrash('person', item.id);
        return;
      }
    }
  }
  for (let i = Math.floor((car.z - 15) / 29); i <= Math.ceil((car.z + 15) / 29); i++) {
    for (const side of [-1, 1]) {
      const item = treeAt(i, side);
      if (!item || fallenTrees.has(item.id)) continue;
      if (Math.abs(car.z - item.z) < 2.5 && Math.abs(car.x - item.x) < 2.15) {
        impactEffect('tree');
        fallenTrees.set(item.id, 0);
        car.speed *= .3;
        setToast('The tree fell over!', 1.1);
        bumpCooldown = .8;
        return;
      }
    }
  }
}

function update(dt) {
  elapsed += dt;
  toastTimer = Math.max(0, toastTimer - dt);
  bumpCooldown = Math.max(0, bumpCooldown - dt);
  if (!toastTimer) hideToast();
  if (crashTimer > 0) {
    crashTimer -= dt;
    if (crashTimer <= 0) {
      Object.assign(car, respawnCar(car));
      runDistance = 0;
      crashEffect = '';
      bumpCooldown = .8;
      hideToast();
    }
    return;
  }
  if (input.up) car.speed = Math.min(36, car.speed + 19 * dt);
  if (input.down) car.speed = Math.max(-11, car.speed - 27 * dt);
  if (!input.up && !input.down) car.speed *= Math.max(0, 1 - 1.15 * dt);
  if (Math.abs(car.speed) < .03) car.speed = 0;
  const steering = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const beforeCenter = roadCenter(car.z);
  const delta = car.speed * dt;
  car.z = Math.max(0, car.z + delta);
  car.x += roadCenter(car.z) - beforeCenter;
  if (steering) car.x += steering * dt * (2.3 + Math.abs(car.speed) * .23) * Math.sign(car.speed || 1);
  car.heading = roadHeading(car.z) + steering * Math.min(.2, Math.abs(car.speed) * .006);
  runDistance += Math.max(0, delta);
  if (!firstDrive && (input.up || input.down || input.left || input.right)) {
    firstDrive = true;
    tip.classList.add('hidden');
  }
  for (const [id, amount] of fallenTrees) fallenTrees.set(id, Math.min(1, amount + dt * 2.1));
  checkCollisions();
  distanceLabel.textContent = `${(runDistance / 1000).toFixed(2)} km`;
  bestLabel.textContent = `${(Math.max(bestDistance, runDistance) / 1000).toFixed(2)} km`;
  const zone = zoneAt(car.z);
  zoneLabel.textContent = zone === 'hills' ? 'HILL ROAD' : zone === 'city' ? 'CITY STREETS' : 'COASTLINE';
}

function drawRoad(start, end) {
  for (let z = start; z < end; z += 8) {
    const next = z + 8;
    const c0 = roadCenter(z), c1 = roadCenter(next);
    const h0 = roadHeight(z), h1 = roadHeight(next);
    const zone = zoneAt(z);
    const leftColor = zone === 'hills' ? C.grass : C.sidewalk;
    const rightColor = zone === 'coast' ? C.sand : leftColor;
    renderer.quad([c0 - 95,h0-.45,z],[c1 - 95,h1-.45,next],[c1-ROAD_HALF_WIDTH,h1-.09,next],[c0-ROAD_HALF_WIDTH,h0-.09,z], zone === 'hills' ? C.grass : C.grassLight, 'grass');
    renderer.quad([c0+ROAD_HALF_WIDTH,h0-.09,z],[c1+ROAD_HALF_WIDTH,h1-.09,next],[c1+95,h1-.45,next],[c0+95,h0-.45,z], zone === 'coast' ? C.sand : C.grassLight, zone === 'coast' ? 'sand' : 'grass');
    if (zone !== 'hills') {
      renderer.quad([c0-12,h0-.02,z],[c1-12,h1-.02,next],[c1-ROAD_HALF_WIDTH,h1+.015,next],[c0-ROAD_HALF_WIDTH,h0+.015,z], leftColor, 'paint');
      renderer.quad([c0+ROAD_HALF_WIDTH,h0+.015,z],[c1+ROAD_HALF_WIDTH,h1+.015,next],[c1+12,h1-.02,next],[c0+12,h0-.02,z], rightColor, zone === 'coast' ? 'sand' : 'paint');
    }
    if (zone === 'coast') {
      renderer.quad([c0+25,h0-.18,z],[c1+25,h1-.18,next],[c1+135,h1-.18,next],[c0+135,h0-.18,z], C.water, 'water');
      if (Math.floor(z/8)%3===0) renderer.quad([c0+27,h0-.14,z],[c1+29,h1-.14,next],[c1+31,h1-.14,next],[c0+29,h0-.14,z], [.47,.79,.91], 'water');
    }
    renderer.quad([c0-ROAD_HALF_WIDTH,h0,z],[c1-ROAD_HALF_WIDTH,h1,next],[c1+ROAD_HALF_WIDTH,h1,next],[c0+ROAD_HALF_WIDTH,h0,z], C.road, 'road');
    for (const side of [-1,1]) {
      const x0 = c0 + side * (ROAD_HALF_WIDTH - .32), x1 = c1 + side * (ROAD_HALF_WIDTH - .32);
      renderer.quad([x0-.07,h0+.025,z],[x1-.07,h1+.025,next],[x1+.07,h1+.025,next],[x0+.07,h0+.025,z], C.roadEdge, 'paint');
    }
    if (Math.floor(z/8)%3!==2) {
      for (const side of [-1,1]) {
        const x0=c0+side*.18, x1=c1+side*.18;
        renderer.quad([x0-.06,h0+.03,z],[x1-.06,h1+.03,next],[x1+.06,h1+.03,next],[x0+.06,h0+.03,z], C.yellow, 'paint');
      }
    }
    if (Math.floor(z / 8) % 2 === 0 && (zone === 'coast' || zone === 'hills')) {
      const side = zone === 'coast' ? 1 : -1;
      const edge0 = c0 + side * (zone === 'coast' ? 12.6 : 12.2);
      const edge1 = c1 + side * (zone === 'coast' ? 12.6 : 12.2);
      renderer.box(edge0, h0 + .48, z + 2.8, .18, .95, .18, [.47,.49,.47], roadHeading(z), 0, -.475, 'paint');
      renderer.box((edge0+edge1)/2, (h0+h1)/2 + .68, z+4, .16, .18, 8.2, zone === 'coast' ? [.78,.80,.77] : [.38,.29,.20], roadHeading(z), 0, -.09, 'paint');
      renderer.box((edge0+edge1)/2, (h0+h1)/2 + .38, z+4, .14, .14, 8.2, zone === 'coast' ? [.65,.68,.67] : [.38,.29,.20], roadHeading(z), 0, -.07, 'paint');
    }
  }
}

function drawTree(tree) {
  const ground = roadHeight(tree.z);
  const fall = fallenTrees.get(tree.id) || 0;
  const angle = Math.sin(fall * Math.PI / 2) * 1.37;
  const direction = tree.side;
  const trunkHeight = tree.height * .6;
  const trunkX = tree.x + direction * Math.sin(angle) * trunkHeight / 2;
  const trunkY = ground + Math.cos(angle) * trunkHeight / 2;
  renderer.cylinder(trunkX,trunkY,tree.z,.33,trunkHeight,C.trunk,0,-direction*angle,'paint');
  const crownX = tree.x + direction * Math.sin(angle) * (trunkHeight + 1.1);
  const crownY = ground + Math.cos(angle) * (trunkHeight + 1.1);
  renderer.ellipsoid(crownX,crownY,tree.z,3.8,3.3,3.5,C.leaf,hash(tree.z)*.4,'grass');
  renderer.sphere(crownX-direction*.85,crownY+.65,tree.z-.35,1.35,C.leafLight,'grass');
  renderer.sphere(crownX+direction*.9,crownY+.4,tree.z+.2,1.2,C.leaf,'grass');
}

function drawBuilding(building) {
  const ground = roadHeight(building.z);
  const colors = [[.93,.75,.61],[.77,.81,.83],[.83,.67,.58],[.92,.86,.72],[.64,.75,.82]];
  const color = colors[Math.floor(building.shade * colors.length)];
  renderer.box(building.x,ground+building.height/2,building.z,building.width,building.height,21,color,0,0,-building.height/2,'paint');
  renderer.box(building.x,ground+building.height+.28,building.z,building.width+1,.55,22,[.36,.43,.50],0,0,-.275,'paint');
  const frontX = building.x - building.side * (building.width/2+.04);
  for (let level=3.5; level<building.height-1; level+=4.2) {
    for (let dz=-7; dz<=7; dz+=4.8) {
      renderer.box(frontX,ground+level,building.z+dz,.08,1.9,2.0,[.12,.30,.43],0,0,-.95,'glass');
      renderer.box(frontX-building.side*.06,ground+level+.97,building.z+dz,.11,.10,2.12,[.82,.83,.77],0,0,-.05,'paint');
    }
    if (building.shade > .48 && level < building.height - 3) {
      renderer.box(frontX-building.side*.38,ground+level-.95,building.z,.72,.12,16.4,[.72,.76,.74],0,0,-.06,'paint');
      renderer.box(frontX-building.side*.72,ground+level-.48,building.z,.06,.88,16.1,[.20,.28,.31],0,0,-.44,'paint');
    }
  }
  renderer.box(frontX,ground+1.35,building.z,.12,2.7,2.2,[.25,.27,.30],0,0,-1.35,'paint');
  renderer.box(frontX-building.side*.8,ground+2.9,building.z,1.65,.18,3.0,[.88,.47,.24],0,0,-.09,'paint');
  if (building.height > 24) {
    renderer.box(building.x,ground+building.height+1.2,building.z,2.2,2.4,3.2,[.48,.51,.52],0,0,-1.2,'paint');
  }
}

function drawPerson(person) {
  const ground=roadHeight(person.z);
  const colors=[[.96,.55,.20],[.19,.57,.77],[.82,.34,.53],[.53,.69,.30]];
  const color=colors[Math.floor(hash(person.z)*colors.length)];
  const sway=Math.sin(elapsed*2+person.z)*.08;
  renderer.cylinder(person.x,ground+.5,person.z+sway,.18,1.0,[.18,.23,.29],0,0,'paint');
  renderer.ellipsoid(person.x,ground+1.28,person.z+sway,.64,.78,.42,color,0,'paint');
  renderer.sphere(person.x,ground+1.88,person.z+sway,.25,[.88,.65,.44],'paint');
}

function drawCar(x, z, color, yaw = 0, fire = false, player = false) {
  const y=roadHeight(z);
  const point = (dx,dz) => [x + dx*Math.cos(yaw) + dz*Math.sin(yaw), z - dx*Math.sin(yaw) + dz*Math.cos(yaw)];
  renderer.box(x,y+.63,z,2.76,.72,4.86,color,yaw,0,-.36,'car');
  const [hoodX,hoodZ]=point(0,1.18);
  const [cabinX,cabinZ]=point(0,-.42);
  renderer.ellipsoid(hoodX,y+1.00,hoodZ,2.67,.56,2.15,color,yaw,'car');
  renderer.box(cabinX,y+1.28,cabinZ,2.12,.91,2.38,player ? C.blueTop : color,yaw,0,-.455,'car');
  const [roofX,roofZ]=point(0,-.55);
  renderer.box(roofX,y+1.77,roofZ,1.82,.16,1.78,player ? C.blueTop : color,yaw,0,-.08,'car');
  const [rearGlassX,rearGlassZ]=point(0,-1.65);
  const [frontGlassX,frontGlassZ]=point(0,.84);
  renderer.box(rearGlassX,y+1.44,rearGlassZ,1.78,.55,.08,C.glass,yaw,0,-.275,'glass');
  renderer.box(frontGlassX,y+1.45,frontGlassZ,1.78,.55,.08,C.glass,yaw,0,-.275,'glass');
  for (const side of [-1,1]) {
    const [sideGlassX,sideGlassZ]=point(side*1.07,-.42);
    renderer.box(sideGlassX,y+1.45,sideGlassZ,.06,.52,1.58,C.glass,yaw,0,-.26,'glass');
  }
  for (const side of [-1,1]) {
    for (const dz of [-1.55,1.55]) {
      const [wheelX,wheelZ]=point(side*1.22,dz);
      renderer.cylinder(wheelX,y+.43,wheelZ,.46,.36,C.tire,yaw,Math.PI/2,'tire');
      renderer.cylinder(wheelX,y+.43,wheelZ,.23,.38,[.65,.69,.72],yaw,Math.PI/2,'car');
    }
    const [headX,headZ]=point(side*.79,2.43);
    const [tailX,tailZ]=point(side*.81,-2.43);
    renderer.box(headX,y+.79,headZ,.56,.22,.09,C.light,yaw,0,-.11,'light');
    renderer.box(tailX,y+.80,tailZ,.54,.23,.09,C.red,yaw,0,-.115,'light');
    const [mirrorX,mirrorZ]=point(side*1.40,.18);
    renderer.ellipsoid(mirrorX,y+1.35,mirrorZ,.34,.20,.48,color,yaw,'car');
  }
  const [hatchX,hatchZ]=point(0,-1.86);
  renderer.box(hatchX,y+1.08,hatchZ,2.26,.12,.82,player ? C.blueTop : color,yaw,0,-.06,'car');
  const [spoilerX,spoilerZ]=point(0,-2.00);
  renderer.box(spoilerX,y+1.23,spoilerZ,1.96,.10,.28,[.06,.10,.14],yaw,0,-.05,'car');
  const [plateX,plateZ]=point(0,-2.46);
  renderer.box(plateX,y+.67,plateZ,.76,.30,.07,[.88,.90,.91],yaw,0,-.15,'paint');
  const [bumperX,bumperZ]=point(0,-2.48);
  renderer.box(bumperX,y+.36,bumperZ,2.25,.16,.12,[.08,.10,.12],yaw,0,-.08,'tire');
  for (const side of [-1,1]) {
    const [exhaustX,exhaustZ]=point(side*.69,-2.55);
    renderer.box(exhaustX,y+.28,exhaustZ,.32,.18,.18,[.56,.60,.62],yaw,0,-.09,'car');
  }
  if (player) {
    const [antennaX,antennaZ]=point(0,-.95);
    renderer.cylinder(antennaX,y+2.14,antennaZ,.035,.58,[.08,.10,.12],yaw,0,'tire');
  }
  if (fire) {
    for (let i=0;i<5;i++) {
      const wave=Math.sin(elapsed*13+i*4)*.25;
      renderer.pyramid(x+(i-2)*.42,y+1.2,z+1.0+wave,.35,.8+hash(i+Math.floor(elapsed*9))*.9,i%2 ? C.orange : C.flame,'light');
    }
  }
}

function drawCloud(x, y, z, scale = 1) {
  const white=[.96,.98,1];
  renderer.ellipsoid(x,y,z,7*scale,2.3*scale,3.4*scale,white,0,'paint');
  renderer.sphere(x-2.3*scale,y+.75*scale,z,1.65*scale,white,'paint');
  renderer.sphere(x+.4*scale,y+1.05*scale,z-.15*scale,2.05*scale,white,'paint');
  renderer.sphere(x+2.8*scale,y+.55*scale,z,1.45*scale,white,'paint');
}

function drawPalm(x,y,z,scale=1) {
  renderer.cylinder(x,y+3.2*scale,z,.22*scale,6.4*scale,[.47,.31,.18],0,-.04,'paint');
  for (let i=0;i<6;i++) {
    const angle=i*Math.PI/3;
    renderer.ellipsoid(x+Math.cos(angle)*1.1*scale,y+6.5*scale,z+Math.sin(angle)*1.1*scale,3.1*scale,.48*scale,.95*scale,[.15,.47,.22],-angle,'grass');
  }
}

function drawScenicDetails(start,end) {
  for (let i=Math.floor(start/46);i<=Math.ceil(end/46);i++) {
    const z=i*46+8;
    if (zoneAt(z)==='hills') {
      const side=hash(i*17)>.5?1:-1;
      const x=roadCenter(z)+side*(22+hash(i*23)*12);
      const y=roadHeight(z)-.02;
      renderer.ellipsoid(x,y+.55,z,1.6+hash(i)*1.5,.9+hash(i*2)*.7,1.4+hash(i*3),[.45,.46,.43],hash(i)*2,'paint');
    }
  }
  for (let i=Math.floor(start/14);i<=Math.ceil(end/14);i++) {
    const z=i*14+5;
    if (zoneAt(z)!=='hills') continue;
    for (const side of [-1,1]) {
      if (hash(i*31+side)<.28) continue;
      const x=roadCenter(z)+side*(9.2+hash(i*19+side)*5.5);
      const y=roadHeight(z);
      renderer.ellipsoid(x,y+.40,z,1.3+hash(i)*.7,.72+hash(i*3)*.35,1.1+hash(i*5)*.6,hash(i+side)>.5?[.24,.54,.22]:[.39,.64,.24],hash(i)*3,'grass');
    }
  }
  for (let i=Math.floor(start/70);i<=Math.ceil(end/70);i++) {
    const z=i*70+32;
    if (zoneAt(z)!=='coast') continue;
    drawPalm(roadCenter(z)+17.5,roadHeight(z),z,.72+hash(i)*.24);
  }
  for (let i=Math.floor(start/230);i<=Math.ceil(end/230);i++) {
    const z=i*230+122;
    if (zoneAt(z)!=='coast') continue;
    const shore=roadCenter(z)+48;
    const y=roadHeight(z)-.08;
    renderer.ellipsoid(shore,y+.18,z,12,1.2,9,[.50,.52,.48],0,'paint');
    renderer.cylinder(shore,y+3.9,z,1.0,7.4,[.91,.88,.79],0,0,'paint');
    renderer.cylinder(shore,y+7.8,z,1.25,.55,C.red,0,0,'paint');
    renderer.ellipsoid(shore,y+8.45,z,1.75,1.2,1.75,C.red,0,'car');
    renderer.sphere(shore,y+8.55,z+1.05,.22,[1,.93,.60],'light');
  }
  for (let i=Math.floor(start/95);i<=Math.ceil(end/95);i++) {
    const z=i*95+48;
    if (zoneAt(z)!=='coast') continue;
    const x=roadCenter(z)+62+hash(i*12)*26;
    const y=roadHeight(z)+.05;
    renderer.ellipsoid(x,y+.20,z,4.4,.55,1.55,[.92,.94,.93],hash(i)*1.6,'paint');
    renderer.pyramid(x,y+.45,z,.2,3.4,[.98,.98,.94],'paint');
  }
}

function drawWorld() {
  const start=Math.floor((car.z-80)/8)*8;
  const end=car.z+270;
  drawRoad(start,end);
  drawScenicDetails(start,end);
  for (let i=0;i<4;i++) drawCloud(car.x-42+i*29,24+i%2*4,car.z+90+i*48,.68+i%3*.10);
  for (let i=Math.floor((start-18)/29); i<=Math.ceil(end/29); i++) {
    for (const side of [-1,1]) {
      const tree=treeAt(i,side);
      if (tree && tree.z>=start-20 && tree.z<end) drawTree(tree);
    }
  }
  for (let i=Math.floor((start-20)/34); i<=Math.ceil(end/34); i++) {
    for (const side of [-1,1]) {
      const building=buildingAt(i,side);
      if (building && building.z>=start-20 && building.z<end) drawBuilding(building);
    }
  }
  for (let i=Math.floor((start-20)/31); i<=Math.ceil(end/31); i++) {
    for (const side of [-1,1]) {
      const person=personAt(i,side);
      if (person && !removedPeople.has(person.id) && person.z>=start-20 && person.z<end) drawPerson(person);
    }
  }
  for (let i=Math.floor(start/52);i<=Math.ceil(end/52);i++) {
    const z=i*52+26;
    if (zoneAt(z)==='hills') continue;
    const x=roadCenter(z)-10.4;
    const y=roadHeight(z);
    renderer.cylinder(x,y+3.4,z,.10,6.8,[.25,.30,.31],0,0,'paint');
    renderer.box(x+.76,y+6.72,z,1.6,.16,.18,[.25,.30,.31],0,0,-.08,'paint');
    renderer.ellipsoid(x+1.42,y+6.58,z,.70,.50,.58,[1,.90,.57],0,'light');
  }
  for (let i=Math.floor((start-100-elapsed*6.7)/78); i<=Math.ceil((end-85-elapsed*6.7)/78); i++) {
    if (i < 0) continue;
    if (removedTraffic.has(i)) continue;
    const traffic=trafficAt(i);
    if (traffic.z>=car.z-7 && traffic.z<end) drawCar(traffic.x,traffic.z,traffic.color,roadHeading(traffic.z));
  }
  // Angular far hills provide a visible skyline before the city appears.
  if (car.z<650) {
    for (let i=Math.floor(start/110);i<=Math.ceil(end/110);i++) {
      const z=i*110+70;
      if (z<340) {
        renderer.pyramid(roadCenter(z)-66,roadHeight(z)-2,z,27,17+hash(i*7)*12,[.28,.50,.38],'grass');
        renderer.pyramid(roadCenter(z)+68,roadHeight(z)-2,z,30,14+hash(i*11)*9,[.34,.56,.42],'grass');
      }
    }
  }
  drawCar(car.x,car.z,C.blue,car.heading,crashEffect==='fire',true);
  if (crashEffect==='red-spark') {
    for (let i=0;i<7;i++) renderer.box(car.x+Math.sin(i*2.7)*(.4+elapsed%1),roadHeight(car.z)+.9+i*.13,car.z+Math.cos(i*3.1)*.7,.2,.2,.2,C.red);
  }
  const compactView=renderer.quality.sceneryScale<1;
  const followDistance=compactView?14.2:12.0;
  const desiredEye={
    x:car.x-Math.sin(car.heading)*followDistance,
    y:roadHeight(car.z)+(compactView?5.45:4.75),
    z:car.z-Math.cos(car.heading)*followDistance,
  };
  const follow=1-Math.exp(-frameDt*5.2);
  cameraState.x+=(desiredEye.x-cameraState.x)*follow;
  cameraState.y+=(desiredEye.y-cameraState.y)*follow;
  cameraState.z+=(desiredEye.z-cameraState.z)*follow;
  const target=[car.x+Math.sin(car.heading)*23,roadHeight(car.z+20)+1.15,car.z+Math.cos(car.heading)*23];
  renderer.render([cameraState.x,cameraState.y,cameraState.z],target,elapsed);
}

let previous=performance.now();
function frame(now) {
  const dt=Math.min(.05,(now-previous)/1000);
  frameDt=dt;
  previous=now;
  update(dt);
  drawWorld();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
