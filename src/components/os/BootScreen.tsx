import { useEffect, useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { playBootSound } from '../../utils/sounds';
import { APP_VERSION, PORTFOLIO_META } from '../../data/config';

const FIRST_NAME = PORTFOLIO_META.name.split(' ')[0];

const DESKTOP_BOOT_MESSAGES = [
  `Starting PortfolioOS v${APP_VERSION}...`,
  `Loading owner profile: ${PORTFOLIO_META.name}... OK`,
  `Mounting experience: ${PORTFOLIO_META.role} @ ${PORTFOLIO_META.company}... OK`,
  'Loading projects and case studies... OK',
  'Indexing skills and certifications... OK',
  'Warming up the AI assistant, terminal and arcade... OK',
  'Rendering desktop with React + TypeScript + Tailwind... OK',
  `Welcome to ${FIRST_NAME}'s workspace!`,
];

const MOBILE_BOOT_MESSAGES = [
  `Starting PortfolioOS Mobile v${APP_VERSION}...`,
  `Loading owner profile: ${PORTFOLIO_META.name}... OK`,
  'Loading projects... OK',
  'Mounting experience... OK',
  'Applying touch-friendly layout... OK',
  'Launching home screen... OK',
  `Welcome to ${FIRST_NAME}'s workspace!`,
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
        // Capture now: the state updater may run later, after currentMsgIdx has advanced.
        const message = bootMessages[currentMsgIdx];
        setLogs((prev) => [...prev, message]);
        setProgress((prev) => Math.min(prev + Math.ceil(100 / bootMessages.length), 100));
        currentMsgIdx++;
      } else {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          // Intentionally skip the lock screen after boot: visitors land straight on the
          // desktop. The lock screen is still reachable via the OS "Lock" action.
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
          === {isMobile ? 'PORTFOLIO OS MOBILE' : 'PORTFOLIO OS'} v{APP_VERSION} ===
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
