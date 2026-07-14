import React, { useEffect, useState, useCallback } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { ArrowRight, Clock } from 'lucide-react';

export default function LockScreen() {
  const setBootState = useOSStore((state) => state.setBootState);
  const soundEnabled = useOSStore((state) => state.soundEnabled);
  const setSoundEnabled = useOSStore((state) => state.setSoundEnabled);
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = useCallback(() => {
    // If sounds are not enabled, enable them on first click/enter to allow Web Audio API
    if (!soundEnabled) {
      setSoundEnabled(true);
    }
    setBootState('desktop');
  }, [soundEnabled, setSoundEnabled, setBootState]);

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

  return (
    <div
      className="fixed inset-0 select-none z-[9990] flex flex-col justify-between p-8 text-white bg-[#03001e] bg-cover bg-center"
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(13, 10, 49, 0.4) 0%, rgba(3, 0, 30, 0.95) 100%), url('https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920&fit=crop')`,
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
            <span className="text-xl font-bold tracking-wider">HK</span>
          </div>
          <h2 className="text-lg font-semibold tracking-wide">Harshit Kandoi</h2>
          <p className="text-xs text-purple-200 mt-1 mb-6">Software & AI Engineer</p>

          <button
            onClick={handleUnlock}
            className="w-full bg-white text-[#03001e] hover:bg-white/90 font-medium py-3 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10"
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
