import React, { useEffect, useState, useRef } from 'react';
import { X, GitBranch, Users, Folder, FileText, ExternalLink, Linkedin } from 'lucide-react';
import { fetchGitHubStats, GitHubStats } from '../../services/github';
import { blogPosts } from '../../data/blogs';
import { PORTFOLIO_META } from '../../data/config';
import { useOSStore } from '../../store/useOSStore';
import { asset } from '../../utils/paths';

interface DashboardWidgetsProps {
  onClose: () => void;
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  loading,
  isLight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  loading: boolean;
  isLight: boolean;
}) {
  return (
    <div className={`border rounded-2xl p-4 flex flex-col gap-2 transition-all hover:shadow-lg group ${
      isLight
        ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-200/60'
        : 'bg-[#0f1019]/90 border-white/5 hover:border-white/10 hover:shadow-purple-900/10'
    }`}>
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">{label}</p>
        <div className="flex items-end gap-2 mt-0.5">
          {loading ? (
            <div className={`h-7 w-16 rounded-md animate-pulse ${isLight ? 'bg-gray-200' : 'bg-white/5'}`} />
          ) : (
            <span className={`text-2xl font-bold tabular-nums ${isLight ? 'text-gray-900' : 'text-white'}`}>{value}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardWidgets({ onClose }: DashboardWidgetsProps) {
  const theme = useOSStore((state) => state.theme);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  // Parent passes a fresh inline onClose on every render (clock tick); keep the latest in a
  // ref so the click-outside listener is attached once instead of every second.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const isLight = theme === 'light';

  useEffect(() => {
    let cancelled = false;
    fetchGitHubStats()
      .then((s) => { if (!cancelled) setStats(s); })
      .finally(() => { if (!cancelled) setLoadingStats(false); });
    return () => { cancelled = true; };
  }, []);

  // Click outside to close (attached after a tick so the opening click doesn't close it)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const firstName = PORTFOLIO_META.name.split(' ')[0];

  return (
    <div
      ref={panelRef}
      id="dashboard-widgets"
      className={`fixed top-14 right-4 z-[9980] w-[340px] max-h-[calc(100vh-80px)] overflow-y-auto rounded-3xl shadow-2xl border animate-slide-up custom-scrollbar ${
        isLight
          ? 'bg-white/90 backdrop-blur-2xl border-gray-200/60 text-gray-900 shadow-gray-400/30'
          : 'bg-[#0a0b10]/95 backdrop-blur-2xl border-white/10 text-white shadow-black/60'
      }`}
    >
      {/* Header */}
      <div className={`sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-inherit backdrop-blur-md ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
        <div>
          <h2 className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Dashboard</h2>
          <p className="text-[10px] text-gray-500">{firstName}'s work at a glance</p>
        </div>
        <button
          onClick={onClose}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
          aria-label="Close dashboard"
        >
          <X className={`w-3.5 h-3.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Stat Cards Grid — only numbers we actually have; '—' when GitHub is unreachable */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Folder className="w-4 h-4" />}
            label="Repositories"
            value={stats?.public_repos ?? '—'}
            gradient="from-blue-500 to-cyan-500"
            loading={loadingStats}
            isLight={isLight}
          />
          <StatCard
            icon={<GitBranch className="w-4 h-4" />}
            label="Total Commits"
            value={stats?.total_commits || '—'}
            gradient="from-amber-500 to-orange-400"
            loading={loadingStats}
            isLight={isLight}
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Followers (GitHub)"
            value={stats?.followers ?? '—'}
            gradient="from-purple-500 to-indigo-500"
            loading={loadingStats}
            isLight={isLight}
          />
          <StatCard
            icon={<FileText className="w-4 h-4" />}
            label="Articles"
            value={blogPosts.length}
            gradient="from-pink-500 to-rose-400"
            loading={false}
            isLight={isLight}
          />
        </div>

        {/* LinkedIn Profile Mini Card */}
        <a
          href={PORTFOLIO_META.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 border rounded-2xl p-3 hover:border-blue-500/40 transition group ${
            isLight ? 'bg-white border-gray-200' : 'bg-[#0f1019]/80 border-blue-500/10'
          }`}
        >
          <img
            src={stats?.avatar_url || asset('profile.webp')}
            alt={`${PORTFOLIO_META.name} profile photo`}
            className={`w-10 h-10 rounded-xl object-cover border ${isLight ? 'border-gray-200' : 'border-white/10'}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className={`text-xs font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{PORTFOLIO_META.name}</p>
              <div className="w-3.5 h-3.5 rounded bg-[#0a66c2] flex items-center justify-center text-white shrink-0">
                <Linkedin className="w-2.5 h-2.5 fill-current" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 truncate">{PORTFOLIO_META.role} · {PORTFOLIO_META.company}</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition shrink-0" />
        </a>
      </div>
    </div>
  );
}
