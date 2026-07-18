import { useEffect, useState, useRef } from 'react';
import { X, GitBranch, GitMerge, Star, Upload, Zap, TrendingUp, Users, Folder, FileText, ExternalLink } from 'lucide-react';
import { fetchGitHubStats, fetchGitHubActivity, GitHubStats, ActivityItem } from '../../services/github';
import { projects } from '../../data/projects';
import { blogPosts } from '../../data/blogs';
import { useOSStore } from '../../store/useOSStore';

interface DashboardWidgetsProps {
  onClose: () => void;
}

const activityIconMap: Record<string, React.ReactNode> = {
  '⬆️': <Upload className="w-3.5 h-3.5" />,
  '🔀': <GitMerge className="w-3.5 h-3.5" />,
  '🔁': <GitBranch className="w-3.5 h-3.5" />,
  '⭐': <Star className="w-3.5 h-3.5" />,
  '✨': <Zap className="w-3.5 h-3.5" />,
  '🐛': <GitBranch className="w-3.5 h-3.5" />,
  '🍴': <GitBranch className="w-3.5 h-3.5" />,
  '🚀': <Upload className="w-3.5 h-3.5" />,
};

function StatCard({
  icon,
  label,
  value,
  badge,
  badgeColor,
  gradient,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  badgeColor?: string;
  gradient: string;
  loading: boolean;
}) {
  return (
    <div className="bg-[#0f1019]/90 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 hover:border-white/10 transition-all hover:shadow-lg hover:shadow-purple-900/10 group">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">{label}</p>
        <div className="flex items-end gap-2 mt-0.5">
          {loading ? (
            <div className="h-7 w-16 bg-white/5 rounded-md animate-pulse" />
          ) : (
            <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
          )}
          {badge && !loading && (
            <span className={`text-[10px] font-bold ${badgeColor ?? 'text-emerald-400'} mb-1`}>{badge}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardWidgets({ onClose }: DashboardWidgetsProps) {
  const theme = useOSStore((state) => state.theme);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    fetchGitHubStats().then((s) => {
      setStats(s);
      setLoadingStats(false);
    });
    fetchGitHubActivity(6).then((a) => {
      setActivity(a);
      setLoadingActivity(false);
    });
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handleClick), 100);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const projectCount = projects.length;
  const articleCount = blogPosts.length;

  return (
    <div
      ref={panelRef}
      id="dashboard-widgets"
      className={`fixed top-14 right-4 z-[9980] w-[340px] max-h-[calc(100vh-80px)] overflow-y-auto rounded-3xl shadow-2xl shadow-black/60 border animate-slide-up custom-scrollbar ${
        isLight
          ? 'bg-white/90 backdrop-blur-2xl border-gray-200/60 text-gray-900'
          : 'bg-[#0a0b10]/95 backdrop-blur-2xl border-white/10 text-white'
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/5 bg-inherit backdrop-blur-md">
        <div>
          <h2 className="text-sm font-bold text-white">Dashboard</h2>
          <p className="text-[10px] text-gray-500">Welcome back, Harshit 👋</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
          aria-label="Close dashboard"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Folder className="w-4.5 h-4.5" />}
            label="Repositories"
            value={stats?.public_repos ?? projectCount}
            badge={stats ? `+${Math.floor(stats.public_repos * 0.12)}%` : undefined}
            badgeColor="text-emerald-400"
            gradient="from-blue-500 to-cyan-500"
            loading={loadingStats}
          />
          <StatCard
            icon={<Star className="w-4.5 h-4.5" />}
            label="Total Stars"
            value={stats?.total_stars ?? '—'}
            badge={stats?.total_stars ? '+' + stats.total_stars : undefined}
            badgeColor="text-amber-400"
            gradient="from-amber-500 to-orange-400"
            loading={loadingStats}
          />
          <StatCard
            icon={<Users className="w-4.5 h-4.5" />}
            label="Followers"
            value={stats?.followers ?? '—'}
            badge={stats ? `+${stats.following} following` : undefined}
            badgeColor="text-purple-400"
            gradient="from-purple-500 to-indigo-500"
            loading={loadingStats}
          />
          <StatCard
            icon={<FileText className="w-4.5 h-4.5" />}
            label="Articles"
            value={articleCount}
            badge="+5%"
            badgeColor="text-pink-400"
            gradient="from-pink-500 to-rose-400"
            loading={false}
          />
        </div>

        {/* Latest Activity */}
        <div className="bg-[#0f1019]/80 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white">Latest Activity</h3>
            <a
              href={`https://github.com/Harshit-Kandoi`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
            >
              GitHub <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {loadingActivity ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-6 h-6 bg-white/5 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2.5 bg-white/5 rounded w-3/4" />
                    <div className="h-2 bg-white/5 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="space-y-2.5">
              {/* Fallback simulated activity */}
              {[
                { icon: '⬆️', text: 'Pushed to portfolio-os', time: '2h ago' },
                { icon: '🔀', text: 'Merged PR in local-gcp-emulator', time: '1d ago' },
                { icon: '✨', text: 'Created branch in asl-detection', time: '3d ago' },
                { icon: '⭐', text: 'Starred torvalds/linux', time: '1w ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-xs">
                      {item.icon}
                    </div>
                    <span className="text-[11px] text-gray-300">{item.text}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 shrink-0 ml-2">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {activity.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between hover:bg-white/5 -mx-2 px-2 py-1 rounded-lg transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      {activityIconMap[item.icon] ?? <TrendingUp className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[11px] text-gray-300 group-hover:text-white transition truncate max-w-[180px]">{item.text}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 shrink-0 ml-2">{item.timeAgo}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* GitHub Profile Mini Card */}
        {stats && (
          <a
            href="https://github.com/Harshit-Kandoi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#0f1019]/80 border border-white/5 rounded-2xl p-3 hover:border-purple-500/30 transition group"
          >
            <img
              src={stats.avatar_url || '/profile.webp'}
              alt="GitHub Avatar"
              className="w-10 h-10 rounded-xl object-cover border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{stats.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{stats.bio || 'Software & AI Engineer'}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-400 transition shrink-0" />
          </a>
        )}
      </div>
    </div>
  );
}
