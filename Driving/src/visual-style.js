const surfaces = {
  default: { roughness: 0.72, metalness: 0.02 },
  road: { roughness: 0.94, metalness: 0 },
  paint: { roughness: 0.55, metalness: 0.02 },
  car: { roughness: 0.24, metalness: 0.42, clearcoat: 0.82, clearcoatRoughness: 0.18 },
  glass: { roughness: 0.08, metalness: 0.08, transparent: true, opacity: 0.78 },
  tire: { roughness: 0.88, metalness: 0 },
  grass: { roughness: 1, metalness: 0 },
  sand: { roughness: 0.92, metalness: 0 },
  water: { roughness: 0.12, metalness: 0.18, transparent: true, opacity: 0.88 },
  light: { roughness: 0.3, metalness: 0, emissive: 0.95 },
};

export function qualityProfile(width, devicePixelRatio = 1) {
  const small = width <= 700;
  return {
    shadowMapSize: small ? 1024 : 2048,
    pixelRatioLimit: small || devicePixelRatio > 2 ? 1.35 : 1.7,
    sceneryScale: small ? 0.72 : 1,
  };
}

export function surfaceStyle(name = 'default') {
  return { ...(surfaces[name] || surfaces.default) };
}
