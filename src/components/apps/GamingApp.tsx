import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Sword, Shield, Zap, Sparkles, Trophy, Backpack, Flame, X, RotateCcw, Check } from 'lucide-react';
import { playNotificationSound, playTerminalClick } from '../../utils/sounds';
import { initialCombatLogs, inventoryItems, InventoryItem } from '../../data/gamingData';

export default function GamingApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const xp = useOSStore((state) => state.xp);
  const addXP = useOSStore((state) => state.addXP);
  const theme = useOSStore((state) => state.theme);
  const incrementCombatCount = useOSStore((state) => state.incrementCombatCount);
  const globalViewMode = useOSStore((state) => state.viewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;

  const [combatLogs, setCombatLogs] = useState<string[]>(initialCombatLogs);
  const [isFighting, setIsFighting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const combatLogRef = useRef<HTMLDivElement>(null);

  // Preview allocation (sandboxed — does NOT change real stats)
  const [allocationMode, setAllocationMode] = useState(false);
  const [previewBonus, setPreviewBonus] = useState({ strength: 0, magic: 0, defense: 0, speed: 0 });
  const PREVIEW_POOL = 5;  // preview points to distribute
  const usedPreview = Object.values(previewBonus).reduce((s, v) => s + v, 0);
  const remainingPreview = PREVIEW_POOL - usedPreview;

  const adjustPreview = (key: keyof typeof previewBonus, delta: number) => {
    setPreviewBonus((prev) => {
      const next = { ...prev, [key]: Math.max(0, prev[key] + delta) };
      const total = Object.values(next).reduce((s, v) => s + v, 0);
      return total <= PREVIEW_POOL ? next : prev;
    });
  };

  const resetPreview = () => setPreviewBonus({ strength: 0, magic: 0, defense: 0, speed: 0 });
  const applyPreview = () => {
    // Apply = just exit preview mode. Stats are cosmetic only.
    setAllocationMode(false);
    resetPreview();
  };

  // Auto-scroll combat log on new entries
  useEffect(() => {
    if (combatLogRef.current) {
      combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
    }
  }, [combatLogs]);

  const currentLevel = Math.floor(xp / 100) + 1;

  // RPG attributes scale with level (real — not user-editable)
  const strength = 18 + currentLevel * 2;
  const magic    = 22 + currentLevel * 3;
  const defense  = 15 + currentLevel * 2;
  const speed    = 25 + currentLevel * 1;

  // Preview values (cosmetic preview, never persisted)
  const previewStrength = strength + previewBonus.strength;
  const previewMagic    = magic    + previewBonus.magic;
  const previewDefense  = defense  + previewBonus.defense;
  const previewSpeed    = speed    + previewBonus.speed;

  const handleFight = () => {
    if (isFighting) return;
    setIsFighting(true);
    playTerminalClick();
    incrementCombatCount();

    const enemies = [
      { name: "Production Crash Outage", hp: 120, xpReward: 25 },
      { name: "Complex Memory Leak",     hp: 80,  xpReward: 15 },
      { name: "Unoptimized SQL Queries", hp: 50,  xpReward: 10 },
      { name: "Missing ARIA tag",        hp: 30,  xpReward: 5  },
      { name: "Infinite Render Loop",    hp: 60,  xpReward: 12 },
    ];

    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    setCombatLogs((prev) => [...prev, `⚔️ Encountered a wild [${enemy.name}]!`]);

    setTimeout(() => {
      const attackPower = strength + magic;
      setCombatLogs((prev) => [...prev, `💥 Harshit casts Generative API spell! Deals ${attackPower} damage.`]);
    }, 600);

    setTimeout(() => {
      setCombatLogs((prev) => [...prev, `🛡️ Harshit's Docker shield absorbs ${enemy.name}'s bugs!`]);
    }, 1200);

    setTimeout(() => {
      setCombatLogs((prev) => [...prev, `🎉 Defeated [${enemy.name}]! Earned +${enemy.xpReward} XP.`]);
      addXP(enemy.xpReward);
      playNotificationSound();
      setIsFighting(false);
    }, 1800);
  };

  const isLight = theme === 'light';
  const boxBg = isLight ? 'bg-white border-gray-250 shadow-sm' : 'bg-slate-900/40 border-white/5 backdrop-blur-md';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-purple-100'} custom-scrollbar`}>
      
      {/* RPG Profile Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-5'} items-start`}>
        
        {/* Pixel Character Avatar */}
        <div className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-3 ${boxBg}`}>
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-800 to-indigo-600 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/20 select-none shadow-lg">
            <img src="/gaming profile.webp" alt="Harshit Character" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4))] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-white">Harshit Kandoi</h3>
            <span className="text-[10px] text-purple-400 font-bold">LVL {currentLevel} CODE WARRIOR</span>
          </div>
          <button
            onClick={handleFight}
            disabled={isFighting}
            className="w-full bg-purple-650 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-md shadow-purple-500/10"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isFighting ? 'Battling Bug...' : 'Train / Fight Bug'}</span>
          </button>
        </div>

        {/* Character Attributes Stats – with Preview Allocation */}
        <div className={`p-4 rounded-xl border space-y-3 ${boxBg}`}>
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Attributes</h4>
            {!allocationMode ? (
              <button
                onClick={() => setAllocationMode(true)}
                className="text-[9px] text-purple-400 hover:text-purple-300 border border-purple-500/25 hover:border-purple-500/50 px-2 py-0.5 rounded-full transition"
              >
                Preview Allocation
              </button>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-[9px] text-amber-400 font-bold">{remainingPreview} pts left</span>
                <button onClick={resetPreview} className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition" title="Reset">
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button onClick={applyPreview} className="p-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition" title="Apply Preview">
                  <Check className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {[
            { key: 'strength' as const, label: 'Strength', sub: 'React Frontend', icon: Sword, color: 'text-red-500',     base: strength,  preview: previewStrength },
            { key: 'magic'    as const, label: 'Magic',    sub: 'AI Engineering', icon: Sparkles, color: 'text-amber-500', base: magic,     preview: previewMagic    },
            { key: 'defense'  as const, label: 'Defense',  sub: 'Cloud Infra',    icon: Shield, color: 'text-blue-500',   base: defense,   preview: previewDefense  },
            { key: 'speed'    as const, label: 'Speed',    sub: 'Problem Solving',icon: Zap, color: 'text-emerald-500',  base: speed,     preview: previewSpeed    },
          ].map(({ key, label, sub, icon: Icon, color, base, preview }) => (
            <div key={key} className="flex items-center space-x-2 text-[11px]">
              <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
              <div className="flex-grow">
                <div className="flex justify-between mb-0.5">
                  <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-gray-300'}`}>{label} <span className={`text-[9px] ${isLight ? 'text-slate-600' : 'text-gray-500'}`}>({sub})</span></span>
                  <span className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {allocationMode ? preview : base}
                    {allocationMode && previewBonus[key] > 0 && (
                      <span className="text-emerald-500 text-[9px] ml-1">+{previewBonus[key]}</span>
                    )}
                  </span>
                </div>
                <div className={`h-1 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/5'}`}>
                  <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}/60 transition-all duration-300`}
                    style={{ width: `${Math.min(100, (allocationMode ? preview : base) / 1.2)}%` }} />
                </div>
              </div>
              {allocationMode && (
                <div className="flex items-center space-x-1 shrink-0">
                  <button onClick={() => adjustPreview(key, -1)} disabled={previewBonus[key] <= 0}
                    className={`w-4 h-4 rounded text-xs disabled:opacity-30 transition flex items-center justify-center ${isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-white/10 text-gray-400 hover:text-white'}`}>−</button>
                  <button onClick={() => adjustPreview(key, 1)} disabled={remainingPreview <= 0}
                    className={`w-4 h-4 rounded text-xs disabled:opacity-30 transition flex items-center justify-center ${isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-white/10 text-gray-400 hover:text-white'}`}>+</button>
                </div>
              )}
            </div>
          ))}

          {allocationMode && (
            <p className={`text-[8px] italic text-center pt-1 ${isLight ? 'text-slate-500' : 'text-gray-600'}`}>Preview only — stats are not permanently changed.</p>
          )}
        </div>

        {/* RPG Inventory Items */}
        <div className={`p-4 rounded-xl border space-y-3.5 ${boxBg}`}>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-500 flex items-center space-x-1">
            <Backpack className="w-3.5 h-3.5" />
            <span>Inventory</span>
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            {inventoryItems.map((inv) => {
              // Map icons statically
              const Icon = inv.id === 'gcp_ace' ? Trophy :
                          inv.id === 'docker_foundations' ? Shield :
                          inv.id === 'yolo_models' ? Zap :
                          inv.id === 'python_scroll' ? Sparkles :
                          inv.id === 'git_token' ? Flame : Sword;
              
              const rarityColor = inv.rarity === 'Legendary' ? 'text-amber-500 bg-amber-500/10 border-amber-500/30 hover:border-amber-500 font-bold' :
                                  inv.rarity === 'Epic' ? 'text-purple-500 bg-purple-500/10 border-purple-500/30 hover:border-purple-500 font-bold' :
                                  'text-blue-500 bg-blue-500/10 border-blue-500/30 hover:border-blue-500 font-bold';

              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedItem(inv)}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center text-center border cursor-pointer transition transform active:scale-95 ${rarityColor}`}
                  title={`Item: ${inv.name}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[8px] mt-1.5 truncate w-full font-bold select-none">{inv.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Combat Activity logs terminal */}
      <div className="flex-grow flex flex-col min-h-[140px] space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Combat Log</h4>
        <div
          ref={combatLogRef}
          className={`flex-grow rounded-xl p-4 font-mono text-[11px] text-emerald-400 border overflow-y-auto space-y-1.5 h-44 custom-scrollbar ${
            isLight ? 'bg-slate-900 border-slate-700' : 'bg-black border-white/10'
          }`}
        >
          {combatLogs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-1 animate-fade-in">
              <span className="opacity-40 shrink-0">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[20000] flex items-center justify-center p-4">
          <div className={`p-6 rounded-2xl w-full max-w-sm space-y-4 relative shadow-2xl animate-scale-up border ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-gray-800 text-white'
          }`}>
            <button 
              onClick={() => setSelectedItem(null)}
              className={`absolute top-3 right-3 p-1 rounded-md transition ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Backpack className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedItem.name}</h3>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase mt-1.5 inline-block ${
                  selectedItem.rarity === 'Legendary' ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' :
                  selectedItem.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30' :
                  'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                }`}>{selectedItem.rarity} {selectedItem.category}</span>
              </div>
            </div>
            <p className={`text-[10px] leading-relaxed text-justify ${isLight ? 'text-slate-700 font-medium' : 'text-gray-400'}`}>{selectedItem.description}</p>
            <div className={`p-2.5 rounded-lg border text-[10px] font-bold ${
              isLight ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-white/5 border-white/5 text-purple-300'
            }`}>
              ⚡ Boost: {selectedItem.statBoost}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
