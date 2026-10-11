// Shared by the browser (src/services/github.ts) and the Netlify function
// (netlify/functions/github-stats.ts), so the stats are computed the same way in both.

export const GITHUB_USER = 'Harshit-Kandoi';

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

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** Fetches profile + repos + commit count. Returns null if the profile request fails. */
export async function buildGitHubStats(fetchFn: FetchLike, headers: HeadersInit = {}): Promise<GitHubStats | null> {
  const api = 'https://api.github.com';
  const opts = { headers: { Accept: 'application/vnd.github+json', ...headers } };

  const [userRes, reposRes, commitsRes] = await Promise.all([
    fetchFn(`${api}/users/${GITHUB_USER}`, opts),
    fetchFn(`${api}/users/${GITHUB_USER}/repos?per_page=100&type=public`, opts),
    // Search counts every public commit authored by the user, across all repos.
    fetchFn(`${api}/search/commits?q=author:${GITHUB_USER}&per_page=1`, opts).catch(() => null),
  ]);
  if (!userRes.ok) return null;

  const user = await userRes.json();
  const repos: Array<{ stargazers_count?: number }> = reposRes.ok ? await reposRes.json() : [];
  let total_commits = 0;
  if (commitsRes?.ok) {
    const body = await commitsRes.json().catch(() => null);
    total_commits = typeof body?.total_count === 'number' ? body.total_count : 0;
  }

  return {
    public_repos: user.public_repos ?? 0,
    public_gists: user.public_gists ?? 0,
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    total_stars: Array.isArray(repos) ? repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) : 0,
    total_commits,
    avatar_url: user.avatar_url ?? '',
    name: user.name ?? GITHUB_USER,
    bio: user.bio ?? '',
    location: user.location ?? '',
    blog: user.blog ?? '',
  };
}
