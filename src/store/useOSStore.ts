import { create } from 'zustand';

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
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

interface OSState {
  // OS System States
  theme: AppTheme;
  wallpaper: WallpaperType;
  soundEnabled: boolean;
  volume: number;
  bootState: 'booting' | 'locked' | 'desktop';
  startMenuOpen: boolean;
  activeWindowId: string | null;
  windows: WindowInstance[];
  maxZIndex: number;
  
  // App-specific stats / lists
  notifications: ToastNotification[];
  chatMessages: ChatMessage[];
  xp: number;
  unlockedAchievements: string[];
  terminalHistory: string[];

  // Actions
  setTheme: (theme: AppTheme) => void;
  setWallpaper: (wallpaper: WallpaperType) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setBootState: (state: 'booting' | 'locked' | 'desktop') => void;
  setStartMenuOpen: (open: boolean) => void;
  
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

  // Notification Actions
  addNotification: (title: string, message: string, type: ToastNotification['type']) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // AI Chat Actions
  addChatMessage: (sender: 'user' | 'assistant', text: string) => void;
  clearChat: () => void;

  // Gamification Actions
  addXP: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  addTerminalCommand: (command: string) => void;

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

const INITIAL_WINDOWS: WindowInstance[] = [
  { id: 'about', title: 'About.exe', isOpen: false, isMinimized: false, isMaximized: false, x: 80, y: 60, width: 700, height: 500, zIndex: 1 },
  { id: 'projects', title: 'Projects.exe', isOpen: false, isMinimized: false, isMaximized: false, x: 120, y: 90, width: 850, height: 600, zIndex: 1 },
  { id: 'experience', title: 'Experience.exe', isOpen: false, isMinimized: false, isMaximized: false, x: 150, y: 120, width: 750, height: 550, zIndex: 1 },
  { id: 'skills', title: 'Skills.exe', isOpen: false, isMinimized: false, isMaximized: false, x: 180, y: 70, width: 780, height: 550, zIndex: 1 },
  { id: 'resume', title: 'Resume.pdf', isOpen: false, isMinimized: false, isMaximized: false, x: 100, y: 50, width: 800, height: 600, zIndex: 1 },
  { id: 'terminal', title: 'Terminal.exe', isOpen: false, isMinimized: false, isMaximized: false, x: 220, y: 160, width: 700, height: 450, zIndex: 1 },
  { id: 'ai', title: 'AI Assistant', isOpen: false, isMinimized: false, isMaximized: false, x: 500, y: 80, width: 420, height: 580, zIndex: 1 },
  { id: 'blog', title: 'Blog Reader.exe', isOpen: false, isMinimized: false, isMaximized: false, x: 140, y: 100, width: 800, height: 580, zIndex: 1 },
  { id: 'achievements', title: 'Achievements.exe', isOpen: false, isMinimized: false, isMaximized: false, x: 250, y: 130, width: 680, height: 480, zIndex: 1 },
  { id: 'gaming', title: 'Gaming Profile', isOpen: false, isMinimized: false, isMaximized: false, x: 160, y: 80, width: 650, height: 520, zIndex: 1 },
  { id: 'contact', title: 'Contact.exe', isOpen: false, isMinimized: false, isMaximized: false, x: 280, y: 140, width: 550, height: 480, zIndex: 1 },
  { id: 'settings', title: 'Settings.exe', isOpen: false, isMinimized: false, isMaximized: false, x: 300, y: 150, width: 600, height: 450, zIndex: 1 },
];

export const useOSStore = create<OSState>((set, get) => ({
  // OS System States
  theme: 'midnight',
  wallpaper: 'nebula',
  soundEnabled: false,
  volume: 0.5,
  bootState: 'booting',
  startMenuOpen: false,
  activeWindowId: null,
  windows: INITIAL_WINDOWS,
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
  xp: 120,
  unlockedAchievements: ['first_boot'],
  terminalHistory: [],

  // General Setters
  setTheme: (theme) => set({ theme }),
  setWallpaper: (wallpaper) => set({ wallpaper }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVolume: (volume) => set({ volume }),
  setBootState: (bootState) => set({ bootState }),
  setStartMenuOpen: (startMenuOpen) => set({ startMenuOpen }),

  // Window Management Actions
  openWindow: (id) => {
    const { windows, maxZIndex } = get();
    const nextZIndex = maxZIndex + 1;
    
    set({
      startMenuOpen: false,
      activeWindowId: id,
      maxZIndex: nextZIndex,
      windows: windows.map((win) =>
        win.id === id
          ? { ...win, isOpen: true, isMinimized: false, zIndex: nextZIndex }
          : win
      ),
    });
  },

  closeWindow: (id) => {
    const { windows } = get();
    const newWindows = windows.map((win) =>
      win.id === id ? { ...win, isOpen: false, isMinimized: false, isMaximized: false } : win
    );
    
    // Find next window to focus
    const openAndNotMinimized = newWindows
      .filter((w) => w.isOpen && !w.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex);
    const nextFocusId = openAndNotMinimized.length > 0 ? openAndNotMinimized[0].id : null;

    set({
      windows: newWindows,
      activeWindowId: nextFocusId,
    });
  },

  minimizeWindow: (id) => {
    const { windows } = get();
    const newWindows = windows.map((win) =>
      win.id === id ? { ...win, isMinimized: true } : win
    );

    // Find next window to focus
    const openAndNotMinimized = newWindows
      .filter((w) => w.isOpen && !w.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex);
    const nextFocusId = openAndNotMinimized.length > 0 ? openAndNotMinimized[0].id : null;

    set({
      windows: newWindows,
      activeWindowId: nextFocusId,
    });
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
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, isMaximized: false, isMinimized: false } : win
      ),
    }));
    get().focusWindow(id);
  },

  focusWindow: (id) => {
    const { windows, maxZIndex, activeWindowId } = get();
    if (activeWindowId === id) return; // already focused

    const nextZIndex = maxZIndex + 1;
    set({
      activeWindowId: id,
      maxZIndex: nextZIndex,
      windows: windows.map((win) =>
        win.id === id ? { ...win, isMinimized: false, zIndex: nextZIndex } : win
      ),
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

  // Toast System
  addNotification: (title, message, type) => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNotif: ToastNotification = { id, title, message, type, timestamp };
    
    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 20), // limit to 20
    }));

    // Trigger XP gain for achievements
    if (type === 'achievement') {
      get().addXP(50);
    }
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // AI Chat Messages
  addChatMessage: (sender, text) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      chatMessages: [...state.chatMessages, { id, sender, text }],
    }));
  },

  clearChat: () => {
    set({ chatMessages: [] });
  },

  // RPG Progression
  addXP: (amount) => {
    set((state) => {
      const newXp = state.xp + amount;
      // Trigger notifications for leveling up, e.g. every 100 XP
      
      return { xp: newXp };
    });
  },

  unlockAchievement: (id) => {
    const { unlockedAchievements } = get();
    if (unlockedAchievements.includes(id)) return;
    
    set((state) => ({
      unlockedAchievements: [...state.unlockedAchievements, id],
    }));

    // Trigger notification
    let title = 'Achievement Unlocked!';
    let message = 'You earned a badge!';
    if (id === 'terminal_master') {
      title = '💻 Terminal Overlord';
      message = 'Ran 10+ terminal commands!';
    } else if (id === 'gamer_level') {
      title = '⚔️ Level Up!';
      message = 'Reached Level 5 in character stats!';
    } else if (id === 'explorer') {
      title = '🧭 Deep Explorer';
      message = 'Opened 5 different applications!';
    } else if (id === 'hacker') {
      title = '🕶️ Hack the Planet';
      message = 'Triggered the retro CRT theme!';
    }

    get().addNotification(title, message, 'achievement');
  },

  addTerminalCommand: (command) => {
    set((state) => ({
      terminalHistory: [...state.terminalHistory, command],
    }));
    
    const count = get().terminalHistory.length;
    if (count >= 10) {
      get().unlockAchievement('terminal_master');
    }
  },

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
  },
  closeMobileApp: (appId) => {
    const { mobileRecents, activeMobileApp } = get();
    const newRecents = mobileRecents.filter((id) => id !== appId);
    const nextActive = activeMobileApp === appId 
      ? (newRecents.length > 0 ? newRecents[0] : null) 
      : activeMobileApp;
    set({
      mobileRecents: newRecents,
      activeMobileApp: nextActive,
    });
  },
  clearMobileRecents: () => set({ mobileRecents: [], activeMobileApp: null }),
  setShowMobileDrawer: (showMobileDrawer) => set({ showMobileDrawer }),
  setShowMobileSettings: (showMobileSettings) => set({ showMobileSettings }),
  setMobileBrightness: (mobileBrightness) => set({ mobileBrightness }),
  setLayoutOverride: (layoutOverride) => set({ layoutOverride }),
}));
