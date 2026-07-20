import React, { useState, useCallback, useRef } from 'react';
import {
  useOSStore, AppTheme, WallpaperType, UIScale,
  WindowAnimation, DockSize, PerformanceMode, AccentColor
} from '../../store/useOSStore';
import {
  Monitor, Volume2, Palette, ShieldAlert, Smartphone, Cpu,
  CheckCircle2, Sun, RefreshCw, Sparkles, Zap, Layers,
  Layout, Gauge, Keyboard, Database, RotateCcw, Code2,
  Settings, ChevronRight, Play, BarChart2
} from 'lucide-react';
import { playThemeSwitchSound, playVolumePreviewSound, playClickSound } from '../../utils/sounds';
import { APP_VERSION } from '../../data/config';

type UpdateState = 'idle' | 'checking' | 'done';
type Section =
  | 'appearance' | 'audio' | 'display' | 'desktop'
  | 'performance' | 'emulator' | 'keyboard' | 'session'
  | 'developer' | 'system';

// ─── Wallpaper colour thumbnails (CSS‑only, no images) ────────────────────────
const WALLPAPER_THUMBS: Record<WallpaperType, string> = {
  nebula:    'bg-gradient-to-br from-[#03001e] via-[#7303c0] to-[#ec38bc]',
  particles: 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]',
  matrix:    'bg-gradient-to-br from-black via-[#001100] to-[#003300]',
  grid:      'bg-gradient-to-br from-[#000000] via-[#0a0a1a] to-[#0d0d2b]',
};

const WALLPAPER_LABELS: Record<WallpaperType, string> = {
  nebula:    'Pulsing Star Network',
  particles: 'Space Dust & Code',
  matrix:    'Green Digital Rain',
  grid:      'Technical Cyber Grid',
};

const WALLPAPER_PATTERN: Record<WallpaperType, React.CSSProperties> = {
  nebula:    {},
  particles: {},
  matrix:    { backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,255,0,0.07) 0px,rgba(0,255,0,0.07) 1px,transparent 1px,transparent 8px)' },
  grid:      { backgroundImage: 'repeating-linear-gradient(0deg,rgba(99,102,241,0.12) 0px,rgba(99,102,241,0.12) 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,rgba(99,102,241,0.12) 0px,rgba(99,102,241,0.12) 1px,transparent 1px,transparent 20px)' },
};

const ACCENT_OPTIONS: { id: AccentColor; label: string; color: string }[] = [
  { id: 'purple', label: 'Purple', color: '#a855f7' },
  { id: 'yellow', label: 'Yellow', color: '#eab308' },
  { id: 'blue',   label: 'Blue',   color: '#3b82f6' },
  { id: 'green',  label: 'Green',  color: '#22c55e' },
  { id: 'red',    label: 'Red',    color: '#ef4444' },
];

// ─── Shared sub-components ────────────────────────────────────────────────────
const SectionTitle = ({ label, icon: Icon }: { label: string; icon: React.ElementType }) => {
  const theme = useOSStore((state) => state.theme);
  const isLight = theme === 'light';
  return (
    <div className={`flex items-center space-x-2 pb-3 border-b mb-4 ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
      <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-purple-50 border-purple-200' : 'bg-white/5 border-white/8'}`}>
        <Icon className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-purple-300'}`} />
      </div>
      <h3 className={`text-xs font-bold uppercase tracking-widest ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>{label}</h3>
    </div>
  );
};

const RadioRow = ({ label, selected, options, onChange }: {
  label: string;
  selected: string;
  options: { id: string; label: string; icon?: string }[];
  onChange: (v: string) => void;
}) => {
  const theme = useOSStore((state) => state.theme);
  const isLight = theme === 'light';
  return (
    <div className="space-y-2">
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all flex items-center space-x-1.5 ${
              selected === o.id
                ? isLight
                  ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                  : 'bg-[var(--accent-muted)] border-[var(--accent-border)] text-white shadow-sm'
                : isLight
                  ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                  : 'bg-white/5 border-white/8 text-gray-400 hover:bg-white/10 hover:text-gray-200'
            }`}
            aria-pressed={selected === o.id}
          >
            {o.icon && <span>{o.icon}</span>}
            <span>{o.label}</span>
            {selected === o.id && <CheckCircle2 className={`w-3 h-3 ${isLight ? 'text-white' : 'text-[var(--accent)]'}`} />}
          </button>
        ))}
      </div>
    </div>
  );
};

const ToggleSwitch = ({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative w-10 h-5.5 rounded-full border transition-all duration-200 flex items-center ${
      checked
        ? 'bg-[var(--accent)] border-[var(--accent)]'
        : 'bg-white/10 border-white/15'
    }`}
  >
    <span
      className={`absolute w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
        checked ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

// ─── MOBILE VIEW ─────────────────────────────────────────────────────────────
function MobileSettingsView() {
  const {
    theme, setTheme, wallpaper, setWallpaper,
    soundEnabled, setSoundEnabled, volume, setVolume,
    mobileBrightness, setMobileBrightness,
    batteryLevel, batteryCharging, batterySaver, setBatterySaver,
  } = useOSStore();

  const [updateState, setUpdateState] = useState<UpdateState>('idle');
  const [screenTimeout, setScreenTimeout] = useState<'30s' | '1m' | '2m' | '5m' | 'never'>('2m');
  const volumeThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const estHours = batterySaver
    ? Math.max(1, Math.round((batteryLevel / 100) * 22))
    : Math.max(1, Math.round((batteryLevel / 100) * 16));

  const handleCheckUpdate = () => {
    if (updateState !== 'idle') return;
    setUpdateState('checking');
    setTimeout(() => setUpdateState('done'), 2200);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (volumeThrottleRef.current) clearTimeout(volumeThrottleRef.current);
    volumeThrottleRef.current = setTimeout(() => playVolumePreviewSound(v), 150);
  };

  const isLight = theme === 'light';
  const boxBg = isLight ? 'bg-gray-100 border-gray-200 text-gray-800' : 'bg-slate-900/40 border-white/5 text-purple-100';

  const installedApps = [
    { title: 'About Me', cat: 'System' },
    { title: 'Projects', cat: 'Work' },
    { title: 'Experience', cat: 'Work' },
    { title: 'Skills', cat: 'Work' },
    { title: 'Resume', cat: 'System' },
    { title: 'Terminal', cat: 'Dev' },
    { title: 'AI Assistant', cat: 'Social' },
    { title: 'Tech Blog', cat: 'Social' },
    { title: 'Badges', cat: 'Gaming' },
    { title: 'Gaming OS', cat: 'Gaming' },
    { title: 'Snake 3310', cat: 'Gaming' },
    { title: 'Swipe Match', cat: 'Social' },
    { title: 'Buy Coffee', cat: 'System' },
    { title: 'Say Hello', cat: 'Social' },
    { title: 'Settings', cat: 'System' },
    { title: 'Library', cat: 'System' },
    { title: 'Notes', cat: 'Work' },
    { title: 'Gallery', cat: 'System' },
    { title: 'Products', cat: 'Work' },
    { title: 'Publications', cat: 'Social' },
    { title: 'Marketplace', cat: 'System' },
  ];

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-4 space-y-4 ${isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100'} custom-scrollbar`}>

      {/* Header */}
      <div className="flex items-center space-x-2.5 pb-2.5 border-b border-white/5">
        <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/25">
          <Settings className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold">Android Settings</h3>
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Mobile OS v15 · API 35</p>
        </div>
      </div>

      {/* 1. Display */}
      <div className={`p-4 rounded-xl border space-y-4 ${boxBg}`}>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
          <Sun className="w-3.5 h-3.5 text-yellow-400" /><span>Display</span>
        </h4>
        
        {/* Brightness */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-semibold text-gray-400">
            <span>Brightness</span><span>{Math.round(mobileBrightness * 100)}%</span>
          </div>
          <input type="range" min="0.15" max="1.0" step="0.05" value={mobileBrightness}
            onChange={e => setMobileBrightness(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer" />
        </div>

        {/* Dark Mode toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div>
            <p className="text-[11px] font-semibold">Dark Mode</p>
            <p className="text-[9px] text-gray-500">Toggle dark UI theme</p>
          </div>
          <ToggleSwitch id="mobile-dark-mode" checked={theme !== 'light'} onChange={() => {
            const next = theme === 'light' ? 'dark' : 'light';
            setTheme(next);
            playThemeSwitchSound();
          }} />
        </div>

        {/* Screen Timeout */}
        <div className="space-y-1.5 pt-1 border-t border-white/5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Screen Timeout</p>
          <div className="grid grid-cols-5 gap-1">
            {(['30s', '1m', '2m', '5m', 'never'] as const).map(t => (
              <button key={t} onClick={() => setScreenTimeout(t)}
                className={`py-1.5 rounded-lg text-[10px] font-semibold border text-center transition-all ${
                  screenTimeout === t
                    ? 'bg-purple-600/25 border-purple-500 text-white'
                    : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5'
                }`}>
                {t === 'never' ? 'Never' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Sound */}
      <div className={`p-4 rounded-xl border space-y-4 ${boxBg}`}>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
          <Volume2 className="w-3.5 h-3.5 text-sky-400" /><span>Sound</span>
        </h4>

        {/* System Volume */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-semibold text-gray-400">
            <span>Media & System Volume</span><span>{Math.round(volume * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.025" value={volume}
            onChange={e => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer" disabled={!soundEnabled} />
        </div>

        {/* Notification Sounds Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div>
            <p className="text-[11px] font-semibold">Notification Sounds</p>
            <p className="text-[9px] text-gray-500">System feedback and alert chirps</p>
          </div>
          <ToggleSwitch id="mobile-sound-toggle" checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
        </div>
      </div>

      {/* 3. Wallpaper */}
      <div className={`p-4 rounded-xl border space-y-3 ${boxBg}`}>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
          <Palette className="w-3.5 h-3.5 text-pink-400" /><span>Wallpaper</span>
        </h4>
        <p className="text-[10px] text-gray-400">Mobile Home & Lock Screen Background</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(WALLPAPER_LABELS) as WallpaperType[]).map(id => (
            <button
              key={id}
              onClick={() => setWallpaper(id)}
              className={`relative overflow-hidden rounded-xl border transition-all h-14 ${
                wallpaper === id ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`absolute inset-0 ${WALLPAPER_THUMBS[id]}`} style={WALLPAPER_PATTERN[id]} />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                <span className="text-[9px] text-white font-semibold leading-tight">{WALLPAPER_LABELS[id]}</span>
              </div>
              {wallpaper === id && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Apps */}
      <div className={`p-4 rounded-xl border space-y-3 ${boxBg}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /><span>Apps</span>
          </h4>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {installedApps.length} Installed
          </span>
        </div>
        <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
          {installedApps.map((app, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5 text-[10px]">
              <span className="font-semibold text-white">{app.title}</span>
              <span className="text-[9px] text-gray-400">{app.cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Battery */}
      <div className={`p-4 rounded-xl border space-y-3 ${boxBg}`}>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-400" /><span>Battery</span>
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold">Battery Saver</p>
            <p className="text-[9px] text-gray-500">Limits background sync & lowers animations</p>
          </div>
          <ToggleSwitch id="mobile-battery-saver" checked={batterySaver} onChange={() => setBatterySaver(!batterySaver)} />
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center justify-between text-[10px]">
          <span className="font-semibold text-emerald-300">Status: {batteryLevel}% · {batteryCharging ? 'Charging' : 'Discharging'}</span>
          <span className={`${batterySaver ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>~{estHours} hrs remaining{batterySaver ? ' (Saver Active)' : ''}</span>
        </div>
      </div>

      {/* 6. About Device */}
      <div className={`p-4 rounded-xl border space-y-3 ${boxBg}`}>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
          <Smartphone className="w-3.5 h-3.5 text-blue-400" /><span>About Device</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 space-y-0.5">
            <p className="text-gray-500 uppercase tracking-wider text-[9px]">Model</p>
            <p className="font-bold text-white">Portfolio Phone</p>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 space-y-0.5">
            <p className="text-gray-500 uppercase tracking-wider text-[9px]">Android Version</p>
            <p className="font-bold text-white">15 · API 35</p>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 space-y-0.5">
            <p className="text-gray-500 uppercase tracking-wider text-[9px]">Resolution</p>
            <p className="font-bold text-white">1080 × 2400 px</p>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 space-y-0.5">
            <p className="text-gray-500 uppercase tracking-wider text-[9px]">Developer</p>
            <p className="font-bold text-white">Harshit Kandoi</p>
          </div>
        </div>
      </div>

      {/* 7. System Update */}
      <div className={`p-4 rounded-xl border space-y-3 ${boxBg}`}>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" /><span>System Update</span>
        </h4>
        <div className="flex flex-col justify-between gap-3 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="text-[11px] font-bold text-white">Portfolio OS v{APP_VERSION}</p>
          </div>
          <p className="text-[9px] text-emerald-300 font-semibold">System is up to date</p>
          <button onClick={handleCheckUpdate} disabled={updateState !== 'idle'}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-60 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition self-start flex items-center space-x-1.5">
            {updateState === 'checking' && <RefreshCw className="w-3 h-3 animate-spin" />}
            {updateState === 'done' && <CheckCircle2 className="w-3 h-3 text-white" />}
            <span>{updateState === 'checking' ? 'Checking…' : updateState === 'done' ? 'All Good!' : 'Check Update'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}

// ─── DESKTOP VIEW ─────────────────────────────────────────────────────────────
function DesktopSettingsView() {
  const {
    theme, setTheme, wallpaper, setWallpaper,
    soundEnabled, setSoundEnabled, volume, setVolume,
    uiScale, setUiScale,
    windowAnimation, setWindowAnimation,
    dockSize, setDockSize,
    performanceMode, setPerformanceMode,
    accentColor, setAccentColor,
    sessionRestore, setSessionRestore,
    showFPS, setShowFPS,
    debugMode, setDebugMode,
    showWindowBounds, setShowWindowBounds,
    viewMode, isSimulatingMobile, setIsSimulatingMobile,
    layoutOverride, setLayoutOverride,
    resetDesktop,
  } = useOSStore();

  const [updateState, setUpdateState] = useState<UpdateState>('idle');
  const [activeSection, setActiveSection] = useState<Section>('appearance');
  const [versionClickCount, setVersionClickCount] = useState(0);
  const [devUnlocked, setDevUnlocked] = useState(false);
  const volumeThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCheckUpdate = () => {
    if (updateState !== 'idle') return;
    setUpdateState('checking');
    setTimeout(() => setUpdateState('done'), 2200);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (volumeThrottleRef.current) clearTimeout(volumeThrottleRef.current);
    volumeThrottleRef.current = setTimeout(() => playVolumePreviewSound(v), 120);
  };

  const handleVersionClick = useCallback(() => {
    const next = versionClickCount + 1;
    setVersionClickCount(next);
    if (next >= 3 && !devUnlocked) {
      setDevUnlocked(true);
      setActiveSection('developer');
      playClickSound();
    }
  }, [versionClickCount, devUnlocked]);

  const isLight = theme === 'light';
  const shellBg = isLight ? 'bg-white text-gray-800' : 'bg-[#07070e] text-purple-100';
  const cardBg  = isLight ? 'bg-gray-50 border-gray-200' : 'bg-slate-900/40 border-white/5';

  const themesList: { id: AppTheme; label: string; desc: string; color: string }[] = [
    { id: 'cyberpunk', label: 'Cyberpunk 2077',   desc: 'High-contrast neon yellow & hot pink overrides',         color: 'from-black to-yellow-500' },
    { id: 'midnight',  label: 'Midnight Purple',  desc: 'Galactic deep purples and violet accent glows',           color: 'from-[#03001e] to-[#7303c0]' },
    { id: 'dark',      label: 'Eclipse Dark',     desc: 'Slate grey developer theme with high contrast',           color: 'from-gray-900 to-black' },
    { id: 'light',     label: 'Arctic Light',     desc: 'Clean paper theme with soft shades and clear typography', color: 'from-white to-gray-200' },
    { id: 'retro',     label: 'Retro CRT Green',  desc: 'Monochrome terminal scanlines and horizontal flickers',   color: 'from-black to-green-600' },
    { id: 'nord',      label: 'Nord Icy',         desc: 'Chilled polar blues and clean arctic visuals',            color: 'from-[#2e3440] to-[#88c0d0]' },
    { id: 'glass',     label: 'Glassmorphism',    desc: 'High transparency layouts with backdrop filters',         color: 'from-white/10 to-white/20' },
  ];

  const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'appearance', label: 'Appearance',  icon: Palette },
    { id: 'audio',      label: 'Audio',       icon: Volume2 },
    { id: 'display',    label: 'Display',     icon: Monitor },
    { id: 'desktop',    label: 'Desktop',     icon: Layout },
    { id: 'performance',label: 'Performance', icon: Gauge },
    { id: 'emulator',   label: 'Emulator',    icon: Smartphone },
    { id: 'keyboard',   label: 'Keyboard',    icon: Keyboard },
    { id: 'session',    label: 'Session',     icon: Database },
    ...(devUnlocked ? [{ id: 'developer' as Section, label: 'Developer', icon: Code2, badge: 'DEV' }] : []),
    { id: 'system',     label: 'System',      icon: Cpu },
  ];

  return (
    <div className={`flex h-full w-full overflow-hidden ${shellBg}`}>

      {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <div className={`w-48 shrink-0 flex flex-col border-r py-4 space-y-0.5 overflow-y-auto custom-scrollbar ${
        isLight ? 'bg-gray-100 border-gray-200' : 'bg-black/30 border-white/5'
      }`}>
        <div className="px-4 pb-3 border-b border-white/5 mb-1">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Settings</h2>
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold transition-all rounded-none group ${
              activeSection === item.id
                ? isLight
                  ? 'bg-purple-100 text-purple-700 border-l-2 border-purple-500'
                  : 'bg-[var(--accent-muted)] text-white border-l-2 border-[var(--accent)]'
                : isLight
                  ? 'text-gray-600 hover:bg-gray-200/60'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </div>
            <div className="flex items-center space-x-1">
              {item.badge && (
                <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
              <ChevronRight className={`w-3 h-3 transition-opacity ${activeSection === item.id ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'}`} />
            </div>
          </button>
        ))}

        {/* Version number – click 3× to unlock Dev Options */}
        <div className="flex-grow" />
        <button
          onClick={handleVersionClick}
          className="px-4 py-3 text-left border-t border-white/5 mt-2"
        >
          <p className="text-[9px] text-gray-600 font-mono">Portfolio OS</p>
          <p className="text-[9px] text-gray-600 font-mono">v{APP_VERSION}</p>
          {versionClickCount > 0 && versionClickCount < 3 && (
            <p className="text-[8px] text-amber-500 mt-0.5">{3 - versionClickCount} more tap{3 - versionClickCount !== 1 ? 's' : ''}…</p>
          )}
          {devUnlocked && (
            <p className="text-[8px] text-emerald-400 mt-0.5">🔓 Dev Unlocked</p>
          )}
        </button>
      </div>

      {/* ─── RIGHT CONTENT PANEL ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">

        {/* ── APPEARANCE ─────────────────────────────────────────────── */}
        {activeSection === 'appearance' && (
          <div className="space-y-5">
            <SectionTitle label="Appearance" icon={Palette} />

            {/* Theme grid */}
            <div className="space-y-2">
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Interface Theme</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themesList.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); playThemeSwitchSound(); }}
                    className={`p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                      theme === t.id
                        ? isLight
                          ? 'bg-purple-100/90 border-purple-400 shadow-sm'
                          : 'bg-[var(--accent-muted)] border-[var(--accent-border)] shadow-md'
                        : isLight
                          ? 'bg-white border-gray-200 hover:bg-gray-100'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${t.color} border border-white/10 shrink-0`} />
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold leading-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.label}</h4>
                      <p className={`text-[10px] mt-0.5 leading-normal ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{t.desc}</p>
                    </div>
                    {theme === t.id && <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ml-auto ${isLight ? 'text-purple-600' : 'text-[var(--accent)]'}`} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallpaper with visual previews */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Desktop Wallpaper</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(WALLPAPER_LABELS) as WallpaperType[]).map(id => (
                  <button
                    key={id}
                    onClick={() => setWallpaper(id)}
                    className={`relative overflow-hidden rounded-2xl border transition-all h-20 text-left ${
                      wallpaper === id ? 'border-[var(--accent)] ring-1 ring-[var(--accent-border)]' : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className={`absolute inset-0 ${WALLPAPER_THUMBS[id]}`} style={WALLPAPER_PATTERN[id]} />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-start justify-end p-2.5">
                      <span className="text-[10px] text-white font-bold leading-tight">{WALLPAPER_LABELS[id]}</span>
                    </div>
                    {wallpaper === id && (
                      <div className="absolute top-2 right-2 bg-black/60 rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Accent Color</p>
              <div className={`p-4 rounded-2xl border ${cardBg} flex flex-wrap gap-4 items-center`}>
                {ACCENT_OPTIONS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAccentColor(a.id)}
                    className="flex flex-col items-center space-y-1.5 group"
                    aria-label={`Set accent to ${a.label}`}
                  >
                    <div
                      style={{ backgroundColor: a.color, boxShadow: accentColor === a.id ? `0 0 12px ${a.color}80` : undefined }}
                      className={`w-9 h-9 rounded-full border-2 transition-all duration-150 ${
                        accentColor === a.id ? 'border-white scale-110' : 'border-transparent group-hover:scale-105'
                      }`}
                    >
                      {accentColor === a.id && (
                        <div className="w-full h-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 group-hover:text-gray-200 transition">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AUDIO ──────────────────────────────────────────────────── */}
        {activeSection === 'audio' && (
          <div className="space-y-5">
            <SectionTitle label="Audio & Sound" icon={Volume2} />

            <div className={`p-4 rounded-2xl border space-y-5 ${cardBg}`}>
              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Interface Sounds</p>
                  <p className={`text-[10px] mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Click, open, close, and notification tones</p>
                </div>
                <ToggleSwitch id="sound-toggle" checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
              </div>

              {/* Volume slider — custom styled */}
              <div className={`space-y-3 ${!soundEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-baseline">
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Volume</p>
                  <span className={`text-xs font-bold tabular-nums ${isLight ? 'text-gray-900' : 'text-white'}`}>{Math.round(volume * 100)}%</span>
                </div>

                {/* Custom volume track with fill */}
                <div className="relative h-6 flex items-center group">
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-75"
                        style={{ width: `${volume * 100}%`, backgroundColor: 'var(--accent)' }}
                      />
                    </div>
                    <input
                      type="range" min="0" max="1" step="0.025" value={volume}
                      onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      disabled={!soundEnabled}
                      aria-label="Volume slider"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-gray-600">
                  <span>Muted</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>Max</span>
                </div>
              </div>

              <div className={`flex items-start space-x-2 bg-purple-950/20 border border-purple-900/30 p-3 rounded-xl text-[10px]`}>
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-gray-400 leading-normal">
                  All sounds are synthesised in real-time via Web Audio API — no audio assets to download.
                  Volume resets on page refresh if browser audio is blocked.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── DISPLAY ────────────────────────────────────────────────── */}
        {activeSection === 'display' && (
          <div className="space-y-5">
            <SectionTitle label="Display" icon={Monitor} />

            <div className={`p-4 rounded-2xl border space-y-5 ${cardBg}`}>
              {/* UI Scale */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">UI Scale</p>
                  <span className="text-xs font-bold text-white">{uiScale}%</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {([80, 90, 100, 110, 125] as UIScale[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setUiScale(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        uiScale === s
                          ? 'bg-[var(--accent-muted)] border-[var(--accent-border)] text-white'
                          : 'bg-white/5 border-white/8 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {s}%
                      {s === 90 && <span className="text-[9px] text-gray-500 ml-1">(Compact)</span>}
                      {s === 100 && <span className="text-[9px] text-gray-500 ml-1">(Default)</span>}
                      {s === 110 && <span className="text-[9px] text-gray-500 ml-1">(Enlarged)</span>}
                      {s === 125 && <span className="text-[9px] text-gray-500 ml-1">(Accessibility)</span>}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Scales typography and element spacing without distorting desktop layout geometry, window bounds, or icon grid alignment.
                </p>
              </div>

              {/* Window Animations */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Window Animations</p>
                <RadioRow
                  label=""
                  selected={windowAnimation}
                  options={[
                    { id: 'instant', label: 'Instant',   icon: '⚡' },
                    { id: 'smooth',  label: 'Smooth',    icon: '✨' },
                    { id: 'retro',   label: 'Retro CRT', icon: '📺' },
                  ]}
                  onChange={v => setWindowAnimation(v as WindowAnimation)}
                />
                <p className="text-[10px] text-gray-500">Controls how windows open and close. Retro uses a classic CRT horizontal-scan effect.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── DESKTOP ────────────────────────────────────────────────── */}
        {activeSection === 'desktop' && (
          <div className="space-y-5">
            <SectionTitle label="Desktop" icon={Layout} />

            <div className={`p-4 rounded-2xl border space-y-5 ${cardBg}`}>
              {/* Dock Size */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Dock Size</p>
                <RadioRow
                  label=""
                  selected={dockSize}
                  options={[
                    { id: 'small',  label: 'Small',  icon: '🔹' },
                    { id: 'medium', label: 'Medium', icon: '🔷' },
                    { id: 'large',  label: 'Large',  icon: '🔵' },
                  ]}
                  onChange={v => setDockSize(v as DockSize)}
                />
                <p className="text-[10px] text-gray-500">Adjust the icon size of the bottom dock bar.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── PERFORMANCE ────────────────────────────────────────────── */}
        {activeSection === 'performance' && (
          <div className="space-y-5">
            <SectionTitle label="Performance" icon={Gauge} />

            <div className={`p-4 rounded-2xl border space-y-5 ${cardBg}`}>
              <RadioRow
                label="Performance Mode"
                selected={performanceMode}
                options={[
                  { id: 'battery',     label: 'Battery Saver', icon: '🔋' },
                  { id: 'balanced',    label: 'Balanced',      icon: '⚡' },
                  { id: 'performance', label: 'Performance',   icon: '🚀' },
                ]}
                onChange={v => setPerformanceMode(v as PerformanceMode)}
              />
              <div className={`grid grid-cols-3 gap-3 text-center text-[10px] mt-2`}>
                {[
                  { mode: 'battery',     title: 'Battery Saver', desc: 'Reduces animations, disables non-critical effects', color: 'text-yellow-400' },
                  { mode: 'balanced',    title: 'Balanced',      desc: 'Optimal mix of visuals and responsiveness',          color: 'text-blue-400' },
                  { mode: 'performance', title: 'Performance',   desc: 'All effects enabled, highest responsiveness',        color: 'text-red-400' },
                ].map(item => (
                  <div key={item.mode}
                    className={`p-3 rounded-xl border space-y-1.5 ${
                      performanceMode === item.mode ? 'border-[var(--accent-border)] bg-[var(--accent-muted)]' : 'border-white/5 bg-white/5'
                    }`}>
                    <p className={`font-bold ${item.color}`}>{item.title}</p>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EMULATOR ───────────────────────────────────────────────── */}
        {activeSection === 'emulator' && (
          <div className="space-y-5">
            <SectionTitle label="Android Emulator" icon={Smartphone} />

            {(viewMode === 'desktop' || viewMode === 'tablet') ? (
              <div className="space-y-4">
                {/* Status card */}
                <div className={`p-4 rounded-2xl border ${cardBg}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                    <div className={`p-3 rounded-xl space-y-1 ${isLight ? 'bg-gray-100 border-gray-200 border' : 'bg-black/30 border border-white/5'}`}>
                      <p className="text-gray-500 uppercase tracking-wider text-[9px]">Status</p>
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${isSimulatingMobile ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                        <span className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{isSimulatingMobile ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl space-y-1 ${isLight ? 'bg-gray-100 border-gray-200 border' : 'bg-black/30 border border-white/5'}`}>
                      <p className="text-gray-500 uppercase tracking-wider text-[9px]">Resolution</p>
                      <p className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>1080 × 2400</p>
                    </div>
                    <div className={`p-3 rounded-xl space-y-1 ${isLight ? 'bg-gray-100 border-gray-200 border' : 'bg-black/30 border border-white/5'}`}>
                      <p className="text-gray-500 uppercase tracking-wider text-[9px]">Android</p>
                      <p className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>15 · API 35</p>
                    </div>
                    <div className={`p-3 rounded-xl space-y-1 ${isLight ? 'bg-gray-100 border-gray-200 border' : 'bg-black/30 border border-white/5'}`}>
                      <p className="text-gray-500 uppercase tracking-wider text-[9px]">Frame</p>
                      <p className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>375 × 780px</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
                    Renders a full Android-style OS inside a smartphone frame overlay. Works on Desktop and Tablet landscape modes — lets you preview the mobile experience without leaving your current view.
                  </p>
                  <button
                    onClick={() => setIsSimulatingMobile(!isSimulatingMobile)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border flex items-center space-x-2 transition-all ${
                      isSimulatingMobile
                        ? 'bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30'
                        : 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isSimulatingMobile ? 'Stop Simulator' : 'Launch Simulator'}</span>
                    {isSimulatingMobile && <Zap className="w-3 h-3 animate-pulse" />}
                  </button>
                </div>

                {/* Layout mode override */}
                <div className={`p-4 rounded-2xl border space-y-3 ${cardBg}`}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Default Preview Layout</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'auto',    label: 'Auto',    icon: '🔄', desc: 'Responsive' },
                      { id: 'desktop', label: 'Desktop', icon: '🖥️', desc: 'Full window' },
                      { id: 'tablet',  label: 'Tablet',  icon: '📱', desc: 'Touch layout' },
                      { id: 'mobile',  label: 'Mobile',  icon: '📲', desc: 'Android OS' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setLayoutOverride(opt.id as 'auto'|'desktop'|'tablet'|'mobile')}
                        className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                          layoutOverride === opt.id
                            ? 'bg-[var(--accent-muted)] border-[var(--accent-border)] text-white'
                            : 'bg-black/20 border-white/5 hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <span className="text-base">{opt.icon}</span>
                        <span className="text-[10px] font-bold mt-1.5 block">{opt.label}</span>
                        <span className="text-[9px] text-gray-400">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-2xl border text-center text-[11px] text-gray-500 ${cardBg}`}>
                The Android Emulator is only available in Desktop and Tablet landscape modes.
              </div>
            )}
          </div>
        )}

        {/* ── KEYBOARD ───────────────────────────────────────────────── */}
        {activeSection === 'keyboard' && (
          <div className="space-y-5">
            <SectionTitle label="Keyboard Shortcuts" icon={Keyboard} />

            <div className={`p-4 rounded-2xl border space-y-4 ${cardBg}`}>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                These shortcuts are active globally throughout Portfolio OS when a window is in focus.
              </p>
              {[
                { keys: ['Esc'],           action: 'Close focused window',         active: true },
                { keys: ['Ctrl', 'K'],     action: 'Open / close Start Menu',      active: true },
                { keys: ['Alt', 'Tab'],    action: 'Cycle through open windows',   active: true },
                { keys: ['Alt', 'T'],      action: 'Open Terminal.exe',            active: true },
                { keys: ['Alt', 'S'],      action: 'Open Settings.exe',            active: true },
                { keys: ['Shift', 'Enter'],'action': 'Enter full-screen terminal', active: false },
                { keys: ['↑↑↓↓←→←→BA'],  action: 'Konami Code Easter Egg',       active: true },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                  <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                    {row.keys.map((k, j) => (
                      <React.Fragment key={j}>
                        <kbd className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold border ${
                          isLight ? 'bg-gray-200 border-gray-300 text-gray-700' : 'bg-white/10 border-white/15 text-gray-200'
                        }`}>{k}</kbd>
                        {j < row.keys.length - 1 && <span className="text-[10px] text-gray-600">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 text-right">
                    <span className="text-[10px] text-gray-400">{row.action}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SESSION ────────────────────────────────────────────────── */}
        {activeSection === 'session' && (
          <div className="space-y-5">
            <SectionTitle label="Session & Reset" icon={Database} />

            <div className={`p-4 rounded-2xl border space-y-5 ${cardBg}`}>
              {/* Session restore */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Restore Previous Session</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 max-w-xs leading-normal">
                    When enabled, your window positions and last opened apps are remembered between visits.
                  </p>
                </div>
                <ToggleSwitch id="session-restore-toggle" checked={sessionRestore} onChange={() => setSessionRestore(!sessionRestore)} />
              </div>

              {/* Reset Desktop */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Reset Desktop</p>
                <div className={`p-3 rounded-xl bg-red-950/20 border border-red-500/15 text-[10px] text-gray-400 leading-relaxed space-y-1`}>
                  <p>Performing a desktop reset will:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-500 ml-1">
                    <li>Close all open application windows</li>
                    <li>Restore icon grid positions to defaults</li>
                    <li>Reset all settings to Cyberpunk 2077 defaults</li>
                    <li>Re-enable sound at 37.5% volume</li>
                  </ul>
                </div>
                <button
                  onClick={() => { resetDesktop(); playThemeSwitchSound(); }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Desktop Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DEVELOPER ──────────────────────────────────────────────── */}
        {activeSection === 'developer' && devUnlocked && (
          <div className="space-y-5">
            <SectionTitle label="Developer Options" icon={Code2} />

            <div className={`flex items-start space-x-2 bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl text-[10px] text-amber-300`}>
              <span className="text-base">⚠️</span>
              <p>Developer options are intended for debugging. They may cause visual artifacts and are not persisted across sessions.</p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-4 ${cardBg}`}>
              {[
                { label: 'Show FPS Counter',     desc: 'Displays live frames per second in the top-right corner',       checked: showFPS,         onChange: () => { setShowFPS(!showFPS); playClickSound(); } },
                { label: 'Show Window Bounds',   desc: 'Outlines all active windows with a red debug border',            checked: showWindowBounds, onChange: () => { setShowWindowBounds(!showWindowBounds); playClickSound(); } },
                { label: 'Debug Mode',           desc: 'Enables console logging and verbose error output in DevTools',   checked: debugMode,       onChange: () => { setDebugMode(!debugMode); playClickSound(); } },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between ${i > 0 ? 'border-t border-white/5 pt-4' : ''}`}>
                  <div>
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 max-w-xs leading-normal">{item.desc}</p>
                  </div>
                  <ToggleSwitch id={`dev-${i}`} checked={item.checked} onChange={item.onChange} />
                </div>
              ))}

              <div className="border-t border-white/5 pt-4 space-y-2">
                <button
                  onClick={() => { resetDesktop(); playClickSound(); }}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 bg-white/5 hover:bg-white/10 text-xs font-bold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Window Layout</span>
                </button>
                <button
                  onClick={() => {
                    const state = useOSStore.getState();
                    const exportData = {
                      theme: state.theme, wallpaper: state.wallpaper,
                      uiScale: state.uiScale, windowAnimation: state.windowAnimation,
                      dockSize: state.dockSize, performanceMode: state.performanceMode,
                      accentColor: state.accentColor, volume: state.volume,
                      soundEnabled: state.soundEnabled, sessionRestore: state.sessionRestore,
                    };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url;
                    a.download = 'portfolio-os-settings.json'; a.click();
                    URL.revokeObjectURL(url);
                    playClickSound();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 bg-white/5 hover:bg-white/10 text-xs font-bold transition"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Export Settings as JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SYSTEM UPDATE ──────────────────────────────────────────── */}
        {activeSection === 'system' && (
          <div className="space-y-5">
            <SectionTitle label="System Update & Device Info" icon={Cpu} />

            <div className={`p-4 rounded-2xl border space-y-4 ${cardBg}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white">Portfolio OS v{APP_VERSION}</h4>
                  </div>
                  <p className="text-[10px] text-emerald-300 font-semibold">System is up to date</p>
                  <p className="text-[9.5px] text-gray-500">Security patch: July 2026 · Jaipur, Rajasthan</p>
                </div>
                <button
                  onClick={handleCheckUpdate}
                  disabled={updateState !== 'idle'}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-60 text-white text-[11px] font-bold py-2 px-4 rounded-xl transition flex items-center space-x-2 shrink-0"
                >
                  {updateState === 'checking' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {updateState === 'done' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{updateState === 'checking' ? 'Checking…' : updateState === 'done' ? 'All Good!' : 'Check for Update'}</span>
                </button>
              </div>

              {updateState === 'done' && (
                <div className="bg-emerald-950/30 border border-emerald-500/15 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-300">✅ You're all up to date!</p>
                    <p className="text-[10.5px] text-gray-400 leading-relaxed max-w-sm">
                      Harshit is continuously shipping new skills, projects, and ideas. Check back soon for the next update!
                    </p>
                    <p className="text-[9.5px] text-gray-500 italic">Last sync: Portfolio OS v{APP_VERSION} · July 2026</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SettingsApp({ isMobileView = false }: { isMobileView?: boolean }) {
  if (isMobileView) return <MobileSettingsView />;
  return <DesktopSettingsView />;
}
