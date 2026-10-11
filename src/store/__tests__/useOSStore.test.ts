import { describe, it, expect, beforeEach } from 'vitest';
import { useOSStore } from '../useOSStore';

describe('useOSStore Zustand Store Tests', () => {
  beforeEach(() => {
    // Reset store state to initial values before each test
    const store = useOSStore.getState();
    store.closeAllWindows();
    store.setTheme('midnight');
    store.setWallpaper('nebula');
    store.setBootState('booting');
    store.setSoundEnabled(false);
    store.setVolume(0.5);
    store.clearNotifications();
    store.clearChat();
    store.clearMobileRecents();
    store.setViewMode('desktop');
    store.setIsSimulatingMobile(false);
    store.setLayoutOverride('auto');
  });

  describe('Theme and Wallpaper settings', () => {
    it('should set and switch themes correctly', () => {
      expect(useOSStore.getState().theme).toBe('midnight');
      
      useOSStore.getState().setTheme('cyberpunk');
      expect(useOSStore.getState().theme).toBe('cyberpunk');

      useOSStore.getState().setTheme('retro');
      expect(useOSStore.getState().theme).toBe('retro');
    });

    it('should set and change wallpapers correctly', () => {
      expect(useOSStore.getState().wallpaper).toBe('nebula');

      useOSStore.getState().setWallpaper('matrix');
      expect(useOSStore.getState().wallpaper).toBe('matrix');
    });
  });

  describe('Boot and System State', () => {
    it('should set bootState and update hasVisited on desktop boot', () => {
      expect(useOSStore.getState().bootState).toBe('booting');

      useOSStore.getState().setBootState('desktop');
      expect(useOSStore.getState().bootState).toBe('desktop');
      expect(useOSStore.getState().hasVisited).toBe(true);
    });

    it('should open start menu', () => {
      expect(useOSStore.getState().startMenuOpen).toBe(false);

      useOSStore.getState().setStartMenuOpen(true);
      expect(useOSStore.getState().startMenuOpen).toBe(true);
    });
  });

  describe('Window Manager Actions', () => {
    it('should open and focus a window correctly', () => {
      const initialWindow = useOSStore.getState().windows.find(w => w.id === 'about');
      expect(initialWindow?.isOpen).toBe(false);

      useOSStore.getState().openWindow('about');
      
      const openedWindow = useOSStore.getState().windows.find(w => w.id === 'about');
      expect(openedWindow?.isOpen).toBe(true);
      expect(openedWindow?.isMinimized).toBe(false);
      expect(useOSStore.getState().activeWindowId).toBe('about');
    });

    it('should minimize and restore windows', () => {
      useOSStore.getState().openWindow('about');
      useOSStore.getState().minimizeWindow('about');

      let win = useOSStore.getState().windows.find(w => w.id === 'about');
      expect(win?.isMinimized).toBe(true);
      expect(useOSStore.getState().activeWindowId).toBe(null);

      useOSStore.getState().restoreWindow('about');
      win = useOSStore.getState().windows.find(w => w.id === 'about');
      expect(win?.isMinimized).toBe(false);
      expect(useOSStore.getState().activeWindowId).toBe('about');
    });

    it('should maximize and restore sizing', () => {
      useOSStore.getState().openWindow('about');
      useOSStore.getState().maximizeWindow('about');

      let win = useOSStore.getState().windows.find(w => w.id === 'about');
      expect(win?.isMaximized).toBe(true);

      useOSStore.getState().restoreWindow('about');
      win = useOSStore.getState().windows.find(w => w.id === 'about');
      expect(win?.isMaximized).toBe(false);
    });

    it('should close windows and correctly transfer focus', () => {
      useOSStore.getState().openWindow('about');
      useOSStore.getState().openWindow('terminal');
      
      expect(useOSStore.getState().activeWindowId).toBe('terminal');

      useOSStore.getState().closeWindow('terminal');
      expect(useOSStore.getState().activeWindowId).toBe('about');

      useOSStore.getState().closeWindow('about');
      expect(useOSStore.getState().activeWindowId).toBe(null);
    });

    it('should update window position and size and clamp y position to top menu bar boundary', () => {
      useOSStore.getState().openWindow('about');
      useOSStore.getState().updateWindowPosition('about', 150, 200);
      useOSStore.getState().updateWindowSize('about', 600, 400);

      let win = useOSStore.getState().windows.find(w => w.id === 'about');
      expect(win?.x).toBe(150);
      expect(win?.y).toBe(200);
      expect(win?.width).toBe(600);
      expect(win?.height).toBe(400);

      // Verify y position is clamped to at least 48px if dragged above top menu bar
      useOSStore.getState().updateWindowPosition('about', 150, 10);
      win = useOSStore.getState().windows.find(w => w.id === 'about');
      expect(win?.y).toBe(48);
    });

    it('should recover any invalid window position on focus and restore', () => {
      useOSStore.getState().openWindow('arcade');
      // Simulate an invalid position bypassing direct setters
      useOSStore.setState((state) => ({
        windows: state.windows.map((w) => (w.id === 'arcade' ? { ...w, y: 5 } : w)),
      }));
      
      let win = useOSStore.getState().windows.find((w) => w.id === 'arcade');
      expect(win?.y).toBe(5);

      // Calling focusWindow should recover the position back to >= 48px
      useOSStore.getState().focusWindow('arcade');
      win = useOSStore.getState().windows.find((w) => w.id === 'arcade');
      expect(win?.y).toBe(48);
    });
  });

  describe('Toast Notifications', () => {
    it('should add, clear, and dismiss notifications', () => {
      expect(useOSStore.getState().notifications.length).toBe(0);

      useOSStore.getState().addNotification('Test Warning', 'This is a warning', 'warning', 'system');
      expect(useOSStore.getState().notifications.length).toBe(1);
      
      const notifId = useOSStore.getState().notifications[0].id;
      expect(useOSStore.getState().notifications[0].title).toBe('Test Warning');
      expect(useOSStore.getState().notifications[0].type).toBe('warning');

      useOSStore.getState().dismissNotification(notifId);
      expect(useOSStore.getState().notifications.length).toBe(0);

      // Multi add
      useOSStore.getState().addNotification('Title 1', 'Message 1', 'info', 'career');
      useOSStore.getState().addNotification('Title 2', 'Message 2', 'success', 'portfolio');
      useOSStore.getState().addNotification('Payment Error', 'Failed payment', 'error', 'system');
      expect(useOSStore.getState().notifications.length).toBe(3);
      expect(useOSStore.getState().notifications[0].type).toBe('error');

      useOSStore.getState().clearNotifications();
      expect(useOSStore.getState().notifications.length).toBe(0);
    });

    it('should suppress app opening notification when suppressNotification is true or window is already open', async () => {
      useOSStore.getState().clearNotifications();
      useOSStore.getState().openWindow('settings', true);
      // Wait for any async timeout
      await new Promise((r) => setTimeout(r, 900));
      expect(useOSStore.getState().notifications.some((n) => n.title.includes('Settings'))).toBe(false);
    });
  });

  describe('Gamification Progression', () => {
    it('should increase XP correctly', () => {
      const initialXP = useOSStore.getState().xp;

      useOSStore.getState().addXP(40);
      expect(useOSStore.getState().xp).toBe(initialXP + 40);
    });

    it('should unlock achievements and trigger reward notifications', () => {
      // Ensure we start with no achievements unlocked
      useOSStore.setState({ unlockedAchievements: [] });
      
      useOSStore.getState().unlockAchievement('terminal_master');
      expect(useOSStore.getState().unlockedAchievements).toContain('terminal_master');
      
      // Checking notification added
      const notifs = useOSStore.getState().notifications;
      expect(notifs.some(n => n.title.includes('Terminal Overlord'))).toBe(true);
    });
  });

  describe('Android OS Layout and Recents', () => {
    it('should toggle view modes and simulator simulation state', () => {
      useOSStore.getState().setViewMode('mobile');
      expect(useOSStore.getState().viewMode).toBe('mobile');

      useOSStore.getState().setIsSimulatingMobile(true);
      expect(useOSStore.getState().isSimulatingMobile).toBe(true);
    });

    it('should handle mobile app launch history and recents panel list', () => {
      useOSStore.getState().openMobileApp('about');
      expect(useOSStore.getState().activeMobileApp).toBe('about');
      expect(useOSStore.getState().mobileRecents).toContain('about');

      useOSStore.getState().openMobileApp('skills');
      expect(useOSStore.getState().activeMobileApp).toBe('skills');
      expect(useOSStore.getState().mobileRecents[0]).toBe('skills'); // most recent
      expect(useOSStore.getState().mobileRecents[1]).toBe('about');

      useOSStore.getState().closeMobileApp('skills');
      expect(useOSStore.getState().activeMobileApp).toBe('about');
    });
  });
});
