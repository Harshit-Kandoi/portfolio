import React, { useEffect, useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { playBootSound } from '../../utils/sounds';

const bootMessages = [
  'Initializing Developer Portfolio OS v2.0...',
  'Loading Linux Kernel-like Modules (Node/Vite)...',
  'Loading AI Engine Core (Gemini-Flash)...',
  'Loading User Profile Config (Harshit Kandoi)...',
  'Connecting Cloud Infrastructure Emulator...',
  'Optimizing WebGL Render Pipeline...',
  'Welcome Harshit! Desktop is ready.',
];

export default function BootScreen() {
  const setBootState = useOSStore((state) => state.setBootState);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Play boot sound (if user interacts or defaults)
    playBootSound();

    let currentMsgIdx = 0;
    const interval = setInterval(() => {
      if (currentMsgIdx < bootMessages.length) {
        setLogs((prev) => [...prev, bootMessages[currentMsgIdx]]);
        setProgress((prev) => Math.min(prev + 15, 100));
        currentMsgIdx++;
      } else {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setBootState('locked');
        }, 600); // short pause
      }
    }, 250);

    return () => clearInterval(interval);
  }, [setBootState]);

  return (
    <div className="fixed inset-0 bg-[#07070a] text-green-400 font-mono text-sm flex flex-col justify-between p-8 select-none z-[9999]">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-start space-y-2 mt-12 overflow-y-auto">
        {/* Terminal Header */}
        <div className="text-gray-500 mb-4 border-b border-gray-800 pb-2">
          === DEV PORTFOLIO OS BOOTLOADER v2.0.0 ===
        </div>

        {logs.map((log, idx) => (
          <div key={idx} className="flex items-center space-x-2 animate-fade-in">
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
        <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
