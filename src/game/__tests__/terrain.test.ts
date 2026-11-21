import { describe, expect, it } from 'vitest';
import { createGroundLayout, pavingTop, river } from '../terrain';
import { zones } from '../world';

describe('ground surface integrity', () => {
  const blocks = createGroundLayout();
  const paving = blocks.filter(b => b.surface === 'paving' || b.surface === 'bridge');
  it('has no overlapping paving at junctions or on the bridge', () => {
    const overlaps: string[] = [];
    for (let i = 0; i < paving.length; i++) {
      const a = paving[i];
      expect(a.y + a.height / 2).toBeCloseTo(pavingTop, 8);
      for (let j = i + 1; j < paving.length; j++) {
        const b = paving[j];
        const overlapX = (a.width + b.width) / 2 - Math.abs(a.x - b.x);
        const overlapZ = (a.depth + b.depth) / 2 - Math.abs(a.z - b.z);
        if (overlapX > 1e-8 && overlapZ > 1e-8) overlaps.push(`${a.x},${a.z} and ${b.x},${b.z}`);
      }
    }
    expect(overlaps).toEqual([]);
  });
  it('keeps grass above its support and water inside an open channel', () => {
    const grass = blocks.filter(b => b.surface === 'grass');
    for (const a of grass) {
      expect(a.z + a.depth / 2 <= river.minZ || a.z - a.depth / 2 >= river.maxZ).toBe(true);
      const rock = blocks.find(b => b.surface === 'rock' && b.x === a.x && b.z === a.z)!;
      expect(rock.y + rock.height / 2).toBeCloseTo(a.y - a.height / 2, 8);
    }
    const riverBed = blocks.filter(b => b.surface === 'rock' && b.z > river.minZ && b.z < river.maxZ);
    expect(riverBed.length).toBeGreaterThan(20);
    for (const bed of riverBed) expect(bed.y + bed.height / 2).toBeLessThan(river.waterY - 0.5);
  });
  it('paves every fast-travel arrival and connects both ends of the bridge', () => {
    for (const [x, z] of [...zones.map(zone => zone.spawn), [0, 6], [0, 12]] as [number, number][]) {
      expect(paving.some(b => Math.abs(b.x - x) <= b.width / 2 + 0.08 && Math.abs(b.z - z) <= b.depth / 2 + 0.08), `${x},${z}`).toBe(true);
    }
  });
});
