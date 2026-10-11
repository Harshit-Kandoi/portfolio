import { useEffect, lazy, Suspense, useState, useRef, useCallback } from 'react';
import { useOSStore } from './store/useOSStore';
import ClassicPortfolio from './components/classic/ClassicPortfolio';
import OSTransitionOverlay from './components/classic/OSTransitionOverlay';
import { PORTFOLIO_META } from './data/config';

// e.g. "harshitkandoi.in/portfolio"
const SITE_LABEL = PORTFOLIO_META.siteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

// The OS is opt-in, so its code is split out of the main bundle that classic visitors load.
const loadOS = {
  boot: () => import('./components/os/BootScreen'),
  lock: () => import('./components/os/LockScreen'),
  desktop: () => import('./components/os/Desktop'),
  wallpaper: () => import('./components/os/Wallpaper'),
  poweredOff: () => import('./components/os/PoweredOffScreen'),
  android: () => import('./components/os/AndroidOS'),
};
const BootScreen = lazy(loadOS.boot);
const LockScreen = lazy(loadOS.lock);
const Desktop = lazy(loadOS.desktop);
const Wallpaper = lazy(loadOS.wallpaper);
const PoweredOffScreen = lazy(loadOS.poweredOff);
const AndroidOS = lazy(loadOS.android);
const prefetchOS = () => Object.values(loadOS).forEach((load) => load().catch(() => {}));

function App() {
  const bootState = useOSStore((state) => state.bootState);
  const theme = useOSStore((state) => state.theme);
  const wallpaper = useOSStore((state) => state.wallpaper);
  const uiScale = useOSStore((state) => state.uiScale);
  const accentColor = useOSStore((state) => state.accentColor);
  const windowAnimation = useOSStore((state) => state.windowAnimation);
  const dockSize = useOSStore((state) => state.dockSize);
  const showFPS = useOSStore((state) => state.showFPS);
  const showWindowBounds = useOSStore((state) => state.showWindowBounds);
  const portalMode = useOSStore((state) => state.portalMode);
  const setPortalMode = useOSStore((state) => state.setPortalMode);
  const setBootState = useOSStore((state) => state.setBootState);
  const viewMode = useOSStore((state) => state.viewMode);
  const setViewMode = useOSStore((state) => state.setViewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const setIsSimulatingMobile = useOSStore((state) => state.setIsSimulatingMobile);
  const layoutOverride = useOSStore((state) => state.layoutOverride);

  // Transition state — managed at App level so overlay survives portalMode switch
  const [transitionRect, setTransitionRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ── Classic → OS transition handler ────────────────────────────────────────
  // Warm the OS chunks once the classic page is idle, so "Interactive mode" opens instantly.
  useEffect(() => {
    if (portalMode !== 'classic') return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const timer = window.setTimeout(() => idle(prefetchOS), 4000);
    return () => window.clearTimeout(timer);
  }, [portalMode]);

  const handleClassicTransition = useCallback((rect: DOMRect) => {
    prefetchOS();
    setTransitionRect(rect);
    setIsTransitioning(true);
    // Skip boot + lock — the zoom transition IS the entry experience
    setBootState('desktop');
    // After overlay animation completes, switch portal to OS
    setTimeout(() => {
      setPortalMode('os');
      setIsTransitioning(false);
      setTransitionRect(null);
    }, 320);
  }, [setPortalMode, setBootState]);

  // ── Toggle html/body os-mode class for OS mode viewport lock ───────────────
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (portalMode === 'os') {
      root.classList.add('os-mode');
      body.classList.add('os-mode');
    } else {
      root.classList.remove('os-mode');
      body.classList.remove('os-mode');
    }
  }, [portalMode]);

  // FPS counter
  const [fps, setFps] = useState(60);
  const fpsRef = useRef<number[]>([]);
  const frameRef = useRef<number | null>(null);

  // ── Mobile landscape detection ──────────────────────────────────────────────
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobileViewport = window.innerWidth < 1024;
      const isLandscape = window.innerWidth > window.innerHeight;
      // Only block landscape on real mobile-sized screens (not tablets in landscape which is intentional)
      const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 550;
      setIsLandscapeMobile(isMobileViewport && isLandscape && isSmallScreen);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // ── FPS tracking ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showFPS) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }
    let lastTime = performance.now();
    const tick = () => {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      fpsRef.current.push(Math.round(1000 / delta));
      if (fpsRef.current.length > 30) fpsRef.current.shift();
      setFps(Math.round(fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [showFPS]);

  // ── Ctrl+K opens Start Menu (OS desktop only; classic keeps the browser shortcut, paused while locked) ──
  useEffect(() => {
    if (portalMode !== 'os' || bootState !== 'desktop') return;
    const handleCtrlK = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const state = useOSStore.getState();
        state.setStartMenuOpen(!state.startMenuOpen);
      }
    };
    window.addEventListener('keydown', handleCtrlK);
    return () => window.removeEventListener('keydown', handleCtrlK);
  }, [portalMode, bootState]);

  // ── History API back-button trap ─────────────────────────────────────────────
  // Pushes a dummy history state so the Android/iOS back gesture stays inside the app.
  // OS mode only: the classic site must let visitors leave with Back.
  useEffect(() => {
    if (typeof window === 'undefined' || portalMode !== 'os') return;
    // Push initial dummy state
    window.history.pushState({ portfolioOS: true }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.portfolioOS) return;
      // User pressed back — push state again to stay in the app
      window.history.pushState({ portfolioOS: true }, '', window.location.href);
      // If an app window is open, close it instead
      const activeId = useOSStore.getState().activeWindowId;
      if (activeId) {
        useOSStore.getState().closeWindow(activeId);
      } else if (useOSStore.getState().activeMobileApp) {
        const appId = useOSStore.getState().activeMobileApp!;
        useOSStore.getState().closeMobileApp(appId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [portalMode]);

  // Set viewMode dynamically based on screen size or override
  useEffect(() => {
    if (layoutOverride !== 'auto') {
      setViewMode(layoutOverride);
      return;
    }

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isPortrait = h > w;

      if (w < 768) {
        setViewMode('mobile');
      } else if (w >= 768 && w < 1024) {
        if (isPortrait) {
          setViewMode('mobile'); // Portrait Tablet -> Render like phone (Android OS)
        } else {
          setViewMode('tablet'); // Landscape Tablet -> Render like laptop (Desktop view)
        }
      } else {
        setViewMode('desktop');
      }
    };
    handleResize(); // run once initially
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setViewMode, layoutOverride]);

  // Apply Retro CRT scanline effect on root container if retro theme is active
  const isRetro = theme === 'retro';
  const isCyber = theme === 'cyberpunk';
  const isMidnight = theme === 'midnight';
  const isGlass = theme === 'glass';

  let themeWrapperClass = '';
  if (isRetro) themeWrapperClass = 'retro-crt-theme';
  if (isCyber) themeWrapperClass = 'cyberpunk-theme';
  if (isMidnight) themeWrapperClass = 'midnight-theme';
  if (isGlass) themeWrapperClass = 'glass-theme';

  // CSS classes driven by user settings
  const accentClass = `accent-${accentColor}`;
  const animClass = windowAnimation !== 'smooth' ? `window-anim-${windowAnimation}` : '';
  const dockClass = dockSize !== 'medium' ? `dock-size-${dockSize}` : '';
  const boundsClass = showWindowBounds ? 'debug-window-bounds' : '';

  // Apply UI scale to root html document and CSS custom property
  const zoomFactor = uiScale / 100;
  useEffect(() => {
    document.documentElement.style.fontSize = `${uiScale}%`;
    document.documentElement.style.setProperty('--ui-scale-factor', `${zoomFactor}`);
    return () => {
      document.documentElement.style.fontSize = '100%';
    };
  }, [uiScale, zoomFactor]);

  return (
    <div
      className={`font-sans relative ${
        portalMode === 'os'
          ? `h-dvh w-screen overflow-hidden select-none ${themeWrapperClass} ${accentClass} ${animClass} ${dockClass} ${boundsClass}`
          : 'min-h-screen w-full text-white bg-[#05060f]'
      }`}
    >
      {/* ── Classic Portfolio Mode ─────────────────────────────────────────── */}
      {portalMode === 'classic' && !isTransitioning && (
        <ClassicPortfolio onTransition={handleClassicTransition} />
      )}

      {/* Transition overlay — shown during Classic→OS animation */}
      {isTransitioning && transitionRect && (
        <OSTransitionOverlay initialRect={transitionRect} />
      )}

      {/* ── OS Mode ───────────────────────────────────────────────────────── */}
      {portalMode === 'os' && (
        <>
          {/* FPS Counter overlay */}
          {showFPS && bootState === 'desktop' && (
            <div className="fps-counter" aria-hidden="true">{fps} FPS</div>
          )}

          {/* ── Mobile Landscape Lock Overlay ──────────────────────────────────── */}
          {isLandscapeMobile && (
            <div className="fixed inset-0 z-[99999] bg-[#07070a] flex flex-col items-center justify-center text-white select-none">
              <div className="flex flex-col items-center space-y-5 px-8 text-center animate-fade-in">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl border-4 border-purple-500/60 flex items-center justify-center bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                    <svg className="w-10 h-10 text-purple-400 animate-[spin_3s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="absolute -inset-2 rounded-[32px] border border-purple-500/20 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                    Please Rotate Your Device
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                    Portfolio OS is designed for portrait mode. Rotate your phone for the best experience.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60 animate-pulse" />
                  <span>{SITE_LABEL}</span>
                </div>
              </div>
            </div>
          )}

          <Suspense fallback={<div className="fixed inset-0 bg-[#07070a]" />}>
            {bootState === 'booting' && <BootScreen />}
            {bootState === 'locked' && <LockScreen />}
            {bootState === 'powered_off' && <PoweredOffScreen />}
          </Suspense>
          
          {(bootState === 'desktop' || bootState === 'locked') && (
            <Suspense fallback={
              <div className="fixed inset-0 bg-[#07070a] flex items-center justify-center text-purple-400 font-mono text-sm">
                <span className="animate-pulse">Loading Mobile OS...</span>
              </div>
            }>
              {viewMode === 'mobile' ? (
                <AndroidOS isFullscreen={true} />
              ) : (
                <>
                  <Wallpaper type={wallpaper} />
                  <Desktop />
                  
                  {/* Android Smartphone Simulator Frame Overlay on Desktop + Tablet landscape */}
                  {(viewMode === 'desktop' || viewMode === 'tablet') && isSimulatingMobile && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
                      
                      {/* Floating Action Button to close simulator */}
                      <button 
                        onClick={() => setIsSimulatingMobile(false)}
                        className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-full text-xs shadow-xl flex items-center space-x-1.5 transition duration-200 hover:scale-[1.05] active:scale-[0.95] z-[600]"
                        aria-label="Exit Mobile OS Simulator"
                      >
                        <span>✕ Exit Mobile OS Simulator</span>
                      </button>

                      {/* CSS Designed Smartphone Mockup Frame */}
                      <div className="relative w-[375px] h-[780px] bg-[#0c0d12] rounded-[52px] p-3 shadow-2xl border-[6px] border-[#1d1f27] ring-8 ring-black/75 overflow-hidden transition-all duration-300 transform scale-90 sm:scale-100">
                        
                        {/* Top Speaker Grille & Punch Hole Camera (Dynamic Island style) */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-7 bg-black rounded-b-[20px] z-[999] flex items-center justify-between px-6">
                          <div className="w-1.5 h-1.5 bg-[#151515] rounded-full" />
                          <div className="w-3.5 h-3.5 bg-[#08080a] rounded-full border-2 border-[#1c1c24] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-blue-950/40 rounded-full" />
                          </div>
                          <div className="w-1.5 h-1.5 bg-transparent" />
                        </div>

                        {/* Left and Right Side Buttons */}
                        <div className="absolute -left-[6px] top-32 w-[6px] h-12 bg-[#1d1f27] rounded-l-md" />
                        <div className="absolute -left-[6px] top-48 w-[6px] h-12 bg-[#1d1f27] rounded-l-md" />
                        <div className="absolute -right-[6px] top-40 w-[6px] h-20 bg-[#1d1f27] rounded-r-md" />

                        {/* Simulated Screen Inner Container */}
                        <div className="w-full h-full rounded-[42px] overflow-hidden relative bg-black border border-white/5">
                          <Suspense fallback={
                            <div className="flex flex-col items-center justify-center h-full bg-[#0c0d12] text-purple-400 font-mono text-xs">
                              <span className="animate-pulse">Booting Mobile OS...</span>
                            </div>
                          }>
                            <AndroidOS isFullscreen={false} />
                          </Suspense>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Suspense>
          )}

          {/* Retro CRT Scanlines & Flicker Overlay */}
          {isRetro && bootState === 'desktop' && (
            <div className="pointer-events-none fixed inset-0 z-[9999] scanlines-overlay opacity-30" />
          )}
        </>
      )}
    </div>
  );
}

export default App;