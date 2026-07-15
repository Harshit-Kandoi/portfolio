import React, { useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Trophy, Star, CheckCircle2, Lock } from 'lucide-react';

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  points: number;
  unlocked: boolean;
  category: 'cloud' | 'code' | 'misc';
  iconColor: string;
}

export default function AchievementsApp() {
  const xp = useOSStore((state) => state.xp);
  const unlockedIds = useOSStore((state) => state.unlockedAchievements);
  const theme = useOSStore((state) => state.theme);
  const [filterCat, setFilterCat] = useState<string>('All');

  const list: AchievementItem[] = [
    {
      id: 'first_boot',
      title: 'First Boot Sequence',
      description: 'Successfully initialized the Developer OS kernel.',
      points: 50,
      unlocked: unlockedIds.includes('first_boot'),
      category: 'misc',
      iconColor: 'text-green-400 bg-green-500/10 border-green-500/25'
    },
    {
      id: 'terminal_master',
      title: 'Terminal Overlord',
      description: 'Triggered 10+ command lines within zsh interface.',
      points: 150,
      unlocked: unlockedIds.includes('terminal_master'),
      category: 'code',
      iconColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25'
    },
    {
      id: 'explorer',
      title: 'Deep Explorer',
      description: 'Opened 5 different applications in a single session.',
      points: 100,
      unlocked: unlockedIds.includes('explorer') || unlockedIds.length >= 5,
      category: 'misc',
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25'
    },
    {
      id: 'hacker',
      title: 'Hack the Planet',
      description: 'Triggered the Retro CRT theme scanlines override.',
      points: 100,
      unlocked: unlockedIds.includes('hacker') || theme === 'retro',
      category: 'code',
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
    },
    {
      id: 'cloud_architect',
      title: 'Cloud ACE Certified',
      description: 'Acquired the official Google Associate Cloud Engineer badge.',
      points: 200,
      unlocked: true,
      category: 'cloud',
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/25'
    },
    {
      id: 'container_deployer',
      title: 'Docker Master',
      description: 'Completed Docker Foundations Professional training.',
      points: 150,
      unlocked: true,
      category: 'cloud',
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25'
    }
  ];

  const currentLevel = Math.floor(xp / 100) + 1;
  const nextLevelXp = currentLevel * 100;
  const prevLevelXp = (currentLevel - 1) * 100;
  const progressPercent = Math.min(100, ((xp - prevLevelXp) / 100) * 100);

  const isLight = theme === 'light';
  const textMuted = isLight ? 'text-gray-500' : 'text-gray-400';
  const boxBg = isLight 
    ? 'bg-white border-gray-200 shadow-sm' 
    : 'bg-white/5 border-white/10 backdrop-blur-md';

  const filteredList = list.filter(item => filterCat === 'All' || item.category === filterCat.toLowerCase());
  const unlockedCount = list.filter(item => item.unlocked).length;

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-purple-100'} custom-scrollbar`}>
      
      {/* Steam Style Top Progress Section */}
      <div className={`p-6 rounded-2xl border ${boxBg} flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl`}>
        <div className="flex items-center space-x-5">
          <div className="relative flex items-center justify-center shrink-0">
            {/* Circular Progress Path */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
              <circle cx="40" cy="40" r="34" stroke="#a855f7" strokeWidth="6" fill="transparent" 
                strokeDasharray={2 * Math.PI * 34} 
                strokeDashoffset={2 * Math.PI * 34 * (1 - unlockedCount / list.length)} 
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-xs font-bold text-white mt-0.5">{unlockedCount}/{list.length}</span>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Achievements Showcase</h2>
            <p className="text-[10px] text-gray-450">Unlock milestones by exploring the system, coding commands, and reviewing credentials.</p>
          </div>
        </div>

        {/* Level & XP Gauge */}
        <div className="w-full md:w-64 space-y-2 flex-shrink-0">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <span>Level {currentLevel} Code Warrior</span>
            <span>{xp} / {nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-white/5 border border-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 border-b border-white/5 pb-3">
        {['All', 'Code', 'Cloud', 'Misc'].map((cat) => {
          const isSelected = filterCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isSelected 
                  ? 'bg-purple-650 text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Badges List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border flex items-start space-x-4 transition-all duration-300 ${
              item.unlocked 
                ? 'bg-slate-900/60 border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-purple-500/40' 
                : 'bg-slate-950/20 border-white/5 opacity-40 grayscale'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 relative ${
              item.unlocked ? item.iconColor : 'bg-white/5 border-white/5 text-gray-500'
            }`}>
              {item.unlocked ? (
                <Star className="w-5 h-5 fill-current animate-pulse text-purple-400" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0 flex-grow">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold leading-tight ${item.unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {item.title}
                </h4>
                {item.unlocked && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className={`text-[10px] mt-1 leading-relaxed ${textMuted}`}>{item.description}</p>
              <span className={`text-[9px] font-bold mt-2 block ${item.unlocked ? 'text-purple-400' : 'text-gray-500'}`}>
                +{item.points} XP Reward
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
