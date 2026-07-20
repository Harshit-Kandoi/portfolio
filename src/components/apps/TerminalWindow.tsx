import React, { useState, useEffect, useRef } from 'react';
import { useOSStore, AppTheme } from '../../store/useOSStore';
import { playTerminalClick } from '../../utils/sounds';
import { trackEvent } from '../../utils/analytics';
import { formatUptimeHuman } from '../../utils/system';

interface HistoryItem {
  command: string;
  output: React.ReactNode;
}

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export default function TerminalWindow({ isMobileView }: { isMobileView?: boolean } = {}) {
  const { openWindow, setTheme, addTerminalCommand, viewMode, isSimulatingMobile } = useOSStore();
  const sessionStart = React.useRef(Date.now());
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: 'system_init',
      output: (
        <div className="text-gray-400">
          Welcome to Harshit-OS v2.0.0 Terminal.
          Type <span className="text-yellow-400">help</span> for a list of available commands.
          <br />
          <span className="text-gray-600 text-[10px]">Psst: try <span className="text-green-500">sudo hire harshit</span> 👀</span>
        </div>
      ),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandIndex, setCommandIndex] = useState(-1);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const konamiProgress = React.useRef<string[]>([]);
  
  const historyStore = useOSStore((state) => state.terminalHistory);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, isMatrixActive]);

  // Prevent parent scroll-chaining on swipe boundary hits
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const target = e.currentTarget as HTMLElement;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY;
      const isScrollable = target.scrollHeight > target.clientHeight;

      if (isScrollable) {
        const isAtTop = target.scrollTop <= 0 && deltaY > 0;
        const isAtBottom = 
          target.scrollHeight - target.scrollTop - target.clientHeight <= 1 && deltaY < 0;

        if ((isAtTop || isAtBottom) && e.cancelable) {
          e.preventDefault();
        }
      } else {
        if (e.cancelable) e.preventDefault();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Handle matrix canvas animation
  useEffect(() => {
    if (!isMatrixActive) return;
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = 350);

    const columns = Math.floor(width / 15) + 1;
    const yPositions = Array(columns).fill(0);
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$*&';

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0f0';
      ctx.font = '13px monospace';

      yPositions.forEach((y, index) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = index * 15;
        ctx.fillText(text, x, y);

        if (y > 100 + Math.random() * 10000) {
          yPositions[index] = 0;
        } else {
          yPositions[index] = y + 15;
        }
      });
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animId);
  }, [isMatrixActive]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Track Konami Code progress
    const key = e.key;
    const progress = konamiProgress.current;
    if (key === KONAMI[progress.length]) {
      progress.push(key);
      if (progress.length === KONAMI.length) {
        konamiProgress.current = [];
        setDevMode(true);
        setHistory((prev) => [
          ...prev,
          {
            command: '↑↑↓↓←→←→BA',
            output: (
              <div className="space-y-1">
                <p className="text-green-400 font-bold animate-pulse">🔓 DEVELOPER MODE UNLOCKED</p>
                <p className="text-gray-400 text-[11px]">Welcome, engineer. You found it.</p>
                <p className="text-gray-600 text-[10px]">XP +999 · Achievement: <span className="text-yellow-400">Up Up Down Down</span></p>
              </div>
            ),
          },
        ]);
      }
    } else {
      konamiProgress.current = key === KONAMI[0] ? [key] : [];
    }

    if (e.key === 'Enter') {
      const cmd = inputVal.trim();
      if (!cmd) return;
      playTerminalClick();
      executeCommand(cmd);
      setInputVal('');
      setCommandIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyStore.length === 0) return;
      const nextIdx = commandIndex === -1 ? historyStore.length - 1 : Math.max(0, commandIndex - 1);
      setCommandIndex(nextIdx);
      setInputVal(historyStore[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandIndex === -1) return;
      const nextIdx = commandIndex + 1;
      if (nextIdx >= historyStore.length) {
        setCommandIndex(-1);
        setInputVal('');
      } else {
        setCommandIndex(nextIdx);
        setInputVal(historyStore[nextIdx]);
      }
    }
  };

  const focusInput = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  const executeCommand = (fullCmd: string) => {
    const tokens = fullCmd.toLowerCase().split(' ');
    const cmd = tokens[0];
    const args = tokens.slice(1);
    addTerminalCommand(fullCmd);

    let output: React.ReactNode = '';

    if (isMatrixActive) {
      if (cmd === 'q' || cmd === 'quit' || cmd === 'clear') {
        setIsMatrixActive(false);
        return;
      }
    }

    switch (cmd) {
      case 'help':
        output = (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-green-400">
            <div><span className="text-yellow-300 font-bold">help</span> - list commands</div>
            <div><span className="text-yellow-300 font-bold">about</span> - profiles Harshit</div>
            <div><span className="text-yellow-300 font-bold">skills</span> - skills dashboard</div>
            <div><span className="text-yellow-300 font-bold">projects</span> - open projects app</div>
            <div><span className="text-yellow-300 font-bold">resume</span> - view resume PDF</div>
            <div><span className="text-yellow-300 font-bold">github</span> - open profile</div>
            <div><span className="text-yellow-300 font-bold">linkedin</span> - open LinkedIn</div>
            <div><span className="text-yellow-300 font-bold">clear</span> - clear output</div>
            <div><span className="text-yellow-300 font-bold">theme [name]</span> - set OS theme</div>
            <div><span className="text-yellow-300 font-bold">contact</span> - open contact box</div>
            <div><span className="text-yellow-300 font-bold">matrix</span> - toggle digital rain</div>
            <div><span className="text-yellow-300 font-bold">neofetch</span> - system config</div>
            <div><span className="text-yellow-300 font-bold">whoami</span> - developer level</div>
            <div><span className="text-yellow-300 font-bold">fortune</span> - developer quote</div>
            <div><span className="text-yellow-300 font-bold">ascii</span> - retro logos</div>
            <div><span className="text-yellow-300 font-bold">uptime</span> - session uptime</div>
            <div><span className="text-yellow-300 font-bold">ping [host]</span> - ping a host</div>
            {/* Phase 3 new commands */}
            <div><span className="text-yellow-300 font-bold">library</span> - view books read</div>
            <div><span className="text-yellow-300 font-bold">notes</span> - tech notes/wiki</div>
            <div><span className="text-yellow-300 font-bold">gallery</span> - photo gallery</div>
            <div><span className="text-yellow-300 font-bold">products</span> - product list</div>
            <div><span className="text-yellow-300 font-bold">publications</span> - articles written</div>
            <div><span className="text-yellow-300 font-bold">marketplace</span> - tools & services</div>
            <div className="text-gray-600 text-[10px] col-span-2 sm:col-span-3 pt-1">🥚 There may be hidden commands. Keep exploring.</div>
          </div>
        );
        break;

      case 'about':
        output = (
          <div className="space-y-1">
            <p className="text-yellow-300 font-bold">Harshit Kandoi - Software Engineer / AI / Cloud Developer</p>
            <p className="text-gray-300">Focuses on building robust local emulators, generative AI structures, and automation data pipelines.</p>
            <p className="text-xs text-gray-500">Opening About.exe application...</p>
          </div>
        );
        setTimeout(() => openWindow('about'), 600);
        break;

      case 'skills':
        output = <p className="text-gray-300">Opening Skills.exe constellation application...</p>;
        setTimeout(() => openWindow('skills'), 600);
        break;

      case 'projects':
        output = <p className="text-gray-300">Opening Projects.exe File Explorer...</p>;
        setTimeout(() => openWindow('projects'), 600);
        break;

      case 'resume':
        output = <p className="text-gray-300">Opening Resume.pdf Viewer...</p>;
        setTimeout(() => openWindow('resume'), 600);
        break;

      case 'github':
        output = <p className="text-blue-400">Navigating to https://github.com/Harshit-Kandoi...</p>;
        setTimeout(() => window.open('https://github.com/Harshit-Kandoi', '_blank'), 500);
        break;

      case 'linkedin':
        output = <p className="text-blue-400">Navigating to https://linkedin.com/in/harshit-kandoi...</p>;
        setTimeout(() => window.open('https://linkedin.com/in/harshit-kandoi', '_blank'), 500);
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'theme': {
        const themeName = args[0] as AppTheme;
        const validThemes: AppTheme[] = ['dark', 'light', 'cyberpunk', 'midnight', 'nord', 'glass', 'retro'];
        if (validThemes.includes(themeName)) {
          setTheme(themeName);
          output = <p className="text-emerald-400">Theme switched to <span className="font-bold">{themeName}</span></p>;
        } else {
          output = (
            <p className="text-red-400">
              Invalid theme name. Options: {validThemes.join(', ')}
            </p>
          );
        }
        break;
      }

      case 'contact':
        output = <p className="text-gray-300">Opening Contact.exe app...</p>;
        setTimeout(() => openWindow('contact'), 600);
        break;

      // Phase 3 commands
      case 'library':
        output = <p className="text-gray-300">Opening Library.exe app...</p>;
        setTimeout(() => openWindow('library'), 600);
        break;

      case 'notes':
        output = <p className="text-gray-300">Opening Notes.exe app...</p>;
        setTimeout(() => openWindow('notes'), 600);
        break;

      case 'gallery':
        output = <p className="text-gray-300">Opening Gallery.exe app...</p>;
        setTimeout(() => openWindow('gallery'), 600);
        break;

      case 'products':
        output = <p className="text-gray-300">Opening Products.exe app...</p>;
        setTimeout(() => openWindow('products'), 600);
        break;

      case 'publications':
        output = <p className="text-gray-300">Opening Papers.exe app...</p>;
        setTimeout(() => openWindow('publications'), 600);
        break;

      case 'marketplace':
        output = <p className="text-gray-300">Opening Store.exe app...</p>;
        setTimeout(() => openWindow('marketplace'), 600);
        break;

      case 'matrix':
        trackEvent('terminal_easter_egg', { easter_egg: 'matrix' });
        setIsMatrixActive(true);
        return;

      case 'neofetch':
        output = (
          <div className="flex space-x-6 text-xs text-gray-300 font-mono leading-relaxed">
            <div className="text-green-500 font-bold hidden sm:block">
              {`   /\\_/\\
  ( o.o )
   > ^ <
 /|     |\\
  | | | |
  (_(_|_)`}
            </div>
            <div className="space-y-1">
              <div><span className="text-blue-400 font-bold">harshit@portfolio-os</span></div>
              <div>-------------------------</div>
              <div><span className="text-blue-400">OS</span>: Developer Portfolio OS v2.4.0</div>
              <div><span className="text-blue-400">Kernel</span>: React 18 / Zustand / Tailwind v3</div>
              <div><span className="text-blue-400">Uptime</span>: 1h 43m</div>
              <div><span className="text-blue-400">Shell</span>: zsh 5.9</div>
              <div><span className="text-blue-400">Resolution</span>: {window.innerWidth}x{window.innerHeight}</div>
              <div><span className="text-blue-400">Theme</span>: {useOSStore.getState().theme.toUpperCase()}</div>
              <div><span className="text-blue-400">CPU</span>: Apple M2 Max (12 Cores)</div>
              <div><span className="text-blue-400">GPU</span>: Apple M2 Max (30 Cores)</div>
              <div><span className="text-blue-400">Developer</span>: Harshit Kandoi</div>
              <div><span className="text-blue-400">Role</span>: Software & AI Engineer</div>
            </div>
          </div>
        );
        break;

      case 'whoami':
        output = (
          <div className="space-y-1 text-gray-300">
            <p><span className="text-yellow-300 font-bold">User</span>: guest (External Recruiter/Visitor)</p>
            <p><span className="text-yellow-300 font-bold">Permissions</span>: Read-Only (Interactive Sandbox)</p>
            <p><span className="text-yellow-300 font-bold">Active Shell</span>: zsh (simulated)</p>
            <p><span className="text-yellow-300 font-bold">Status</span>: Connected from {window.location.hostname || "local-recruiters"}</p>
          </div>
        );
        break;

      case 'fortune': {
        const quotes = [
          "Talk is cheap. Show me the code. — Linus Torvalds",
          "Programs must be written for people to read, and only incidentally for machines to execute. — Abelson & Sussman",
          "Simplicity is complexity resolved. — Constantin Brancusi",
          "The best way to predict the future is to invent it. — Alan Kay",
          "Ensure your emulators run offline, your datasets stay clean, and your networks deploy correctly."
        ];
        output = <p className="text-yellow-200 italic">"{quotes[Math.floor(Math.random() * quotes.length)]}"</p>;
        break;
      }

      case 'ascii':
        output = (
          <pre className="text-emerald-500 text-[10px] sm:text-xs leading-none font-bold">
{`
  _   _                 _     _ _   
 | | | | __ _ _ __  ___| |__ (_) |_ 
 | |_| |/ _\` | '__|/ __| '_ \\| | __|
 |  _  | (_| | |   \\__ \\ | | | | |_ 
 |_| |_|\\__,_|_|   |___/_| |_|_|\\__|
                                    
`}
          </pre>
        );
        break;

      case 'ls':
        output = (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-blue-400 font-bold">
            <div>about.txt</div>
            <div>projects/</div>
            <div>resume_pdf</div>
            <div>contact_info/</div>
            <div>library/</div>
            <div>notes/</div>
            <div>publications/</div>
            <div>marketplace/</div>
          </div>
        );
        break;

      case 'pwd':
        output = <p className="text-gray-400">/users/harshit/workspace</p>;
        break;

      case 'cat':
        if (args[0] === 'about.txt') {
          output = (
            <div className="space-y-1 text-gray-300">
              <p><span className="text-yellow-300">Name:</span> Harshit Kandoi</p>
              <p><span className="text-yellow-300">Role:</span> Backend + AI + Cloud Engineer</p>
              <p><span className="text-yellow-300">Stack:</span> Java · Python · GCP · React · Docker</p>
              <p><span className="text-yellow-300">Focus:</span> Event-driven systems · LLM orchestration · Serverless</p>
              <p className="text-gray-500 text-[10px] italic mt-1">"Good backend systems disappear. Users notice them only when they're broken."</p>
            </div>
          );
        } else {
          output = <p className="text-red-400">cat: file not found or unspecified. Try: cat about.txt</p>;
        }
        break;

      case 'sudo': {
        const sudoArgs = args.join(' ');
        if (args[0] === 'hire' && args[1] === 'harshit') {
          trackEvent('terminal_easter_egg', { easter_egg: 'sudo_hire' });
          output = (
            <div className="space-y-1">
              <p className="text-yellow-300">[sudo] password for recruiter: ••••••••</p>
              <p className="text-emerald-400 font-bold animate-pulse">✅ Permission granted.</p>
              <p className="text-gray-300">Initiating onboarding sequence...</p>
              <p className="text-gray-500 text-[10px]">→ Resume sent · Calendar link opened · Offer letter pending</p>
            </div>
          );
          setTimeout(() => openWindow('contact'), 1200);
        } else {
          output = (
            <p className="text-red-400">
              sudo: permission denied — you are not Harshit
              {sudoArgs ? <span className="text-gray-500"> (tried: sudo {sudoArgs})</span> : null}
            </p>
          );
        }
        break;
      }

      case 'uptime': {
        const uptimeText = formatUptimeHuman();
        output = (
          <p className="text-green-400">
            up {uptimeText} · load avg: 0.42 0.77 1.01
          </p>
        );
        break;
      }

      case 'ping': {
        const target = args[0] || 'harshit';
        output = (
          <div className="space-y-0.5 text-gray-300 text-[11px]">
            <p>PING {target}.dev (127.0.0.1): 56 data bytes</p>
            {[12, 8, 11, 9].map((ms, i) => (
              <p key={i}>64 bytes from {target}.dev: icmp_seq={i} ttl=64 time={ms} ms</p>
            ))}
            <p className="text-emerald-400 mt-1">--- {target}.dev ping statistics ---</p>
            <p className="text-gray-400">4 packets transmitted · avg: 10ms · Response: <span className="text-emerald-300 font-bold">Available</span></p>
          </div>
        );
        break;
      }

      default:
        output = (
          <p className="text-red-400">
            Command not found: <span className="font-bold">{cmd}</span>. Type <span className="text-yellow-300">help</span> for options.
          </p>
        );
    }

    setHistory((prev) => [...prev, { command: fullCmd, output }]);
  };

  return (
    <div
      onClick={focusInput}
      className={`flex-grow flex flex-col font-mono text-xs md:text-sm p-3.5 w-full h-full min-h-0 cursor-text overflow-y-auto overscroll-contain transition-all duration-500 ${
        devMode
          ? 'bg-black text-green-300 shadow-[inset_0_0_30px_rgba(0,255,0,0.08)]'
          : 'bg-black text-green-400'
      }`}
      style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
      ref={containerRef}
    >
      {isMatrixActive ? (
        <div className="relative w-full h-[350px] overflow-hidden">
          <canvas ref={matrixCanvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-2 left-2 z-10 bg-black/60 text-green-500 border border-green-500 px-3 py-1 rounded text-xs select-none">
            Digital Rain Active. Type <span className="font-bold underline text-white">q</span> or click exit to quit.
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute bottom-2 left-2 z-10 opacity-0 w-1 text-base"
            autoFocus={viewMode === 'desktop' && !isSimulatingMobile}
          />
        </div>
      ) : (
        <div className="space-y-3.5 flex-grow">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400"><span className="hidden sm:inline">guest@</span>harshit-os:~$</span>
                <span>{item.command}</span>
              </div>
              <div className="pl-4">{item.output}</div>
            </div>
          ))}
          
          <div className="flex items-center space-x-2">
            <span className="text-blue-400"><span className="hidden sm:inline">guest@</span>harshit-os:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow bg-transparent focus:outline-none text-green-400 font-mono caret-green-400 border-none p-0 text-base sm:text-xs md:text-sm"
              autoFocus={viewMode === 'desktop' && !isSimulatingMobile}
            />
          </div>
        </div>
      )}
    </div>
  );
}
