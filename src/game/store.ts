import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ZoneId } from './world';
export type Panel = ZoneId | 'guide' | 'map' | 'missions' | 'settings' | 'help' | null;
interface GameState {
  playing: boolean; panel: Panel; quality: 'low' | 'balanced' | 'high'; reducedMotion: boolean; sound: boolean;
  completed: string[]; visited: ZoneId[]; travel: { x: number; z: number; serial: number };
  setPlaying: (v: boolean) => void; open: (p: Panel) => void; mark: (id: string) => void; visit: (id: ZoneId) => void;
  setQuality: (v: GameState['quality']) => void; setReducedMotion: (v: boolean) => void; setSound: (v: boolean) => void;
  teleport: (x: number, z: number) => void;
}
export const useGame = create<GameState>()(persist((set, get) => ({
  playing: false, panel: null, quality: 'balanced', reducedMotion: typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  sound: false, completed: [], visited: [], travel: { x: 0, z: 13, serial: 0 },
  setPlaying: playing => set({ playing, panel: null }), open: panel => set({ panel }),
  mark: id => set({ completed: get().completed.includes(id) ? get().completed : [...get().completed, id] }),
  visit: id => { set({ visited: get().visited.includes(id) ? get().visited : [...get().visited, id] }); if (id === 'projects' || id === 'career') get().mark(id); },
  setQuality: quality => set({ quality }), setReducedMotion: reducedMotion => set({ reducedMotion }), setSound: sound => set({ sound }),
  teleport: (x, z) => set({ playing: true, panel: null, travel: { x, z, serial: get().travel.serial + 1 } }),
}), {
  name: 'harshitverse-v1', version: 1,
  storage: createJSONStorage(() => ({
    getItem: key => { try { return localStorage.getItem(key); } catch { return null; } },
    setItem: (key, value) => { try { localStorage.setItem(key, value); } catch { /* Exploration works even when storage is blocked. */ } },
    removeItem: key => { try { localStorage.removeItem(key); } catch { /* Optional persistence. */ } },
  })),
  partialize: s => ({ quality: s.quality, reducedMotion: s.reducedMotion, sound: s.sound, completed: s.completed, visited: s.visited }),
}));
