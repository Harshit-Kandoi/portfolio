import { useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { playBootSound } from '../../utils/sounds';
import { LayoutTemplate, Power } from 'lucide-react';

function restartOS() {
  const { resetShutdown, setBootState } = useOSStore.getState();
  resetShutdown();
  playBootSound();
  setBootState('booting');
}

export default function PoweredOffScreen() {
  const resetShutdown = useOSStore((state) => state.resetShutdown);
  const setPortalMode = useOSStore((state) => state.setPortalMode);

  const handleRestart = restartOS;

  const handleGoClassic = () => {
    resetShutdown();
    setPortalMode('classic');
  };

  // Enter/Space restarts only when no control has focus; focused buttons (Tab) handle
  // their own keys, and modifier/navigation keys are ignored.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const active = document.activeElement;
      if (active && active !== document.body && active !== document.documentElement) return;
      e.preventDefault();
      restartOS();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#07070a] flex flex-col items-center justify-center select-none z-9999">
      <div className="text-center space-y-10 max-w-md px-8">
        {/* Power icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <Power className="w-8 h-8" style={{ color: 'rgba(168,85,247,0.6)' }} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">System Halted</h1>
          <p className="text-gray-500 text-sm">
            Thank you for exploring Portfolio OS.
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-3">
          <button
            onClick={handleRestart}
            className="w-full flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', boxShadow: '0 0 24px rgba(168,85,247,0.3)' }}
            aria-label="Restart Portfolio OS"
          >
            <Power className="w-4 h-4" />
            <span>Restart OS</span>
          </button>

          <button
            onClick={handleGoClassic}
            className="w-full flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
            }}
            aria-label="Go to Classic Portfolio"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Normal Portfolio</span>
          </button>
        </div>

        <p className="text-xs text-gray-700">
          Press Enter to restart · Tab to choose an option
        </p>
      </div>
    </div>
  );
}
