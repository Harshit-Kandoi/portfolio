// ─── GitHub API Service ──────────────────────────────────────────────────────
// Uses the public GitHub REST API (no auth required for public profiles).
// Rate limit: 60 req/hour unauthenticated. Cache results in sessionStorage.

const GITHUB_USER = 'Harshit-Kandoi';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

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
  avatar_url: string;
  name: string;
  bio: string;
  location: string;
  blog: string;
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

export async function fetchGitHubStats(): Promise<GitHubStats | null> {
  const cached = cacheGet<GitHubStats>('gh_stats');
  if (cached) return cached;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=public`),
    ]);

    if (!userRes.ok) return null;

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    const total_stars = Array.isArray(repos)
      ? repos.reduce((sum: number, r: { stargazers_count: number }) => sum + (r.stargazers_count || 0), 0)
      : 0;

    const stats: GitHubStats = {
      public_repos: user.public_repos ?? 0,
      public_gists: user.public_gists ?? 0,
      followers: user.followers ?? 0,
      following: user.following ?? 0,
      total_stars,
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
