import { useEffect, useState, lazy, Suspense } from 'react';
import { useOSStore, AppTheme } from '../../store/useOSStore';
import { 
  Folder, Terminal as TermIcon, MessageSquare, BookOpen, Trophy, 
  Settings as GearIcon, User, Briefcase, Award, FileText, Send, 
  Search, Cpu, HardDrive, Wifi, Volume2, Bell, LogOut, Moon, Sun, 
  Gamepad2, Github, Linkedin, CheckCircle, Smartphone
} from 'lucide-react';
import Window from './Window';
import { playWindowSound, playNotificationSound } from '../../utils/sounds';

// Lazy load app modules to reduce initial JS bundle size and improve SEO / LCP metrics
const AboutApp = lazy(() => import('../apps/AboutApp'));
const ProjectsApp = lazy(() => import('../apps/ProjectsApp'));
const ExperienceApp = lazy(() => import('../apps/ExperienceApp'));
const SkillsApp = lazy(() => import('../apps/SkillsApp'));
const ResumeApp = lazy(() => import('../apps/ResumeApp'));
const TerminalWindow = lazy(() => import('../apps/TerminalWindow'));
const AIAssistantApp = lazy(() => import('../apps/AIAssistantApp'));
const BlogApp = lazy(() => import('../apps/BlogApp'));
const AchievementsApp = lazy(() => import('../apps/AchievementsApp'));
const GamingApp = lazy(() => import('../apps/GamingApp'));
const ContactApp = lazy(() => import('../apps/ContactApp'));
const SettingsApp = lazy(() => import('../apps/SettingsApp'));

export default function Desktop() {
  const { 
    windows, theme, setTheme, openWindow, startMenuOpen, setStartMenuOpen, 
    notifications, dismissNotification, addNotification, closeAllWindows, setBootState,
    viewMode, isSimulatingMobile, setIsSimulatingMobile
  } = useOSStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [cpuUsage, setCpuUsage] = useState(24);
  const [ramUsage, setRamUsage] = useState(48);

  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [sysTime, setSysTime] = useState(new Date());
  const [bouncingApp, setBouncingApp] = useState<string | null>(null);

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

  // Dispatch a random toast notification every 45-60 seconds for immersive activity
  useEffect(() => {
    const randomToasts = [
      { title: '💼 Open to Work', message: 'Harshit is currently active and looking for new roles!', type: 'info' as const },
      { title: '⭐ GitHub Update', message: 'Repository "movie-recommender" starred!', type: 'success' as const },
      { title: '🚀 Deployment Active', message: 'Local GCP Emulator offline container built successfully.', type: 'success' as const },
      { title: '🏆 Cert Unlocked', message: 'TensorFlow Developer Certificate completed!', type: 'achievement' as const },
    ];

    const interval = setInterval(() => {
      const selected = randomToasts[Math.floor(Math.random() * randomToasts.length)];
      addNotification(selected.title, selected.message, selected.type);
      playNotificationSound();
    }, 55000);

    return () => clearInterval(interval);
  }, [addNotification]);

  const handleIconDoubleClick = (id: string) => {
    playWindowSound('open');
    openWindow(id);
  };

  const handleThemeCycle = () => {
    const themes: AppTheme[] = ['midnight', 'dark', 'light', 'cyberpunk', 'nord', 'retro', 'glass'];
    const currentIdx = themes.indexOf(theme);
    const nextTheme = themes[(currentIdx + 1) % themes.length];
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
    { id: 'about', title: 'About.exe', icon: User, color: 'from-blue-500 to-cyan-400' },
    { id: 'projects', title: 'Projects.exe', icon: Folder, color: 'from-purple-500 to-indigo-500' },
    { id: 'experience', title: 'Experience.exe', icon: Briefcase, color: 'from-emerald-500 to-teal-500' },
    { id: 'skills', title: 'Skills.exe', icon: Award, color: 'from-amber-500 to-orange-500' },
    { id: 'resume', title: 'Resume.pdf', icon: FileText, color: 'from-rose-500 to-red-500' },
    { id: 'terminal', title: 'Terminal.exe', icon: TermIcon, color: 'from-slate-700 to-slate-900' },
    { id: 'ai', title: 'AI Assistant', icon: MessageSquare, color: 'from-pink-500 to-rose-400' },
    { id: 'blog', title: 'Blog Reader.exe', icon: BookOpen, color: 'from-sky-500 to-blue-600' },
    { id: 'achievements', title: 'Achievements.exe', icon: Trophy, color: 'from-yellow-400 to-amber-500' },
    { id: 'gaming', title: 'Gaming Profile', icon: Gamepad2, color: 'from-red-500 to-pink-500' },
    { id: 'contact', title: 'Contact.exe', icon: Send, color: 'from-teal-400 to-emerald-500' },
    { id: 'settings', title: 'Settings.exe', icon: GearIcon, color: 'from-slate-400 to-slate-600' },
  ];

  // Filters search query for App icons
  const filteredApps = searchQuery 
    ? appIcons.filter(app => app.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : appIcons;

  const formattedTime = sysTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = sysTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Handle system powers
  const handleShutdown = () => {
    closeAllWindows();
    setBootState('booting');
  };

  const handleSleep = () => {
    setBootState('locked');
  };

  // Base Theme Configurations
  let shellTheme = 'text-white';
  let barBg = 'bg-black/40 backdrop-blur-xl border-white/10';
  let cardBg = 'bg-white/10 border-white/10 text-white';

  if (theme === 'light') {
    shellTheme = 'text-gray-800';
    barBg = 'bg-white/70 backdrop-blur-xl border-gray-200/50 shadow-sm';
    cardBg = 'bg-white/80 border-gray-200/50 text-gray-800';
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

  return (
    <div className={`fixed inset-0 select-none overflow-hidden flex flex-col h-screen w-screen font-sans ${shellTheme}`}>
      
      {/* Top Taskbar */}
      <div className={`h-12 w-full flex items-center justify-between border-b z-[50] ${barBg} ${
        viewMode === 'tablet' ? 'px-6' : 'px-4'
      }`}>
        <div className="flex items-center space-x-4">
          {/* Start Menu Button */}
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
              theme === 'cyberpunk' 
                ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                : theme === 'retro'
                  ? 'bg-green-500 text-black hover:bg-green-600'
                  : 'bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
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
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-60" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-1.5 rounded-lg text-xs w-48 focus:outline-none focus:ring-1 focus:ring-primary-500/50 bg-white/5 border border-white/15 placeholder-gray-400 ${
                theme === 'light' ? 'bg-black/5 text-gray-800 border-black/10 placeholder-gray-500' : ''
              }`}
            />
          </div>
        </div>

        {/* System Info & Widgets Tray */}
        <div className="flex items-center space-x-4">
          
          {/* CPU Monitor */}
          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-[10px] sm:text-xs">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">CPU</span>
            <span className="font-semibold">{cpuUsage}%</span>
          </div>

          {/* RAM Monitor */}
          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-[10px] sm:text-xs">
            <HardDrive className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">RAM</span>
            <span className="font-semibold">{ramUsage}%</span>
          </div>

          {/* Socials Shortcuts */}
          <div className="hidden sm:flex items-center space-x-2 border-l border-white/10 pl-4">
            <a href="https://github.com/Harshit-Kandoi" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition text-purple-300">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com/in/harshit-kandoi" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition text-blue-400">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

          {/* WiFi & Sound */}
          <div className="flex items-center space-x-2 border-l border-white/10 pl-4">
            {viewMode === 'desktop' && (
              <button 
                onClick={() => setIsSimulatingMobile(!isSimulatingMobile)} 
                className={`p-1 rounded-md transition hover:scale-105 active:scale-95 ${
                  isSimulatingMobile ? 'bg-purple-600/35 border border-purple-500/50 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle Android OS Simulator"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={handleThemeCycle} 
              className="p-1 rounded-md transition hover:scale-105 active:scale-95 text-gray-400 hover:text-white hover:bg-white/10"
              title={`Cycle Theme (Current: ${theme})`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            </button>
            <Wifi className="w-4 h-4 text-emerald-400" />
            <button onClick={() => setShowVolumePopup(!showVolumePopup)} className="hover:opacity-80 transition relative">
              <Volume2 className="w-4 h-4 text-sky-400" />
              {showVolumePopup && (
                <div className="absolute right-0 top-6 bg-slate-900 border border-gray-800 p-3 rounded-lg shadow-xl w-32 flex flex-col z-[100] text-white">
                  <span className="text-[10px] text-gray-400 mb-1">Volume Control</span>
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
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)} 
              className="hover:opacity-80 transition relative"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[8px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Date & Time */}
          <div className="flex flex-col items-end border-l border-white/10 pl-4 text-right">
            <span className="text-xs font-semibold">{formattedTime}</span>
            <span className="text-[9px] text-gray-400 uppercase hidden sm:inline">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Start Menu Popup */}
      {startMenuOpen && (
        <div className={`fixed border shadow-2xl z-[90] ${cardBg} backdrop-blur-3xl flex flex-col space-y-4 animate-slide-up transition-all duration-300 ${
          viewMode === 'tablet'
            ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-md p-8 rounded-3xl'
            : 'left-4 top-14 w-80 p-6 rounded-2xl'
        }`}>
          <div className="flex items-center space-x-3 pb-3 border-b border-white/10 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border border-white/20 flex items-center justify-center text-xs font-bold text-white">HK</div>
            <div>
              <h3 className="text-xs font-bold">Harshit Kandoi</h3>
              <p className="text-[10px] text-gray-400">Level {Math.floor(useOSStore.getState().xp / 100) + 1} Code Warrior</p>
            </div>
          </div>
          
          <div className={`grid gap-2 text-xs ${viewMode === 'tablet' ? 'grid-cols-2 text-sm gap-3' : 'grid-cols-2'}`}>
            {appIcons.slice(0, 8).map((app) => (
              <button
                key={app.id}
                onClick={() => handleIconDoubleClick(app.id)}
                className={`flex items-center p-2 rounded-xl hover:bg-white/5 transition text-left ${
                  viewMode === 'tablet' ? 'space-x-3.5' : 'space-x-2.5'
                }`}
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
            <button onClick={handleSleep} className="flex items-center space-x-1.5 hover:text-white transition">
              <Moon className="w-3.5 h-3.5" />
              <span>Sleep</span>
            </button>
            <button onClick={handleShutdown} className="flex items-center space-x-1.5 hover:text-red-400 transition">
              <LogOut className="w-3.5 h-3.5" />
              <span>Power Off</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications Side Drawer */}
      {showNotificationDrawer && (
        <div className={`fixed right-4 top-14 w-80 max-h-[80vh] p-4 rounded-2xl border shadow-2xl z-[90] ${cardBg} backdrop-blur-3xl overflow-y-auto flex flex-col space-y-3 animate-slide-up`}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider">Notifications</h3>
            <button 
              onClick={() => useOSStore.getState().clearNotifications()} 
              className="text-[10px] text-gray-400 hover:text-white transition"
            >
              Clear All
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-6">No new notifications</p>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-3 rounded-xl border flex flex-col space-y-1 relative bg-white/5 border-white/10`}
              >
                <button 
                  onClick={() => dismissNotification(notif.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs font-bold"
                >
                  &times;
                </button>
                <div className="flex items-center space-x-1.5">
                  {notif.type === 'achievement' && <Trophy className="w-3.5 h-3.5 text-yellow-400" />}
                  {notif.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-xs font-bold">{notif.title}</span>
                </div>
                <p className="text-[10px] text-gray-300">{notif.message}</p>
                <span className="text-[8px] text-gray-500 self-end">{notif.timestamp}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Active Workspaces - Icons on Desktop / Tablet */}
      <div className={`flex-grow p-6 z-10 select-none overflow-y-auto mt-4 ${
        viewMode === 'tablet' 
          ? 'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-6 justify-items-start justify-start content-start max-h-[calc(100vh-160px)]' 
          : 'grid grid-flow-col auto-cols-max grid-rows-[repeat(auto-fill,96px)] gap-4 max-h-[calc(100vh-112px)]'
      }`}>
        {filteredApps.map((app) => (
          <div
            key={app.id}
            onDoubleClick={() => handleIconDoubleClick(app.id)}
            onTouchEnd={() => handleIconDoubleClick(app.id)} // Mobile-friendly trigger
            className={`flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-white/5 border border-transparent hover:border-white/10 active:bg-white/10 transition-all select-none group text-center ${
              viewMode === 'tablet' ? 'w-24 h-24' : 'w-20 h-20'
            }`}
          >
            <div className={`rounded-2xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform ${
              viewMode === 'tablet' ? 'w-12 h-12' : 'w-11 h-11'
            }`}>
              <app.icon className={`${viewMode === 'tablet' ? 'w-6 h-6' : 'w-5.5 h-5.5'}`} />
            </div>
            <span className="text-[10px] font-medium tracking-wide mt-2 text-gray-200 truncate w-18 text-shadow">
              {app.title}
            </span>
          </div>
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
            {win.id === 'about' && <AboutApp />}
            {win.id === 'projects' && <ProjectsApp />}
            {win.id === 'experience' && <ExperienceApp />}
            {win.id === 'skills' && <SkillsApp />}
            {win.id === 'resume' && <ResumeApp />}
            {win.id === 'terminal' && <TerminalWindow />}
            {win.id === 'ai' && <AIAssistantApp />}
            {win.id === 'blog' && <BlogApp />}
            {win.id === 'achievements' && <AchievementsApp />}
            {win.id === 'gaming' && <GamingApp />}
            {win.id === 'contact' && <ContactApp />}
            {win.id === 'settings' && <SettingsApp />}
          </Suspense>
        </Window>
      ))}

      {/* Bottom Dock */}
      <div className={`absolute left-1/2 transform -translate-x-1/2 z-[40] flex items-end bg-black/35 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl transition-all duration-300 ${
        viewMode === 'tablet' 
          ? 'bottom-6 px-6 py-3 space-x-4.5' 
          : 'bottom-4 px-4 py-2.5 space-x-3.5'
      }`}>
        {appIcons.map((app) => {
          const win = windows.find((w) => w.id === app.id);
          const isRunning = win?.isOpen;
          const isCurrentActive = useOSStore.getState().activeWindowId === app.id;

          return (
            <button
              key={app.id}
              onClick={() => handleDockClick(app.id)}
              className="relative flex flex-col items-center group transition"
              title={app.title}
            >
              <div className={`rounded-2xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-md transform hover:scale-[1.2] hover:-translate-y-2 transition duration-200 active:scale-[0.95] ${
                viewMode === 'tablet' ? 'w-12 h-12' : 'w-11 h-11'
              } ${bouncingApp === app.id ? 'animate-bounce-dock' : ''}`}>
                <app.icon className={`${viewMode === 'tablet' ? 'w-6 h-6' : 'w-5.5 h-5.5'}`} />
              </div>
              
              {/* Dot Indicators */}
              {isRunning && (
                <span className={`w-1.5 h-1.5 rounded-full absolute -bottom-1.5 ${
                  isCurrentActive ? 'bg-primary-400 shadow-[0_0_5px_rgba(99,102,241,0.8)]' : 'bg-gray-400'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tablet and Mobile are natively supported - no banner needed */}

    </div>
  );
}
