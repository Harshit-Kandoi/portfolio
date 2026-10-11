import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMediumStats } from '../medium';

describe('Medium Service Unit Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return parsed Medium articles from rss2json proxy', async () => {
    const mockFeedResponse = {
      status: 'ok',
      items: [
        {
          title: 'Building Scalable RAG Systems with Vector Databases',
          link: 'https://medium.com/@kandoiharshitsdlp/rag-systems-123',
          pubDate: '2026-06-15 10:00:00',
          guid: 'rag-123',
          categories: ['ai', 'rag', 'architecture'],
        },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockFeedResponse,
        })
      )
    );

    const stats = await fetchMediumStats();
    expect(stats.articles.length).toBe(1);
    expect(stats.articles[0].title).toBe('Building Scalable RAG Systems with Vector Databases');
    expect(stats.latestPostsCount).toBe(1);
    expect(stats.followers).toBeUndefined();
  });

  it('should return an empty result (no invented numbers) if RSS fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => Promise.reject(new Error('Network error')))
    );

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const stats = await fetchMediumStats();
    expect(stats.followers).toBeUndefined();
    expect(stats.latestPostsCount).toBe(0);
    expect(stats.articles).toEqual([]);
  });
});
