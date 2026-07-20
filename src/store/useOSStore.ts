import { create } from 'zustand';
import { SESSION_KEYS } from '../data/config';
import { trackEvent, trackPageView } from '../utils/analytics';

let lastFocusAppId: string | null = null;
let lastFocusAppStartTime: number | null = null;

const trackAppDuration = () => {
  if (lastFocusAppId && lastFocusAppStartTime) {
    const duration = (Date.now() - lastFocusAppStartTime) / 1000;
    if (duration > 0.5) {
      trackEvent('app_duration', {
        app_id: lastFocusAppId,
        duration: Math.round(duration * 100) / 100,
      });
    }
  }
};

const recordFocusStart = (id: string | null) => {
  if (id === lastFocusAppId) return;
  trackAppDuration();
  lastFocusAppId = id;
  lastFocusAppStartTime = id ? Date.now() : null;
  if (id) {
    trackPageView(`App: ${id}`, `/apps/${id}`);
  } else {
    trackPageView('Desktop', '/');
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    trackAppDuration();
  });
  window.addEventListener('pagehide', () => {
    trackAppDuration();
  });
}


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
  action?: 'resume' | 'projects' | 'blog' | 'contact' | 'coffee' | 'swipe' | 'snake' | 'github' | 'linkedin';
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
  { id: 'blog',         title: 'Blog.exe',            isOpen: false, isMinimized: false, isMaximized: false, x: 140, y: 100, width: 840,  height: 600, zIndex: 1 },
  { id: 'achievements', title: 'Awards.exe',          isOpen: false, isMinimized: false, isMaximized: false, x: 250, y: 130, width: 720,  height: 520, zIndex: 1 },
  { id: 'gaming',       title: 'Gaming.exe',          isOpen: false, isMinimized: false, isMaximized: false, x: 160, y: 80,  width: 700,  height: 560, zIndex: 1 },
  { id: 'contact',      title: 'Contact.exe',         isOpen: false, isMinimized: false, isMaximized: false, x: 280, y: 140, width: 680,  height: 540, zIndex: 1 },
  { id: 'settings',     title: 'Settings.exe',        isOpen: false, isMinimized: false, isMaximized: false, x: 300, y: 150, width: 620,  height: 480, zIndex: 1 },
  { id: 'snake',        title: 'Snake.exe',           isOpen: false, isMinimized: false, isMaximized: false, x: 340, y: 100, width: 540,  height: 580, zIndex: 1 },
  { id: 'swipe',        title: 'Swipe.exe',           isOpen: false, isMinimized: false, isMaximized: false, x: 200, y: 80,  width: 480,  height: 680, zIndex: 1 },
  { id: 'coffee',       title: 'Coffee.exe',          isOpen: false, isMinimized: false, isMaximized: false, x: 360, y: 120, width: 480,  height: 540, zIndex: 1 },
  // Phase 3 new apps
  { id: 'library',      title: 'Library.exe',         isOpen: false, isMinimized: false, isMaximized: false, x: 130, y: 80,  width: 860,  height: 600, zIndex: 1 },
  { id: 'notes',        title: 'Notes.exe',           isOpen: false, isMinimized: false, isMaximized: false, x: 160, y: 90,  width: 900,  height: 620, zIndex: 1 },
  { id: 'gallery',      title: 'Gallery.exe',         isOpen: false, isMinimized: false, isMaximized: false, x: 140, y: 70,  width: 860,  height: 600, zIndex: 1 },
  { id: 'products',     title: 'Products.exe',        isOpen: false, isMinimized: false, isMaximized: false, x: 170, y: 100, width: 820,  height: 580, zIndex: 1 },
  { id: 'publications', title: 'Papers.exe',          isOpen: false, isMinimized: false, isMaximized: false, x: 150, y: 85,  width: 780,  height: 580, zIndex: 1 },
  { id: 'marketplace',  title: 'Store.exe',           isOpen: false, isMinimized: false, isMaximized: false, x: 190, y: 110, width: 800,  height: 580, zIndex: 1 },
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
    y: Math.max(48, saved.y ?? win.y),
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
  bootState: 'booting' | 'locked' | 'desktop' | 'powered_off';
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
  setBootState: (state: 'booting' | 'locked' | 'desktop' | 'powered_off') => void;
  setStartMenuOpen: (open: boolean) => void;
  initiateShutdown: () => void;
  resetShutdown: () => void;

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
  addNotification: (title: string, message: string, type: ToastNotification['type'], category?: ToastNotification['category'], action?: ToastNotification['action']) => void;
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
  physicalDeviceType: 'desktop' | 'tablet' | 'mobile';
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
    const clampedY = Math.max(48, w.y);
    if (w.id === activeId) {
      return { ...w, y: clampedY, isOpen: true, isMinimized: false, zIndex: 10 + openWindows.length };
    }
    const idx = openWindows.findIndex((o) => o.id === w.id);
    if (idx !== -1) {
      return { ...w, y: clampedY, zIndex: 10 + idx };
    }
    return { ...w, y: clampedY };
  });

  return {
    windows: normalized,
    maxZIndex: 10 + openWindows.length,
  };
};

const getInitialPhysicalDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTabletUA = /iPad|PlayBook|Silk/i.test(userAgent) || (isMobileUA && /tablet/i.test(userAgent));
  
  if (isTabletUA) return 'tablet';
  if (isMobileUA) return 'mobile';
  
  if (typeof window.screen !== 'undefined') {
    const w = window.screen.width;
    const h = window.screen.height;
    const maxDim = Math.max(w, h);
    if (maxDim < 1024) {
      return 'mobile';
    } else if (maxDim < 1366) {
      return 'tablet';
    }
  }
  
  return 'desktop';
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
  physicalDeviceType: getInitialPhysicalDeviceType(),
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

  resetShutdown: () => {
    set({ isShuttingDown: false });
  },

  openWindow: (id) => {
    const { windows } = get();
    const { windows: normalizedWindows, maxZIndex: nextMax } = normalizeZIndices(windows, id);
    const prevWin = windows.find((w) => w.id === id);
    if (prevWin && !prevWin.isOpen) {
      trackEvent('app_open', { app_id: id });
    }
    set({
      startMenuOpen: false,
      activeWindowId: id,
      maxZIndex: nextMax,
      windows: normalizedWindows,
    });
    recordFocusStart(id);
    // Dispatch contextual notification
    const labels: Record<string, [string, string, ToastNotification['category'], ToastNotification['action']]> = {
      resume:   ['📄 Resume Viewed', 'Visitor opened Resume.pdf', 'career', 'resume'],
      projects: ['📂 Projects Opened', 'Browsing through project files...', 'portfolio', 'projects'],
      blog:     ['📖 Blog Reader Active', 'Reading tech articles...', 'portfolio', 'blog'],
      contact:  ['💌 Contact Opened', 'Potential connection incoming!', 'career', 'contact'],
      coffee:   ['☕ Coffee Time!', 'Opening the coffee shop...', 'funny', 'coffee'],
      swipe:    ['❤️ Hiring Swipe Launched', 'Time to find the perfect match!', 'career', 'swipe'],
      snake:    ['🐍 Snake Activated', 'Retro gaming mode on.', 'gaming', 'snake'],
    };
    if (labels[id]) {
      const [title, message, category, action] = labels[id];
      setTimeout(() => get().addNotification(title, message, 'info', category, action), 800);
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
    trackEvent('app_close', { app_id: id });
    const newWindows = windows.map((win) =>
      win.id === id ? { ...win, isOpen: false, isMinimized: false, isMaximized: false, y: Math.max(48, win.y) } : { ...win, y: Math.max(48, win.y) }
    );
    const openAndNotMinimized = newWindows
      .filter((w) => w.isOpen && !w.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex);
    const nextFocusId = openAndNotMinimized.length > 0 ? openAndNotMinimized[0].id : null;
    
    if (nextFocusId) {
      const { windows: normalizedWindows, maxZIndex: nextMax } = normalizeZIndices(newWindows, nextFocusId);
      set({ windows: normalizedWindows, activeWindowId: nextFocusId, maxZIndex: nextMax });
      recordFocusStart(nextFocusId);
    } else {
      set({ windows: newWindows, activeWindowId: null });
      recordFocusStart(null);
    }
  },

  minimizeWindow: (id) => {
    trackEvent('app_minimize', { app_id: id });
    const { windows } = get();
    const newWindows = windows.map((win) =>
      win.id === id ? { ...win, isMinimized: true, y: Math.max(48, win.y) } : { ...win, y: Math.max(48, win.y) }
    );
    const openAndNotMinimized = newWindows
      .filter((w) => w.isOpen && !w.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex);
    const nextFocusId = openAndNotMinimized.length > 0 ? openAndNotMinimized[0].id : null;
    
    if (nextFocusId) {
      const { windows: normalizedWindows, maxZIndex: nextMax } = normalizeZIndices(newWindows, nextFocusId);
      set({ windows: normalizedWindows, activeWindowId: nextFocusId, maxZIndex: nextMax });
      recordFocusStart(nextFocusId);
    } else {
      set({ windows: newWindows, activeWindowId: null });
      recordFocusStart(null);
    }
  },

  maximizeWindow: (id) => {
    trackEvent('app_maximize', { app_id: id });
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, isMaximized: true, isMinimized: false, y: Math.max(48, win.y) } : { ...win, y: Math.max(48, win.y) }
      ),
    }));
    get().focusWindow(id);
  },

  restoreWindow: (id) => {
    trackEvent('app_restore', { app_id: id });
    // Restore preserves last custom width/height and clamps y to top menu bar height
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, isMaximized: false, isMinimized: false, y: Math.max(48, win.y) } : { ...win, y: Math.max(48, win.y) }
      ),
    }));
    get().focusWindow(id);
  },

  focusWindow: (id) => {
    const { windows, activeWindowId } = get();
    const { windows: normalizedWindows, maxZIndex: nextMax } = normalizeZIndices(windows, id);
    if (activeWindowId === id) {
      set({ windows: normalizedWindows });
      return;
    }
    set({
      activeWindowId: id,
      maxZIndex: nextMax,
      windows: normalizedWindows,
    });
    recordFocusStart(id);
  },


  updateWindowPosition: (id, x, y) => {
    const clampedY = Math.max(48, y);
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, x, y: clampedY } : { ...win, y: Math.max(48, win.y) }
      ),
    }));
  },

  updateWindowSize: (id, width, height) => {
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, width, height, y: Math.max(48, win.y) } : { ...win, y: Math.max(48, win.y) }
      ),
    }));
  },

  closeAllWindows: () => {
    trackEvent('app_close', { app_id: 'all' });
    set((state) => ({
      activeWindowId: null,
      windows: state.windows.map((win) => ({ ...win, isOpen: false, isMinimized: false, isMaximized: false })),
    }));
    recordFocusStart(null);
  },

  persistWindowState: () => {
    const { windows } = get();
    const toSave = windows.map(({ id, x, y, width, height }) => ({ id, x, y, width, height }));
    safeSet(SESSION_KEYS.windows, toSave);
  },

  // ─── Toast System ───────────────────────────────────────────────────────
  addNotification: (title, message, type, category = 'system', action) => {
    // Prevent duplicate same notification (same title and message)
    const currentNotifications = get().notifications;
    if (currentNotifications.length > 0) {
      const lastNotif = currentNotifications[0];
      if (lastNotif.title === title && lastNotif.message === message) {
        return; // Skip duplicate
      }
    }
    
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNotif: ToastNotification = { id, title, message, type, category, timestamp, action };
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

    trackEvent('achievement_unlock', { achievement_id: id, achievement_title: def.title });

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
  setViewMode: (viewMode) => {
    set({ viewMode });
    const activeId = viewMode === 'mobile' ? get().activeMobileApp : get().activeWindowId;
    recordFocusStart(activeId);
  },
  setIsSimulatingMobile: (isSimulatingMobile) => set({ isSimulatingMobile }),

  openMobileApp: (appId) => {
    const { mobileRecents, activeMobileApp } = get();
    if (activeMobileApp !== appId) {
      trackEvent('app_open', { app_id: appId });
    }
    const filtered = mobileRecents.filter((id) => id !== appId);
    set({
      activeMobileApp: appId,
      mobileRecents: [appId, ...filtered],
      showMobileDrawer: false,
    });
    recordFocusStart(appId);
    // Trigger same notifications/achievements as desktop
    if (appId === 'resume') get().unlockAchievement('resume_viewer');
    if (appId === 'projects') get().unlockAchievement('project_browser');
    if (appId === 'blog') get().unlockAchievement('blog_reader');
    if (appId === 'coffee') get().unlockAchievement('coffee_lover');
  },

  closeMobileApp: (appId) => {
    trackEvent('app_close', { app_id: appId });
    const { mobileRecents, activeMobileApp } = get();
    const newRecents = mobileRecents.filter((id) => id !== appId);
    const nextActive = activeMobileApp === appId
      ? (newRecents.length > 0 ? newRecents[0] : null)
      : activeMobileApp;
    set({ mobileRecents: newRecents, activeMobileApp: nextActive });
    recordFocusStart(nextActive);
  },

  clearMobileRecents: () => {
    set({ mobileRecents: [], activeMobileApp: null });
    recordFocusStart(null);
  },
  setShowMobileDrawer: (showMobileDrawer) => set({ showMobileDrawer }),
  setShowMobileSettings: (showMobileSettings) => set({ showMobileSettings }),
  setMobileBrightness: (mobileBrightness) => set({ mobileBrightness }),
  setLayoutOverride: (layoutOverride) => set({ layoutOverride }),
}));
