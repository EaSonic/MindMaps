import * as THREE from '../vendor/three.module.js';
import { qualityProfile, surfaceStyle } from './visual-style.js';

function colorKey(color) {
  return color.map((value) => Math.round(value * 255)).join('-');
}

function makeNoiseTexture(kind) {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  let seed = kind === 'road' ? 19 : kind === 'grass' ? 71 : 113;
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const noise = ((seed >>> 24) - 128) * (kind === 'road' ? 0.26 : 0.18);
    const base = kind === 'road' ? 205 : kind === 'grass' ? 222 : 232;
    const value = Math.max(140, Math.min(255, base + noise));
    pixels[i * 4] = value;
    pixels[i * 4 + 1] = value;
    pixels[i * 4 + 2] = value;
    pixels[i * 4 + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'road' ? 4 : 3, kind === 'road' ? 12 : 4);
  texture.needsUpdate = true;
  return texture;
}

export function createRenderer(canvas) {
  const profile = qualityProfile(canvas.clientWidth || window.innerWidth, window.devicePixelRatio || 1);
  const webgl = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  webgl.outputColorSpace = THREE.SRGBColorSpace;
  webgl.toneMapping = THREE.ACESFilmicToneMapping;
  webgl.toneMappingExposure = 1.04;
  webgl.shadowMap.enabled = true;
  webgl.shadowMap.type = THREE.PCFSoftShadowMap;
  webgl.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatioLimit));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8cccf4);
  scene.fog = new THREE.Fog(0x9fd3ef, 92, 285);
  const camera = new THREE.PerspectiveCamera(51, 1, 0.1, 440);
  const world = new THREE.Group();
  scene.add(world);

  scene.add(new THREE.HemisphereLight(0xc7eaff, 0x5f7f3f, 1.72));
  const sun = new THREE.DirectionalLight(0xfff1d0, 3.15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize);
  Object.assign(sun.shadow.camera, { left: -72, right: 72, top: 72, bottom: -72, near: 4, far: 190 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.00028;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(360, 32, 18),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x2c94e7) },
        horizonColor: { value: new THREE.Color(0xb9e4f8) },
        bottomColor: { value: new THREE.Color(0xe5f1dc) },
      },
      vertexShader: 'varying vec3 vWorld; void main(){ vec4 world = modelMatrix * vec4(position, 1.0); vWorld = world.xyz; gl_Position = projectionMatrix * viewMatrix * world; }',
      fragmentShader: `uniform vec3 topColor; uniform vec3 horizonColor; uniform vec3 bottomColor; varying vec3 vWorld; void main(){ float h = normalize(vWorld - cameraPosition).y; vec3 low = mix(bottomColor, horizonColor, smoothstep(-0.22, 0.05, h)); vec3 color = mix(low, topColor, smoothstep(0.0, 0.72, h)); gl_FragColor = vec4(color, 1.0); }`,
    }),
  );
  sky.frustumCulled = false;
  scene.add(sky);

  const textures = { road: makeNoiseTexture('road'), grass: makeNoiseTexture('grass'), sand: makeNoiseTexture('sand') };
  const materials = new Map();
  function getMaterial(color, surface = 'default') {
    const key = `${surface}:${colorKey(color)}`;
    if (materials.has(key)) return materials.get(key);
    const style = surfaceStyle(surface);
    const params = {
      color: new THREE.Color().setRGB(...color, THREE.SRGBColorSpace), roughness: style.roughness, metalness: style.metalness,
      transparent: Boolean(style.transparent), opacity: style.opacity ?? 1, depthWrite: !style.transparent,
    };
    if (textures[surface]) params.map = textures[surface];
    if (style.emissive) { params.emissive = params.color.clone(); params.emissiveIntensity = style.emissive; }
    const material = ['car', 'glass', 'water'].includes(surface)
      ? new THREE.MeshPhysicalMaterial({ ...params, clearcoat: style.clearcoat ?? (surface === 'water' ? 0.55 : 0), clearcoatRoughness: style.clearcoatRoughness ?? 0.2 })
      : new THREE.MeshStandardMaterial(params);
    if (surface === 'glass') material.side = THREE.DoubleSide;
    materials.set(key, material);
    return material;
  }

  const geometries = {
    box: new THREE.BoxGeometry(1, 1, 1, 2, 2, 2),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 16, 1, false),
    sphere: new THREE.IcosahedronGeometry(1, 2),
    ellipsoid: new THREE.SphereGeometry(1, 24, 14),
    pyramid: new THREE.ConeGeometry(1, 1, 4, 1, false, Math.PI / 4),
  };
  const pools = { box: [], cylinder: [], sphere: [], ellipsoid: [], pyramid: [], quad: [] };
  const used = { box: 0, cylinder: 0, sphere: 0, ellipsoid: 0, pyramid: 0, quad: 0 };
  let frameOpen = false;

  function beginFrame() {
    if (frameOpen) return;
    frameOpen = true;
    for (const key of Object.keys(pools)) {
      for (const mesh of pools[key]) mesh.visible = false;
      used[key] = 0;
    }
  }

  function acquire(type, material) {
    beginFrame();
    const index = used[type]++;
    let mesh = pools[type][index];
    if (!mesh) {
      mesh = new THREE.Mesh(geometries[type], material);
      mesh.receiveShadow = true;
      world.add(mesh);
      pools[type].push(mesh);
    }
    mesh.material = material;
    mesh.visible = true;
    mesh.castShadow = type !== 'quad';
    mesh.rotation.set(0, 0, 0);
    mesh.quaternion.identity();
    return mesh;
  }

  function setRotatedTransform(mesh, x, y, z, sx, sy, sz, yaw = 0, tilt = 0, pivotY = -sy / 2) {
    x = -x;
    yaw = -yaw;
    tilt = -tilt;
    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const qTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), tilt);
    mesh.quaternion.copy(qYaw).multiply(qTilt);
    const offset = new THREE.Vector3(pivotY * Math.sin(tilt), pivotY * (1 - Math.cos(tilt)), 0).applyQuaternion(qYaw);
    mesh.position.set(x + offset.x, y + offset.y, z + offset.z);
    mesh.scale.set(sx, sy, sz);
  }

  function box(x, y, z, w, h, d, color, yaw = 0, tilt = 0, pivotY = -h / 2, surface = 'default') {
    const mesh = acquire('box', getMaterial(color, surface));
    setRotatedTransform(mesh, x, y, z, w, h, d, yaw, tilt, pivotY);
    mesh.castShadow = !['road', 'grass', 'sand', 'water'].includes(surface);
    return mesh;
  }

  function cylinder(x, y, z, radius, height, color, yaw = 0, rotationZ = 0, surface = 'default') {
    const mesh = acquire('cylinder', getMaterial(color, surface));
    mesh.position.set(-x, y, z);
    mesh.scale.set(radius, height, radius);
    mesh.rotation.order = 'YZX';
    mesh.rotation.set(0, -yaw, -rotationZ);
    return mesh;
  }

  function sphere(x, y, z, radius, color, surface = 'default') {
    const mesh = acquire('sphere', getMaterial(color, surface));
    mesh.position.set(-x, y, z);
    mesh.scale.setScalar(radius);
    return mesh;
  }

  function ellipsoid(x, y, z, w, h, d, color, yaw = 0, surface = 'default') {
    const mesh = acquire('ellipsoid', getMaterial(color, surface));
    mesh.position.set(-x, y, z);
    mesh.scale.set(w / 2, h / 2, d / 2);
    mesh.rotation.y = -yaw;
    return mesh;
  }

  function pyramid(x, y, z, radius, height, color, surface = 'default') {
    const mesh = acquire('pyramid', getMaterial(color, surface));
    mesh.position.set(-x, y + height / 2, z);
    mesh.scale.set(radius, height, radius);
    return mesh;
  }

  function quad(a, b, c, d, color, surface = 'default') {
    beginFrame();
    const index = used.quad++;
    let mesh = pools.quad[index];
    if (!mesh) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0,0, 0,4, 1,4, 1,0]), 2));
      geometry.setIndex([0, 1, 2, 0, 2, 3]);
      mesh = new THREE.Mesh(geometry, getMaterial(color, surface));
      mesh.receiveShadow = true;
      world.add(mesh);
      pools.quad.push(mesh);
    }
    mesh.visible = true;
    mesh.material = getMaterial(color, surface);
    const positions = mesh.geometry.attributes.position;
    [d, c, b, a].forEach((point, vertex) => positions.setXYZ(vertex, -point[0], point[1], point[2]));
    positions.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingSphere();
    return mesh;
  }

  function render(eye, target, time = 0) {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const requiredWidth = Math.round(width * webgl.getPixelRatio());
    const requiredHeight = Math.round(height * webgl.getPixelRatio());
    if (canvas.width !== requiredWidth || canvas.height !== requiredHeight) webgl.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.position.set(-eye[0], eye[1], eye[2]);
    camera.lookAt(-target[0], target[1], target[2]);
    sky.position.copy(camera.position);
    sun.position.set(-eye[0] + 48, eye[1] + 78, eye[2] - 42);
    sun.target.position.set(-target[0], target[1], target[2] + 28);
    sun.target.updateMatrixWorld();
    for (const [key, material] of materials) if (key.startsWith('water:')) material.clearcoatRoughness = 0.14 + Math.sin(time * 0.75) * 0.035;
    webgl.render(scene, camera);
    frameOpen = false;
  }

  return { box, cylinder, sphere, ellipsoid, pyramid, quad, render, quality: profile };
}
