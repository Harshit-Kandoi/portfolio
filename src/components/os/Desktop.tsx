import { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { useOSStore, AppTheme } from '../../store/useOSStore';
import { 
  Folder, Terminal as TermIcon, MessageSquare, BookOpen, Trophy, 
  Settings as GearIcon, User, Briefcase, Award, FileText, Send, 
  Search, Cpu, HardDrive, Wifi, Volume2, Bell, LogOut, Moon, Sun, 
  Gamepad2, Github, Linkedin, Smartphone, Mail, Phone, Database,
  Coffee, Heart, BookMarked, StickyNote, /* Image as ImageIcon, */ Package,
  LayoutTemplate
} from 'lucide-react';

import Window from './Window';
import NotificationPanel from './NotificationPanel';
import DashboardWidgets from './DashboardWidgets';
import { playWindowSound, playNotificationSound } from '../../utils/sounds';
import { SYSTEM_NOTIFICATION_POOL } from '../../data/notifications';


// Custom Snake Icon SVG
const SnakeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8.5 10c-1.5-1.5-2.5-2.5-2.5-4a4 4 0 1 1 8 0v4a4 4 0 0 0 8 0V6" />
    <path d="M12 12c1.5 1.5 2.5 2.5 2.5 4a4 4 0 1 1-8 0v-4a4 4 0 0 0-8 0v2" />
    <circle cx="10" cy="4" r="1" fill="currentColor" />
  </svg>
);

// Lazy load app modules to reduce initial JS bundle size and improve SEO / LCP metrics
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


export default function Desktop() {
  const { 
    windows, theme, setTheme, openWindow, startMenuOpen, setStartMenuOpen,
    notifications, addNotification, closeAllWindows, setBootState,
    viewMode, isSimulatingMobile, setIsSimulatingMobile, xp,
    hasVisited, isShuttingDown, initiateShutdown, setPortalMode,
  } = useOSStore();
  const welcomeNotifSent = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [cpuUsage, setCpuUsage] = useState(24);
  const [ramUsage, setRamUsage] = useState(48);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [sysTime, setSysTime] = useState(new Date());

  const [bouncingApp, setBouncingApp] = useState<string | null>(null);
  const [shutdownStep, setShutdownStep] = useState(0);

  const SHUTDOWN_LINES = [
    'Shutting down Portfolio OS...',
    'Saving visitor progress...',
    'Closing active sessions...',
    'Thanks for exploring.',
    'Hope to work with you soon.',
    'System halted.',
  ];

  // Update clocks and system monitors
  useEffect(() => {
    const clockTimer = setInterval(() => setSysTime(new Date()), 1000);
    const cpuTimer = setInterval(() => {
      setCpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(10, Math.min(90, prev + delta));
      });
      setRamUsage((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(30, Math.min(85, prev + delta));
      });
    }, 4000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(cpuTimer);
    };
  }, []);

  // Keyboard Navigation / Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes focused window
      if (e.key === 'Escape') {
        const activeId = useOSStore.getState().activeWindowId;
        if (activeId) {
          e.preventDefault();
          useOSStore.getState().closeWindow(activeId);
        }
      }
      // Alt + T opens Terminal
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        useOSStore.getState().openWindow('terminal');
      }
      // Alt + S opens Settings
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        useOSStore.getState().openWindow('settings');
      }
      // Alt + Tab cycles windows
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        const openWins = useOSStore.getState().windows.filter(w => w.isOpen);
        if (openWins.length > 1) {
          const activeId = useOSStore.getState().activeWindowId;
          const currentIdx = openWins.findIndex(w => w.id === activeId);
          const nextIdx = (currentIdx + 1) % openWins.length;
          useOSStore.getState().focusWindow(openWins[nextIdx].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Konami Code easter egg
  useEffect(() => {
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let progress: string[] = [];
    const handleKonami = (e: KeyboardEvent) => {
      if (e.key === KONAMI[progress.length]) {
        progress = [...progress, e.key];
        if (progress.length === KONAMI.length) {
          progress = [];
          addNotification('🔓 Developer Mode Unlocked', 'Welcome, engineer. You found the Konami Code. XP +999.', 'success', 'system');
          playNotificationSound();
        }
      } else {
        progress = e.key === KONAMI[0] ? [e.key] : [];
      }
    };
    window.addEventListener('keydown', handleKonami);
    return () => window.removeEventListener('keydown', handleKonami);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Welcome-back notification for returning visitors
  useEffect(() => {
    if (welcomeNotifSent.current) return;
    welcomeNotifSent.current = true;
    if (hasVisited) {
      setTimeout(() => {
        addNotification('👋 Welcome Back!', 'Continuing your previous session...', 'info', 'system');
        playNotificationSound();
      }, 1500);
    } else {
      setTimeout(() => {
        addNotification('🚀 Welcome to Portfolio OS!', "You're exploring Harshit Kandoi's interactive developer portfolio.", 'info', 'system');
        playNotificationSound();
      }, 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shutdown sequence animator
  useEffect(() => {
    if (!isShuttingDown) return;
    let step = 0;
    setShutdownStep(0);
    const interval = setInterval(() => {
      step++;
      setShutdownStep(step);
      if (step >= SHUTDOWN_LINES.length) {
        clearInterval(interval);
        setTimeout(() => {
          closeAllWindows();
          setBootState('powered_off');
        }, 900);
      }
    }, 600);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShuttingDown]);

  // Ref for non-repeating notification queue
  const notificationQueueRef = useRef<number[]>([]);

  // Dispatch non-repeating toast notifications from SYSTEM_NOTIFICATION_POOL every 45s
  useEffect(() => {
    const getNextNotificationIndex = () => {
      if (notificationQueueRef.current.length === 0) {
        const indices = Array.from({ length: SYSTEM_NOTIFICATION_POOL.length }, (_, i) => i);
        // Fisher-Yates Shuffle
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        notificationQueueRef.current = indices;
      }
      return notificationQueueRef.current.pop()!;
    };

    const interval = setInterval(() => {
      const idx = getNextNotificationIndex();
      const selected = SYSTEM_NOTIFICATION_POOL[idx];
      if (selected) {
        addNotification(selected.title, selected.message, selected.type, selected.category, selected.action);
        playNotificationSound();
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [addNotification]);

  const handleIconDoubleClick = (id: string) => {
    playWindowSound('open');
    openWindow(id);
  };

  const handleThemeToggle = () => {
    const nextTheme: AppTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    playWindowSound('open');
  };

  const handleDockClick = (id: string) => {
    setBouncingApp(id);
    setTimeout(() => setBouncingApp(null), 800);

    const { windows, activeWindowId, openWindow, minimizeWindow, restoreWindow } = useOSStore.getState();
    const win = windows.find((w) => w.id === id);

    if (win?.isOpen) {
      if (activeWindowId === id) {
        playWindowSound('minimize');
        minimizeWindow(id);
      } else {
        playWindowSound('open');
        restoreWindow(id);
      }
    } else {
      playWindowSound('open');
      openWindow(id);
    }
  };

  const appIcons = [
    { id: 'about',        title: 'About.exe',        icon: User,          color: 'from-blue-500 to-cyan-400'     },
    { id: 'projects',     title: 'Projects.exe',     icon: Folder,        color: 'from-purple-500 to-indigo-500' },
    { id: 'experience',   title: 'Experience.exe',   icon: Briefcase,     color: 'from-emerald-500 to-teal-500' },
    { id: 'skills',       title: 'Skills.exe',       icon: Award,         color: 'from-amber-500 to-orange-500' },
    { id: 'resume',       title: 'Resume.pdf',       icon: FileText,      color: 'from-rose-500 to-red-500'     },
    { id: 'terminal',     title: 'Terminal.exe',     icon: TermIcon,      color: 'from-slate-700 to-slate-900'  },
    { id: 'ai',           title: 'Chatbot.exe',     icon: MessageSquare, color: 'from-pink-500 to-rose-400'    },
    { id: 'blog',         title: 'Blog.exe',         icon: BookOpen,      color: 'from-sky-500 to-blue-600'     },
    { id: 'achievements', title: 'Certifications.exe', icon: Award, color: 'from-yellow-400 to-amber-500' },
    { id: 'gaming',       title: 'Gaming.exe',       icon: Gamepad2,      color: 'from-red-500 to-pink-500'     },
    { id: 'contact',      title: 'Contact.exe',      icon: Send,          color: 'from-teal-400 to-emerald-500' },
    { id: 'settings',     title: 'Settings.exe',     icon: GearIcon,      color: 'from-slate-400 to-slate-600'  },
    { id: 'snake',        title: 'Snake.exe',        icon: SnakeIcon,     color: 'from-green-500 to-emerald-700' },
    { id: 'swipe',        title: 'Swipe.exe',        icon: Heart,         color: 'from-rose-500 to-red-600'     },
    { id: 'coffee',       title: 'Coffee.exe',       icon: Coffee,        color: 'from-amber-600 to-yellow-700' },
    // Phase 3 New Apps
    { id: 'library',      title: 'Library.exe',      icon: BookMarked,    color: 'from-amber-500 to-orange-400' },
    { id: 'notes',        title: 'Notes.exe',        icon: StickyNote,    color: 'from-violet-500 to-purple-600'},
    // { id: 'gallery',      title: 'Gallery.exe',      icon: ImageIcon,     color: 'from-pink-500 to-rose-500'    },
    { id: 'products',     title: 'Products.exe',     icon: Package,       color: 'from-violet-600 to-indigo-600'},
    // { id: 'publications', title: 'Papers.exe',        icon: BookMarked,    color: 'from-green-500 to-emerald-600'},
    // { id: 'marketplace',  title: 'Store.exe',        icon: ShoppingBag,   color: 'from-rose-500 to-pink-600'    },
  ];


  // Filters search query for App icons
  const filteredApps = searchQuery 
    ? appIcons.filter(app => app.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : appIcons;

  const formattedTime = sysTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = sysTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Handle system powers
  const handleShutdown = () => {
    initiateShutdown();
  };

  const handleSleep = () => {
    setBootState('locked');
  };

  // Base Theme Configurations
  let shellTheme = 'text-white';
  let barBg = 'bg-black/40 backdrop-blur-xl border-white/10';
  let cardBg = 'bg-white/10 border-white/10 text-white';

  if (theme === 'light') {
    shellTheme = 'text-gray-900';
    barBg = 'bg-white/85 backdrop-blur-2xl border-gray-200 shadow-md text-gray-900';
    cardBg = 'bg-white/90 border-gray-200 text-gray-900 shadow-xl';
  } else if (theme === 'dark') {
    barBg = 'bg-gray-950/70 backdrop-blur-xl border-gray-800/80';
    cardBg = 'bg-gray-900/80 border-gray-800/80 text-gray-100';
  } else if (theme === 'cyberpunk') {
    shellTheme = 'text-yellow-400 font-mono';
    barBg = 'bg-black border-b border-yellow-400';
    cardBg = 'bg-black border border-yellow-400 text-yellow-400';
  } else if (theme === 'retro') {
    shellTheme = 'text-green-500 font-mono';
    barBg = 'bg-black border-b border-green-500';
    cardBg = 'bg-black border border-green-500 text-green-500';
  }

  const handleDesktopClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isStartMenuClick = target.closest('#start-menu-button') || target.closest('#start-menu');
    const isNotificationClick = target.closest('#notification-button') || target.closest('#notification-drawer');
    const isVolumeClick = target.closest('#volume-button') || target.closest('#volume-popup');
    const isDashboardClick = target.closest('#dashboard-button') || target.closest('#dashboard-widgets');
    
    if (!isStartMenuClick && startMenuOpen) setStartMenuOpen(false);
    if (!isNotificationClick && showNotificationDrawer) setShowNotificationDrawer(false);
    if (!isVolumeClick && showVolumePopup) setShowVolumePopup(false);
    if (!isDashboardClick && showDashboard) setShowDashboard(false);

  };

  return (
    <div 
      onClick={handleDesktopClick}
      className={`fixed inset-0 select-none overflow-hidden flex flex-col h-screen w-screen font-sans ${shellTheme}`}
    >
      
      {/* Top Taskbar */}
      <div className={`h-12 w-full flex items-center justify-between border-b z-[9995] ${barBg} ${
        viewMode === 'tablet' ? 'px-6' : 'px-4'
      }`}>
        <div className="flex items-center space-x-4">
          {/* Start Menu Button */}
          <button
            id="start-menu-button"
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
              theme === 'cyberpunk' 
                ? 'bg-yellow-400 text-black hover:bg-yellow-500 font-bold' 
                : theme === 'retro'
                  ? 'bg-green-500 text-black hover:bg-green-600 font-bold'
                  : theme === 'light'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-sm font-bold'
                    : 'bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
            aria-label={startMenuOpen ? "Close start menu" : "Open start menu"}
          >
            <div className="flex flex-wrap w-4 h-4 justify-between content-between gap-0.5">
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
            </div>
            <span className="text-xs font-bold tracking-wide">Menu</span>
          </button>

          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${theme === 'light' ? 'text-gray-500' : 'opacity-60'}`} />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-1.5 rounded-lg text-xs w-48 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition ${
                theme === 'light' 
                  ? 'bg-white text-gray-900 border border-gray-300 placeholder-gray-500 shadow-inner' 
                  : 'bg-white/5 border border-white/15 placeholder-gray-400 text-white'
              }`}
            />
          </div>
        </div>

        {/* System Info & Widgets Tray */}
        <div className="flex items-center space-x-4">

          {/* Dashboard Widget Toggle */}
          <button
            id="dashboard-button"
            onClick={() => setShowDashboard(!showDashboard)}
            className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-xs border transition-all ${
              showDashboard
                ? theme === 'light' ? 'bg-purple-600 border-purple-600 text-white shadow-sm font-bold' : 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                : theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800 font-semibold' : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
            aria-label={showDashboard ? 'Close dashboard' : 'Open dashboard'}
            title="Dashboard"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Dashboard</span>
          </button>
          
          {/* Normal Portfolio Button */}
          <button
            onClick={() => setPortalMode('classic')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
              theme === 'light'
                ? 'bg-purple-100 text-purple-950 border border-purple-300 hover:bg-purple-200 shadow-sm'
                : 'bg-white/10 text-purple-300 border border-purple-500/40 hover:bg-white/15 hover:border-purple-400/60 shadow-sm'
            }`}
            title="Switch to Normal Portfolio View"
            aria-label="Switch to Classic Portfolio View"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-purple-400" />
            <span>Normal Portfolio</span>
          </button>
          
          {/* Socials Shortcuts Tray */}
          <div className={`hidden lg:flex items-center space-x-3 border-l pl-4 ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
            {/* GitHub */}
            <a href="https://github.com/Harshit-Kandoi" target="_blank" rel="noopener noreferrer" className={`hover:scale-115 active:scale-95 transition-all relative group ${theme === 'light' ? 'text-purple-700 hover:text-purple-900' : 'text-purple-300'}`} title="GitHub">
              <Github className="w-4 h-4" />
              <span className={`absolute bottom-[-32px] left-1/2 -translate-x-1/2 px-2 py-1 text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap z-[10005] ${theme === 'light' ? 'bg-white border border-gray-300 text-gray-900 shadow-md' : 'bg-slate-900 border border-gray-800 text-white'}`}>GitHub</span>
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com/in/harshit-kandoi" target="_blank" rel="noopener noreferrer" className={`hover:scale-115 active:scale-95 transition-all relative group ${theme === 'light' ? 'text-blue-700 hover:text-blue-900' : 'text-blue-400'}`} title="LinkedIn">
              <Linkedin className="w-4 h-4" />
              <span className={`absolute bottom-[-32px] left-1/2 -translate-x-1/2 px-2 py-1 text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap z-[10005] ${theme === 'light' ? 'bg-white border border-gray-300 text-gray-900 shadow-md' : 'bg-slate-900 border border-gray-800 text-white'}`}>LinkedIn</span>
            </a>
            {/* Gmail */}
            <a href="mailto:kandoiharshitsdlp@gmail.com" className={`hover:scale-115 active:scale-95 transition-all relative group ${theme === 'light' ? 'text-rose-600 hover:text-rose-800' : 'text-rose-400'}`} title="Gmail">
              <Mail className="w-4 h-4" />
              <span className={`absolute bottom-[-32px] left-1/2 -translate-x-1/2 px-2 py-1 text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap z-[10005] ${theme === 'light' ? 'bg-white border border-gray-300 text-gray-900 shadow-md' : 'bg-slate-900 border border-gray-800 text-white'}`}>Gmail</span>
            </a>
            {/* Phone */}
            <a href="tel:+917850098453" className={`hover:scale-115 active:scale-95 transition-all relative group ${theme === 'light' ? 'text-emerald-700 hover:text-emerald-900' : 'text-emerald-400'}`} title="Phone">
              <Phone className="w-4 h-4" />
              <span className={`absolute bottom-[-32px] left-1/2 -translate-x-1/2 px-2 py-1 text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap z-[10005] ${theme === 'light' ? 'bg-white border border-gray-300 text-gray-900 shadow-md' : 'bg-slate-900 border border-gray-800 text-white'}`}>Phone</span>
            </a>
            {/* Medium */}
            <a href="https://medium.com/@kandoiharshitsdlp" target="_blank" rel="noopener noreferrer" className={`hover:scale-115 active:scale-95 transition-all relative group ${theme === 'light' ? 'text-cyan-700 hover:text-cyan-900' : 'text-cyan-400'}`} title="Medium">
              <BookOpen className="w-4 h-4" />
              <span className={`absolute bottom-[-32px] left-1/2 -translate-x-1/2 px-2 py-1 text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap z-[10005] ${theme === 'light' ? 'bg-white border border-gray-300 text-gray-900 shadow-md' : 'bg-slate-900 border border-gray-800 text-white'}`}>Medium</span>
            </a>
            {/* Kaggle */}
            <a href="https://kaggle.com/harshitkandoi" target="_blank" rel="noopener noreferrer" className={`hover:scale-115 active:scale-95 transition-all relative group ${theme === 'light' ? 'text-amber-700 hover:text-amber-900' : 'text-amber-400'}`} title="Kaggle">
              <Database className="w-4 h-4" />
              <span className={`absolute bottom-[-32px] left-1/2 -translate-x-1/2 px-2 py-1 text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap z-[10005] ${theme === 'light' ? 'bg-white border border-gray-300 text-gray-900 shadow-md' : 'bg-slate-900 border border-gray-800 text-white'}`}>Kaggle</span>
            </a>
          </div>

          {/* WiFi & Sound */}
          <div className={`flex items-center space-x-2 border-l pl-4 ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
            {(viewMode === 'desktop' || viewMode === 'tablet') && (
              <button 
                onClick={() => setIsSimulatingMobile(!isSimulatingMobile)} 
                className={`p-1 rounded-md transition hover:scale-105 active:scale-95 ${
                  isSimulatingMobile
                    ? 'bg-purple-600 border border-purple-600 text-white shadow-xs'
                    : theme === 'light'
                      ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/80'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle Android OS Simulator"
                aria-label="Toggle Android OS simulator"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => { playWindowSound('open'); openWindow('settings'); }} 
              className={`p-1 rounded-md transition hover:scale-105 active:scale-95 ${
                theme === 'light' ? 'text-purple-700 hover:bg-gray-200/80' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Open Settings (Alt+S)"
              aria-label="Open Settings"
            >
              <GearIcon className={`w-4 h-4 hover:rotate-90 transition-transform duration-300 ${theme === 'light' ? 'text-purple-700' : 'text-purple-400'}`} />
            </button>

            <button 
              onClick={handleThemeToggle} 
              className={`p-1 rounded-md transition hover:scale-105 active:scale-95 ${
                theme === 'light' ? 'text-indigo-700 hover:bg-gray-200/80' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme mode"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            </button>
            <Wifi className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            
            <button id="volume-button" onClick={() => setShowVolumePopup(!showVolumePopup)} className="hover:opacity-80 transition relative" aria-label={showVolumePopup ? "Close volume controls" : "Open volume controls"}>
              <Volume2 className={`w-4 h-4 ${theme === 'light' ? 'text-sky-600' : 'text-sky-400'}`} />
              {showVolumePopup && (
                <div id="volume-popup" className={`absolute right-0 top-6 p-3 rounded-lg shadow-xl w-32 flex flex-col z-[10000] ${
                  theme === 'light' ? 'bg-white border border-gray-200 text-gray-900 shadow-2xl' : 'bg-slate-900 border border-gray-800 text-white'
                }`}>
                  <span className={`text-[10px] mb-1 font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Volume Control</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={useOSStore.getState().volume}
                    onChange={(e) => useOSStore.getState().setVolume(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <label className="flex items-center space-x-1 mt-2 text-[10px]">
                    <input
                      type="checkbox"
                      checked={useOSStore.getState().soundEnabled}
                      onChange={(e) => useOSStore.getState().setSoundEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span>Sound Effects</span>
                  </label>
                </div>
              )}
            </button>
            
            {/* Notification Count Trigger */}
            <button 
              id="notification-button"
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)} 
              className="hover:opacity-80 transition relative"
              aria-label={showNotificationDrawer ? "Close notifications panel" : "Open notifications panel"}
            >
              <Bell className={`w-4 h-4 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[8px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Date & Time */}
          <div className={`flex flex-col items-end border-l pl-4 text-right ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
            <span className={`text-xs font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{formattedTime}</span>
            <span className={`text-[9px] font-semibold uppercase hidden sm:inline ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{formattedDate}</span>
          </div>
        </div>
      </div>
      {/* Start Menu Popup */}
      {startMenuOpen && (
        <div id="start-menu" className={`fixed border shadow-2xl z-[10000] ${cardBg} backdrop-blur-3xl flex flex-col space-y-4 animate-slide-up transition-all duration-300 ${
          viewMode === 'tablet'
            ? 'left-6 top-14 w-[85vw] max-w-md p-8 rounded-3xl'
            : 'left-4 top-14 w-80 p-6 rounded-2xl'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-purple-500 to-indigo-500 border border-white/20 flex items-center justify-center shrink-0">
                <img src="/profile.webp" alt="HK" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xs font-bold">Harshit Kandoi</h3>
                <p className="text-[10px] text-gray-400">Level {Math.floor(xp / 100) + 1} Code Warrior</p>
              </div>
            </div>
            <button
              onClick={() => {
                handleIconDoubleClick('settings');
                setStartMenuOpen(false);
              }}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
              title="Open Settings"
              aria-label="Open Settings"
            >
              <GearIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className={`grid gap-2 text-xs ${viewMode === 'tablet' ? 'grid-cols-2 text-sm gap-3' : 'grid-cols-2'}`}>
            {appIcons.slice(0, 8).map((app) => (
              <button
                key={app.id}
                onClick={() => handleIconDoubleClick(app.id)}
                className={`flex items-center p-2 rounded-xl hover:bg-white/5 transition text-left ${
                  viewMode === 'tablet' ? 'space-x-3.5' : 'space-x-2.5'
                }`}
                aria-label={`Open ${app.title.replace('.exe', '')} from start menu`}
              >
                <div className={`rounded-lg bg-gradient-to-br ${app.color} text-white ${
                  viewMode === 'tablet' ? 'p-2' : 'p-1.5'
                }`}>
                  <app.icon className={`${viewMode === 'tablet' ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
                </div>
                <span className="font-medium truncate">{app.title.replace('.exe', '')}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/10 dark:border-gray-800 text-[10px] text-gray-400">
            <button onClick={handleSleep} className="flex items-center space-x-1.5 hover:text-white transition" aria-label="Put system to sleep">
              <Moon className="w-3.5 h-3.5" />
              <span>Sleep</span>
            </button>
            <button onClick={handleShutdown} className="flex items-center space-x-1.5 hover:text-red-400 transition" aria-label="Shut down system">
              <LogOut className="w-3.5 h-3.5" />
              <span>Power Off</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications Side Drawer – delegated to NotificationPanel */}
      {showNotificationDrawer && (
        <NotificationPanel onClose={() => setShowNotificationDrawer(false)} />
      )}

      {/* Dashboard Widgets Panel */}
      {showDashboard && (
        <DashboardWidgets onClose={() => setShowDashboard(false)} />
      )}

      {/* Active Workspaces - Icons on Desktop / Tablet */}
      <div className={`flex-grow p-6 z-10 select-none overflow-y-auto mt-4 ${
        viewMode === 'tablet' 
          ? 'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-6 justify-items-start justify-start content-start max-h-[calc(100vh-160px)]' 
          : 'grid grid-flow-col auto-cols-max grid-rows-[repeat(auto-fill,96px)] gap-4 max-h-[calc(100vh-112px)]'
      }`}>
        {filteredApps.map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => handleIconDoubleClick(app.id)}
            onTouchEnd={() => handleIconDoubleClick(app.id)} // Mobile-friendly trigger
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleIconDoubleClick(app.id);
              }
            }}
            className={`flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all select-none group text-center w-24 h-24 ${
              theme === 'light' ? 'hover:bg-black/5 hover:border-black/10' : 'hover:bg-white/5 hover:border-white/10'
            } border border-transparent active:scale-95`}
            aria-label={`Open ${app.title.replace('.exe', '')} from desktop`}
            title={app.title}
          >
            <div className={`rounded-2xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform w-12 h-12`}>
              <app.icon className="w-6 h-6" />
            </div>
            <span className={`text-[10px] tracking-wide mt-1.5 truncate block max-w-full px-1.5 py-0.5 rounded-md ${
              theme === 'light' 
                ? 'text-slate-900 bg-white/90 shadow-xs border border-slate-200/90 font-bold backdrop-blur-xs' 
                : 'text-gray-100 font-medium text-shadow'
            }`}>
              {app.title}
            </span>
          </button>
        ))}
      </div>

      {/* Active Windows Layer */}
      {windows.map((win) => (
        <Window key={win.id} id={win.id} title={win.title}>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
              <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-xs text-purple-300 font-mono animate-pulse">Launching {win.title}...</p>
            </div>
          }>
            {win.id === 'about'        && <AboutApp />}
            {win.id === 'projects'     && <ProjectsApp />}
            {win.id === 'experience'   && <ExperienceApp />}
            {win.id === 'skills'       && <SkillsApp />}
            {win.id === 'resume'       && <ResumeApp />}
            {win.id === 'terminal'     && <TerminalWindow />}
            {win.id === 'ai'           && <AIAssistantApp />}
            {win.id === 'blog'         && <BlogApp />}
            {win.id === 'achievements' && <AchievementsApp />}
            {win.id === 'gaming'       && <GamingApp />}
            {win.id === 'contact'      && <ContactApp />}
            {win.id === 'settings'     && <SettingsApp />}
            {win.id === 'snake'        && <SnakeGame />}
            {win.id === 'swipe'        && <PortfolioSwipe />}
            {win.id === 'coffee'       && <BuyMeCoffeeApp />}
            {/* Phase 3 New Apps */}
            {win.id === 'library'      && <LibraryApp />}
            {win.id === 'notes'        && <NotesApp />}
            {/* {win.id === 'gallery'      && <GalleryApp />} */}
            {win.id === 'products'     && <ProductsApp />}
            {/* {win.id === 'publications' && <PublicationsApp />} */}
            {/* {win.id === 'marketplace'  && <MarketplaceApp />} */}
          </Suspense>
        </Window>
      ))}

      {/* Bottom Dock */}
      <div className={`absolute left-1/2 transform -translate-x-1/2 z-[9990] flex items-end bg-black/35 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl transition-all duration-300 ${
        viewMode === 'tablet' 
          ? 'bottom-6 px-8 py-3 space-x-6' 
          : 'bottom-4 px-4 py-2.5 space-x-3.5'
      }`}>
        {appIcons.filter((app) => {
          if (viewMode === 'tablet') {
            return ['about', 'projects', 'experience', 'skills', 'resume', 'ai', 'contact', 'settings', 'swipe', 'coffee'].includes(app.id);
          }
          return true;
        }).map((app) => {
          const win = windows.find((w) => w.id === app.id);
          const isRunning = win?.isOpen;
          const isCurrentActive = useOSStore.getState().activeWindowId === app.id;

          return (
            <button
              key={app.id}
              onClick={() => handleDockClick(app.id)}
              className="relative flex flex-col items-center group transition"
              aria-label={`${isRunning ? (isCurrentActive ? "Minimize" : "Restore") : "Open"} ${app.title} from dock`}
            >
              {/* Custom tooltip with 200ms delay on entry and smooth disappear */}
              <span className="absolute bottom-14 px-2 py-1 bg-slate-900/90 border border-gray-800 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-y-0 group-hover:-translate-y-1.5 transition-all duration-200 ease-out pointer-events-none whitespace-nowrap text-white shadow-xl z-[10001] delay-0 group-hover:delay-200">
                {app.title}
              </span>

              <div className={`dock-icon-inner rounded-2xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-md transform hover:scale-[1.2] hover:-translate-y-2 transition duration-200 active:scale-[0.95] ${
                viewMode === 'tablet' ? 'w-12 h-12' : 'w-11 h-11'
              } ${bouncingApp === app.id ? 'animate-bounce-dock' : ''}`}>
                <app.icon className={`${viewMode === 'tablet' ? 'w-6 h-6' : 'w-5.5 h-5.5'}`} />
              </div>
              
              {/* Dot Indicators */}
              {isRunning && (
                <span className={`absolute -bottom-1.5 transition-all duration-250 ${
                  isCurrentActive 
                    ? 'w-3.5 h-1 bg-purple-400 shadow-[0_0_8px_#c084fc] rounded-full' 
                    : 'w-1.5 h-1.5 bg-gray-500 rounded-full'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Shutdown Overlay */}
      {isShuttingDown && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center font-mono">
          <div className="space-y-2 text-left max-w-md w-full px-8">
            {SHUTDOWN_LINES.slice(0, shutdownStep + 1).map((line, i) => (
              <p
                key={i}
                className={`text-sm ${
                  i === SHUTDOWN_LINES.length - 1
                    ? 'text-gray-600'
                    : i >= SHUTDOWN_LINES.length - 3
                    ? 'text-gray-400'
                    : 'text-green-400'
                } animate-fade-in`}
              >
                {i < SHUTDOWN_LINES.length - 3 ? `> ${line}` : line}
              </p>
            ))}
            {shutdownStep >= SHUTDOWN_LINES.length - 1 && (
              <p className="text-[10px] text-gray-700 mt-4 italic">Session Saved. See you next deployment.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
