import React, { useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Sword, Shield, Zap, Sparkles, Trophy, Backpack, Flame, X } from 'lucide-react';
import { playNotificationSound, playTerminalClick } from '../../utils/sounds';
import { initialCombatLogs, inventoryItems, InventoryItem } from '../../data/gamingData';

export default function GamingApp() {
  const xp = useOSStore((state) => state.xp);
  const addXP = useOSStore((state) => state.addXP);
  const theme = useOSStore((state) => state.theme);

  const [combatLogs, setCombatLogs] = useState<string[]>(initialCombatLogs);
  const [isFighting, setIsFighting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

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
  const boxBg = isLight ? 'bg-white border-gray-250 shadow-sm' : 'bg-slate-900/40 border-white/5 backdrop-blur-md';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-purple-100'} custom-scrollbar`}>
      
      {/* RPG Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        
        {/* Pixel Character Avatar */}
        <div className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-3 ${boxBg}`}>
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-800 to-indigo-600 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/20 select-none shadow-lg">
            <img src="/gaming profile.png" alt="Harshit Character" className="w-full h-full object-cover" />
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
            {inventoryItems.map((inv) => {
              // Map icons statically
              const Icon = inv.id === 'gcp_ace' ? Trophy :
                          inv.id === 'docker_foundations' ? Shield :
                          inv.id === 'yolo_models' ? Zap :
                          inv.id === 'python_scroll' ? Sparkles :
                          inv.id === 'git_token' ? Flame : Sword;
              
              const rarityColor = inv.rarity === 'Legendary' ? 'text-amber-400 bg-amber-500/10 border-amber-500/25 hover:border-amber-400' :
                                  inv.rarity === 'Epic' ? 'text-purple-400 bg-purple-500/10 border-purple-500/25 hover:border-purple-400' :
                                  'text-blue-400 bg-blue-500/10 border-blue-500/25 hover:border-blue-400';

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
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Combat Log</h4>
        <div className="flex-grow bg-black rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/10 overflow-y-auto space-y-1.5 h-44 custom-scrollbar">
          {combatLogs.map((log, idx) => (
            <div key={idx} className="flex items-center space-x-1 animate-fade-in">
              <span>&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[20000] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-gray-800 p-6 rounded-2xl w-full max-w-sm space-y-4 text-white relative shadow-2xl animate-scale-up">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                <Backpack className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">{selectedItem.name}</h3>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase mt-1.5 inline-block ${
                  selectedItem.rarity === 'Legendary' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/20' :
                  selectedItem.rarity === 'Epic' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' :
                  'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                }`}>{selectedItem.rarity} {selectedItem.category}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed text-justify">{selectedItem.description}</p>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 text-[10px] font-bold text-purple-300">
              ⚡ Boost: {selectedItem.statBoost}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
