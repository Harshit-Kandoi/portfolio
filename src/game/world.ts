export type ZoneId = 'hub' | 'projects' | 'cloud' | 'career' | 'ai' | 'knowledge' | 'signal';
export interface Zone { id: ZoneId; name: string; subtitle: string; color: string; x: number; z: number; spawn: [number, number]; icon: 'portal' | 'code' | 'cloud' | 'guild' | 'ai' | 'book' | 'signal' }
export const zones: Zone[] = [
  { id: 'hub', name: 'Central Hub', subtitle: 'Your journey starts here', color: '#7cecff', x: 0, z: -5, spawn: [0, 13], icon: 'portal' },
  { id: 'projects', name: 'Project District', subtitle: 'Projects · Products & experiments', color: '#5bcfff', x: -23, z: -13, spawn: [-23, -4], icon: 'code' },
  { id: 'cloud', name: 'Cloud Citadel', subtitle: 'Cloud & backend engineering', color: '#65f5ed', x: 19, z: -27, spawn: [19, -19], icon: 'cloud' },
  { id: 'career', name: 'Career Guild', subtitle: 'Experience · Education & credentials', color: '#ffc573', x: 25, z: -4, spawn: [25, 4], icon: 'guild' },
  { id: 'ai', name: 'AI Nexus', subtitle: 'AI · Models & experiments', color: '#ca91ff', x: -34, z: -30, spawn: [-34, -23], icon: 'ai' },
  { id: 'knowledge', name: 'Knowledge Tavern', subtitle: 'Blog · Articles & ideas', color: '#ffd897', x: 29, z: 22, spawn: [29, 29], icon: 'book' },
  { id: 'signal', name: 'Contact Beacon', subtitle: 'Contact · Email & LinkedIn', color: '#ffae8b', x: -28, z: 25, spawn: [-28, 32], icon: 'signal' },
];
export interface Collider { minX: number; maxX: number; minZ: number; maxZ: number; height: number; minY?: number }
export function boxCollider(x: number, y: number, z: number, width: number, height: number, depth: number): Collider {
  return { minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2, minY: Math.max(0, y - height / 2), height: y + height / 2 };
}
export const colliders: Collider[] = zones.filter(z => z.id !== 'hub').map(z => ({ minX: z.x - 5.5, maxX: z.x + 5.5, minZ: z.z - 4, maxZ: z.z + 4, height: z.id === 'cloud' ? 25 : z.id === 'signal' ? 17 : z.id === 'career' ? 15 : 11 }));
// Portal columns and guide plinth. The opening itself remains walkable.
colliders.push({ minX: -4.2, maxX: -2.6, minZ: -6, maxZ: -3, height: 10 }, { minX: 2.6, maxX: 4.2, minZ: -6, maxZ: -3, height: 10 });
export function canOccupy(x: number, z: number, obstacles: Collider[] = colliders): boolean {
  const r = 0.48;
  if (Math.hypot(x, z) > 46) return false;
  // A shallow river has one clearly marked stone bridge.
  if (z > 7.2 - r && z < 10.8 + r && Math.abs(x) > 4.3 - r) return false;
  return !obstacles.some(b => x > b.minX - r && x < b.maxX + r && z > b.minZ - r && z < b.maxZ + r);
}
export function nearestZone(x: number, z: number): Zone {
  return zones.reduce((a, b) => Math.hypot(x - a.x, z - a.z) < Math.hypot(x - b.x, z - b.z) ? a : b);
}
export function interactionAt(x: number, z: number): ZoneId | 'guide' | null {
  if (Math.hypot(x + 5.5, z - 2) < 3.8) return 'guide';
  const zone = zones.find(a => Math.hypot(x - (a.id === 'hub' ? 0 : a.spawn[0]), z - (a.id === 'hub' ? 0 : a.spawn[1])) < 4.8);
  return zone?.id ?? null;
}
export const missionObjectives = [
  { id: 'guide', title: 'Meet the Central Hub guide' },
  { id: 'projects', title: 'Visit the Project District' },
  { id: 'inspect', title: 'Inspect a project' },
  { id: 'career', title: 'Visit the Career Guild' },
] as const;
