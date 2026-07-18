import React, { useEffect, useState, useRef } from 'react';
import { X, GitBranch, GitMerge, Star, Upload, Zap, TrendingUp, Users, Folder, FileText, ExternalLink, Linkedin, Award, Briefcase, MessageSquare, Share2 } from 'lucide-react';
import { fetchGitHubStats, fetchGitHubActivity, GitHubStats, ActivityItem } from '../../services/github';
import { fetchMediumStats, MediumStats } from '../../services/medium';
import { projects } from '../../data/projects';
import { blogPosts } from '../../data/blogs';
import { useOSStore } from '../../store/useOSStore';

interface DashboardWidgetsProps {
  onClose: () => void;
}

const LINKEDIN_ACTIVITIES = [
  {
    id: '1',
    type: 'cert',
    icon: <Award className="w-3.5 h-3.5 text-amber-400" />,
    text: 'Earned Google Cloud ACE Certification',
    sub: 'Verified Associate Cloud Engineer',
    time: '1mo ago',
    url: 'https://www.linkedin.com/in/harshit-kandoi/',
  },
  {
    id: '2',
    type: 'article',
    icon: <FileText className="w-3.5 h-3.5 text-cyan-400" />,
    text: 'Published article on UV Package Manager',
    sub: 'Featured in Towards AI · 1.2k reads',
    time: '2w ago',
    url: 'https://pub.towardsai.net/from-pip-to-uv-a-modern-take-on-python-project-management-part-1-2f4a7fdec860',
  },
  {
    id: '3',
    type: 'role',
    icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" />,
    text: 'Software & AI Engineer at ThoughtIn Solutions',
    sub: 'Building GCP backend workflows & ML tools',
    time: '2mo ago',
    url: 'https://www.linkedin.com/in/harshit-kandoi/',
  },
  {
    id: '4',
    type: 'project',
    icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
    text: 'Released YOLOv5 ASL Real-time Detector',
    sub: 'Custom dataset & OpenCV webcam pipeline',
    time: '3w ago',
    url: 'https://github.com/Harshit-Kandoi/asl-detection',
  },
];

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
  const [mediumStats, setMediumStats] = useState<MediumStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMedium, setLoadingMedium] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    fetchGitHubStats().then((s) => {
      setStats(s);
      setLoadingStats(false);
    });
    fetchMediumStats().then((ms) => {
      setMediumStats(ms);
      setLoadingMedium(false);
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
            icon={<GitBranch className="w-4.5 h-4.5" />}
            label="Total Commits"
            value={stats?.total_commits ?? '—'}
            badge={stats?.total_commits ? 'Active' : undefined}
            badgeColor="text-emerald-400"
            gradient="from-amber-500 to-orange-400"
            loading={loadingStats}
          />
          <StatCard
            icon={<Users className="w-4.5 h-4.5" />}
            label="Followers (Medium)"
            value={mediumStats?.followers ?? 98}
            badge={mediumStats ? 'Popular' : undefined}
            badgeColor="text-purple-400"
            gradient="from-purple-500 to-indigo-500"
            loading={loadingMedium}
          />
          <StatCard
            icon={<FileText className="w-4.5 h-4.5" />}
            label="Articles (Medium)"
            value={mediumStats?.articlesCount ?? articleCount}
            badge={mediumStats ? 'Tech/AI' : undefined}
            badgeColor="text-pink-400"
            gradient="from-pink-500 to-rose-400"
            loading={loadingMedium}
          />
        </div>

        {/* LinkedIn Professional Activity Feed */}
        <div className="bg-[#0f1019]/80 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-[#0a66c2] flex items-center justify-center text-white">
                <Linkedin className="w-3 h-3 fill-current" />
              </div>
              <h3 className="text-xs font-bold text-white">Professional Updates</h3>
            </div>
            <a
              href="https://www.linkedin.com/in/harshit-kandoi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              LinkedIn <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="space-y-2">
            {LINKEDIN_ACTIVITIES.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between hover:bg-white/5 -mx-2 px-2 py-1.5 rounded-xl transition group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="min-w-0 pr-1">
                    <p className="text-[11px] font-medium text-gray-200 group-hover:text-blue-300 transition leading-tight line-clamp-1">
                      {item.text}
                    </p>
                    <p className="text-[9px] text-gray-500 truncate mt-0.5">{item.sub}</p>
                  </div>
                </div>
                <span className="text-[9px] text-gray-600 shrink-0 mt-0.5">{item.time}</span>
              </a>
            ))}
          </div>
        </div>

        {/* LinkedIn Profile Mini Card */}
        <a
          href="https://www.linkedin.com/in/harshit-kandoi/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#0f1019]/80 border border-blue-500/10 rounded-2xl p-3 hover:border-blue-500/40 transition group"
        >
          <img
            src={stats?.avatar_url || '/profile.webp'}
            alt="LinkedIn Profile Avatar"
            className="w-10 h-10 rounded-xl object-cover border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-white truncate">{stats?.name || 'Harshit Kandoi'}</p>
              <div className="w-3.5 h-3.5 rounded bg-[#0a66c2] flex items-center justify-center text-white shrink-0">
                <Linkedin className="w-2.5 h-2.5 fill-current" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 truncate">Software & AI Engineer · ThoughtIn Solutions</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition shrink-0" />
        </a>
      </div>
    </div>
  );
}
