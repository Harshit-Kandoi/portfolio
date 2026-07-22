import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheGet, cacheSet, fetchGitHubStats, fetchGitHubActivity } from '../github';

describe('GitHub Service Unit Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should store and retrieve data from cache', () => {
    cacheSet('test_key', { foo: 'bar' });
    const cached = cacheGet<{ foo: string }>('test_key');
    expect(cached).toEqual({ foo: 'bar' });
  });

  it('should return null for expired cache entries', () => {
    const expiredEntry = { data: { foo: 'old' }, ts: Date.now() - 1000 * 60 * 60 };
    sessionStorage.setItem('test_expired', JSON.stringify(expiredEntry));
    const cached = cacheGet<{ foo: string }>('test_expired');
    expect(cached).toBeNull();
  });

  it('should fetch GitHub stats and compute total stars', async () => {
    const mockUserResponse = {
      public_repos: 12,
      public_gists: 3,
      followers: 45,
      following: 10,
    };

    const mockReposResponse = [
      { name: 'repo-1', stargazers_count: 10, forks_count: 2, language: 'TypeScript' },
      { name: 'repo-2', stargazers_count: 5, forks_count: 1, language: 'TypeScript' },
      { name: 'repo-3', stargazers_count: 3, forks_count: 0, language: 'Python' },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/users/Harshit-Kandoi/repos')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => mockReposResponse,
          });
        }
        if (url.includes('/users/Harshit-Kandoi')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => mockUserResponse,
          });
        }
        if (url.includes('/commits')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => [{ sha: '123' }],
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      })
    );

    const stats = await fetchGitHubStats();
    expect(stats).not.toBeNull();
    expect(stats?.public_repos).toBe(12);
    expect(stats?.total_stars).toBe(18);
  });

  it('should fetch GitHub recent activity events', async () => {
    const mockEvents = [
      {
        id: '1',
        type: 'PushEvent',
        repo: { name: 'Harshit-Kandoi/portfolio' },
        created_at: '2026-07-22T10:00:00Z',
        payload: { commits: [{ message: 'feat: add comprehensive tests' }] },
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => mockEvents,
        })
      )
    );

    const activity = await fetchGitHubActivity(5);
    expect(activity.length).toBeGreaterThan(0);
    expect(activity[0].repoName).toBe('portfolio');
  });
});
