import * as THREE from 'three';
import { createEnvironment } from './Environment';
import { makeAvatar } from './Avatar';
import { canOccupy, nearestZone, interactionAt, type ZoneId } from './world';
import { useGame } from './store';
import type { TouchInput } from './touchInput';

export interface WorldSnapshot { x: number; z: number; y: number; region: ZoneId; near: ZoneId | 'guide' | null; fps: number; locked: boolean }
export function createEngine(host: HTMLElement, report: (s: WorldSnapshot) => void, fail: (message: string) => void, input: TouchInput) {
  const touchDevice = () => window.matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !touchDevice(), alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor('#a9b9bb');
  const canvas = renderer.domElement; canvas.tabIndex = 0; canvas.setAttribute('aria-label', 'HarshitVerse 3D world. Use the movement stick and drag to look on touch screens, or WASD and mouse on desktop.'); host.appendChild(canvas);
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#abb6bd', 0.004);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.25, 850); camera.position.set(10, 14, 39);
  scene.add(new THREE.HemisphereLight('#d4eaf7', '#70583c', 1.5));
  const sun = new THREE.DirectionalLight('#ffd2a0', 3.8); sun.position.set(-35, 65, -30); sun.castShadow = true;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -55; sun.shadow.camera.right = sun.shadow.camera.top = 55; sun.shadow.camera.near = 1; sun.shadow.camera.far = 160; sun.shadow.bias = -0.001; sun.shadow.normalBias = 0.05; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const fill = new THREE.DirectionalLight('#8fdbff', 0.7); fill.position.set(20, 20, 40); scene.add(fill);
  const world = createEnvironment(scene); const player = makeAvatar(); scene.add(player.root); player.root.position.set(0, 0, 13);
  const playerGlow = new THREE.PointLight('#65eaff', 6, 15, 2); playerGlow.position.set(0, 4, -3); scene.add(playerGlow);
  const keys = new Set<string>(); let yaw = 0, pitch = 0.36, distance = 8.5, vx = 0, vz = 0, vy = 0, time = 0, jumpPeakY = 0;
  const lookPointers = new Map<number, { x: number; y: number }>(); let pinchSpan = 0;
  let frame = 0, stopped = false, last = performance.now(), lastReport = 0, fps = 60, hadLock = false;
  const look = new THREE.Vector3(), desired = new THREE.Vector3(), direction = new THREE.Vector3(), target = new THREE.Vector3(), ray = new THREE.Ray();
  const hit = new THREE.Vector3();
  const cameraBoxes = world.obstacles.map(b => new THREE.Box3(new THREE.Vector3(b.minX - 0.25, b.minY ?? 0, b.minZ - 0.25), new THREE.Vector3(b.maxX + 0.25, b.height, b.maxZ + 0.25)));
  function quality() {
    const s = useGame.getState();
    const pixelLimit = s.quality === 'low' ? 1 : touchDevice() ? (s.quality === 'high' ? 1.5 : 1.25) : (s.quality === 'high' ? 2 : 1.5);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, pixelLimit)); renderer.shadowMap.enabled = s.quality !== 'low';
    sun.shadow.mapSize.set(touchDevice() ? 1024 : 2048, touchDevice() ? 1024 : 2048); resize();
  }
  function resize() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; release(); renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); quality();
  const unsubscribe = useGame.subscribe((state, previous) => {
    if (state.quality !== previous.quality) quality();
    if (state.panel || !state.playing) { release(); if (document.pointerLockElement === canvas) document.exitPointerLock(); }
    if (state.travel.serial !== previous.travel.serial) {
      release(); player.root.position.set(state.travel.x, 0, state.travel.z); vy = 0; yaw = 0; camera.position.set(state.travel.x, 4.5, state.travel.z + 8); reportState();
    }
    if (state.playing && !previous.playing) { canvas.focus(); player.root.rotation.y = 0; camera.position.set(player.root.position.x, 5, player.root.position.z + 9); }
  });
  function keydown(event: KeyboardEvent) {
    const s = useGame.getState(); if (!s.playing) return;
    if (event.key === 'Escape') { event.preventDefault(); s.open(s.panel ? null : 'settings'); return; }
    if (s.panel || event.ctrlKey || event.metaKey || event.altKey) return;
    if ((event.target as HTMLElement).closest('input,textarea,select,button,a')) return;
    const key = event.code;
    if (['Space', 'Tab', 'KeyM', 'KeyE', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) event.preventDefault();
    if (event.repeat && ['Space', 'Tab', 'KeyM', 'KeyE'].includes(key)) return;
    if (key === 'KeyM') { s.open('map'); return; }
    if (key === 'Tab') { s.open('missions'); return; }
    if (key === 'KeyE') { const near = interactionAt(player.root.position.x, player.root.position.z); if (near) s.open(near); return; }
    if (key === 'Space' && player.root.position.y <= 0.001) { vy = 8.3; jumpPeakY = 0; }
    keys.add(key);
  }
  function keyup(event: KeyboardEvent) { keys.delete(event.code); }
  function release() {
    keys.clear(); input.reset(); vx = vz = 0;
    for (const id of lookPointers.keys()) if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    lookPointers.clear(); pinchSpan = 0;
  }
  function blur() { release(); const s = useGame.getState(); if (s.playing && !s.panel) s.open('settings'); }
  function visibility() { if (document.hidden) blur(); }
  function lock(event: MouseEvent) {
    if (touchDevice() || (event instanceof PointerEvent && event.pointerType !== 'mouse')) return;
    if (useGame.getState().playing && !useGame.getState().panel) { canvas.focus(); const result = canvas.requestPointerLock?.(); if (result && typeof result.catch === 'function') result.catch(() => {}); }
  }
  function lockChange() { const locked = document.pointerLockElement === canvas; if (hadLock && !locked && useGame.getState().playing && !useGame.getState().panel) useGame.getState().open('settings'); hadLock = locked; reportState(); }
  function mousemove(event: MouseEvent) { if (document.pointerLockElement !== canvas || useGame.getState().panel) return; yaw -= event.movementX * 0.0026; pitch = THREE.MathUtils.clamp(pitch + event.movementY * 0.002, 0.12, 0.85); }
  function wheel(event: WheelEvent) { if (!useGame.getState().playing || useGame.getState().panel) return; event.preventDefault(); distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.006, 5, 13); }
  function span() { const [a, b] = [...lookPointers.values()]; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0; }
  function touchStart(event: PointerEvent) {
    if (event.pointerType === 'mouse' || !useGame.getState().playing || useGame.getState().panel) return;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId);
    lookPointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); pinchSpan = span();
  }
  function touchMove(event: PointerEvent) {
    const previous = lookPointers.get(event.pointerId);
    if (!previous || !useGame.getState().playing || useGame.getState().panel) return;
    event.preventDefault(); lookPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (lookPointers.size === 1) {
      yaw -= (event.clientX - previous.x) * 0.006;
      pitch = THREE.MathUtils.clamp(pitch + (event.clientY - previous.y) * 0.004, 0.12, 0.85);
    } else {
      const next = span(); distance = THREE.MathUtils.clamp(distance + (pinchSpan - next) * 0.025, 5, 13); pinchSpan = next;
    }
  }
  function touchEnd(event: PointerEvent) { lookPointers.delete(event.pointerId); pinchSpan = span(); }
  function reportState() {
    const p = player.root.position; const region = nearestZone(p.x, p.z).id;
    if (useGame.getState().playing && Math.hypot(p.x - nearestZone(p.x, p.z).spawn[0], p.z - nearestZone(p.x, p.z).spawn[1]) < 6) useGame.getState().visit(region);
    report({ x: p.x, z: p.z, y: p.y, region, near: interactionAt(p.x, p.z), fps: Math.round(fps), locked: document.pointerLockElement === canvas });
    canvas.dataset.playerX = p.x.toFixed(2); canvas.dataset.playerZ = p.z.toFixed(2); canvas.dataset.playerY = p.y.toFixed(2); canvas.dataset.fps = fps.toFixed(0); canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.cameraX = camera.position.x.toFixed(2); canvas.dataset.cameraY = camera.position.y.toFixed(2); canvas.dataset.cameraZ = camera.position.z.toFixed(2); canvas.dataset.cameraYaw = yaw.toFixed(2);
    canvas.dataset.cameraDistance = distance.toFixed(2); canvas.dataset.pixelRatio = renderer.getPixelRatio().toFixed(2);
    canvas.dataset.jumpPeakY = jumpPeakY.toFixed(2);
  }
  window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', blur);
  document.addEventListener('pointerlockchange', lockChange); document.addEventListener('mousemove', mousemove);
  document.addEventListener('visibilitychange', visibility);
  canvas.addEventListener('pointerdown', touchStart); canvas.addEventListener('pointermove', touchMove);
  canvas.addEventListener('pointerup', touchEnd); canvas.addEventListener('pointercancel', touchEnd); canvas.addEventListener('lostpointercapture', touchEnd);
  canvas.addEventListener('click', lock); canvas.addEventListener('wheel', wheel, { passive: false }); canvas.addEventListener('webglcontextlost', contextLost);
  function contextLost(event: Event) { event.preventDefault(); fail('The graphics connection was interrupted. Your portfolio and resume are still available below.'); }
  function tick(now: number) {
    if (stopped) return;
    const elapsed = (now - last) / 1000;
    const dt = Math.min(elapsed, 0.25); last = now; time += dt; fps = THREE.MathUtils.lerp(fps, 1 / Math.max(elapsed, 0.001), 0.1);
    const state = useGame.getState();
    if (state.playing) {
      let dx = 0, dz = 0;
      if (!state.panel) {
        dx = THREE.MathUtils.clamp(Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) + input.x, -1, 1);
        dz = THREE.MathUtils.clamp(Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp')) + input.z, -1, 1);
        if (input.jump && player.root.position.y <= 0.001) { vy = 8.3; jumpPeakY = 0; }
      }
      input.jump = false;
      const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') || input.sprint ? 8.2 : 4.6; const length = Math.max(1, Math.hypot(dx, dz));
      const wx = (Math.cos(yaw) * dx + Math.sin(yaw) * dz) / length * speed, wz = (-Math.sin(yaw) * dx + Math.cos(yaw) * dz) / length * speed;
      vx = THREE.MathUtils.damp(vx, wx, 12, dt); vz = THREE.MathUtils.damp(vz, wz, 12, dt);
      const p = player.root.position;
      if (!state.panel) {
        // Substeps preserve collision and jump behavior when rendering is slow.
        const steps = Math.max(1, Math.ceil(dt / (1 / 60))), step = dt / steps;
        for (let i = 0; i < steps; i++) {
          if (canOccupy(p.x + vx * step, p.z, world.obstacles)) p.x += vx * step; else vx = 0;
          if (canOccupy(p.x, p.z + vz * step, world.obstacles)) p.z += vz * step; else vz = 0;
          vy -= 22 * step; p.y = Math.max(0, p.y + vy * step); jumpPeakY = Math.max(jumpPeakY, p.y); if (p.y === 0 && vy < 0) vy = 0;
        }
        if (Math.hypot(vx, vz) > 0.15) { const angle = Math.atan2(-vx, -vz); player.root.rotation.y += (THREE.MathUtils.euclideanModulo(angle - player.root.rotation.y + Math.PI, Math.PI * 2) - Math.PI) * (1 - Math.exp(-12 * dt)); }
      }
      player.animate(time, Math.hypot(vx, vz), p.y > 0.01);
      target.set(p.x, p.y + 1.8, p.z);
      desired.set(p.x + Math.sin(yaw) * Math.cos(pitch) * distance, p.y + 1.8 + Math.sin(pitch) * distance, p.z + Math.cos(yaw) * Math.cos(pitch) * distance);
      direction.subVectors(desired, target); let safeDistance = direction.length(); direction.normalize(); ray.set(target, direction);
      for (const box of cameraBoxes) if (ray.intersectBox(box, hit)) { const d = target.distanceTo(hit); if (d > 0.1 && d < safeDistance) safeDistance = Math.max(0.65, d - 0.35); }
      desired.copy(target).addScaledVector(direction, safeDistance); desired.y = Math.max(0.65, desired.y);
      // Snap inward immediately to keep the camera outside walls; ease outward and while following.
      if (camera.position.distanceTo(target) > safeDistance + 0.8) camera.position.copy(desired); else camera.position.lerp(desired, 1 - Math.exp(-8 * dt));
      look.lerp(target, 1 - Math.exp(-12 * dt)); camera.lookAt(look);
    } else {
      player.root.position.set(0, 0, 13); player.root.rotation.y = Math.PI; player.animate(time, 0, false);
      const orbit = state.reducedMotion ? 0 : Math.sin(time * 0.055) * 5;
      desired.set(10 + orbit * 0.4, 14, 39); camera.position.lerp(desired, 1 - Math.exp(-1.6 * dt)); camera.lookAt(0, 4, -8);
    }
    world.update(time, state.reducedMotion);
    try { renderer.render(scene, camera); } catch { fail('This browser could not render the world. You can still explore every portfolio section directly.'); return; }
    if (now - lastReport > 120) { lastReport = now; reportState(); }
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return () => {
    stopped = true; cancelAnimationFrame(frame); unsubscribe(); resizeObserver.disconnect(); release();
    window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', blur);
    document.removeEventListener('pointerlockchange', lockChange); document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('visibilitychange', visibility);
    canvas.removeEventListener('pointerdown', touchStart); canvas.removeEventListener('pointermove', touchMove);
    canvas.removeEventListener('pointerup', touchEnd); canvas.removeEventListener('pointercancel', touchEnd); canvas.removeEventListener('lostpointercapture', touchEnd);
    canvas.removeEventListener('click', lock); canvas.removeEventListener('wheel', wheel); canvas.removeEventListener('webglcontextlost', contextLost);
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    scene.traverse(o => { if (o instanceof THREE.InstancedMesh) o.dispose(); const mesh = o as THREE.Mesh; if (mesh.geometry) geometries.add(mesh.geometry); if (mesh.material) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) { materials.add(material); for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value); } });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); sun.shadow.map?.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
  };
}
