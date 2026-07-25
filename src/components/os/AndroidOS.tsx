import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useOSStore, AppTheme } from '../../store/useOSStore';
import { 
  Wifi, Signal, Battery, Search, Bell, BellOff, Settings as GearIcon, 
  Volume2, Sun, Palette, Trash2, Bluetooth, Zap, ChevronLeft, ChevronRight, Gamepad2,
  User, Folder, Briefcase, Award, FileText, Terminal as TermIcon,
  MessageSquare, BookOpen, Trophy, Send, VolumeX, Moon, Heart, Coffee, ExternalLink,
  BookMarked, StickyNote, /* Image as ImageIcon, */ Package, LayoutTemplate
} from 'lucide-react';
import { playWindowSound } from '../../utils/sounds';
import Wallpaper from './Wallpaper';

// Lazy load app modules to reduce initial mobile JS bundle size and improve load speed
const AboutApp       = lazy(() => import('../apps/AboutApp'));
const ProjectsApp    = lazy(() => import('../apps/ProjectsApp'));
const ExperienceApp  = lazy(() => import('../apps/ExperienceApp'));
const SkillsApp      = lazy(() => import('../apps/SkillsApp'));
const ResumeApp      = lazy(() => import('../apps/ResumeApp'));
const TerminalWindow = lazy(() => import('../apps/TerminalWindow'));
const AIAssistantApp = lazy(() => import('../apps/AIAssistantApp'));
const BlogApp        = lazy(() => import('../apps/BlogApp'));
const AchievementsApp= lazy(() => import('../apps/AchievementsApp'));
const GamingApp      = lazy(() => import('../apps/GamingApp'));
const ContactApp     = lazy(() => import('../apps/ContactApp'));
const SettingsApp    = lazy(() => import('../apps/SettingsApp'));
const SnakeGame      = lazy(() => import('../apps/SnakeGame'));
const PortfolioSwipe = lazy(() => import('../apps/PortfolioSwipe'));
const BuyMeCoffeeApp = lazy(() => import('../apps/BuyMeCoffeeApp'));
// Phase 3 New Apps
const LibraryApp     = lazy(() => import('../apps/LibraryApp'));
const NotesApp       = lazy(() => import('../apps/NotesApp'));
// const GalleryApp     = lazy(() => import('../apps/GalleryApp'));
const ProductsApp    = lazy(() => import('../apps/ProductsApp'));
// const PublicationsApp= lazy(() => import('../apps/PublicationsApp'));
// const MarketplaceApp = lazy(() => import('../apps/MarketplaceApp'));


// Custom Snake Icon SVG
const SnakeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8.5 10c-1.5-1.5-2.5-2.5-2.5-4a4 4 0 1 1 8 0v4a4 4 0 0 0 8 0V6" />
    <path d="M12 12c1.5 1.5 2.5 2.5 2.5 4a4 4 0 1 1-8 0v-4a4 4 0 0 0-8 0v2" />
    <circle cx="10" cy="4" r="1" fill="currentColor" />
  </svg>
);

interface AndroidOSProps {
  isFullscreen: boolean;
}

export default function AndroidOS({ isFullscreen }: AndroidOSProps) {
  const {
    theme, setTheme, wallpaper,
    notifications, dismissNotification, clearNotifications, addNotification,
    activeMobileApp, openMobileApp, closeMobileApp, mobileRecents, clearMobileRecents,
    showMobileDrawer, setShowMobileDrawer,
    showMobileSettings, setShowMobileSettings,
    mobileBrightness, setMobileBrightness,
    soundEnabled, setSoundEnabled,
    volume, setVolume,
    batteryLevel, batteryCharging, setBatteryLevel,
    setPortalMode,
  } = useOSStore();

  const [sysTime, setSysTime] = useState(new Date());
  const [localSearch, setLocalSearch] = useState('');
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const flashlight = false;
  const [showRecents, setShowRecents] = useState(false);
  const recentsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeRecentIdx, setActiveRecentIdx] = useState(0);

  const checkRecentsScroll = useCallback(() => {
    if (!recentsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = recentsRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const cardWidth = 208;
    const idx = Math.round(scrollLeft / cardWidth);
    setActiveRecentIdx(Math.max(0, Math.min(idx, mobileRecents.length - 1)));
  }, [mobileRecents.length]);

  useEffect(() => {
    if (showRecents) {
      const timer = setTimeout(checkRecentsScroll, 60);
      return () => clearTimeout(timer);
    }
  }, [showRecents, mobileRecents.length, checkRecentsScroll]);

  const scrollRecents = (direction: 'left' | 'right') => {
    if (!recentsRef.current) return;
    const scrollAmount = 210;
    recentsRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const pointerStartY = useRef(0);
  const pointerStartX = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartY.current = e.clientY;
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent, context: 'home' | 'settings' | 'drawer') => {
    const deltaY = e.clientY - pointerStartY.current;
    const deltaX = e.clientX - pointerStartX.current;
    const threshold = 45;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (context === 'home') {
        if (deltaY > threshold) {
          setShowMobileSettings(true);
        } else if (deltaY < -threshold) {
          setShowMobileDrawer(true);
        }
      } else if (context === 'settings') {
        if (deltaY < -threshold) {
          setShowMobileSettings(false);
        }
      } else if (context === 'drawer') {
        if (deltaY > threshold) {
          setShowMobileDrawer(false);
        }
      }
    }
  };

  // Update clock time
  useEffect(() => {
    const timer = setInterval(() => setSysTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update battery level simulation
  useEffect(() => {
    const batteryTimer = setInterval(() => {
      const current = useOSStore.getState().batteryLevel;
      const isCharging = useOSStore.getState().batteryCharging;
      if (isCharging) {
        setBatteryLevel(current >= 100 ? 100 : current + 1);
      } else {
        setBatteryLevel(current <= 1 ? 1 : current - 1);
      }
    }, 60000);
    return () => clearInterval(batteryTimer);
  }, [setBatteryLevel]);

  // Mobile App metadata mapper
  const appIcons = [
    { id: 'about', title: 'About Me', icon: User, color: 'from-blue-500 to-cyan-400', category: 'system' },
    { id: 'projects', title: 'Projects', icon: Folder, color: 'from-purple-500 to-indigo-500', category: 'work' },
    { id: 'experience', title: 'Experience', icon: Briefcase, color: 'from-emerald-500 to-teal-500', category: 'work' },
    { id: 'skills', title: 'Skills', icon: Award, color: 'from-amber-500 to-orange-500', category: 'work' },
    { id: 'resume', title: 'Resume', icon: FileText, color: 'from-rose-500 to-red-500', category: 'system' },
    { id: 'terminal', title: 'Terminal', icon: TermIcon, color: 'from-slate-700 to-slate-900', category: 'dev' },
    { id: 'ai', title: 'AI Assistant', icon: MessageSquare, color: 'from-pink-500 to-rose-400', category: 'social' },
    { id: 'blog', title: 'Tech Blog', icon: BookOpen, color: 'from-sky-500 to-blue-600', category: 'social' },
    { id: 'achievements', title: 'Certifications', icon: Award, color: 'from-yellow-400 to-amber-500', category: 'work' },
    { id: 'gaming', title: 'Gaming OS', icon: Gamepad2, color: 'from-red-500 to-pink-500', category: 'game' },
    { id: 'snake', title: 'Snake 3310', icon: SnakeIcon, color: 'from-green-600 to-emerald-500', category: 'game' },
    { id: 'swipe', title: 'Swipe Match', icon: Heart, color: 'from-rose-500 to-pink-500', category: 'social' },
    { id: 'coffee', title: 'Buy Coffee', icon: Coffee, color: 'from-amber-600 to-yellow-500', category: 'system' },
    { id: 'contact', title: 'Say Hello', icon: Send, color: 'from-teal-400 to-emerald-500', category: 'social' },
    { id: 'settings', title: 'Settings', icon: GearIcon, color: 'from-slate-400 to-slate-600', category: 'system' },
    // Phase 3 New Apps
    { id: 'library', title: 'Library', icon: BookMarked, color: 'from-amber-500 to-orange-400', category: 'system' },
    { id: 'notes', title: 'Notes', icon: StickyNote, color: 'from-violet-500 to-purple-600', category: 'work' },
    // { id: 'gallery', title: 'Gallery', icon: ImageIcon, color: 'from-pink-500 to-rose-500', category: 'system' },
    { id: 'products', title: 'Products', icon: Package, color: 'from-violet-600 to-indigo-600', category: 'work' },
    // { id: 'publications', title: 'Publications', icon: BookMarked, color: 'from-green-500 to-emerald-600', category: 'social' },
    // { id: 'marketplace', title: 'Marketplace', icon: ShoppingBag, color: 'from-rose-500 to-pink-600', category: 'system' },
  ];

  // Quick App Search filter
  const filteredApps = appIcons.filter(app => 
    app.title.toLowerCase().includes(localSearch.toLowerCase())
  );

  // Dynamic mobile background gradient depending on store theme
  const getBackgroundStyle = () => {
    switch (theme) {
      case 'light':
        return 'bg-gradient-to-b from-[#e0eafc] to-[#cfdef3]';
      case 'dark':
        return 'bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]';
      case 'cyberpunk':
        return 'bg-gradient-to-b from-[#120015] via-[#22002b] to-[#120015] border-2 border-yellow-400/20';
      case 'retro':
        return 'bg-black border border-green-500/20';
      case 'nord':
        return 'bg-gradient-to-b from-[#2e3440] via-[#3b4252] to-[#434c5e]';
      case 'glass':
        return 'bg-gradient-to-b from-[#1a1c29] via-[#0e1017] to-[#050608]';
      case 'midnight':
      default:
        return 'bg-gradient-to-b from-[#0f0c20] via-[#150a33] to-[#090212]';
    }
  };

  // Back Key action handler
  const handleBackKey = () => {
    if (showMobileSettings) {
      setShowMobileSettings(false);
    } else if (showMobileDrawer) {
      setShowMobileDrawer(false);
    } else if (showRecents) {
      setShowRecents(false);
    } else if (activeMobileApp) {
      playWindowSound('close');
      // Go back to previous app or home
      const nextActiveIdx = mobileRecents.indexOf(activeMobileApp) + 1;
      if (nextActiveIdx < mobileRecents.length) {
        openMobileApp(mobileRecents[nextActiveIdx]);
      } else {
        closeMobileApp(activeMobileApp);
      }
    }
  };

  // Home Key action handler
  const handleHomeKey = () => {
    setShowMobileSettings(false);
    setShowMobileDrawer(false);
    setShowRecents(false);
    if (activeMobileApp) {
      playWindowSound('close');
      // Set active app to null but keep in recents stack
      useOSStore.setState({ activeMobileApp: null });
    }
  };

  // Recents Switcher Key handler
  const handleRecentsKey = () => {
    setShowMobileSettings(false);
    setShowMobileDrawer(false);
    setShowRecents(!showRecents);
  };

  const handleLaunchApp = (appId: string) => {
    if (appId === 'classic-portal') {
      setPortalMode('classic');
      return;
    }
    playWindowSound('open');
    openMobileApp(appId);
    setShowRecents(false);
  };

  const formatClock = sysTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatDateLong = sysTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Render content of opened app
  const renderAppContent = (appId: string) => {
    const fallback = (
      <div className="flex flex-col items-center justify-center h-full p-6 text-purple-400 font-mono text-[10px] sm:text-xs">
        <span className="animate-pulse">Loading app components...</span>
      </div>
    );

    let content;
    switch (appId) {
      case 'about': content = <AboutApp isMobileView={true} />; break;
      case 'projects': content = <ProjectsApp isMobileView={true} />; break;
      case 'experience': content = <ExperienceApp isMobileView={true} />; break;
      case 'skills': content = <SkillsApp isMobileView={true} />; break;
      case 'resume': content = <ResumeApp isMobileView={true} />; break;
      case 'terminal': content = <TerminalWindow isMobileView={true} />; break;
      case 'ai': content = <AIAssistantApp isMobileView={true} />; break;
      case 'blog': content = <BlogApp isMobileView={true} />; break;
      case 'achievements': content = <AchievementsApp isMobileView={true} />; break;
      case 'gaming': content = <GamingApp isMobileView={true} />; break;
      case 'snake': content = <SnakeGame isMobileView={true} />; break;
      case 'swipe': content = <PortfolioSwipe isMobileView={true} />; break;
      case 'coffee': content = <BuyMeCoffeeApp isMobileView={true} />; break;
      case 'contact': content = <ContactApp isMobileView={true} />; break;
      case 'settings': content = <SettingsApp isMobileView={true} />; break;
      // Phase 3 New Apps
      case 'library': content = <LibraryApp isMobileView={true} />; break;
      case 'notes': content = <NotesApp isMobileView={true} />; break;
      // case 'gallery': content = <GalleryApp isMobileView={true} />; break;
      case 'products': content = <ProductsApp isMobileView={true} />; break;
      // case 'publications': content = <PublicationsApp isMobileView={true} />; break;
      // case 'marketplace': content = <MarketplaceApp isMobileView={true} />; break;
      default: content = <div className="p-4 text-center text-white">App is currently building...</div>;
    }

    return (
      <Suspense fallback={fallback}>
        {content}
      </Suspense>
    );
  };

  return (
    <div 
      className={`relative w-full ${isFullscreen ? 'h-dvh' : 'h-full'} flex flex-col select-none overflow-hidden ${getBackgroundStyle()} ${theme === 'light' ? 'text-gray-800' : 'text-white'} font-sans`}
      style={{ touchAction: 'none' }}
    >
      <Wallpaper type={wallpaper} />
      
      {/* Dynamic Brightness Dimming Overlay */}
      <div 
        className="absolute inset-0 z-[1000] pointer-events-none bg-black transition-opacity duration-200" 
        style={{ opacity: 1 - mobileBrightness }} 
      />

      {/* Retro CRT Grid Overlay (for retro theme) */}
      {theme === 'retro' && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20 z-40" />
      )}

      {/* Flashlight Simulated Aura */}
      {flashlight && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-300/10 rounded-full blur-3xl pointer-events-none z-30 animate-pulse" />
      )}

      {/* ================= STATUS BAR ================= */}
      <div 
        onClick={() => setShowMobileSettings(true)}
        className={`h-9 w-full flex items-center justify-between px-6 pt-1.5 text-[11px] font-bold tracking-tight select-none cursor-pointer z-50 transition ${
          theme === 'light' ? 'hover:bg-black/5 active:bg-black/10 text-gray-700' : 'hover:bg-white/5 active:bg-white/10 text-white'
        }`}
      >
        {/* Left Side: Time / Notification Icons */}
        <div className="flex items-center space-x-1.5">
          <span>{formatClock}</span>
          {!airplaneMode && notifications.length > 0 && (
            <Bell className={`w-3 h-3 ${theme === 'light' ? 'text-purple-600' : 'text-amber-400'} animate-bounce`} />
          )}
        </div>

        {/* Center notch spacing for desktop phone simulator */}
        {!isFullscreen && <div className="w-20" />}

        {/* Right Side: Network Status Icons */}
        <div className="flex items-center space-x-1.5">
          {airplaneMode ? (
            <span className={`text-[9px] uppercase tracking-wider ${theme === 'light' ? 'text-red-650' : 'text-red-400'}`}>Airplane Mode</span>
          ) : (
            <>
              {wifiEnabled ? <Wifi className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <Wifi className="w-3.5 h-3.5 text-gray-500" />}
              <Signal className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-sky-650' : 'text-sky-400'}`} />
            </>
          )}
          {bluetoothEnabled && <Bluetooth className={`w-3 h-3 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />}
          
          <div className="flex items-center space-x-0.5">
            <span className={`text-[9px] font-normal ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>{batteryLevel}%</span>
            <div className="relative flex items-center">
              <Battery className={`w-4 h-4 ${batteryCharging ? (theme === 'light' ? 'text-green-600' : 'text-green-400') : (theme === 'light' ? 'text-gray-600' : 'text-gray-200')}`} />
              {batteryCharging && <Zap className={`w-2.5 h-2.5 absolute left-0.5 ${theme === 'light' ? 'text-green-500' : 'text-green-300'} animate-pulse`} />}
            </div>
          </div>
        </div>
      </div>

      {/* ================= QUICK SETTINGS / NOTIFICATIONS DRAWER ================= */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerUp={(e) => handlePointerUp(e, 'settings')}
        className={`absolute inset-0 ${
          theme === 'light' ? 'bg-[#f4f7f6] text-gray-800' : 'bg-slate-950 text-white'
        } z-[600] flex flex-col justify-between px-6 pt-10 pb-4 transition-transform duration-300 ease-out ${
          showMobileSettings ? 'translate-y-0 pointer-events-auto opacity-100' : '-translate-y-full pointer-events-none opacity-0 invisible'
        }`}
      >
          <div className="space-y-6">
            
            {/* Drawer Top Handle */}
            <div className={`flex justify-between items-center border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} pb-4`}>
              <div className="flex flex-col">
                <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} font-bold uppercase tracking-wider`}>Quick Controls</span>
                <span className={`text-[10px] ${theme === 'light' ? 'text-gray-450' : 'text-gray-500'} mt-0.5`}>{formatDateLong}</span>
              </div>
              <button 
                onClick={() => setShowMobileSettings(false)}
                className={`p-1.5 rounded-full ${theme === 'light' ? 'bg-black/5 hover:bg-black/10 text-gray-600' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                aria-label="Close quick settings"
              >
                <ChevronLeft className="w-5 h-5 rotate-275" />
              </button>
            </div>

            {/* Quick Settings Action Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Wi-Fi Toggle */}
              <button 
                onClick={() => {
                  if (airplaneMode) return;
                  const nextVal = !wifiEnabled;
                  setWifiEnabled(nextVal);
                  addNotification(
                    nextVal ? '📶 Wi-Fi Active' : '📶 Wi-Fi Disabled',
                    nextVal ? 'Connected to local high-speed gateway.' : 'Radio receiver powered off.',
                    'info',
                    'system'
                  );
                }}
                disabled={airplaneMode}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1.5 border transition ${
                  wifiEnabled && !airplaneMode 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' 
                    : (theme === 'light' ? 'bg-gray-200/60 border-gray-300/40 text-gray-600 hover:bg-gray-200' : 'bg-white/5 border-white/5 text-gray-400')
                }`}
                aria-label="Toggle Wi-Fi"
              >
                <Wifi className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Wi-Fi</span>
              </button>

              {/* Bluetooth Toggle */}
              <button 
                onClick={() => {
                  const nextVal = !bluetoothEnabled;
                  setBluetoothEnabled(nextVal);
                  addNotification(
                    nextVal ? '🔹 Bluetooth Enabled' : '🔹 Bluetooth Disabled',
                    nextVal ? 'Scanning for peripheral devices...' : 'Bluetooth adapter shut down.',
                    'info',
                    'system'
                  );
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1.5 border transition ${
                  bluetoothEnabled 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                    : (theme === 'light' ? 'bg-gray-200/60 border-gray-300/40 text-gray-600 hover:bg-gray-200' : 'bg-white/5 border-white/5 text-gray-400')
                }`}
                aria-label="Toggle Bluetooth"
              >
                <Bluetooth className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Bluetooth</span>
              </button>

              {/* Airplane Mode Toggle */}
              <button 
                onClick={() => {
                  const nextVal = !airplaneMode;
                  setAirplaneMode(nextVal);
                  if (nextVal) {
                    setWifiEnabled(false);
                  }
                  addNotification(
                    nextVal ? '✈️ Airplane Mode Active' : '✈️ Airplane Mode Disabled',
                    nextVal ? 'All wireless network bridges disabled.' : 'Restoring radio channels.',
                    'warning',
                    'system'
                  );
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1.5 border transition ${
                  airplaneMode 
                    ? 'bg-red-600 border-red-500 text-white shadow-md' 
                    : (theme === 'light' ? 'bg-gray-200/60 border-gray-300/40 text-gray-600 hover:bg-gray-200' : 'bg-white/5 border-white/5 text-gray-400')
                }`}
                aria-label="Toggle Airplane Mode"
              >
                <Zap className="w-5 h-5 rotate-45" />
                <span className="text-[10px] font-semibold">Airplane</span>
              </button>

              {/* Dark Theme Toggle */}
              <button 
                onClick={() => {
                  const nextTheme = theme === 'light' ? 'dark' : 'light';
                  setTheme(nextTheme);
                  addNotification(
                    nextTheme === 'light' ? '☀️ Light Mode Active' : '🌙 Dark Mode Active',
                    `Interface theme changed to ${nextTheme}.`,
                    'info',
                    'system'
                  );
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1.5 border transition ${
                  theme !== 'light' 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                    : (theme === 'light' ? 'bg-gray-200/60 border-gray-300/40 text-gray-600 hover:bg-gray-200' : 'bg-white/5 border-white/5 text-gray-400')
                }`}
                aria-label="Toggle Dark Theme"
              >
                {theme !== 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span className="text-[10px] font-semibold">Dark Theme</span>
              </button>

              {/* System Sound Toggle */}
              <button 
                onClick={() => {
                  const nextVal = !soundEnabled;
                  setSoundEnabled(nextVal);
                  addNotification(
                    nextVal ? '🔊 Audio Restored' : '🔇 System Muted',
                    nextVal ? 'Retro sound cues and chirps enabled.' : 'All system sounds disabled.',
                    'info',
                    'system'
                  );
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1.5 border transition ${
                  soundEnabled 
                    ? 'bg-[#38bdf8] border-[#0ea5e9] text-black font-semibold shadow-md' 
                    : (theme === 'light' ? 'bg-gray-200/60 border-gray-300/40 text-gray-600 hover:bg-gray-200' : 'bg-white/5 border-white/5 text-gray-400')
                }`}
                aria-label="Toggle System Sounds"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="text-[10px] font-semibold">Sounds</span>
              </button>

              {/* Alerts / Do Not Disturb Toggle */}
              <button 
                onClick={() => {
                  const nextVal = !alertsEnabled;
                  setAlertsEnabled(nextVal);
                  addNotification(
                    nextVal ? '🔔 Alerts Active' : '🔕 Alerts Muted',
                    nextVal ? 'Notification alerts enabled.' : 'Notification alerts silenced.',
                    'info',
                    'system'
                  );
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 active:scale-95 transition ${
                  alertsEnabled 
                    ? 'bg-amber-600 border-amber-500 text-white shadow-md' 
                    : (theme === 'light' ? 'bg-gray-200/60 border-gray-300/40 text-gray-500 hover:bg-gray-200' : 'bg-white/5 border-white/5 text-gray-500')
                }`}
                aria-label={alertsEnabled ? "Mute notification alerts" : "Enable notification alerts"}
              >
                {alertsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                <span className="text-[10px] font-semibold text-center">{alertsEnabled ? 'Alerts On' : 'Alerts Off'}</span>
              </button>
            </div>

            {/* Sliders: Brightness and Sound Volume */}
            <div className={`space-y-4 ${theme === 'light' ? 'bg-gray-100/80 border-gray-200' : 'bg-white/5 border-white/10'} border p-4 rounded-3xl`}>
              
              {/* Brightness Slider */}
              <div className="space-y-1.5">
                <div className={`flex justify-between items-center text-[10px] font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                  <span className="flex items-center space-x-1"><Sun className="w-3.5 h-3.5 text-yellow-400" /> <span>Display Brightness</span></span>
                  <span>{Math.round(mobileBrightness * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0.15"
                  max="1.0"
                  step="0.05"
                  value={mobileBrightness}
                  onChange={(e) => setMobileBrightness(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Sound Volume Slider */}
              <div className="space-y-1.5">
                <div className={`flex justify-between items-center text-[10px] font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                  <span className="flex items-center space-x-1"><Volume2 className="w-3.5 h-3.5 text-sky-400" /> <span>System Volume</span></span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                  disabled={!soundEnabled}
                />
              </div>
            </div>

            {/* Switch to Normal View Hero Tile — positioned below System Volume box & above Notifications */}
            <button
              onClick={() => { setPortalMode('classic'); setShowMobileSettings(false); }}
              className="w-full p-3.5 rounded-2xl flex items-center justify-between border bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border-purple-500/30 text-white shadow-lg active:scale-98 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Normal Portfolio View</div>
                  <div className="text-[10px] text-purple-200/70">Switch back to classic web view</div>
                </div>
              </div>
              <span className="text-xs font-semibold px-3.5 py-1 rounded-full bg-purple-600 text-white shadow-sm">Switch →</span>
            </button>

            {/* Active System Notifications */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <span className={`text-xs font-bold ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Notifications ({notifications.length})</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className={`text-[10px] ${theme === 'light' ? 'text-purple-700 hover:text-purple-900' : 'text-gray-500 hover:text-white'} flex items-center space-x-1`}
                    aria-label="Dismiss all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> <span>Dismiss All</span>
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-gray-100 border-gray-250 text-gray-500' : 'bg-white/5 border-white/5 text-gray-500'} text-center text-xs border`}>
                    No active notifications
                  </div>
                ) : (
                  notifications.map((n) => {
                    const handleNotifClick = () => {
                      if (n.action) {
                        if (n.action.startsWith('http://') || n.action.startsWith('https://')) {
                          window.open(n.action, '_blank');
                        } else if (n.action === 'github') {
                          window.open('https://github.com/Harshit-Kandoi', '_blank');
                        } else if (n.action === 'linkedin') {
                          window.open('https://linkedin.com/in/harshit-kandoi', '_blank');
                        } else {
                          openMobileApp(n.action);
                        }
                        setShowMobileSettings(false);
                      }
                      dismissNotification(n.id);
                    };
                    return (
                      <div 
                        key={n.id}
                        onClick={handleNotifClick}
                        className={`p-3 ${theme === 'light' ? 'bg-white border-gray-200 shadow-sm text-gray-800' : 'bg-white/5 border-white/10 text-white'} border rounded-2xl flex items-start justify-between relative group hover:bg-white/10 transition cursor-pointer ${n.action ? 'hover:ring-1 hover:ring-purple-500/30' : ''}`}
                      >
                        <div className="space-y-0.5 min-w-0 pr-6">
                          <div className="flex items-center space-x-1">
                            {n.type === 'achievement' && <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                            <span className={`text-[11px] font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'} leading-tight truncate`}>{n.title}</span>
                            {n.action && <ExternalLink className="w-3 h-3 text-gray-400" />}
                          </div>
                          <p className={`text-[10px] ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} leading-normal`}>{n.message}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(n.id);
                          }}
                          className={`text-gray-500 ${theme === 'light' ? 'hover:text-red-650' : 'hover:text-red-400'} absolute top-2 right-2 text-xs`}
                          aria-label="Dismiss notification"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Settings Footer Close button */}
          <button 
            onClick={() => setShowMobileSettings(false)}
            className={`w-full py-2.5 ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-white/10 hover:bg-white/15 text-white'} active:scale-95 border border-white/10 rounded-2xl text-xs font-semibold text-center mt-4 transition`}
            aria-label="Close quick settings panel"
          >
            Close Panel
          </button>
        </div>

      {/* ================= HOMESCREEN CONTENT ================= */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerUp={(e) => handlePointerUp(e, 'home')}
        className={`flex-grow flex flex-col justify-between px-6 pt-4 pb-2 z-10 select-none ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
      >
        
        {/* HOMESCREEN WIDGETS AND APP GRID */}
        {!activeMobileApp && !showRecents ? (
          <>
            <div className="space-y-8 mt-2">
              
              {/* Material You Style Digital Clock Widget */}
              <div className={`flex flex-col items-center justify-center text-center p-6 ${theme === 'light' ? 'bg-white/70 border-white shadow-md' : 'bg-white/5 border-white/10 shadow-lg shadow-black/10'} rounded-[32px] border`}>
                <span className={`text-[44px] font-light tracking-tighter ${theme === 'light' ? 'text-gray-800' : 'text-white'} leading-none`}>
                  {formatClock}
                </span>
                <span className={`text-[10px] font-semibold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'} uppercase tracking-widest mt-1.5`}>
                  {formatDateLong}
                </span>
              </div>

              {/* Dynamic Google App Search Pill */}
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-4 top-3 ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`} />
                <input 
                  type="text"
                  placeholder="Search application grid..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className={`w-full ${theme === 'light' ? 'bg-white/75 border-gray-300 text-gray-800 placeholder-gray-500' : 'bg-white/5 border-white/10 text-white placeholder-gray-400'} pl-11 pr-4 py-2.5 rounded-full text-xs focus:outline-none focus:bg-white/10 border transition`}
                />
              </div>

              {/* Launcher App Grid (Home icons) */}
              <div className="grid grid-cols-4 gap-y-5 gap-x-3 justify-items-center pt-2">
                {filteredApps.slice(0, 12).map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleLaunchApp(app.id)}
                    className="flex flex-col items-center space-y-1 focus:outline-none transition group hover:scale-[1.05]"
                    aria-label={`Open ${app.title}`}
                  >
                    <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-md shadow-black/15 group-active:scale-95 transition-transform`}>
                      <app.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[9px] font-semibold tracking-wide ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} truncate w-14 text-center mt-1`}>
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Dock Launcher trigger */}
            <div className="pb-4 flex flex-col items-center">
              {/* App Drawer Swiper Indicator */}
              <button 
                onClick={() => setShowMobileDrawer(true)}
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition cursor-pointer mb-2"
                aria-label="Open all apps drawer"
              >
                <div className={`w-8 h-1 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/25'} rounded-full animate-bounce`} />
                <span className={`text-[8px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>All Apps</span>
              </button>

              {/* Standard Dock Apps */}
              <div className={`w-[90%] mx-auto ${theme === 'light' ? 'bg-white/75 border-white shadow-lg' : 'bg-white/10 border-white/10 shadow-lg'} backdrop-blur-xl border p-2 rounded-[24px] flex justify-around items-center`}>
                {appIcons.filter(a => ['about', 'ai', 'projects', 'settings'].includes(a.id)).map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleLaunchApp(app.id)}
                    className="flex flex-col items-center transition hover:scale-[1.1] active:scale-90"
                    title={app.title}
                    aria-label={`Open ${app.title}`}
                  >
                    <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-sm`}>
                      <app.icon className="w-6 h-6" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {/* ================= RECENTS TASK CAROUSEL SWITCHER ================= */}
        {showRecents && !activeMobileApp && (
          <div className="flex-grow flex flex-col justify-between pt-6 pb-2 animate-fade-in h-full overflow-hidden relative">
            <div className="w-full flex flex-col items-center justify-center text-center px-4">
              <span className={`text-xs font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'} uppercase tracking-widest block text-center`}>Active Background Apps</span>
              <p className={`text-[10px] ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} mt-1 text-center w-full`}>
                {mobileRecents.length > 0 
                  ? 'Click Dismiss to close apps. Tap a card to resume.' 
                  : 'Your background task switcher is empty'}
              </p>
            </div>

            {mobileRecents.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2 flex-grow my-auto">
                <div className={`w-16 h-16 rounded-full ${theme === 'light' ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white/5 border-white/10 text-gray-500'} border flex items-center justify-center shadow-inner mb-1`}>
                  ■
                </div>
                <span className={`text-sm ${theme === 'light' ? 'text-gray-800' : 'text-white'} font-bold`}>No recent apps running</span>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center my-auto w-full">
                <div className="relative w-full flex items-center justify-center group">
                
                {/* Left Arrow Button */}
                <button
                  onClick={() => scrollRecents('left')}
                  disabled={!canScrollLeft}
                  className={`absolute left-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    theme === 'light' 
                      ? 'bg-white/90 text-gray-800 shadow-md border border-gray-200' 
                      : 'bg-black/70 text-white shadow-lg border border-white/15'
                  } ${
                    canScrollLeft 
                      ? 'opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer' 
                      : 'opacity-0 pointer-events-none'
                  }`}
                  aria-label="Scroll left in recent apps"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Carousel cards container */}
                <div 
                  ref={recentsRef}
                  onScroll={checkRecentsScroll}
                  className="flex items-center space-x-4 overflow-x-auto py-2 px-6 max-w-full scroll-smooth no-scrollbar"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {mobileRecents.map((appId) => {
                    const appMeta = appIcons.find(a => a.id === appId);
                    if (!appMeta) return null;
                    return (
                      <div 
                        key={appId}
                        className={`w-48 h-72 flex-shrink-0 ${theme === 'light' ? 'bg-white border-gray-200 text-gray-800 shadow-md' : 'bg-slate-900 border-white/15 text-white'} border rounded-3xl p-3 flex flex-col justify-between shadow-2xl relative transition hover:border-purple-500/50`}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${appMeta.color} text-white`}>
                              <appMeta.icon className="w-3.5 h-3.5" />
                            </div>
                            <span className={`text-[10px] font-bold truncate w-24 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{appMeta.title}</span>
                          </div>
                          <button 
                            onClick={() => closeMobileApp(appId)}
                            className={`text-[10px] ${theme === 'light' ? 'text-red-700 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200' : 'text-red-400 bg-red-950/20 hover:bg-red-500 hover:text-white'} px-2 py-0.5 rounded-full transition`}
                            aria-label={`Dismiss ${appMeta?.title}`}
                          >
                            Dismiss
                          </button>
                        </div>

                        {/* Mock Screen Content Preview */}
                        <div 
                          onClick={() => handleLaunchApp(appId)}
                          className={`flex-grow mt-3 rounded-xl ${theme === 'light' ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800' : 'bg-slate-950/50 border-white/5 text-purple-100 hover:bg-slate-950/70'} border flex items-center justify-center cursor-pointer transition overflow-hidden`}
                        >
                          <div className="text-center p-3 space-y-1">
                             <appMeta.icon className="w-8 h-8 mx-auto opacity-40 text-purple-400" />
                            <span className={`text-[9px] ${theme === 'light' ? 'text-gray-650' : 'text-gray-500'} block uppercase tracking-wide`}>Tap to Resume</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Arrow Button */}
                <button
                  onClick={() => scrollRecents('right')}
                  disabled={!canScrollRight}
                  className={`absolute right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    theme === 'light' 
                      ? 'bg-white/90 text-gray-800 shadow-md border border-gray-200' 
                      : 'bg-black/70 text-white shadow-lg border border-white/15'
                  } ${
                    canScrollRight 
                      ? 'opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer' 
                      : 'opacity-0 pointer-events-none'
                  }`}
                  aria-label="Scroll right in recent apps"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

            {/* Page Dots Indicator */}
            {mobileRecents.length > 1 && (
              <div className="flex items-center justify-center space-x-1.5 my-1">
                {mobileRecents.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeRecentIdx === idx 
                        ? 'w-4 bg-purple-500' 
                        : theme === 'light' ? 'w-1.5 bg-gray-300' : 'w-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Clear All Actions */}
            {mobileRecents.length > 0 && (
              <button
                onClick={clearMobileRecents}
                className={`w-fit self-center py-2 px-6 ${theme === 'light' ? 'bg-red-100 hover:bg-red-600 hover:text-white text-red-700 border-red-200' : 'bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white'} border font-semibold rounded-full tracking-wide transition active:scale-95 shadow-md text-xs mt-1`}
                aria-label="Clear all recent apps"
              >
                Clear All Apps
              </button>
            )}
          </div>
        )}

        {/* ================= FULLSCREEN PORTRAIT APP VIEWER ================= */}
        {activeMobileApp && !showRecents && (
          <div 
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className={`absolute inset-x-0 top-9 bottom-[54px] ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-slate-950 text-white'} z-[40] flex flex-col overflow-hidden animate-slide-up`}
          >
            
            {/* App Action Bar (Header) */}
            <div className={`h-11 w-full ${theme === 'light' ? 'bg-gray-100 border-b border-gray-200 text-gray-800' : 'bg-slate-900 border-b border-white/10 text-white'} px-4 flex items-center justify-between shrink-0 select-none z-[45]`}>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => closeMobileApp(activeMobileApp)}
                  className={`p-1 rounded-lg ${theme === 'light' ? 'hover:bg-gray-200 text-gray-700' : 'hover:bg-white/10 text-gray-300'} transition flex items-center space-x-1`}
                  aria-label="Back to home"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold tracking-wide">
                  {appIcons.find(a => a.id === activeMobileApp)?.title}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Simulated App Options or Actions */}
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" title="App active" />
              </div>
            </div>

            {/* Render app contents scrollable */}
            <div className="flex-grow w-full h-full overflow-hidden relative flex flex-col">
              {renderAppContent(activeMobileApp)}
            </div>
          </div>
        )}

        {/* ================= ALL APP LAUNCHER / DRAWER SCREEN ================= */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerUp={(e) => handlePointerUp(e, 'drawer')}
          className={`absolute inset-0 ${
            theme === 'light' ? 'bg-[#f4f7f6] border-r border-gray-250 text-gray-800' : 'bg-slate-950 text-white'
          } z-[550] flex flex-col justify-between px-6 pt-10 pb-16 transition-transform duration-300 ease-out ${
            showMobileDrawer ? 'translate-y-0 pointer-events-auto opacity-100' : 'translate-y-full pointer-events-none opacity-0 invisible'
          }`}
        >
          <div className="space-y-5 flex-grow flex flex-col overflow-hidden">
            
            {/* Drawer search header */}
            <div className={`flex items-center justify-between pb-2 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}>All Applications</span>
              <button 
                onClick={() => setShowMobileDrawer(false)}
                className={`text-xs ${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-555 hover:text-white'}`}
              >
                ✕ Close
              </button>
            </div>

            {/* Drawer Search Field */}
            <div className="relative">
              <Search className={`w-4 h-4 absolute left-4 top-3 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
              <input 
                type="text"
                placeholder="Search drawer..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className={`w-full ${theme === 'light' ? 'bg-white/75 border-gray-300 text-gray-800 placeholder-gray-500' : 'bg-white/5 border-white/10 text-white placeholder-gray-400'} pl-11 pr-4 py-2.5 rounded-full text-xs focus:outline-none focus:bg-white/10 border transition`}
              />
            </div>

            {/* Launcher scrolling grid */}
            <div className="flex-grow overflow-y-auto pr-1">
              <div className="grid grid-cols-4 gap-y-5 gap-x-2 pt-2">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleLaunchApp(app.id)}
                    className="flex flex-col items-center space-y-1.5 focus:outline-none transition group"
                  >
                    <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-md group-active:scale-90 transition-transform`}>
                      <app.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[9px] font-semibold tracking-wide ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} truncate w-14 text-center mt-1`}>
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowMobileDrawer(false)}
            className={`w-full py-2.5 ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-white/10 hover:bg-white/15 text-white'} border border-white/10 rounded-2xl text-xs font-semibold text-center mt-3 transition`}
          >
            Back to Home
          </button>
        </div>

      </div>

      {/* ================= SYSTEM NAVIGATION BUTTONS ================= */}
      <div className={`w-[90%] mx-auto mb-2.5 h-11 rounded-full flex items-center justify-around px-4 border ${
        theme === 'light' 
          ? 'border-gray-200/80 bg-white/85 text-gray-700 shadow-md' 
          : 'border-white/15 bg-[#0c0d14]/90 text-gray-300 shadow-xl'
      } backdrop-blur-2xl shrink-0 z-[600]`}>
        {/* BACK: Triangle */}
        <button 
          onClick={handleBackKey}
          className={`p-2 ${theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'} active:scale-90 transition-transform flex items-center justify-center w-9 h-9`}
          title="Back"
        >
          <div className="w-0 h-0 border-t-[4.5px] border-t-transparent border-r-[9px] border-r-current border-b-[4.5px] border-b-transparent" />
        </button>

        {/* HOME: Circle */}
        <button 
          onClick={handleHomeKey}
          className={`p-2 ${theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'} active:scale-90 transition-transform flex items-center justify-center w-9 h-9`}
          title="Home"
        >
          <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
        </button>

        {/* RECENTS: Square */}
        <button 
          onClick={handleRecentsKey}
          className={`p-2 ${theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'} active:scale-90 transition-transform flex items-center justify-center w-9 h-9`}
          title="Recents"
        >
          <div className="w-3.5 h-3.5 border-2 border-current rounded-sm" />
        </button>
      </div>

    </div>
  );
}
