import React, { useEffect, useState, useCallback } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { ArrowRight, Clock, ArrowUp } from 'lucide-react';

export default function LockScreen() {
  const setBootState = useOSStore((state) => state.setBootState);
  const viewMode = useOSStore((state) => state.viewMode);
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = useCallback(() => {
    setBootState('desktop');
  }, [setBootState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleUnlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUnlock]);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const isMobile = viewMode === 'mobile';

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 select-none z-[9990] flex flex-col justify-between p-6 text-white bg-[#03001e] bg-cover bg-center"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(13, 10, 49, 0.5) 0%, rgba(3, 0, 30, 0.95) 100%), url('/wallpaper.webp')`,
        }}
      >
        {/* Mobile Top Bar */}
        <div className="flex justify-between items-start w-full px-2 pt-2 text-xs text-gray-400">
          <div className="flex flex-col">
            <span className="font-bold text-white text-xs">Harshit's Phone</span>
            <span className="text-[9px] text-gray-500 font-medium">Jaipur, Rajasthan, India</span>
          </div>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open to Work</span>
          </div>
        </div>

        {/* Mobile Vertical Clock & Date */}
        <div className="flex flex-col items-center justify-center text-center mt-12 space-y-2">
          <div className="text-6xl font-extralight tracking-tighter filter drop-shadow-md">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div className="text-sm font-light text-purple-300 tracking-wide">
            {formattedDate}
          </div>
        </div>

        {/* Mobile Unlock Trigger (Tap/Swipe-up action) */}
        <div className="flex flex-col items-center justify-center mb-10 w-full space-y-4">
          <button
            onClick={handleUnlock}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition active:scale-95 shadow-lg animate-bounce"
            aria-label="Unlock Mobile OS"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <span onClick={handleUnlock} className="text-xs text-gray-300 font-medium tracking-widest cursor-pointer uppercase animate-pulse">
            Swipe up or Tap to Unlock
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 select-none z-[9990] flex flex-col justify-between p-8 text-white bg-[#03001e] bg-cover bg-center"
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(13, 10, 49, 0.4) 0%, rgba(3, 0, 30, 0.95) 100%), url('/wallpaper.webp')`,
      }}
    >
      {/* Top Bar with Time & Weather status info */}
      <div className="flex justify-between items-start max-w-6xl mx-auto w-full mt-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium tracking-wide text-gray-300">Harshit's Workspace</span>
          <span className="text-xs text-gray-400">Rajasthan, India</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-300 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <Clock className="w-3.5 h-3.5" />
          <span>Status: Open to Work</span>
        </div>
      </div>

      {/* Center Clock and Date */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-7xl sm:text-8xl font-light tracking-tight filter drop-shadow-md mb-2">
          {formattedTime.split(' ')[0]}
          <span className="text-xl sm:text-2xl font-normal ml-2 opacity-80">
            {formattedTime.split(' ')[1] || ''}
          </span>
        </div>
        <div className="text-lg sm:text-xl font-medium tracking-wide text-gray-300 filter drop-shadow-sm">
          {formattedDate}
        </div>
      </div>

      {/* Bottom Login Card */}
      <div className="flex flex-col items-center justify-center mb-8 max-w-md mx-auto w-full">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl w-full flex flex-col items-center text-center shadow-2xl animate-slide-up">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-tr from-purple-500 to-indigo-500 border border-white/30 flex items-center justify-center mb-4">
            <img src="/profile.webp" alt="Harshit Kandoi" className="w-full h-full object-cover" />
          </div>
          <h2 className="w-full text-center text-lg font-semibold tracking-wide">Harshit Kandoi</h2>
          <p className="w-full text-center text-xs text-purple-200 mt-1 mb-8">Software &amp; AI Engineer</p>

          <button
            onClick={handleUnlock}
            className="w-full bg-white text-[#03001e] hover:bg-white/90 font-medium py-3 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10"
            aria-label="Unlock Workspace"
          >
            <span>Unlock Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <span className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest animate-pulse">
            Press Enter to Unlock
          </span>
        </div>
      </div>
    </div>
  );
}
