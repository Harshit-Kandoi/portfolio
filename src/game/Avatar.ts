import * as THREE from 'three';
export function makeAvatar(guide = false) {
  const root = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const parts: { object: THREE.Object3D; color: string }[] = [];
  function block(parent: THREE.Group, size: number[], pos: number[], color: string) {
    const m = new THREE.Object3D(); m.scale.set(...size as [number, number, number]); m.position.set(...pos as [number, number, number]); parent.add(m); parts.push({ object: m, color }); return m;
  }
  const skin = '#d99a6c', jacket = guide ? '#c59445' : '#253646';
  block(root, [0.87, 1, 0.48], [0, 1.55, 0], jacket);
  block(root, [0.29, 0.86, 0.025], [0, 1.55, -0.255], '#e2e5d4');
  block(root, [0.08, 0.92, 0.035], [0, 1.55, -0.28], '#2c3238');
  block(root, [0.68, 0.33, 0.56], [0, 2, 0.03], jacket);
  block(root, [0.77, 0.69, 0.65], [0, 2.42, 0], skin);
  block(root, [0.84, 0.25, 0.73], [0, 2.79, 0.01], '#241a19');
  block(root, [0.21, 0.55, 0.67], [-0.33, 2.53, 0.04], '#241a19');
  block(root, [0.77, 0.64, 0.14], [0, 2.46, 0.32], '#241a19');
  block(root, [0.15, 0.12, 0.025], [-0.18, 2.46, -0.335], '#151d27');
  block(root, [0.15, 0.12, 0.025], [0.18, 2.46, -0.335], '#151d27');
  block(root, [0.25, 0.05, 0.027], [0, 2.23, -0.337], '#734832');
  block(root, [0.68, 0.81, 0.25], [0, 1.61, 0.36], '#111e2d');
  block(root, [0.52, 0.47, 0.04], [0, 1.65, 0.505], '#374457');
  // The monogram is geometry, so it remains legible from the following camera.
  for (const [x, y, w, h] of [[-0.16, 1.65, 0.055, 0.21], [-0.02, 1.65, 0.055, 0.21], [-0.09, 1.65, 0.14, 0.045], [0.1, 1.65, 0.055, 0.21]] ) block(root, [w, h, 0.015], [x, y, 0.536], '#d3e1e9');
  const k1 = block(root, [0.05, 0.15, 0.02], [0.16, 1.69, 0.54], '#d3e1e9'); k1.rotation.z = -0.65;
  const k2 = block(root, [0.05, 0.15, 0.02], [0.16, 1.61, 0.54], '#d3e1e9'); k2.rotation.z = 0.65;
  const arms = [-1, 1].map(side => { const pivot = new THREE.Group(); pivot.position.set(side * 0.59, 1.92, 0); root.add(pivot); block(pivot, [0.28, 0.78, 0.4], [0, -0.33, 0], jacket); block(pivot, [0.29, 0.21, 0.4], [0, -0.79, 0], skin); return pivot; });
  const legs = [-1, 1].map(side => { const pivot = new THREE.Group(); pivot.position.set(side * 0.23, 1.03, 0); root.add(pivot); block(pivot, [0.33, 0.83, 0.4], [0, -0.39, 0], '#253b50'); block(pivot, [0.37, 0.17, 0.58], [0, -0.88, -0.08], '#e6e2d1'); block(pivot, [0.37, 0.12, 0.48], [0, -0.77, -0.02], '#1c2630'); return pivot; });
  const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85 }), parts.length);
  mesh.castShadow = true; mesh.frustumCulled = false; mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  parts.forEach((p, i) => mesh.setColorAt(i, new THREE.Color(p.color))); root.add(mesh);
  const inverse = new THREE.Matrix4(), matrix = new THREE.Matrix4();
  const animate = (time: number, speed: number, airborne: boolean) => {
    const amplitude = Math.min(speed / 5, 1) * 0.75;
    legs.forEach((p, i) => p.rotation.x = airborne ? (i ? -0.45 : 0.45) : Math.sin(time * 10 + i * Math.PI) * amplitude);
    arms.forEach((p, i) => { p.rotation.x = airborne ? -0.8 : -Math.sin(time * 10 + i * Math.PI) * amplitude; p.rotation.z = Math.sin(time * 1.7) * 0.022 * (1 - amplitude) * (i ? -1 : 1); });
    root.updateMatrixWorld(true); inverse.copy(root.matrixWorld).invert();
    parts.forEach((p, i) => { matrix.multiplyMatrices(inverse, p.object.matrixWorld); mesh.setMatrixAt(i, matrix); }); mesh.instanceMatrix.needsUpdate = true;
  };
  animate(0, 0, false);
  return { root, animate };
}
