import React, { useState, useEffect, useRef } from 'react';
import { useOSStore, AppTheme } from '../../store/useOSStore';
import { playTerminalClick } from '../../utils/sounds';

interface HistoryItem {
  command: string;
  output: React.ReactNode;
}

export default function TerminalWindow() {
  const { openWindow, setTheme, addTerminalCommand } = useOSStore();
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: 'system_init',
      output: (
        <div className="text-gray-400">
          Welcome to Harshit-OS v2.0.0 Terminal.
          Type <span className="text-yellow-400">help</span> for a list of available commands.
        </div>
      ),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandIndex, setCommandIndex] = useState(-1);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  
  const historyStore = useOSStore((state) => state.terminalHistory);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, isMatrixActive]);

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

      case 'matrix':
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
              <div><span className="text-blue-400">OS</span>: Developer Portfolio OS v2</div>
              <div><span className="text-blue-400">Kernel</span>: React 18 / Zustand / Vite</div>
              <div><span className="text-blue-400">Shell</span>: Antigravity Shell 1.0</div>
              <div><span className="text-blue-400">Resolution</span>: {window.innerWidth}x{window.innerHeight}</div>
              <div><span className="text-blue-400">Theme</span>: {useOSStore.getState().theme.toUpperCase()}</div>
              <div><span className="text-blue-400">Developer</span>: Harshit Kandoi</div>
              <div><span className="text-blue-400">Role</span>: Software & AI Engineer</div>
            </div>
          </div>
        );
        break;

      case 'whoami':
        output = (
          <p className="text-gray-300">
            guest@portfolio-os. Level: Code Warrior. Open to interview inquiries.
          </p>
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
          <div className="grid grid-cols-4 gap-2 text-blue-400 font-bold">
            <div>about.txt</div>
            <div>projects/</div>
            <div>resume_pdf</div>
            <div>contact_info/</div>
          </div>
        );
        break;

      case 'pwd':
        output = <p className="text-gray-400">/users/harshit/workspace</p>;
        break;

      case 'cat':
        if (args[0] === 'about.txt') {
          output = <p className="text-gray-300">Harshit Kandoi is a Software & AI Engineer. Key stack: Python, PyTorch, React, Node, GCP, Flask.</p>;
        } else {
          output = <p className="text-red-400">cat: file not found or unspecified. Try: cat about.txt</p>;
        }
        break;

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
      className="flex-grow flex flex-col bg-black text-green-400 font-mono text-sm p-4 h-full cursor-text overflow-y-auto"
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
            className="absolute bottom-2 left-2 z-10 opacity-0 w-1"
            autoFocus
          />
        </div>
      ) : (
        <div className="space-y-3.5 flex-grow">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">guest@harshit-os:~$</span>
                <span>{item.command}</span>
              </div>
              <div className="pl-4">{item.output}</div>
            </div>
          ))}
          
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">guest@harshit-os:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow bg-transparent focus:outline-none text-green-400 font-mono caret-green-400 border-none p-0"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}
