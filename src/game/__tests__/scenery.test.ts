import { describe, expect, it } from 'vitest';
import { createSceneryLayout } from '../Environment';
import { canOccupy, zones } from '../world';

const layout = createSceneryLayout();
describe('scenery collision', () => {
  it('blocks the rendered footprint of every solid prop, including plants and tower wings', () => {
    const solids = layout.blocks.filter(block => block.solid);
    expect(solids.length).toBeGreaterThan(100);
    for (const block of solids) {
      const [x, , z] = block.p;
      expect(canOccupy(x, z, layout.obstacles), `solid at ${x}, ${z}`).toBe(false);
    }
    for (const [x, z] of [[10, 4], [-8, 0], [7, 4], [25, 2.7], [31, -5], [24, -29.3]]) {
      expect(canOccupy(x, z, layout.obstacles), `prop at ${x}, ${z}`).toBe(false);
    }
  });
  it('keeps every landing clear and reachable on foot from the central hub', () => {
    for (const zone of zones) expect(canOccupy(...zone.spawn, layout.obstacles), zone.name).toBe(true);
    // Flood the playable island in half-metre steps using the engine's actual scenery.
    const queue: [number, number][] = [[0, 26]], seen = new Set(['0,26']);
    for (let i = 0; i < queue.length; i++) {
      const [x, z] = queue[i];
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nextX = x + dx, nextZ = z + dz, key = `${nextX},${nextZ}`;
        if (seen.has(key) || !canOccupy(nextX / 2, nextZ / 2, layout.obstacles)) continue;
        seen.add(key); queue.push([nextX, nextZ]);
      }
    }
    for (const zone of zones) expect(seen.has(`${zone.spawn[0] * 2},${zone.spawn[1] * 2}`), zone.name).toBe(true);
  });
  it('preserves the bridge and guide approach while blocking the bridge rails', () => {
    for (let z = 6; z < 13; z += 0.25) expect(canOccupy(0, z, layout.obstacles)).toBe(true);
    expect(canOccupy(-4.2, 9, layout.obstacles)).toBe(false);
    expect(canOccupy(-3.5, 2, layout.obstacles)).toBe(true);
    expect(canOccupy(-5.5, 2, layout.obstacles)).toBe(false);
  });
});
