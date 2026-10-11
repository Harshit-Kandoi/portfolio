// GitHub profile stats for the OS dashboard/About app.
// The optional GITHUB_TOKEN stays on the server (never VITE_-prefixed), and Netlify's CDN
// caches the response for an hour, so GitHub is hit at most ~once an hour for all visitors.
import { buildGitHubStats } from '../../src/services/githubCore';

export default async () => {
  const token = process.env.GITHUB_TOKEN?.trim();
  const stats = await buildGitHubStats(fetch, token ? { Authorization: `Bearer ${token}` } : {}).catch(() => null);

  if (!stats) {
    return new Response(JSON.stringify({ error: 'GitHub is unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  return new Response(JSON.stringify(stats), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      'Netlify-CDN-Cache-Control': 'public, durable, max-age=3600, stale-while-revalidate=86400',
    },
  });
};

export const config = { path: ['/portfolio/api/github-stats', '/api/github-stats'] };
