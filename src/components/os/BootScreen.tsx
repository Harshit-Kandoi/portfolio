import React, { useEffect, useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { playBootSound } from '../../utils/sounds';

const DESKTOP_BOOT_MESSAGES = [
  'Initializing PortfolioOS kernel v2.4.0-darwin...',
  'Probing hardware configuration (macOS Darwin x86_64)...',
  'Verifying CPU state: Apple M2 Max (12 Cores)... OK',
  'Initializing display server: Aqua Server (React/Tailwind/Vite)... OK',
  'Loading developer credentials: [Harshit Kandoi]... OK',
  'Mounting filesystem: /users/harshit/workspace (129.05 kB)... OK',
  'Starting background services: SpotifyNowPlaying, RPGProgression, AIAssistant... OK',
  'Starting system shell: zsh 5.9... OK',
  'System loaded. Workspace ready for console operations.'
];

const MOBILE_BOOT_MESSAGES = [
  'Android Bootloader version 14.0.0...',
  'Checking system partition... OK',
  'Mounting external SD storage... OK',
  'Loading portfolio components... OK',
  'Initializing cellular and network stack... OK',
  'Applying mobile layout configurations... OK',
  'Optimizing touch screen gesture drivers... OK',
  'Launching system UI... OK',
  'Welcome back, Harshit!'
];

export default function BootScreen() {
  const setBootState = useOSStore((state) => state.setBootState);
  const viewMode = useOSStore((state) => state.viewMode);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const isMobile = viewMode === 'mobile';
  const bootMessages = isMobile ? MOBILE_BOOT_MESSAGES : DESKTOP_BOOT_MESSAGES;
  const speed = isMobile ? 120 : 220; // snappier mobile boot speed

  useEffect(() => {
    playBootSound();

    let currentMsgIdx = 0;
    const interval = setInterval(() => {
      if (currentMsgIdx < bootMessages.length) {
        setLogs((prev) => [...prev, bootMessages[currentMsgIdx]]);
        setProgress((prev) => Math.min(prev + Math.ceil(100 / bootMessages.length), 100));
        currentMsgIdx++;
      } else {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          // Temporarily skip lock screen friction and boot straight to desktop for testing
          // setBootState('locked');
          setBootState('desktop');
        }, 500);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [setBootState, bootMessages, speed]);

  return (
    <div className="fixed inset-0 bg-[#07070a] text-green-400 font-mono text-sm flex flex-col justify-between p-8 select-none z-[9999]">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-start space-y-2 mt-12 overflow-y-auto">
        {/* Terminal Header */}
        <div className="text-gray-500 mb-4 border-b border-gray-800 pb-2">
          === {isMobile ? 'MOBILEOS' : 'DEV PORTFOLIO OS'} BOOTLOADER v2.4.0 ===
        </div>

        {logs.map((log, idx) => (
          <div key={idx} className="flex items-center space-x-2 animate-fade-in text-[11px] sm:text-sm">
            <span className="text-green-600 font-bold">&gt;</span>
            <span>{log}</span>
          </div>
        ))}
        
        {progress < 100 && (
          <div className="flex items-center space-x-2 text-green-500">
            <span className="animate-pulse">_</span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto w-full mb-12">
        <div className="flex justify-between items-center mb-2 text-gray-500 text-xs uppercase tracking-wider">
          <span>Boot Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
