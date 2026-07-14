import React, { useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Sword, Shield, Zap, Sparkles, Trophy, Backpack, Flame } from 'lucide-react';
import { playNotificationSound, playTerminalClick } from '../../utils/sounds';

export default function GamingApp() {
  const xp = useOSStore((state) => state.xp);
  const addXP = useOSStore((state) => state.addXP);
  const theme = useOSStore((state) => state.theme);

  const [combatLogs, setCombatLogs] = useState<string[]>([
    "Game Initialized. Ready for training exercises."
  ]);
  const [isFighting, setIsFighting] = useState(false);

  const currentLevel = Math.floor(xp / 100) + 1;

  // RPG attributes scales with level
  const strength = 18 + currentLevel * 2; // React
  const magic = 22 + currentLevel * 3; // AI/ML
  const defense = 15 + currentLevel * 2; // Cloud/Infra
  const speed = 25 + currentLevel * 1; // Problem Solving

  const handleFight = () => {
    if (isFighting) return;
    setIsFighting(true);
    playTerminalClick();

    const enemies = [
      { name: "Production Crash Outage", hp: 120, xpReward: 25 },
      { name: "Complex Memory Leak", hp: 80, xpReward: 15 },
      { name: "Unoptimized SQL Queries", hp: 50, xpReward: 10 },
      { name: "Missing ARIA accessibility tag", hp: 30, xpReward: 5 }
    ];

    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    
    setCombatLogs((prev) => [
      ...prev,
      `⚔️ Encountered a wild [${enemy.name}]!`
    ]);

    setTimeout(() => {
      // Fight sequence 1
      const attackPower = strength + magic;
      setCombatLogs((prev) => [
        ...prev,
        `💥 Harshit casts Generative API spell! Deals ${attackPower} damage.`
      ]);
    }, 600);

    setTimeout(() => {
      // Fight sequence 2
      setCombatLogs((prev) => [
        ...prev,
        `🛡️ Harshit's Docker shield absorbs ${enemy.name}'s bugs!`
      ]);
    }, 1200);

    setTimeout(() => {
      // Fight outcome
      setCombatLogs((prev) => [
        ...prev,
        `🎉 Defeated [${enemy.name}]! Unlocked +${enemy.xpReward} XP.`
      ]);
      addXP(enemy.xpReward);
      playNotificationSound();
      setIsFighting(false);
    }, 1800);
  };

  const isLight = theme === 'light';
  const boxBg = isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-900/40 border-white/5';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100'}`}>
      
      {/* RPG Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        
        {/* Pixel Character Avatar */}
        <div className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-3 ${boxBg}`}>
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-800 to-indigo-600 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/20 select-none shadow-lg">
            <span className="text-4xl">⚔️</span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4))] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-white">Harshit Kandoi</h3>
            <span className="text-[10px] text-purple-400 font-bold">LVL {currentLevel} CODE WARRIOR</span>
          </div>
          <button
            onClick={handleFight}
            disabled={isFighting}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isFighting ? 'Battling Bug...' : 'Train / Fight Bug'}</span>
          </button>
        </div>

        {/* Character Attributes Stats */}
        <div className={`p-4 rounded-xl border space-y-3.5 ${boxBg}`}>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Attributes Stats</h4>
          
          <div className="space-y-2.5 text-[11px] sm:text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 text-gray-300 font-medium">
                <Sword className="w-3.5 h-3.5 text-red-400" />
                <span>Strength (React Frontend)</span>
              </span>
              <span className="font-bold text-white">{strength}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 text-gray-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                <span>Magic (AI Engineering)</span>
              </span>
              <span className="font-bold text-white">{magic}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 text-gray-300 font-medium">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Defense (Cloud Infrastructure)</span>
              </span>
              <span className="font-bold text-white">{defense}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 text-gray-300 font-medium">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Speed (Problem Solving)</span>
              </span>
              <span className="font-bold text-white">{speed}</span>
            </div>
          </div>
        </div>

        {/* RPG Inventory Items */}
        <div className={`p-4 rounded-xl border space-y-3.5 ${boxBg}`}>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1">
            <Backpack className="w-3.5 h-3.5" />
            <span>Inventory</span>
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Google ACE', icon: Trophy, color: 'text-amber-400 bg-amber-500/10' },
              { label: 'Docker Key', icon: Shield, color: 'text-blue-400 bg-blue-500/10' },
              { label: 'Python Scroll', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'YOLO Visor', icon: Zap, color: 'text-pink-400 bg-pink-500/10' },
              { label: 'Git Token', icon: Flame, color: 'text-purple-400 bg-purple-500/10' },
              { label: 'Offline Emul', icon: Sword, color: 'text-cyan-400 bg-cyan-500/10' }
            ].map((inv) => (
              <div
                key={inv.label}
                className={`p-2 rounded-lg flex flex-col items-center justify-center text-center border border-white/5 hover:border-purple-500/20 cursor-help ${inv.color}`}
                title={`Item: ${inv.label}`}
              >
                <inv.icon className="w-4 h-4" />
                <span className="text-[8px] mt-1.5 truncate w-full font-bold select-none">{inv.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Combat Activity logs terminal */}
      <div className="flex-grow flex flex-col min-h-[140px] space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Combat Log</h4>
        <div className="flex-grow bg-black rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/10 overflow-y-auto space-y-1.5 h-44">
          {combatLogs.map((log, idx) => (
            <div key={idx} className="flex items-center space-x-1 animate-fade-in">
              <span>&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
