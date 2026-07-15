import { create } from 'zustand';
import { SESSION_KEYS } from '../data/config';

export type AppTheme = 'dark' | 'light' | 'cyberpunk' | 'midnight' | 'nord' | 'glass' | 'retro';
export type WallpaperType = 'nebula' | 'particles' | 'matrix' | 'grid';

export interface WindowInstance {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'achievement';
  category: 'system' | 'career' | 'portfolio' | 'gaming' | 'social' | 'funny';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

// ─── Visitor Achievement Definitions ────────────────────────────────────────
export interface VisitorAchievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  emoji: string;
}

export const VISITOR_ACHIEVEMENTS: VisitorAchievement[] = [
  { id: 'first_boot',        title: 'First Boot',         description: 'Entered the Portfolio OS.',                     xp: 50,  emoji: '🚀' },
  { id: 'explorer',          title: 'Deep Explorer',       description: 'Opened 5 different applications.',              xp: 100, emoji: '🧭' },
  { id: 'terminal_master',   title: 'Terminal Overlord',   description: 'Ran 10+ terminal commands.',                    xp: 150, emoji: '💻' },
  { id: 'hacker',            title: 'Hack the Planet',     description: 'Triggered Retro CRT theme.',                    xp: 100, emoji: '🕶️' },
  { id: 'social_butterfly',  title: 'Social Butterfly',    description: 'Copied contact details.',                       xp: 100, emoji: '📋' },
  { id: 'combat_veteran',    title: 'Bug Slayer',          description: 'Performed 3+ combat rounds in Gaming Profile.', xp: 150, emoji: '⚔️' },
  { id: 'coffee_lover',      title: 'Coffee Supporter',    description: 'Opened the Buy Me Coffee app.',                 xp: 100, emoji: '☕' },
  { id: 'tinder_swiper',     title: 'Perfect Match',       description: 'Swiped all hiring roles in Portfolio Swipe.',   xp: 150, emoji: '❤️' },
  { id: 'easter_egg',        title: 'AI Destroyer',        description: 'Triggered the AI self-destruction sequence.',   xp: 200, emoji: '💥' },
  { id: 'snake_champion',    title: 'Snake Champion',      description: 'Scored 50+ points on Snake.',                   xp: 150, emoji: '🐍' },
  { id: 'resume_viewer',     title: 'Resume Reader',       description: 'Opened and viewed Resume.pdf.',                 xp: 75,  emoji: '📄' },
  { id: 'project_browser',   title: 'Project Curious',     description: 'Browsed through Projects.exe.',                 xp: 75,  emoji: '📂' },
  { id: 'blog_reader',       title: 'Tech Reader',         description: 'Read a blog post.',                             xp: 75,  emoji: '📖' },
];

// ─── Helpers to read/write localStorage safely ──────────────────────────────
const safeGet = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeSet = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded or private mode */ }
};

// ─── Persisted defaults ─────────────────────────────────────────────────────
const persistedTheme      = safeGet<AppTheme>(SESSION_KEYS.theme, 'midnight');
const persistedWallpaper  = safeGet<WallpaperType>(SESSION_KEYS.wallpaper, 'nebula');
const persistedXP         = safeGet<number>(SESSION_KEYS.xp, 120);
const persistedAchieves   = safeGet<string[]>(SESSION_KEYS.achievements, ['first_boot']);
const persistedHasVisited = safeGet<boolean>(SESSION_KEYS.hasVisited, false);

// ─── Window defaults ─────────────────────────────────────────────────────────
const INITIAL_WINDOWS: WindowInstance[] = [
  { id: 'about',        title: 'About.exe',          isOpen: false, isMinimized: false, isMaximized: false, x: 80,  y: 60,  width: 720,  height: 520, zIndex: 1 },
  { id: 'projects',     title: 'Projects.exe',        isOpen: false, isMinimized: false, isMaximized: false, x: 120, y: 90,  width: 900,  height: 620, zIndex: 1 },
  { id: 'experience',   title: 'Experience.exe',      isOpen: false, isMinimized: false, isMaximized: false, x: 150, y: 120, width: 780,  height: 560, zIndex: 1 },
  { id: 'skills',       title: 'Skills.exe',          isOpen: false, isMinimized: false, isMaximized: false, x: 180, y: 70,  width: 820,  height: 580, zIndex: 1 },
  { id: 'resume',       title: 'Resume.pdf',          isOpen: false, isMinimized: false, isMaximized: false, x: 100, y: 50,  width: 820,  height: 620, zIndex: 1 },
  { id: 'terminal',     title: 'Terminal.exe',        isOpen: false, isMinimized: false, isMaximized: false, x: 220, y: 160, width: 720,  height: 470, zIndex: 1 },
  { id: 'ai',           title: 'AI Assistant',        isOpen: false, isMinimized: false, isMaximized: false, x: 500, y: 80,  width: 440,  height: 600, zIndex: 1 },
  { id: 'blog',         title: 'Blog Reader.exe',     isOpen: false, isMinimized: false, isMaximized: false, x: 140, y: 100, width: 840,  height: 600, zIndex: 1 },
  { id: 'achievements', title: 'Achievements.exe',    isOpen: false, isMinimized: false, isMaximized: false, x: 250, y: 130, width: 720,  height: 520, zIndex: 1 },
  { id: 'gaming',       title: 'Gaming Profile',      isOpen: false, isMinimized: false, isMaximized: false, x: 160, y: 80,  width: 700,  height: 560, zIndex: 1 },
  { id: 'contact',      title: 'Contact.exe',         isOpen: false, isMinimized: false, isMaximized: false, x: 280, y: 140, width: 680,  height: 540, zIndex: 1 },
  { id: 'settings',     title: 'Settings.exe',        isOpen: false, isMinimized: false, isMaximized: false, x: 300, y: 150, width: 620,  height: 480, zIndex: 1 },
  { id: 'snake',        title: 'Snake.exe',           isOpen: false, isMinimized: false, isMaximized: false, x: 340, y: 100, width: 540,  height: 580, zIndex: 1 },
  { id: 'swipe',        title: 'Portfolio Swipe',     isOpen: false, isMinimized: false, isMaximized: false, x: 200, y: 80,  width: 480,  height: 680, zIndex: 1 },
  { id: 'coffee',       title: 'Buy Me Coffee ☕',    isOpen: false, isMinimized: false, isMaximized: false, x: 360, y: 120, width: 480,  height: 540, zIndex: 1 },
];

// Restore persisted window sizes/positions
const persistedWindows = safeGet<Partial<WindowInstance>[]>(SESSION_KEYS.windows, []);
const mergedWindows: WindowInstance[] = INITIAL_WINDOWS.map((win) => {
  const saved = persistedWindows.find((w) => w.id === win.id);
  if (!saved) return win;
  return {
    ...win,
    // Restore position & size but never restore open/minimized state across sessions
    x: saved.x ?? win.x,
    y: saved.y ?? win.y,
    width: saved.width ?? win.width,
    height: saved.height ?? win.height,
  };
});

// ─── Store interface ─────────────────────────────────────────────────────────
interface OSState {
  // OS System States
  theme: AppTheme;
  wallpaper: WallpaperType;
  soundEnabled: boolean;
  volume: number;
  bootState: 'booting' | 'locked' | 'desktop';
  isShuttingDown: boolean;
  hasVisited: boolean;
  startMenuOpen: boolean;
  activeWindowId: string | null;
  windows: WindowInstance[];
  maxZIndex: number;

  // App-specific states
  notifications: ToastNotification[];
  chatMessages: ChatMessage[];
  xp: number;
  unlockedAchievements: string[];
  terminalHistory: string[];
  combatCount: number;

  // Actions
  setTheme: (theme: AppTheme) => void;
  setWallpaper: (wallpaper: WallpaperType) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setBootState: (state: 'booting' | 'locked' | 'desktop') => void;
  setStartMenuOpen: (open: boolean) => void;
  initiateShutdown: () => void;

  // Window Actions
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  closeAllWindows: () => void;
  persistWindowState: () => void;

  // Notification Actions
  addNotification: (title: string, message: string, type: ToastNotification['type'], category?: ToastNotification['category']) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // AI Chat Actions
  addChatMessage: (sender: 'user' | 'assistant', text: string) => void;
  clearChat: () => void;

  // Gamification Actions
  addXP: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  addTerminalCommand: (command: string) => void;
  incrementCombatCount: () => void;

  // Android OS / Tablet State
  viewMode: 'desktop' | 'mobile' | 'tablet';
  isSimulatingMobile: boolean;
  activeMobileApp: string | null;
  mobileRecents: string[];
  showMobileDrawer: boolean;
  showMobileSettings: boolean;
  mobileBrightness: number;

  // Android OS / Tablet Actions
  setViewMode: (mode: 'desktop' | 'mobile' | 'tablet') => void;
  setIsSimulatingMobile: (isSimulating: boolean) => void;
  openMobileApp: (id: string) => void;
  closeMobileApp: (id: string) => void;
  clearMobileRecents: () => void;
  setShowMobileDrawer: (open: boolean) => void;
  setShowMobileSettings: (open: boolean) => void;
  setMobileBrightness: (brightness: number) => void;

  // Layout Override
  layoutOverride: 'auto' | 'desktop' | 'tablet' | 'mobile';
  setLayoutOverride: (override: 'auto' | 'desktop' | 'tablet' | 'mobile') => void;
}

// Helper to normalize zIndices of open windows to prevent infinite drift
const normalizeZIndices = (windows: WindowInstance[], activeId: string): { windows: WindowInstance[]; maxZIndex: number } => {
  const openWindows = windows
    .filter((w) => w.isOpen && w.id !== activeId)
    .sort((a, b) => a.zIndex - b.zIndex);

  const normalized = windows.map((w) => {
    if (w.id === activeId) {
      return { ...w, isOpen: true, isMinimized: false, zIndex: 10 + openWindows.length };
    }
    const idx = openWindows.findIndex((o) => o.id === w.id);
    if (idx !== -1) {
      return { ...w, zIndex: 10 + idx };
    }
    return w;
  });

  return {
    windows: normalized,
    maxZIndex: 10 + openWindows.length,
  };
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const useOSStore = create<OSState>((set, get) => ({
  // OS System States
  theme: persistedTheme,
  wallpaper: persistedWallpaper,
  soundEnabled: false,
  volume: 0.5,
  bootState: 'booting',
  isShuttingDown: false,
  hasVisited: persistedHasVisited,
  startMenuOpen: false,
  activeWindowId: null,
  windows: mergedWindows,
  maxZIndex: 10,

  // Mobile / Tablet States
  viewMode: 'desktop',
  isSimulatingMobile: false,
  activeMobileApp: null,
  mobileRecents: [],
  showMobileDrawer: false,
  showMobileSettings: false,
  mobileBrightness: 1.0,
  layoutOverride: 'auto',

  // App Lists
  notifications: [],
  chatMessages: [
    { id: '1', sender: 'assistant', text: "Hello! I am Harshit's AI Assistant. Ask me anything about him, or ask me to open any application (e.g., 'Open projects', 'Show resume')." }
  ],
  xp: persistedXP,
  unlockedAchievements: persistedAchieves,
  terminalHistory: [],
  combatCount: 0,

  // ─── General Setters ────────────────────────────────────────────────────
  setTheme: (theme) => {
    safeSet(SESSION_KEYS.theme, theme);
    set({ theme });
  },
  setWallpaper: (wallpaper) => {
    safeSet(SESSION_KEYS.wallpaper, wallpaper);
    set({ wallpaper });
  },
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVolume: (volume) => set({ volume }),
  setBootState: (bootState) => {
    if (bootState === 'desktop') {
      // Mark visited for session persistence welcome-back
      safeSet(SESSION_KEYS.hasVisited, true);
      set({ bootState, hasVisited: true });
    } else {
      set({ bootState });
    }
  },
  setStartMenuOpen: (startMenuOpen) => set({ startMenuOpen }),

  initiateShutdown: () => {
    // Persist everything before shutdown
    const state = get();
    safeSet(SESSION_KEYS.xp, state.xp);
    safeSet(SESSION_KEYS.achievements, state.unlockedAchievements);
    get().persistWindowState();
    set({ isShuttingDown: true });
  },

  openWindow: (id) => {
    const { windows } = get();
    const { windows: normalizedWindows, maxZIndex: nextMax } = normalizeZIndices(windows, id);
    set({
      startMenuOpen: false,
      activeWindowId: id,
      maxZIndex: nextMax,
      windows: normalizedWindows,
    });
    // Dispatch contextual notification
    const labels: Record<string, [string, string, ToastNotification['category']]> = {
      resume:   ['📄 Resume Viewed', 'Visitor opened Resume.pdf', 'career'],
      projects: ['📂 Projects Opened', 'Browsing through project files...', 'portfolio'],
      blog:     ['📖 Blog Reader Active', 'Reading tech articles...', 'portfolio'],
      contact:  ['💌 Contact Opened', 'Potential connection incoming!', 'career'],
      coffee:   ['☕ Coffee Time!', 'Opening the coffee shop...', 'funny'],
      swipe:    ['❤️ Hiring Swipe Launched', 'Time to find the perfect match!', 'career'],
      snake:    ['🐍 Snake Activated', 'Retro gaming mode on.', 'gaming'],
    };
    if (labels[id]) {
      const [title, message, category] = labels[id];
      setTimeout(() => get().addNotification(title, message, 'info', category), 800);
    }
    // Check explorer achievement
    const openedCount = windows.filter((w) => w.isOpen && w.id !== id).length + 1;
    if (openedCount >= 5) get().unlockAchievement('explorer');
    // Resume achievement
    if (id === 'resume') get().unlockAchievement('resume_viewer');
    if (id === 'projects') get().unlockAchievement('project_browser');
    if (id === 'blog') get().unlockAchievement('blog_reader');
    if (id === 'coffee') get().unlockAchievement('coffee_lover');
  },

  closeWindow: (id) => {
    const { windows } = get();
    const newWindows = windows.map((win) =>
      win.id === id ? { ...win, isOpen: false, isMinimized: false, isMaximized: false } : win
    );
    const openAndNotMinimized = newWindows
      .filter((w) => w.isOpen && !w.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex);
    const nextFocusId = openAndNotMinimized.length > 0 ? openAndNotMinimized[0].id : null;
    
    if (nextFocusId) {
      const { windows: normalizedWindows, maxZIndex: nextMax } = normalizeZIndices(newWindows, nextFocusId);
      set({ windows: normalizedWindows, activeWindowId: nextFocusId, maxZIndex: nextMax });
    } else {
      set({ windows: newWindows, activeWindowId: null });
    }
  },

  minimizeWindow: (id) => {
    const { windows } = get();
    const newWindows = windows.map((win) =>
      win.id === id ? { ...win, isMinimized: true } : win
    );
    const openAndNotMinimized = newWindows
      .filter((w) => w.isOpen && !w.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex);
    const nextFocusId = openAndNotMinimized.length > 0 ? openAndNotMinimized[0].id : null;
    
    if (nextFocusId) {
      const { windows: normalizedWindows, maxZIndex: nextMax } = normalizeZIndices(newWindows, nextFocusId);
      set({ windows: normalizedWindows, activeWindowId: nextFocusId, maxZIndex: nextMax });
    } else {
      set({ windows: newWindows, activeWindowId: null });
    }
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, isMaximized: true, isMinimized: false } : win
      ),
    }));
    get().focusWindow(id);
  },

  restoreWindow: (id) => {
    // Restore preserves last custom width/height (already stored in the window instance)
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, isMaximized: false, isMinimized: false } : win
      ),
    }));
    get().focusWindow(id);
  },

  focusWindow: (id) => {
    const { windows, activeWindowId } = get();
    if (activeWindowId === id) return;
    const { windows: normalizedWindows, maxZIndex: nextMax } = normalizeZIndices(windows, id);
    set({
      activeWindowId: id,
      maxZIndex: nextMax,
      windows: normalizedWindows,
    });
  },

  updateWindowPosition: (id, x, y) => {
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, x, y } : win
      ),
    }));
  },

  updateWindowSize: (id, width, height) => {
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, width, height } : win
      ),
    }));
  },

  closeAllWindows: () => {
    set((state) => ({
      activeWindowId: null,
      windows: state.windows.map((win) => ({ ...win, isOpen: false, isMinimized: false, isMaximized: false })),
    }));
  },

  persistWindowState: () => {
    const { windows } = get();
    const toSave = windows.map(({ id, x, y, width, height }) => ({ id, x, y, width, height }));
    safeSet(SESSION_KEYS.windows, toSave);
  },

  // ─── Toast System ───────────────────────────────────────────────────────
  addNotification: (title, message, type, category = 'system') => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNotif: ToastNotification = { id, title, message, type, category, timestamp };
    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 25),
    }));
    if (type === 'achievement') {
      get().addXP(50);
    }
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),

  // ─── AI Chat Messages ───────────────────────────────────────────────────
  addChatMessage: (sender, text) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      chatMessages: [...state.chatMessages, { id, sender, text }],
    }));
  },

  clearChat: () => set({ chatMessages: [] }),

  // ─── RPG Progression ────────────────────────────────────────────────────
  addXP: (amount) => {
    set((state) => {
      const newXp = state.xp + amount;
      safeSet(SESSION_KEYS.xp, newXp);
      return { xp: newXp };
    });
  },

  unlockAchievement: (id) => {
    const { unlockedAchievements } = get();
    if (unlockedAchievements.includes(id)) return;
    const def = VISITOR_ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return;

    const newAchievements = [...unlockedAchievements, id];
    safeSet(SESSION_KEYS.achievements, newAchievements);
    set({ unlockedAchievements: newAchievements });

    get().addNotification(
      `${def.emoji} ${def.title}`,
      def.description,
      'achievement',
      'gaming'
    );
    get().addXP(def.xp);
  },

  addTerminalCommand: (command) => {
    set((state) => ({ terminalHistory: [...state.terminalHistory, command] }));
    const count = get().terminalHistory.length;
    if (count >= 10) get().unlockAchievement('terminal_master');
  },

  incrementCombatCount: () => {
    const newCount = get().combatCount + 1;
    set({ combatCount: newCount });
    if (newCount >= 3) get().unlockAchievement('combat_veteran');
  },

  // ─── Android OS Actions ─────────────────────────────────────────────────
  setViewMode: (viewMode) => set({ viewMode }),
  setIsSimulatingMobile: (isSimulatingMobile) => set({ isSimulatingMobile }),

  openMobileApp: (appId) => {
    const { mobileRecents } = get();
    const filtered = mobileRecents.filter((id) => id !== appId);
    set({
      activeMobileApp: appId,
      mobileRecents: [appId, ...filtered],
      showMobileDrawer: false,
    });
    // Trigger same notifications/achievements as desktop
    if (appId === 'resume') get().unlockAchievement('resume_viewer');
    if (appId === 'projects') get().unlockAchievement('project_browser');
    if (appId === 'blog') get().unlockAchievement('blog_reader');
    if (appId === 'coffee') get().unlockAchievement('coffee_lover');
  },

  closeMobileApp: (appId) => {
    const { mobileRecents, activeMobileApp } = get();
    const newRecents = mobileRecents.filter((id) => id !== appId);
    const nextActive = activeMobileApp === appId
      ? (newRecents.length > 0 ? newRecents[0] : null)
      : activeMobileApp;
    set({ mobileRecents: newRecents, activeMobileApp: nextActive });
  },

  clearMobileRecents: () => set({ mobileRecents: [], activeMobileApp: null }),
  setShowMobileDrawer: (showMobileDrawer) => set({ showMobileDrawer }),
  setShowMobileSettings: (showMobileSettings) => set({ showMobileSettings }),
  setMobileBrightness: (mobileBrightness) => set({ mobileBrightness }),
  setLayoutOverride: (layoutOverride) => set({ layoutOverride }),
}));
