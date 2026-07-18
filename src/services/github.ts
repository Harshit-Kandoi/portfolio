// ─── GitHub API Service ──────────────────────────────────────────────────────
// Uses the public GitHub REST API (no auth required for public profiles).
// Rate limit: 60 req/hour unauthenticated, 5000/hr with VITE_GITHUB_TOKEN.
// To unlock higher limits: add VITE_GITHUB_TOKEN=ghp_... to your .env file.

import { useEffect, useState } from 'react';

const GITHUB_USER = 'Harshit-Kandoi';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function getAuthHeaders(): HeadersInit {
  const token = (import.meta.env as Record<string, string>).VITE_GITHUB_TOKEN;
  return token
    ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    : { Accept: 'application/vnd.github+json' };
}

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function cacheGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore quota */ }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GitHubStats {
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  total_stars: number;
  total_commits: number;
  avatar_url: string;
  name: string;
  bio: string;
  location: string;
  blog: string;
}

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

async function fetchTotalCommits(repoNames: string[]): Promise<number> {
  // Sample up to 12 repos to stay within rate limits
  const sample = repoNames.slice(0, 12);
  const counts = await Promise.all(
    sample.map(async (repo) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_USER}/${repo}/contributors?per_page=100&anon=true`,
          { headers: getAuthHeaders() }
        );
        if (!res.ok) return 0;
        const contributors = (await res.json()) as Array<{ contributions: number }>;
        if (!Array.isArray(contributors)) return 0;
        return contributors.reduce((sum, c) => sum + (c.contributions ?? 0), 0);
      } catch {
        return 0;
      }
    })
  );
  return counts.reduce((a, b) => a + b, 0);
}

export async function fetchGitHubStats(): Promise<GitHubStats | null> {
  const cached = cacheGet<GitHubStats>('gh_stats');
  if (cached) return cached;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers: getAuthHeaders() }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=public`, { headers: getAuthHeaders() }),
    ]);

    if (!userRes.ok) return null;

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    const total_stars = Array.isArray(repos)
      ? repos.reduce((sum: number, r: { stargazers_count: number }) => sum + (r.stargazers_count || 0), 0)
      : 0;

    const repoNames: string[] = Array.isArray(repos) ? repos.map((r: { name: string }) => r.name) : [];
    const total_commits = await fetchTotalCommits(repoNames);

    const stats: GitHubStats = {
      public_repos: user.public_repos ?? 0,
      public_gists: user.public_gists ?? 0,
      followers: user.followers ?? 0,
      following: user.following ?? 0,
      total_stars,
      total_commits,
      avatar_url: user.avatar_url ?? '',
      name: user.name ?? GITHUB_USER,
      bio: user.bio ?? '',
      location: user.location ?? '',
      blog: user.blog ?? '',
    };

    cacheSet('gh_stats', stats);
    return stats;
  } catch {
    return null;
  }
}

// ─── React Hook ───────────────────────────────────────────────────────────────

export function useGitHubStats(): UseGitHubStatsResult {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGitHubStats()
      .then((s) => {
        if (!cancelled) {
          setStats(s);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message ?? 'GitHub API error');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, error };
}

export async function fetchGitHubActivity(limit = 8): Promise<ActivityItem[]> {
  const cached = cacheGet<ActivityItem[]>('gh_activity');
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`);
    if (!res.ok) return [];

    const events: GitHubEvent[] = await res.json();
    const items = events
      .map(eventToActivity)
      .filter((item): item is ActivityItem => item !== null)
      .slice(0, limit);

    cacheSet('gh_activity', items);
    return items;
  } catch {
    return [];
  }
}
