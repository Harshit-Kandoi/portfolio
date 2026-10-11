import { describe, it, expect, beforeEach } from 'vitest';
import { useOSStore } from '../useOSStore';

describe('store audit fixes', () => {
  beforeEach(() => {
    const store = useOSStore.getState();
    store.closeAllWindows();
    store.clearMobileRecents();
    store.clearNotifications();
    store.setViewMode('desktop');
    store.setIsSimulatingMobile(false);
    useOSStore.setState({ unlockedAchievements: [], sessionOpenedApps: [] });
  });

  it('achievement-type notifications do not grant XP on their own', () => {
    const before = useOSStore.getState().xp;
    useOSStore.getState().addNotification('Some trophy', 'msg', 'achievement', 'gaming');
    expect(useOSStore.getState().xp).toBe(before);
  });

  it('unlocking an achievement grants exactly its XP once', () => {
    const before = useOSStore.getState().xp;
    useOSStore.getState().unlockAchievement('terminal_master'); // 150 XP
    useOSStore.getState().unlockAchievement('terminal_master');
    expect(useOSStore.getState().xp).toBe(before + 150);
  });

  it('Explorer unlocks after 5 distinct apps, even if windows are closed in between', () => {
    const store = useOSStore.getState();
    ['about', 'projects', 'skills', 'about'].forEach((id) => {
      store.openWindow(id, true);
      store.closeWindow(id);
    });
    expect(useOSStore.getState().unlockedAchievements).not.toContain('explorer');
    store.openWindow('contact', true);
    expect(useOSStore.getState().unlockedAchievements).not.toContain('explorer');
    store.openWindow('resume', true);
    expect(useOSStore.getState().unlockedAchievements).toContain('explorer');
  });

  it('Explorer counts mobile app opens and legacy aliases map to the parent app', () => {
    const store = useOSStore.getState();
    store.setViewMode('mobile');
    ['about', 'snake', 'gaming', 'projects', 'skills'].forEach((id) => store.openMobileApp(id));
    // snake + gaming both map to arcade → only 4 distinct apps so far
    expect(useOSStore.getState().sessionOpenedApps).toEqual(['about', 'arcade', 'projects', 'skills']);
    expect(useOSStore.getState().unlockedAchievements).not.toContain('explorer');
    store.openMobileApp('writing');
    expect(useOSStore.getState().unlockedAchievements).toContain('explorer');
  });

  it('clampWindowsToViewport pulls windows back into a smaller viewport', () => {
    const store = useOSStore.getState();
    store.openWindow('projects', true);
    store.updateWindowPosition('projects', 1500, 900);
    store.updateWindowSize('projects', 1200, 900);
    store.clampWindowsToViewport(800, 600);
    const win = useOSStore.getState().windows.find((w) => w.id === 'projects')!;
    expect(win.width).toBeLessThanOrEqual(760);
    expect(win.height).toBeLessThanOrEqual(504);
    expect(win.x).toBeLessThanOrEqual(700);
    expect(win.y).toBeGreaterThanOrEqual(48);
    expect(win.y).toBeLessThanOrEqual(520);
  });

  it('clampWindowsToViewport is a no-op when everything already fits', () => {
    const before = useOSStore.getState().windows;
    useOSStore.getState().clampWindowsToViewport(5000, 5000);
    expect(useOSStore.getState().windows).toBe(before);
  });
});
