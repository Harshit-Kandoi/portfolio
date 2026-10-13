import { Orbit, Code2, Cloud, GraduationCap, Sparkles, BookOpen, Mail } from 'lucide-react';
import type { Zone } from './world';
export default function ZoneIcon({ zone, size = 21 }: { zone: Zone; size?: number }) {
  const Icon = { portal: Orbit, code: Code2, cloud: Cloud, guild: GraduationCap, ai: Sparkles, book: BookOpen, signal: Mail }[zone.icon];
  return <Icon size={size} strokeWidth={1.6} />;
}
