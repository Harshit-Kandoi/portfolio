// ============================================================
// Portfolio OS – Central Configuration
// Update values here without touching component files.
// ============================================================

export const SPOTIFY_CONFIG = {
  playlistId: '37i9dQZF1DX8Ueb9qMvV2n',
  embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Ueb9qMvV2n?utm_source=generator&theme=0',
  externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8Ueb9qMvV2n',
  label: 'Coding & Focus Beats',
  playlists: [
    { id: 'lofi', label: 'Lofi Beats', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Ueb9qMvV2n?utm_source=generator&theme=0' },
    { id: 'focus', label: 'Deep Focus', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0SM0LYsmbMT?utm_source=generator&theme=0' },
    { id: 'synth', label: 'Synthwave', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLENyawioXt?utm_source=generator&theme=0' },
    { id: 'chill', label: 'Chill Coding', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0' },
  ],
};

export const PORTFOLIO_META = {
  name: 'Harshit Kandoi',
  role: 'Software & AI Engineer',
  location: 'Jaipur, Rajasthan, India',
  email: 'kandoiharshitsdlp@gmail.com',
  phone: '+91 78500 98453',
  github: 'https://github.com/Harshit-Kandoi',
  linkedin: 'https://linkedin.com/in/harshit-kandoi',
  medium: 'https://medium.com/@kandoiharshitsdlp',
  kaggle: 'https://kaggle.com/harshitkandoi7850',
  buymecoffee: 'https://buymeacoffee.com/Harshit_Kandoi',
};

export const SNAKE_CONFIG = {
  localStorageKey: 'portfolio-os-snake-highscore',
  initialSpeed: 220,   // ms per tick
  speedIncrement: 12,  // ms faster every N food pickups
  speedThreshold: 2,   // food pickups before speed increase
  gridSize: 20,        // cells across
};

export const SESSION_KEYS = {
  theme: 'portfolio-os-theme',
  wallpaper: 'portfolio-os-wallpaper',
  xp: 'portfolio-os-xp',
  achievements: 'portfolio-os-achievements',
  windows: 'portfolio-os-windows',
  snakeHighScore: 'portfolio-os-snake-highscore',
  swipeProgress: 'portfolio-os-swipe-progress',
  lastApps: 'portfolio-os-last-apps',
  hasVisited: 'portfolio-os-has-visited',
  uiScale: 'portfolio-os-ui-scale',
  windowAnimation: 'portfolio-os-win-anim',
  dockSize: 'portfolio-os-dock-size',
  performanceMode: 'portfolio-os-perf-mode',
  accentColor: 'portfolio-os-accent-color',
  sessionRestore: 'portfolio-os-session-restore',
  soundEnabled: 'portfolio-os-sound-enabled',
  volume: 'portfolio-os-volume',
};

export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.4.0';
export const ANALYTICS_VERSION = import.meta.env.VITE_ANALYTICS_VERSION || 'v1.0';