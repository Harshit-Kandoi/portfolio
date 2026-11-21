// Transient input is shared with the render loop, never persisted with exploration.
export interface TouchInput {
  x: number; z: number; sprint: boolean; jump: boolean;
  reset: () => void;
}
export function createTouchInput(): TouchInput {
  const input: TouchInput = { x: 0, z: 0, sprint: false, jump: false, reset: () => {
    input.x = input.z = 0; input.sprint = input.jump = false;
  } };
  return input;
}
export function stickVector(dx: number, dy: number, radius: number): { x: number; z: number } {
  const magnitude = Math.hypot(dx, dy);
  if (magnitude < radius * 0.12) return { x: 0, z: 0 };
  const scale = Math.max(radius, magnitude);
  return { x: dx / scale, z: dy / scale };
}
