import { describe, expect, it } from 'vitest';
import { createTouchInput, stickVector } from '../touchInput';
describe('touch movement input', () => {
  it('ignores thumb jitter and retains proportional movement below full deflection', () => {
    expect(stickVector(2, -1, 40)).toEqual({ x: 0, z: 0 });
    expect(stickVector(0, -20, 40)).toEqual({ x: 0, z: -0.5 });
  });
  it('caps diagonal and out-of-bounds drags at normal movement speed', () => {
    const diagonal = stickVector(90, -90, 40);
    expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(1);
    expect(diagonal.z).toBeLessThan(0);
    expect(stickVector(100, 0, 40)).toEqual({ x: 1, z: 0 });
  });
  it('clears held movement and actions without sharing input between worlds', () => {
    const first = createTouchInput(), second = createTouchInput();
    first.x = 1; first.z = -0.5; first.sprint = first.jump = true; first.reset();
    expect(first).toMatchObject({ x: 0, z: 0, sprint: false, jump: false });
    second.z = -1; expect(first.z).toBe(0);
  });
});
