import { useEffect, lazy, Suspense } from 'react';
import { useOSStore } from './store/useOSStore';
import BootScreen from './components/os/BootScreen';
import LockScreen from './components/os/LockScreen';
import Desktop from './components/os/Desktop';
import Wallpaper from './components/os/Wallpaper';

const AndroidOS = lazy(() => import('./components/os/AndroidOS'));

function App() {
  const bootState = useOSStore((state) => state.bootState);
  const theme = useOSStore((state) => state.theme);
  const wallpaper = useOSStore((state) => state.wallpaper);
  
  const viewMode = useOSStore((state) => state.viewMode);
  const setViewMode = useOSStore((state) => state.setViewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const setIsSimulatingMobile = useOSStore((state) => state.setIsSimulatingMobile);
  const layoutOverride = useOSStore((state) => state.layoutOverride);

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

  return (
    <div className={`h-dvh w-screen overflow-hidden font-sans select-none relative ${themeWrapperClass}`}>
      {bootState === 'booting' && <BootScreen />}
      {bootState === 'locked' && <LockScreen />}
      
      {bootState === 'desktop' && (
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
              
              {/* Android Smartphone Simulator Frame Overlay on Desktop */}
              {viewMode === 'desktop' && isSimulatingMobile && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
                  
                  {/* Floating Action Button to close simulator */}
                  <button 
                    onClick={() => setIsSimulatingMobile(false)}
                    className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-full text-xs shadow-xl flex items-center space-x-1.5 transition duration-200 hover:scale-[1.05] active:scale-[0.95] z-[600]"
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
                      <AndroidOS isFullscreen={false} />
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
    </div>
  );
}

export default App;