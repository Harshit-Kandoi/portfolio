import { describe, expect, it } from 'vitest';
import { canOccupy, zones, interactionAt } from '../world';
import { useGame } from '../store';
describe('world navigation', () => {
  it('keeps every fast-travel landing outside walls, water and island edges', () => {
    for (const zone of zones) expect(canOccupy(...zone.spawn), zone.name).toBe(true);
  });
  it('blocks buildings, river banks and the ocean while preserving the bridge and portal opening', () => {
    expect(canOccupy(-23, -13)).toBe(false);
    expect(canOccupy(8, 9)).toBe(false);
    expect(canOccupy(0, 9)).toBe(true);
    expect(canOccupy(0, -4.5)).toBe(true);
    expect(canOccupy(48, 0)).toBe(false);
  });
  it('offers interactions only at the guide or a destination terminal', () => {
    expect(interactionAt(-5.5, 2)).toBe('guide');
    expect(interactionAt(-23, -4)).toBe('projects');
    expect(interactionAt(0, 35)).toBe(null);
  });
});
describe('exploration state', () => {
  it('records a visit only once and preserves the mission across travel', () => {
    useGame.setState({ completed: [], visited: [] });
    const state = useGame.getState(); state.visit('projects'); state.visit('projects'); state.mark('inspect'); state.teleport(25, 4);
    expect(useGame.getState().completed).toEqual(['projects', 'inspect']);
    expect(useGame.getState().visited).toEqual(['projects']);
    expect(useGame.getState().travel).toMatchObject({ x: 25, z: 4 });
    expect(useGame.getState().panel).toBe(null);
  });
});
