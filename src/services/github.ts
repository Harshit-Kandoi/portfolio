// ─── GitHub API Service ──────────────────────────────────────────────────────
// Stats come from /api/github-stats (Netlify function, CDN-cached, token stays server-side).
// If that endpoint is unavailable (e.g. plain `vite dev`), fall back to the public API.

import { useEffect, useState } from 'react';
import { GITHUB_USER, GitHubStats, buildGitHubStats } from './githubCore';
import { apiUrl } from '../utils/paths';

export type { GitHubStats };

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
}

export function cacheGet<T>(key: string, { allowStale = false } = {}): T | null {
  try {
    // 1. Try sessionStorage
    let raw = sessionStorage.getItem(key);
    // 2. Fall back to localStorage
    if (!raw) {
      raw = localStorage.getItem(key);
    }
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (!allowStale && Date.now() - entry.ts > CACHE_TTL) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T) {
  try {
    const payload = JSON.stringify({ data, ts: Date.now() });
    sessionStorage.setItem(key, payload);
    localStorage.setItem(key, payload);
  } catch { /* ignore quota */ }
}



// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseGitHubStatsResult {
  stats: GitHubStats | null;
  loading: boolean;
  error: string | null;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    action?: string;
    ref?: string;
    commits?: Array<{ message: string }>;
    pull_request?: { title: string; merged: boolean };
  };
}

export interface ActivityItem {
  id: string;
  icon: string;
  text: string;
  repoName: string;
  timeAgo: string;
  url: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function eventToActivity(event: GitHubEvent): ActivityItem | null {
  const repo = event.repo.name.replace(`${GITHUB_USER}/`, '');
  const url = `https://github.com/${event.repo.name}`;
  const t = timeAgo(event.created_at);

  switch (event.type) {
    case 'PushEvent':
      return { id: event.id, icon: '⬆️', text: `Pushed to ${repo}`, repoName: repo, timeAgo: t, url };
    case 'PullRequestEvent':
      if (event.payload.pull_request?.merged) {
        return { id: event.id, icon: '🔀', text: `Merged PR in ${repo}`, repoName: repo, timeAgo: t, url };
      }
      return { id: event.id, icon: '🔁', text: `Opened PR in ${repo}`, repoName: repo, timeAgo: t, url };
    case 'WatchEvent':
      return { id: event.id, icon: '⭐', text: `Starred ${repo}`, repoName: repo, timeAgo: t, url };
    case 'CreateEvent':
      return { id: event.id, icon: '✨', text: `Created ${event.payload.ref ?? 'branch'} in ${repo}`, repoName: repo, timeAgo: t, url };
    case 'IssuesEvent':
      return { id: event.id, icon: '🐛', text: `${event.payload.action} issue in ${repo}`, repoName: repo, timeAgo: t, url };
    case 'ForkEvent':
      return { id: event.id, icon: '🍴', text: `Forked ${repo}`, repoName: repo, timeAgo: t, url };
    case 'ReleaseEvent':
      return { id: event.id, icon: '🚀', text: `Released in ${repo}`, repoName: repo, timeAgo: t, url };
    default:
      return null;
  }
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function fetchStatsFromFunction(): Promise<GitHubStats | null> {
  try {
    const res = await fetch(apiUrl('github-stats'));
    const isJson = res.headers?.get('content-type')?.includes('application/json');
    if (!res.ok || !isJson) return null;
    const data = await res.json();
    return typeof data?.public_repos === 'number' ? (data as GitHubStats) : null;
  } catch {
    return null;
  }
}

export async function fetchGitHubStats(): Promise<GitHubStats | null> {
  const cached = cacheGet<GitHubStats>('gh_stats');
  if (cached) return cached;

  const fresh =
    (await fetchStatsFromFunction()) ??
    (await buildGitHubStats((url, init) => fetch(url, init)).catch(() => null));
  if (fresh) {
    cacheSet('gh_stats', fresh);
    return fresh;
  }
  // GitHub unavailable or rate limited: an old number beats an empty widget.
  return cacheGet<GitHubStats>('gh_stats', { allowStale: true });
}

// ─── React Hook ───────────────────────────────────────────────────────────────

export function useGitHubStats(): UseGitHubStatsResult {
  const [stats, setStats] = useState<GitHubStats | null>(() => cacheGet<GitHubStats>('gh_stats'));
  const [loading, setLoading] = useState(() => !stats);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGitHubStats()
      .then((s) => {
        if (cancelled) return;
        if (s) setStats(s);
        else setError('GitHub stats unavailable');
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message ?? 'GitHub API error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, error };
}

export async function fetchGitHubActivity(limit = 8): Promise<ActivityItem[]> {
  const cached = cacheGet<ActivityItem[]>('gh_activity');
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`,
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) return cacheGet<ActivityItem[]>('gh_activity', { allowStale: true }) ?? [];

    const events: GitHubEvent[] = await res.json();

    const items = events
      .map(eventToActivity)
      .filter((item): item is ActivityItem => item !== null)
      .slice(0, limit);

    cacheSet('gh_activity', items);
    return items;
  } catch {
    return cacheGet<ActivityItem[]>('gh_activity', { allowStale: true }) ?? [];
  }
}
