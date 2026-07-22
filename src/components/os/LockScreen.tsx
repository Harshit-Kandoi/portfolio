import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { ArrowRight, Clock, Fingerprint, CheckCircle2 } from 'lucide-react';
import { playUnlockSound } from '../../utils/sounds';

export default function LockScreen() {
  const setBootState = useOSStore((state) => state.setBootState);
  const viewMode = useOSStore((state) => state.viewMode);
  
  const [time, setTime] = useState(new Date());

  // Biometric state for mobile lock screen
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

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

  // Handle fingerprint press & hold
  const startScan = useCallback((e?: React.SyntheticEvent) => {
    if (e && e.cancelable) e.preventDefault();
    if (isVerified) return;

    setIsScanning(true);
    startTimeRef.current = performance.now();

    const HOLD_DURATION = 800; // 800ms press & hold

    const tick = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);

      setScanProgress(progress);

      if (progress < 100) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        // Hold completed successfully
        setIsVerified(true);
        setIsScanning(false);
        setScanProgress(100);
        playUnlockSound();
        setTimeout(() => {
          handleUnlock();
        }, 350);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [isVerified, handleUnlock]);

  const resetScan = useCallback(() => {
    if (isVerified) return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    startTimeRef.current = null;
    setIsScanning(false);
    setScanProgress(0);
  }, [isVerified]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const isMobile = viewMode === 'mobile' || isSimulatingMobile || (typeof window !== 'undefined' && window.innerWidth < 768);

  if (isMobile) {
    // Circumference of r=36 SVG progress circle (2 * PI * 36)
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (scanProgress / 100) * circumference;

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

        {/* Mobile Biometric Fingerprint Unlock Trigger */}
        <div className="flex flex-col items-center justify-center mb-10 w-full space-y-5">
          <div className="relative flex items-center justify-center touch-none">
            {/* Subtle ambient pulsing glow behind sensor while scanning */}
            <div
              className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
                isVerified
                  ? 'w-24 h-24 bg-emerald-500/30 blur-lg animate-pulse'
                  : isScanning
                  ? 'w-24 h-24 bg-cyan-500/30 blur-lg animate-ping'
                  : 'w-20 h-20 bg-purple-500/10 blur-md opacity-40'
              }`}
            />

            {/* Circular Progress SVG Ring around sensor */}
            <svg className="w-24 h-24 transform -rotate-90 pointer-events-none z-10" viewBox="0 0 80 80">
              {/* Background ring track */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-white/10"
                strokeWidth="3"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className={`transition-all duration-75 ${
                  isVerified
                    ? 'stroke-emerald-400'
                    : isScanning
                    ? 'stroke-cyan-400'
                    : 'stroke-purple-400/50'
                }`}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Interactive Sensor Core Button */}
            <button
              onClick={handleUnlock}
              onPointerDown={startScan}
              onPointerUp={resetScan}
              onPointerLeave={resetScan}
              onPointerCancel={resetScan}
              onTouchStart={startScan}
              onTouchEnd={resetScan}
              onTouchCancel={resetScan}
              className={`absolute w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl select-none z-20 ${
                isVerified
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.7)] scale-105'
                  : isScanning
                  ? 'bg-cyan-500/20 border border-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.6)] scale-110'
                  : 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-white/30 active:scale-95'
              }`}
              aria-label="Touch & Hold Fingerprint to Unlock Mobile OS"
            >
              {isVerified ? (
                <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-scale-up" />
              ) : (
                <div className="relative w-9 h-9 flex items-center justify-center">
                  {/* Unfilled base fingerprint */}
                  <Fingerprint className="w-9 h-9 text-white/30 absolute inset-0" />
                  {/* Progressive vertical fill fingerprint */}
                  <Fingerprint
                    className={`w-9 h-9 absolute inset-0 transition-colors duration-150 ${
                      isScanning ? 'text-cyan-300' : 'text-purple-300'
                    }`}
                    style={{
                      clipPath: `inset(${100 - scanProgress}% 0 0 0)`,
                    }}
                  />
                </div>
              )}
            </button>
          </div>

          {/* Dynamic Action Text */}
          <span
            className={`text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
              isVerified
                ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-105'
                : isScanning
                ? 'text-cyan-300 animate-pulse'
                : 'text-gray-300/80 animate-pulse'
            }`}
          >
            {isVerified
              ? 'Fingerprint Verified'
              : isScanning
              ? 'Scanning Fingerprint...'
              : 'Touch & Hold to Unlock'}
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
      <div className="flex flex-col items-center justify-center text-center min-h-[130px]">
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
            <img src="/profile.webp" alt="Harshit Kandoi" width="64" height="64" className="w-full h-full object-cover" />
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
