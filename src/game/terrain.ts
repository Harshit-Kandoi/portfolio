import { zones } from './world';

export interface GroundBlock {
  x: number; y: number; z: number;
  width: number; height: number; depth: number;
  surface: 'rock' | 'grass' | 'paving' | 'bridge';
}
export const river = { minZ: 7.2, maxZ: 10.8, waterY: -0.24, bedY: -1.25 };
export const pavingTop = 0.025;
const tileStep = 1.2;

// One ownership grid for all routes: intersections never stack coplanar pavers.
export function createGroundLayout(): GroundBlock[] {
  const blocks: GroundBlock[] = [];
  for (let x = -52; x <= 52; x += 4) for (let z = -52; z <= 52; z += 4) {
    const radius = Math.hypot(x, z);
    if (radius > 52 + 1.2 * Math.sin(x)) continue;
    const top = radius < 47 ? 0 : -1.5;
    const cuts = [z - 2, river.minZ, river.maxZ, z + 2]
      .filter(v => v >= z - 2 && v <= z + 2).sort((a, b) => a - b);
    for (let i = 1; i < cuts.length; i++) {
      const depth = cuts[i] - cuts[i - 1];
      if (depth <= 0) continue;
      const centerZ = (cuts[i] + cuts[i - 1]) / 2;
      const channel = centerZ > river.minZ && centerZ < river.maxZ;
      const rockTop = channel ? river.bedY : top - 0.5;
      blocks.push({ x, y: (rockTop - 7) / 2, z: centerZ, width: 4, height: rockTop + 7, depth, surface: 'rock' });
      if (!channel) blocks.push({ x, y: top - 0.25, z: centerZ, width: 4, height: 0.5, depth, surface: 'grass' });
    }
  }
  const routes = zones.filter(zone => zone.id !== 'hub').map(zone => ({
    ax: 0, az: zone.z > 10 ? 14 : 1, bx: zone.spawn[0], bz: zone.spawn[1], width: 4.2,
  }));
  routes.push({ ax: 0, az: 4, bx: 0, bz: 29, width: 6 });
  for (let ix = -39; ix <= 39; ix++) for (let iz = -39; iz <= 39; iz++) {
    const x = ix * tileStep, z = iz * tileStep;
    // Clip the approach rows exactly to the bridge, leaving only the normal grout seam.
    let minZ = z - tileStep / 2, maxZ = z + tileStep / 2;
    if (minZ < 11.5 && maxZ > 6.5) {
      if (minZ < 6.5) maxZ = 6.5;
      else if (maxZ > 11.5) minZ = 11.5;
      else continue;
    }
    const plaza = Math.abs(x) <= 9 && z >= -11 && z <= 5;
    const route = routes.some(({ ax, az, bx, bz, width }) => {
      const dx = bx - ax, dz = bz - az;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      return Math.hypot(x - ax - t * dx, z - az - t * dz) <= width / 2;
    });
    if (!plaza && !route) continue;
    blocks.push({ x, y: pavingTop - 0.06, z: (minZ + maxZ) / 2, width: tileStep - 0.035, height: 0.12, depth: maxZ - minZ - 0.035, surface: 'paving' });
  }
  blocks.push({ x: 0, y: pavingTop - 0.15, z: 9, width: 8.4, height: 0.3, depth: 5, surface: 'bridge' });
  return blocks;
}

// Position-based colors keep adjacent tiles quiet and stable as scenery evolves.
export function groundColor(block: GroundBlock): string {
  const palettes = {
    rock: ['#596567', '#626e6e', '#697373'],
    grass: ['#58754b', '#5b794d', '#5e7b50', '#567349', '#607d50'],
    paving: ['#8c9690', '#949b93', '#88938d', '#919a93', '#98a098'],
    bridge: ['#949e98'],
  };
  const colors = palettes[block.surface];
  const hash = Math.abs(Math.round(block.x * 100) * 73856093 ^ Math.round(block.z * 100) * 19349663);
  return colors[hash % colors.length];
}
