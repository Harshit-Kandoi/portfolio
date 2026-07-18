import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { SNAKE_CONFIG } from '../../data/config';
import { RotateCcw, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Cell = { x: number; y: number };

const GRID = SNAKE_CONFIG.gridSize;

const rand = (max: number) => Math.floor(Math.random() * max);
const randFood = (snake: Cell[]): Cell => {
  let food: Cell;
  do { food = { x: rand(GRID), y: rand(GRID) }; }
  while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
};

const INITIAL_SNAKE: Cell[] = [
  { x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 },
];

export default function SnakeGame() {
  const theme = useOSStore((s) => s.theme);
  const unlockAchievement = useOSStore((s) => s.unlockAchievement);
  const addNotification   = useOSStore((s) => s.addNotification);
  const soundEnabled      = useOSStore((s) => s.soundEnabled);
  const activeWindowId    = useOSStore((s) => s.activeWindowId);
  const viewMode          = useOSStore((s) => s.viewMode);

  const [snake, setSnake]     = useState<Cell[]>(INITIAL_SNAKE);
  const [food, setFood]       = useState<Cell>(() => randFood(INITIAL_SNAKE));
  const foodRef               = useRef<Cell>(INITIAL_SNAKE[0]); // placeholder, will sync in useEffect or immediately
  
  // Keep foodRef in sync with initial food state on mount
  useEffect(() => {
    foodRef.current = food;
  }, []);
  const [score, setScore]     = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem(SNAKE_CONFIG.localStorageKey) || '0', 10); } catch { return 0; }
  });
  const [running, setRunning] = useState(false);
  const [dead, setDead]       = useState(false);
  const [muted, setMuted]     = useState(!soundEnabled);

  const nextDirRef = useRef<Dir>('RIGHT');
  const lastTickedDirRef = useRef<Dir>('RIGHT');
  const tickMs = useRef(SNAKE_CONFIG.initialSpeed);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const changeDirection = useCallback((newDir: Dir) => {
    const opposites: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (newDir !== opposites[lastTickedDirRef.current]) {
      nextDirRef.current = newDir;
    }
    setRunning((r) => {
      if (!r && !dead) {
        return true;
      }
      return r;
    });
  }, [dead]);

  // Prevent browser window/drawer scroll while playing on mobile
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleTouchMove = (e: TouchEvent) => {
      if (running) {
        e.preventDefault();
      }
    };
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [running]);

  // Sound helpers
  const beep = useCallback((freq: number, dur: number) => {
    if (muted) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + dur / 1000);
    } catch { /* noop */ }
  }, [muted]);

  const handleControl = (newDir: Dir, e?: React.PointerEvent) => {
    if (e) {
      e.preventDefault();
    }
    changeDirection(newDir);
  };

  const reset = useCallback(() => {
    trackEvent('snake_game_start');
    setSnake(INITIAL_SNAKE);
    const newFood = randFood(INITIAL_SNAKE);
    foodRef.current = newFood;
    setFood(newFood);
    nextDirRef.current = 'RIGHT';
    lastTickedDirRef.current = 'RIGHT';
    setScore(0);
    tickMs.current = SNAKE_CONFIG.initialSpeed;
    setDead(false);
    setRunning(true);
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (activeWindowId !== 'snake') return;

    const map: Record<string, Dir> = {
      ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
      w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT'
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (dead || (!running && score === 0)) {
          e.preventDefault();
          reset();
        }
        return;
      }
      const newDir = map[e.key];
      if (!newDir) return;
      e.preventDefault();
      changeDirection(newDir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeWindowId, changeDirection, dead, running, score, reset]);

  // Touch controls
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const minSwipeDistance = 30;
    if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
      touchStart.current = null;
      return;
    }
    let newDir: Dir;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
      newDir = dy > 0 ? 'DOWN' : 'UP';
    }
    changeDirection(newDir);
    touchStart.current = null;
  };

  // Game loop
  useEffect(() => {
    if (!running || dead) return;

    const tick = () => {
      const currentDir = nextDirRef.current;
      lastTickedDirRef.current = currentDir;

      setSnake((prev) => {
        const head = prev[0];
        const DELTAS: Record<Dir, Cell> = { UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 }, LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 } };
        const d = DELTAS[currentDir];
        const newHead = { x: head.x + d.x, y: head.y + d.y };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
          setDead(true); setRunning(false);
          beep(220, 300);
          return prev;
        }
        // Self collision
        if (prev.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          setDead(true); setRunning(false);
          beep(220, 300);
          return prev;
        }
        // Food
        const ateFood = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
        const next = ateFood ? [newHead, ...prev] : [newHead, ...prev.slice(0, -1)];

        if (ateFood) {
          beep(880, 80);
          const newFood = randFood(next);
          foodRef.current = newFood;
          setFood(newFood);
          setScore((s) => {
            const ns = s + 10;
            if (ns > highScore) {
              setHighScore(ns);
              try { localStorage.setItem(SNAKE_CONFIG.localStorageKey, String(ns)); } catch { /* noop */ }
            }
            return ns;
          });
          
          const nfp = next.length - 3;
          if (nfp > 0 && nfp % SNAKE_CONFIG.speedThreshold === 0) {
            tickMs.current = Math.max(60, tickMs.current - SNAKE_CONFIG.speedIncrement);
          }
        }
        return next;
      });

      loopRef.current = setTimeout(tick, tickMs.current);
    };

    loopRef.current = setTimeout(tick, tickMs.current);

    return () => { if (loopRef.current) clearTimeout(loopRef.current); };
  }, [running, dead, highScore, beep]);

  // Achievements and analytics on death
  useEffect(() => {
    if (dead) {
      trackEvent('snake_game_over', { score });
      const prevHighScore = (() => {
        try { return parseInt(localStorage.getItem(SNAKE_CONFIG.localStorageKey) || '0', 10); } catch { return 0; }
      })();
      if (score > prevHighScore) {
        trackEvent('snake_high_score', { score });
      }

      if (score >= 50) {
        unlockAchievement('snake_champion');
        addNotification('🐍 Snake Champion!', `You scored ${score} points on Snake!`, 'achievement', 'gaming');
      } else {
        addNotification('🐍 Snake Game Over', `Score: ${score} | High Score: ${highScore}`, 'info', 'gaming');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dead]);

  const isLight = theme === 'light';
  const bg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-white';
  const cellPx = 16; // px per cell
  const boardSize = GRID * cellPx;

  return (
    <div ref={containerRef} className={`flex flex-col flex-grow h-full items-center justify-center p-2 sm:p-4 space-y-2 sm:space-y-4 select-none ${bg}`}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="space-y-0.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Score</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">{score.toString().padStart(4, '0')}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-purple-400">🐍 SNAKE</p>
          <p className="text-[9px] text-gray-500">Nokia OS Edition</p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Best</p>
          <p className="text-2xl font-black text-amber-400 font-mono">{highScore.toString().padStart(4, '0')}</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative border-2 border-purple-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.1)]"
        style={{ boxSizing: 'content-box', width: boardSize, height: boardSize, background: isLight ? '#f0fdf4' : '#020c04' }}>

        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.15) 2px, rgba(0,255,0,0.15) 4px)' }} />

        {/* Food */}
        <div
          className="absolute rounded-sm bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)] transition-all duration-100"
          style={{ left: food.x * cellPx + 2, top: food.y * cellPx + 2, width: cellPx - 4, height: cellPx - 4 }}
        />

        {/* Snake */}
        {snake.map((seg, i) => (
          <div
            key={`${seg.x}-${seg.y}-${i}`}
            className="absolute rounded-sm transition-all duration-50"
            style={{
              left: seg.x * cellPx + 1,
              top: seg.y * cellPx + 1,
              width: cellPx - 2,
              height: cellPx - 2,
              background: i === 0 ? '#4ade80' : `hsl(${145 - i * 2}, 70%, ${50 - i * 0.5}%)`,
              boxShadow: i === 0 ? '0 0 8px rgba(74, 222, 128, 0.6)' : 'none',
            }}
          />
        ))}

        {/* Game Over / Paused Overlay */}
        {(dead || (!running && score === 0)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm space-y-3">
            {dead ? (
              <>
                <p className="text-red-400 text-lg font-black font-mono tracking-widest animate-pulse">GAME OVER</p>
                <p className="text-gray-400 text-xs">Score: <span className="text-white font-bold">{score}</span></p>
                <button onClick={reset} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition active:scale-95">
                  <RotateCcw className="w-3.5 h-3.5" /><span>Play Again</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-emerald-400 text-sm font-black font-mono tracking-widest animate-pulse">PRESS START</p>
                <p className="text-gray-500 text-[10px]">Arrow keys / WASD / Swipe to play</p>
                <button onClick={reset} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition active:scale-95">
                  <Play className="w-3.5 h-3.5" /><span>Start Game</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Pause overlay */}
        {running === false && !dead && score > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <p className="text-amber-400 text-sm font-black font-mono tracking-widest">PAUSED</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => { if (!dead) setRunning((r) => !r); }}
          disabled={dead}
          className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-40"
        >
          {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{running ? 'Pause' : 'Resume'}</span>
        </button>
        <button
          onClick={reset}
          className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /><span>Restart</span>
        </button>
        <button
          onClick={() => setMuted((m) => !m)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nokia style controller keypad */}
      {viewMode !== 'desktop' && (
        <div className="flex flex-col items-center bg-slate-900/40 p-4 rounded-3xl border border-white/5 shadow-inner w-full max-w-[220px] touch-none">
          <div className="grid grid-cols-3 gap-2 w-full touch-none">
            <div></div>
            <button
              onPointerDown={(e) => handleControl('UP', e)}
              className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-white/10 font-bold flex flex-col items-center justify-center transition touch-none select-none"
            >
              <span className="text-[8px] text-gray-500 uppercase">▲</span>
            </button>
            <div></div>

            <button
              onPointerDown={(e) => handleControl('LEFT', e)}
              className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-white/10 font-bold flex flex-col items-center justify-center transition touch-none select-none"
            >
              <span className="text-[8px] text-gray-500 uppercase">◀</span>
            </button>
            <div className="h-10 rounded-xl bg-slate-950 flex items-center justify-center font-bold text-gray-700 border border-white/5 text-xs font-mono select-none">
              ●
            </div>
            <button
              onPointerDown={(e) => handleControl('RIGHT', e)}
              className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-white/10 font-bold flex flex-col items-center justify-center transition touch-none select-none"
            >
              <span className="text-[8px] text-gray-500 uppercase">▶</span>
            </button>

            <div></div>
            <button
              onPointerDown={(e) => handleControl('DOWN', e)}
              className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-white/10 font-bold flex flex-col items-center justify-center transition touch-none select-none"
            >
              <span className="text-[8px] text-gray-500 uppercase">▼</span>
            </button>
            <div></div>
          </div>
        </div>
      )}
 
      <p className="text-[9px] text-gray-600 text-center">
        {viewMode === 'desktop' ? 'Use Keyboard (WASD / Arrows & Enter) to control' : 'Use D-pad, Swipe, or Keyboard to control'}
      </p>
    </div>
  );
}
