import * as THREE from 'three';
import { zones, boxCollider, type Collider } from './world';
import { makeAvatar } from './Avatar';
import { createGroundLayout, groundColor, river as riverChannel } from './terrain';

type Block = { p: [number, number, number]; s: [number, number, number]; color: string; glow: boolean; rotation: number; solid?: boolean };
type Sign = { title: string; subtitle: string; x: number; y: number; z: number; color: string; width: number; landmark?: boolean };
// Rendering and movement use this same deterministic scenery layout.
export function createSceneryLayout() {
  const blocks: Block[] = [];
  const obstacles: Collider[] = [];
  const lanternPositions: number[] = [];
  const signs: Sign[] = [];
  let seed = 7391;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (colors: string[]) => colors[Math.floor(random() * colors.length)];
  function box(x: number, y: number, z: number, w: number, h: number, d: number, color: string, glow = false, rotation = 0) { blocks.push({ p: [x, y, z], s: [w, h, d], color, glow, rotation }); }
  function solid(x: number, y: number, z: number, w: number, h: number, d: number, color: string, glow = false) {
    blocks.push({ p: [x, y, z], s: [w, h, d], color, glow, rotation: 0, solid: true });
    obstacles.push(boxCollider(x, y, z, w, h, d));
  }
  function addSign(title: string, subtitle: string, x: number, y: number, z: number, color: string, width: number, landmark = false) { signs.push({ title, subtitle, x, y, z, color, width, landmark }); }
  const stone = ['#6b777a', '#7b8683', '#8c9288', '#657478'];
  const foliage = ['#315d40', '#477247', '#527d42', '#6f8b48', '#3c694a'];
  function tree(x: number, z: number, height = 7, distant = false) {
    const ground = distant ? -2 : 0;
    if (distant) box(x, ground + height / 2, z, 0.7, height, 0.7, '#654635');
    else solid(x, height / 2, z, 0.7, height, 0.7, '#654635');
    box(x + 0.8, ground + height * 0.71, z, 1.8, 0.38, 0.44, '#654635');
    for (let j = 0; j < 8; j++) {
      const w = 2.1 + random() * 1.8;
      box(x + (random() - 0.5) * 3.7, ground + height - 0.8 + random() * 2.4, z + (random() - 0.5) * 3.4, w, 1.1 + random() * 1.6, w * 0.8, pick(foliage));
    }
  }
  function lantern(x: number, z: number, y = 0, tall = false) {
    if (tall) { solid(x, y + 1.6, z, 0.2, 3.2, 0.2, '#4b3b32'); y += 3; }
    solid(x, y + 0.22, z, 0.8, 0.44, 0.8, '#62706d');
    box(x, y + 0.86, z, 0.52, 0.75, 0.52, '#ffbd64', true);
    lanternPositions.push(x, y + 0.86, z);
    box(x, y + 1.3, z, 0.82, 0.18, 0.82, '#55473a');
    for (const s of [-1, 1]) box(x + s * 0.3, y + 0.84, z, 0.07, 0.8, 0.64, '#604835');
  }
  // Terrain layers meet at their edges, with a single paving grid and excavated river.
  for (const block of createGroundLayout()) box(block.x, block.y, block.z, block.width, block.height, block.depth, groundColor(block));
  // Stone bridge with crenellated rails and warm lights over a flowing river.
  for (const side of [-1, 1]) {
    solid(side * 4.2, 0.48, 9, 0.45, 0.95, 5, '#727f7e');
    for (let z = 6.8; z <= 11.3; z += 1.3) box(side * 4.2, 1.12, z, 0.7, 0.35, 0.7, '#8a9389');
    lantern(side * 4.3, 6.6, 0.6); lantern(side * 4.3, 11.5, 0.6);
  }
  // Gateway: nested cyan frames, stone columns, tower caps and glowing insets.
  for (const side of [-1, 1]) {
    solid(side * 3.5, 3.6, -4.5, 1.4, 7.2, 2, '#617d85');
    box(side * 3.5, 4.1, -3.42, 0.32, 5.9, 0.06, '#6cf2ff', true);
    box(side * 3.5, 7.65, -4.5, 2.15, 0.9, 2.65, '#839592');
    for (let z = -5.3; z < -3.6; z += 0.8) box(side * 3.5, 8.3, z, 0.65, 0.65, 0.55, '#5c7780');
    lantern(side * 6, -3, 0, true);
  }
  box(0, 7.4, -4.5, 7.5, 1.05, 1.6, '#637e85');
  box(0, 6.75, -3.65, 5.6, 0.13, 0.12, '#6cf2ff', true);
  box(0, 0.25, -4.5, 8.2, 0.5, 4.2, '#788888');
  // Each destination has a distinct silhouette and accent palette.
  for (const zone of zones.filter(z => z.id !== 'hub')) {
    const { x, z, color, id } = zone;
    box(x, 0.27, z, 12, 0.55, 10, '#6e7b7b');
    const technology = id === 'cloud' || id === 'projects' || id === 'ai';
    if (id === 'cloud') {
      solid(x, 8.5, z, 6.6, 17, 6.6, '#334d68');
      for (const side of [-1, 1]) {
        solid(x + side * 4, 5, z, 2, 10, 7.5, '#5e6f80');
        box(x + side * 4, 5.8, z + 3.8, 0.45, 8.5, 0.08, color, true);
        box(x + side * 3.2, 10, z, 1, 2, 1, '#8d9d9b');
      }
      for (let y = 1.6; y < 17; y += 2.5) {
        box(x, y, z + 3.35, 4.8, 1.55, 0.04, '#256584');
        box(x, y + 0.8, z + 3.42, 6.2, 0.1, 0.06, color, true);
        for (const s of [-1, 1]) box(x + s * 1.7, y, z + 3.4, 0.1, 1.6, 0.08, color, true);
      }
      box(x, 17.3, z, 8, 0.7, 8, '#789198');
      for (let y = 18; y <= 21; y++) box(x, y, z, 6.5 - (y - 18) * 1.4, 1, 6.5 - (y - 18) * 1.4, '#354f65');
      box(x, 24, z, 0.2, 5.4, 0.2, color, true);
      // Buttresses, roof crowns and side windows make the citadel readable from every approach.
      for (const side of [-1, 1]) {
        solid(x + side * 5.1, 3, z - 2.3, 1.1, 6, 2.1, '#456474');
        for (let y = 3; y < 16; y += 3) {
          box(x + side * 3.34, y, z, 0.06, 1.8, 4.6, '#318599', true);
          box(x + side * 3.4, y + 1, z, 0.12, 0.2, 5.5, '#789198');
        }
      }
    } else if (id === 'signal') {
      // A welcoming communications lodge, with a rooftop beacon instead of an inaccessible summit.
      solid(x, 2.5, z, 9.6, 5, 7.8, '#6d574d');
      for (let roof = 0; roof < 4; roof++) box(x, 5.2 + roof * 0.65, z, 11.5 - roof * 2, 0.7, 9 - roof * 1.5, '#a36749');
      for (const side of [-1, 1]) {
        box(x + side * 3, 2.6, z + 3.95, 1.8, 2.1, 0.08, '#ffcf9b', true);
        box(x + side * 3, 2.6, z + 4.01, 0.12, 2.2, 0.12, '#594434');
      }
      box(x, 1.9, z + 3.95, 1.8, 3.8, 0.08, '#263b46');
      box(x, 12.2, z, 0.28, 7.5, 0.28, '#d69c65');
      for (const side of [-1, 1]) { box(x + side * 1.1, 12.8, z, 0.15, 3.5, 0.15, '#759396'); box(x + side * 1.1, 14.8, z, 0.35, 0.35, 0.35, color, true); }
      box(x, 14.1, z, 2.4, 0.15, 0.15, color, true);
      box(x, 16.2, z, 0.55, 0.55, 0.55, '#ffc795', true);
      lantern(x - 4, z + 5.3); lantern(x + 4, z + 5.3);
    } else {
      const wall = technology ? '#435567' : '#a9825c';
      solid(x, 3.6, z, 10.6, 6.8, 7.8, wall);
      for (const side of [-1, 1]) {
        box(x + side * 4.7, 3.6, z + 4.02, 0.55, 7.1, 0.42, technology ? '#2b394c' : '#4e382c');
        box(x + side * 3.1, 3.6, z + 4.01, 1.55, 2.7, 0.06, technology ? '#1f6683' : '#ffd494', true);
        box(x + side * 3.1, 3.6, z + 4.07, 1.7, 0.14, 0.1, '#3b3735');
        box(x + side * 3.1, 3.6, z + 4.08, 0.12, 2.8, 0.1, '#3b3735');
        lantern(x + side * 5.7, z + 5.1);
      }
      box(x, 2.2, z + 4.01, 1.9, 4.15, 0.04, '#273442');
      box(x, 5.6, z + 4.07, 11.5, 0.3, 0.36, technology ? color : '#513b2f', technology);
      if (technology) {
        box(x, 7.2, z, 12, 0.7, 9.2, '#2b394e');
        box(x, 7.7, z, 11.7, 0.12, 8.9, color, true);
        if (id === 'ai') for (const s of [-1, 1]) { box(x + s * 3.6, 9, z, 1.1, 2.8, 1.1, '#5d4380'); box(x + s * 3.6, 10.5, z, 1.4, 0.3, 1.4, color, true); }
        if (id === 'projects') { box(x - 2, 9, z - 1, 2.8, 2.6, 2.8, '#34495f'); box(x - 2, 10.4, z - 1, 3.4, 0.25, 3.4, color, true); }
      } else {
        for (let roof = 0; roof < 5; roof++) box(x, 7.1 + roof * 0.62, z, 12.2 - roof * 1.8, 0.68, 9.6 - roof * 1.4, id === 'career' ? (roof % 2 ? '#9b5936' : '#b46f41') : '#5b4636');
        box(x + 3.2, 9.8, z - 2, 1.1, 3.8, 1.2, '#7f7264');
        if (id === 'career') for (const side of [-1, 1]) {
          solid(x + side * 5.1, 5.5, z - 1, 2.5, 11, 2.5, '#a18362');
          for (let r = 0; r < 4; r++) box(x + side * 5.1, 11.1 + r * 0.65, z - 1, 3.4 - r * 0.8, 0.7, 3.4 - r * 0.8, '#925134');
          box(x + side * 5.1, 14.2, z - 1, 0.08, 2, 0.08, '#493a32'); box(x + side * 5.1 + 0.55, 14.5, z - 1, 1.1, 0.7, 0.04, '#eabc68');
        }
      }
      // Facade masonry / beam work adds rhythm without individual draw calls.
      for (let y = 0.9; y < 6.6; y += 1.3) for (let j = -4; j <= 4; j += 1.8) if (Math.abs(j) > 1.5) box(x + j, y, z + 4.1, 0.6, 0.24, 0.12, technology ? '#7c919b' : '#c1a17a');
      // Side facades and a framed entrance avoid the appearance of plain cubes.
      for (const side of [-1, 1]) {
        for (const offset of [-2, 1.7]) {
          box(x + side * 5.34, 3.4, z + offset, 0.06, 2.2, 1.5, technology ? '#3d97b6' : '#ffd494', true);
          box(x + side * 5.39, 3.4, z + offset, 0.1, 2.3, 0.13, '#374651');
        }
        box(x + side * 1.25, 2.15, z + 4.2, 0.32, 4.3, 0.5, technology ? '#738c96' : '#d0ad7e');
      }
      box(x, 4.4, z + 4.3, 2.8, 0.35, 0.7, color, technology);
      if (id === 'projects') {
        for (const side of [-1, 1]) { box(x + side * 4, 8.8, z, 1, 2.4, 5, '#526877'); box(x + side * 4, 10.1, z, 1.2, 0.2, 5.2, color, true); }
        box(x + 2, 9, z - 1, 3, 2.4, 3, '#3d566b');
      }
      if (id === 'knowledge') {
        box(x, 4.7, z + 4.8, 9.5, 0.35, 1.8, '#856348');
        for (const side of [-1, 1]) solid(x + side * 4.4, 2.3, z + 5.3, 0.22, 4.6, 0.22, '#624a37');
      }
    }
    solid(x, 0.7, zone.spawn[1] - 1.3, 1.6, 1.4, 0.9, '#354a52');
    box(x, 1.42, zone.spawn[1] - 1.3, 1.8, 0.1, 1.02, color, true);
    addSign(zone.name.toUpperCase(), zone.subtitle, x, id === 'cloud' ? 14 : 6.3, z + (id === 'cloud' ? 4.1 : 5.25), color, id === 'cloud' ? 7 : 10.7);
    addSign(zone.name, id === 'signal' ? 'CONTACT · EMAIL / LINKEDIN' : zone.subtitle, x, 3.8, zone.spawn[1] - 1.3, color, 3.6, true);
  }
  addSign('CENTRAL HUB', 'WELCOME TO HARSHITVERSE', 0, 8.1, -3.1, '#ffcf8a', 8.5);
  // Deliberately composed gardens bring the small details into the player's view.
  for (const side of [-1, 1]) for (const z of [-8, -1, 4, 16]) {
    const x = side * (z === 16 ? 7 : 10);
    solid(x, 0.36, z, 2.5, 0.72, 1.8, '#747e70');
    box(x, 0.75, z, 2.15, 0.2, 1.5, '#384e34');
    for (let flower = 0; flower < 16; flower++) {
      const fx = x + (random() - 0.5) * 2, fz = z + (random() - 0.5) * 1.3;
      box(fx, 1.04, fz, 0.08, 0.5, 0.08, '#4b7742');
      box(fx, 1.3 + random() * 0.2, fz, 0.23, 0.19, 0.23, pick(['#e8b866', '#f0d3a1', '#d791aa', '#d1b3d2']));
    }
  }
  for (const side of [-1, 1]) for (let j = 0; j < 14; j++) {
    box(side * 4.27, 0.7 + j * 0.47, -4.25 + Math.sin(j) * 0.6, 0.6, 0.6, 0.7, pick(foliage));
    if (j % 4 === 0) box(side * 4.4, 0.9 + j * 0.47, -3.86, 0.18, 0.15, 0.18, '#e5c08c');
  }
  // Garden walls, timber benches, a guide and abundant small vegetation.
  for (const side of [-1, 1]) for (let z = -10; z <= 4; z += 1.6) if (z < -6 || z > -1) {
    solid(side * 10.5, 0.65, z, 0.9, 1.3, 1.5, pick(stone)); box(side * 10.5, 1.38, z, 1.1, 0.2, 1.6, '#8c9788');
  }
  for (const [x, z] of [[-7, 4], [7, 4], [-7, -8], [7, -8], [-12, 16], [12, 17], [-15, -6], [12, -17], [22, 15]]) lantern(x, z);
  for (const [x, z] of [[-8, 0], [8, 0], [24, 29]]) { solid(x, 0.7, z, 2.8, 0.2, 0.8, '#745438'); solid(x, 1.17, z + 0.45, 2.8, 0.85, 0.18, '#745438'); for (const s of [-1, 1]) solid(x + s, 0.35, z, 0.2, 0.7, 0.8, '#494438'); }
  obstacles.push(boxCollider(-5.5, 1.3, 2, 0.8, 2.6, 0.8));
  addSign('THE GUIDE', 'COME SAY HELLO', -5.5, 3.8, 2, '#ffd897', 3.3, true);
  const isPath = (x: number, z: number) => {
    if (Math.abs(x) < 10 || Math.abs(z - 9) < 5) return true;
    if (x > 8 && x < 24 && z > 13 && z < 39) return true; // Keep the lobby's view of the hub and citadel clear.
    return zones.some(a => {
      if (Math.hypot(x - a.x, z - a.z) < 9) return true;
      const az = a.z > 10 ? 14 : 1, bx = a.spawn[0], bz = a.spawn[1];
      const t = Math.max(0, Math.min(1, (x * bx + (z - az) * (bz - az)) / (bx * bx + (bz - az) ** 2)));
      return Math.hypot(x - bx * t, z - az - (bz - az) * t) < 3.2;
    });
  };
  for (let j = 0; j < 115; j++) {
    const x = (random() - 0.5) * 91, z = (random() - 0.5) * 91;
    if (Math.hypot(x, z) > 45 || isPath(x, z)) continue;
    tree(x, z, 5 + random() * 5);
  }
  for (let j = 0; j < 450; j++) {
    const x = (random() - 0.5) * 92, z = (random() - 0.5) * 92;
    if (Math.hypot(x, z) > 45 || isPath(x, z)) continue;
    const c = pick(['#e9b962', '#dac77e', '#c983b0', '#80a46d', '#66a075']);
    box(x, 0.22, z, 0.12, 0.45, 0.12, '#678246'); solid(x, 0.5, z, 0.32, 0.24, 0.32, c);
    if (j % 3 === 0) solid(x + 0.4, 0.3, z + 0.4, 0.75, 0.6, 0.65, pick(foliage));
  }
  // Distant floating islands and stepped mountain silhouettes frame the world.
  for (let j = 0; j < 10; j++) {
    const angle = j / 10 * Math.PI * 2; const x = Math.sin(angle) * 102, z = Math.cos(angle) * 102;
    const y = j % 2 ? 22 + random() * 14 : -3;
    for (let step = 0; step < 7; step++) box(x, y - step * 2.4, z, 14 - step * 1.7, 2.6, 13 - step * 1.5, step === 0 ? '#527957' : pick(['#556675', '#677686', '#536271']));
    for (let t = 0; t < 3; t++) { box(x + t * 3 - 3, y + 2, z, 0.55, 4, 0.55, '#634b41'); box(x + t * 3 - 3, y + 5, z, 4, 3, 4, '#477654'); }
    if (j % 2 === 0) for (let step = 0; step < 13; step++) box(x, step * 2.4, z - 14, 27 - step * 1.75, 2.5, 25 - step * 1.6, step > 9 ? '#d1d4c7' : '#637080');
  }
  // Sunset cloud banks and distant castle silhouettes give the skyline depth.
  for (let j = 0; j < 8; j++) {
    const x = (j - 4) * 27, z = -110 - random() * 35, y = 34 + random() * 21;
    for (let p = 0; p < 6; p++) box(x + p * 6, y + Math.sin(p) * 3, z + random() * 3, 10 + random() * 5, 4 + random() * 3, 8, pick(['#e4c7b5', '#d5b7aa', '#d8c1b7']));
  }
  for (const [x, y, z] of [[-59, 26, -82], [62, 30, -74]]) {
    box(x, y - 2, z, 15, 4, 12, '#5b7161');
    for (const side of [-1, 1]) { box(x + side * 5, y + 5, z, 3.1, 10, 3.1, '#728082'); for (let top = 0; top < 4; top++) box(x + side * 5, y + 10.3 + top * 0.65, z, 4 - top * 0.9, 0.7, 4 - top * 0.9, '#6e574c'); box(x + side * 5, y + 5, z + 1.6, 0.6, 2, 0.08, '#ffdcb1', true); }
    box(x, y + 3, z, 7, 6, 4, '#697979'); box(x, y + 3, z + 2.1, 1.6, 3.4, 0.1, '#7ae5f4', true);
  }
  return { blocks, obstacles, lanternPositions, signs };
}
export function createEnvironment(scene: THREE.Scene) {
  const { blocks, obstacles, lanternPositions, signs } = createSceneryLayout();
  for (const label of signs) sign(scene, label.title, label.subtitle, label.x, label.y, label.z, label.color, label.width, label.landmark);
  const guide = makeAvatar(true); guide.root.position.set(-5.5, 0, 2); guide.root.rotation.y = Math.PI; scene.add(guide.root);
  let seed = 1749;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  // Flush original geometry into shared instanced meshes grouped by material.
  const grouped = new Map<string, Block[]>();
  for (const b of blocks) { const key = b.glow ? b.color : 'solid'; if (!grouped.has(key)) grouped.set(key, []); grouped.get(key)!.push(b); }
  const geometry = new THREE.BoxGeometry(1, 1, 1), transform = new THREE.Object3D();
  for (const list of grouped.values()) {
    const b = list[0]; const material = new THREE.MeshStandardMaterial({ color: b.glow ? b.color : '#ffffff', roughness: 0.95, emissive: b.glow ? b.color : '#000000', emissiveIntensity: b.glow ? 1.6 : 0 });
    const mesh = new THREE.InstancedMesh(geometry, material, list.length);
    list.forEach((b, i) => { transform.position.set(...b.p); transform.scale.set(...b.s); transform.rotation.set(0, b.rotation, 0); transform.updateMatrix(); mesh.setMatrixAt(i, transform.matrix); if (!b.glow) mesh.setColorAt(i, new THREE.Color(b.color)); });
    mesh.castShadow = !b.glow; mesh.receiveShadow = true; mesh.computeBoundingSphere(); scene.add(mesh);
  }
  const oceanGeometry = new THREE.PlaneGeometry(1600, 1600);
  const waterMaterial = new THREE.MeshStandardMaterial({ color: '#407d8d', metalness: 0.42, roughness: 0.28, transparent: true, opacity: 0.92 });
  const ocean = new THREE.Mesh(oceanGeometry, waterMaterial); ocean.rotation.x = -Math.PI / 2; ocean.position.y = -3; scene.add(ocean);
  const riverGeometry = new THREE.PlaneGeometry(104, 3.6, 100, 4); riverGeometry.rotateX(-Math.PI / 2);
  const river = new THREE.Mesh(riverGeometry, waterMaterial); river.position.set(0, riverChannel.waterY, 9); scene.add(river);
  const foam = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#b9dee2', transparent: true, opacity: 0.25, depthWrite: false }), 52);
  for (let j = 0; j < 52; j++) { transform.rotation.set(-Math.PI / 2, 0, 0); transform.scale.set(0.5 + random() * 1.6, 0.035, 1); const x = (random() - 0.5) * 87; transform.position.set(x < 0 ? x - 5 : x + 5, riverChannel.waterY + 0.04, 7.6 + random() * 2.8); transform.updateMatrix(); foam.setMatrixAt(j, transform.matrix); } foam.computeBoundingSphere(); scene.add(foam);
  const waterfall = new THREE.Mesh(new THREE.BoxGeometry(3.4, 9, 0.12), new THREE.MeshStandardMaterial({ color: '#8abccb', emissive: '#367a94', emissiveIntensity: 0.4, transparent: true, opacity: 0.75 })); waterfall.position.set(48.1, -4.3, 9); waterfall.rotation.y = Math.PI / 2; scene.add(waterfall);
  const portal = new THREE.Group(); portal.position.set(0, 3.6, -3.4);
  const aiOrb = new THREE.Group(); aiOrb.position.set(-34, 9.2, -25.6);
  aiOrb.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 1), new THREE.MeshBasicMaterial({ color: '#cc9aff', wireframe: true, transparent: true, opacity: 0.8 })));
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.055, 4, 32), new THREE.MeshBasicMaterial({ color: '#b688fb' })); ring.rotation.x = i ? Math.PI / 2 : 0; ring.rotation.z = 0.4; aiOrb.add(ring); } scene.add(aiOrb);
  for (let i = 0; i < 3; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35 - i * 0.32, 0.055, 4, 8), new THREE.MeshBasicMaterial({ color: i === 1 ? '#efffff' : '#65e8ff' })); ring.rotation.z = Math.PI / 8; ring.position.z = i * 0.035; portal.add(ring); }
  const portalMaterial = new THREE.ShaderMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false, uniforms: { time: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }', fragmentShader: 'varying vec2 vUv; uniform float time; void main(){ vec2 p=vUv-.5; float r=length(p); float rings=pow(.5+.5*sin(r*65.-time*2.5),5.); float grid=pow(.5+.5*sin(p.x*75.),18.)+pow(.5+.5*sin(p.y*75.),18.); float alpha=smoothstep(.49,.38,r); gl_FragColor=vec4(.12+grid*.3,.66+rings*.3,1.,alpha*(.2+rings*.25+grid*.15)); }' });
  portal.add(new THREE.Mesh(new THREE.CircleGeometry(2.12, 8), portalMaterial)); scene.add(portal);
  const glow = glowTexture();
  const lanternGeometry = new THREE.BufferGeometry(); lanternGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lanternPositions, 3));
  scene.add(new THREE.Points(lanternGeometry, new THREE.PointsMaterial({ map: glow, color: '#ffc171', size: 2.7, transparent: true, opacity: 0.27, blending: THREE.AdditiveBlending, depthWrite: false })));
  for (const [x, y, z, color, size] of [[0, 3.4, -3.3, '#62cfff', 10], [19, 17, -24, '#57dbff', 12], [-34, 8, -26, '#b07cff', 8]] as [number, number, number, string, number][]) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.37 })); sprite.position.set(x, y, z); sprite.scale.set(size, size, 1); scene.add(sprite);
  }
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 24, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: {}, vertexShader: 'varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'varying vec3 vPosition; void main(){float h=normalize(vPosition).y; vec3 top=vec3(.13,.25,.39); vec3 horizon=vec3(.88,.62,.43); vec3 bottom=vec3(.25,.42,.5); vec3 color=h>0.?mix(horizon,top,pow(clamp(h*1.6,0.,1.),.55)):mix(horizon,bottom,clamp(-h*3.,0.,1.)); gl_FragColor=vec4(color,1.);}' })); scene.add(sky);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#ffcf8e', blending: THREE.AdditiveBlending, depthWrite: false })); sun.position.set(-150, 78, -220); sun.scale.set(160, 160, 1); scene.add(sun);
  const particlesGeometry = new THREE.BufferGeometry(); const points = new Float32Array(150 * 3);
  for (let i = 0; i < points.length; i += 3) { points[i] = (random() - 0.5) * 60; points[i + 1] = 1 + random() * 9; points[i + 2] = (random() - 0.5) * 60; }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
  const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ color: '#ffe2a3', size: 0.09, transparent: true, opacity: 0.7, depthWrite: false })); scene.add(particles);
  return { obstacles, update: (t: number, reduced: boolean) => {
    if (reduced) return;
    portalMaterial.uniforms.time.value = t; portal.children.forEach((child, i) => { if (i < 3) child.rotation.z = Math.PI / 8 + t * (i % 2 ? -0.08 : 0.06); });
    particles.position.y = Math.sin(t * 0.25) * 0.45;
    aiOrb.rotation.y = t * 0.2; aiOrb.position.y = 9.2 + Math.sin(t) * 0.15;
    const vertices = riverGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) vertices.setY(i, Math.sin(vertices.getX(i) * 1.4 + t * 1.4) * 0.025);
    vertices.needsUpdate = true; foam.position.x = Math.sin(t * 0.15) * 1.2;
  } };
}

function glowTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128; const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64); grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.12, '#ffffff88'); grad.addColorStop(0.5, '#ffffff18'); grad.addColorStop(1, '#ffffff00'); ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(canvas);
}
function sign(scene: THREE.Scene, title: string, subtitle: string, x: number, y: number, z: number, color: string, width: number, landmark = false) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 220; const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#112232'; ctx.fillRect(0, 0, 1024, 220); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(4, 4, 1016, 212);
  ctx.fillStyle = color; ctx.font = 'bold 66px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(title, 512, 96, 950); ctx.fillStyle = '#dfedf2'; ctx.font = '29px system-ui, sans-serif'; ctx.fillText(subtitle, 512, 160, 950);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const material = { map: texture, toneMapped: false, fog: false };
  const mesh = landmark ? new THREE.Sprite(new THREE.SpriteMaterial(material)) : new THREE.Mesh(new THREE.PlaneGeometry(width, width * 220 / 1024), new THREE.MeshBasicMaterial({ ...material, side: THREE.DoubleSide }));
  if (landmark) mesh.scale.set(width, width * 220 / 1024, 1);
  mesh.position.set(x, y, z); scene.add(mesh);
}
