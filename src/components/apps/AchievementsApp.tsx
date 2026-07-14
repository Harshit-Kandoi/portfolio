import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Trophy, Star, CheckCircle2 } from 'lucide-react';

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

  const list: AchievementItem[] = [
    {
      id: 'first_boot',
      title: 'First Boot Sequence',
      description: 'Successfully initialized the Developer OS kernel.',
      points: 50,
      unlocked: unlockedIds.includes('first_boot'),
      category: 'misc',
      iconColor: 'text-green-400 bg-green-500/10 border-green-500/20'
    },
    {
      id: 'terminal_master',
      title: 'Terminal Overlord',
      description: 'Triggered 10+ command lines within zsh interface.',
      points: 150,
      unlocked: unlockedIds.includes('terminal_master'),
      category: 'code',
      iconColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    },
    {
      id: 'explorer',
      title: 'Deep Explorer',
      description: 'Opened 5 different applications in a single session.',
      points: 100,
      unlocked: unlockedIds.includes('explorer') || unlockedIds.length >= 5, // auto unlock or manual trigger
      category: 'misc',
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'hacker',
      title: 'Hack the Planet',
      description: 'Triggered the Retro CRT theme scanlines override.',
      points: 100,
      unlocked: unlockedIds.includes('hacker') || theme === 'retro',
      category: 'code',
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'cloud_architect',
      title: 'Cloud ACE Certified',
      description: 'Acquired the official Google Associate Cloud Engineer badge.',
      points: 200,
      unlocked: true, // Professional real-world achievement
      category: 'cloud',
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'container_deployer',
      title: 'Docker Master',
      description: 'Completed Docker Foundations Professional training.',
      points: 150,
      unlocked: true, // Professional real-world achievement
      category: 'cloud',
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    }
  ];

  const currentLevel = Math.floor(xp / 100) + 1;
  const nextLevelXp = currentLevel * 100;
  const prevLevelXp = (currentLevel - 1) * 100;
  const progressPercent = Math.min(100, ((xp - prevLevelXp) / 100) * 100);

  const isLight = theme === 'light';
  const textMuted = isLight ? 'text-gray-500' : 'text-gray-400';
  const boxBg = isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-900/40 border-white/5';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100'}`}>
      
      {/* Level Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Dev Level */}
        <div className={`p-4 rounded-xl border flex items-center space-x-4 ${boxBg}`}>
          <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/35 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">Dev Level</span>
            <h3 className="text-lg font-black text-white mt-0.5">{currentLevel}</h3>
          </div>
        </div>

        {/* XP Progress */}
        <div className={`p-4 rounded-xl border col-span-2 flex flex-col justify-center space-y-2 ${boxBg}`}>
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <span>XP Tracker</span>
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

      {/* Badges and Milestones list */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">Milestone Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {list.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex items-start space-x-3.5 transition-all ${
                item.unlocked 
                  ? 'bg-slate-900/60 border-purple-500/25' 
                  : 'bg-slate-950/20 border-white/5 opacity-50'
              }`}
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${item.iconColor}`}>
                <Star className={`w-4 h-4 ${item.unlocked ? 'fill-current' : ''}`} />
              </span>

              <div className="min-w-0 flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold leading-tight ${item.unlocked ? 'text-white' : 'text-gray-500'}`}>
                    {item.title}
                  </h4>
                  {item.unlocked && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className={`text-[10px] mt-1 leading-normal ${textMuted}`}>{item.description}</p>
                <span className="text-[9px] font-bold text-purple-400 mt-2 block">+{item.points} XP Reward</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
