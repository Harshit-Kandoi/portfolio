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
    expect(stats.followers).toBe(98);
  });

  it('should fall back to default stats if RSS fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => Promise.reject(new Error('Network error')))
    );

    const stats = await fetchMediumStats();
    expect(stats.followers).toBe(98);
    expect(stats.articlesCount).toBe(10);
    expect(stats.articles).toEqual([]);
  });
});
