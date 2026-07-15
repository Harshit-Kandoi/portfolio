import React, { useState } from 'react';
import { useOSStore, VISITOR_ACHIEVEMENTS } from '../../store/useOSStore';
import { Trophy, Star, Lock, CheckCircle, Zap, Award, User } from 'lucide-react';

// ─── Developer Credentials (Harshit's real achievements) ─────────────────────
const DEV_CREDENTIALS = [
  {
    id: 'gcp_ace',
    title: 'Google Cloud Associate Cloud Engineer',
    org: 'Google',
    year: '2024',
    emoji: '☁️',
    color: 'from-blue-500 to-cyan-500',
    description: 'Designed and deployed GCP workloads including Compute Engine, GKE, Cloud Storage, Pub/Sub, and IAM.',
  },
  {
    id: 'tf_cert',
    title: 'TensorFlow Developer Certificate',
    org: 'DeepLearning.AI / Google',
    year: '2023',
    emoji: '🤖',
    color: 'from-orange-500 to-amber-400',
    description: 'Proficient in building and training neural networks using TensorFlow 2.x for real-world ML problems.',
  },
  {
    id: 'mlops',
    title: 'MLOps Specialization',
    org: 'DeepLearning.AI',
    year: '2024',
    emoji: '🔧',
    color: 'from-purple-500 to-indigo-500',
    description: 'Covers ML pipeline design, model versioning, monitoring, and production deployment patterns.',
  },
  {
    id: 'data_analytics',
    title: 'Google Data Analytics Professional',
    org: 'Google / Coursera',
    year: '2023',
    emoji: '📊',
    color: 'from-emerald-500 to-teal-500',
    description: 'End-to-end data analysis: spreadsheets, SQL, R, Tableau, and storytelling with data.',
  },
  {
    id: 'meta_react',
    title: 'Meta React Developer Professional',
    org: 'Meta / Coursera',
    year: '2024',
    emoji: '⚛️',
    color: 'from-sky-500 to-blue-500',
    description: 'Advanced React patterns, hooks, testing, and frontend performance optimization.',
  },
  {
    id: 'kaggle_nlp',
    title: 'NLP Competition – Top 20%',
    org: 'Kaggle',
    year: '2024',
    emoji: '🏆',
    color: 'from-amber-500 to-yellow-400',
    description: 'Achieved top 20% ranking in a Kaggle NLP classification challenge with ensemble models.',
  },
];

// ─── XP Level Thresholds ─────────────────────────────────────────────────────
const getLevelInfo = (xp: number) => {
  const levels = [
    { min: 0,    max: 199,  label: 'Visitor',      color: 'text-gray-400' },
    { min: 200,  max: 499,  label: 'Explorer',     color: 'text-blue-400' },
    { min: 500,  max: 999,  label: 'Curious Mind', color: 'text-purple-400' },
    { min: 1000, max: 1999, label: 'Code Warrior', color: 'text-amber-400' },
    { min: 2000, max: Infinity, label: 'Elite Visitor', color: 'text-rose-400' },
  ];
  const current = levels.find((l) => xp >= l.min && xp < l.max) ?? levels[levels.length - 1];
  const next = levels[levels.indexOf(current) + 1];
  const progress = next ? ((xp - current.min) / (next.min - current.min)) * 100 : 100;
  return { current, next, progress };
};

export default function AchievementsApp() {
  const xp             = useOSStore((s) => s.xp);
  const unlockedIds    = useOSStore((s) => s.unlockedAchievements);
  const theme          = useOSStore((s) => s.theme);
  const [tab, setTab]  = useState<'visitor' | 'dev'>('visitor');

  const { current, next, progress } = getLevelInfo(xp);
  const isLight = theme === 'light';
  const bg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-white';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-white/4 border-white/8';

  const unlockedCount = unlockedIds.length;
  const totalAchieves = VISITOR_ACHIEVEMENTS.length;
  const earnedXP      = VISITOR_ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id)).reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${bg}`}>
      {/* XP Header */}
      <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-purple-900/60 px-5 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Your Session XP</h2>
              <p className={`text-xs font-bold ${current.color}`}>{current.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-amber-400 font-mono">{xp} XP</p>
            <p className="text-[9px] text-gray-400">{unlockedCount}/{totalAchieves} unlocked</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div>
          <div className="flex justify-between text-[9px] text-gray-500 mb-1">
            <span>{current.label}</span>
            {next && <span>{next.label} ({next.min} XP)</span>}
          </div>
          <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/5 shrink-0">
        {(['visitor', 'dev'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1.5 ${
              tab === t
                ? 'border-b-2 border-purple-500 text-purple-300'
                : isLight ? 'text-gray-400 hover:text-gray-600' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {t === 'visitor' ? <User className="w-3 h-3" /> : <Award className="w-3 h-3" />}
            <span>{t === 'visitor' ? 'Your Journey' : 'Dev Credentials'}</span>
          </button>
        ))}
      </div>

      {/* ── Visitor Achievements Tab ─────────────────────────────────────── */}
      {tab === 'visitor' && (
        <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            {[
              { label: 'Achievements', value: `${unlockedCount}/${totalAchieves}`, icon: Trophy, color: 'text-amber-400' },
              { label: 'Earned XP', value: `${earnedXP}`, icon: Zap, color: 'text-purple-400' },
              { label: 'Progress', value: `${Math.round((unlockedCount / totalAchieves) * 100)}%`, icon: Star, color: 'text-cyan-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`rounded-xl p-3 border text-center ${cardBg}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                <p className="text-sm font-black">{value}</p>
                <p className="text-[9px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {VISITOR_ACHIEVEMENTS.map((ach) => {
            const unlocked = unlockedIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`flex items-start space-x-3 p-3 rounded-xl border transition ${cardBg} ${
                  unlocked ? 'border-purple-500/25 shadow-[0_0_10px_rgba(168,85,247,0.05)]' : 'opacity-55'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  unlocked ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/3 border border-white/5 grayscale'
                }`}>
                  {unlocked ? ach.emoji : <Lock className="w-4 h-4 text-gray-600" />}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between space-x-2">
                    <p className={`text-xs font-bold leading-tight ${unlocked ? '' : 'opacity-50'}`}>
                      {unlocked ? ach.title : '???'}
                    </p>
                    {unlocked && (
                      <div className="flex items-center space-x-1 shrink-0">
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-bold">+{ach.xp}</span>
                      </div>
                    )}
                  </div>
                  <p className={`text-[10px] mt-0.5 leading-snug ${unlocked ? 'text-gray-400' : 'text-gray-700 italic'}`}>
                    {unlocked ? ach.description : 'Keep exploring to unlock this achievement...'}
                  </p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {unlocked
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <Lock className="w-4 h-4 text-gray-700" />
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dev Credentials Tab ─────────────────────────────────────────── */}
      {tab === 'dev' && (
        <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <p className="text-[10px] text-gray-500 text-center pb-1">
            Harshit's certifications, awards & professional milestones.
          </p>
          {DEV_CREDENTIALS.map((cert) => (
            <div key={cert.id} className={`rounded-2xl border overflow-hidden ${cardBg}`}>
              <div className={`bg-gradient-to-r ${cert.color} px-4 py-3 flex items-center space-x-3`}>
                <span className="text-2xl">{cert.emoji}</span>
                <div>
                  <h3 className="text-xs font-black text-white leading-tight">{cert.title}</h3>
                  <p className="text-[10px] text-white/70">{cert.org} · {cert.year}</p>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-[11px] leading-relaxed opacity-70">{cert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
