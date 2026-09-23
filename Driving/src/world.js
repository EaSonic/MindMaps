export const ROAD_HALF_WIDTH = 6.7;

export function zoneAt(z) {
  if (z < 340) return 'hills';
  if (z < 780) return 'city';
  return 'coast';
}

export function roadCenter(z) {
  return 5.2 * Math.sin(z * 0.0065) + 2.1 * Math.sin(z * 0.017);
}

export function roadHeight(z) {
  const fade = Math.max(0, Math.min(1, (430 - z) / 130));
  return fade * (2.5 * Math.sin(z * 0.012) + 0.9 * Math.sin(z * 0.026));
}

export function roadWidth() {
  return ROAD_HALF_WIDTH * 2;
}

export function roadsideAt(z, side) {
  if (zoneAt(z) === 'coast' && side > 0) return 'water';
  return zoneAt(z) === 'hills' ? 'grass' : 'sidewalk';
}

export function roadHeading(z) {
  return Math.atan2(roadCenter(z + 1) - roadCenter(z - 1), 2);
}

export function respawnCar(car) {
  return {
    ...car,
    x: roadCenter(car.z),
    speed: 0,
    heading: roadHeading(car.z),
  };
}

export function hash(n) {
  let v = (n | 0) ^ 0x9e3779b9;
  v = Math.imul(v ^ (v >>> 16), 0x85ebca6b);
  v = Math.imul(v ^ (v >>> 13), 0xc2b2ae35);
  return ((v ^ (v >>> 16)) >>> 0) / 4294967296;
}
