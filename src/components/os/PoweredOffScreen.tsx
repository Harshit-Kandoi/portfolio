import React, { useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { playBootSound } from '../../utils/sounds';

export default function PoweredOffScreen() {
  const setBootState = useOSStore((state) => state.setBootState);
  const resetShutdown = useOSStore((state) => state.resetShutdown);

  const handleRestart = () => {
    resetShutdown();
    playBootSound();
    setBootState('booting');
  };

  useEffect(() => {
    const handleKeyDown = () => {
      handleRestart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#07070a] flex flex-col items-center justify-center select-none z-[9999]">
      <div className="text-center space-y-8 max-w-md px-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">System Halted</h1>
          <p className="text-gray-400 text-sm">
            Thank you for exploring Portfolio OS!
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={handleRestart}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Power On</span>
            </span>
          </button>
          
          <p className="text-xs text-gray-600">
            Press any key or click the button to restart
          </p>
        </div>
      </div>
    </div>
  );
}
