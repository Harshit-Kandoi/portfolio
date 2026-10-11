// ─── Medium RSS Integration Service ─────────────────────────────────────────
// Fetches posts from Medium feed using the public rss2json API proxy.
// This bypasses Cloudflare challenge and CORS blocks.

import { cacheGet, cacheSet } from './github'; // Re-use local caching helpers

export interface MediumArticle {
  title: string;
  link: string;
  pubDate: string;
  guid: string;
  categories: string[];
}

export interface MediumStats {
  /** Medium doesn't expose follower counts in the feed; only set when actually known. */
  followers?: number;
  /** Number of posts in the feed. rss2json returns at most the 10 latest, so this is "latest posts", not a lifetime total. */
  latestPostsCount: number;
  articles: MediumArticle[];
}

const MEDIUM_USERNAME = 'kandoiharshitsdlp';
const MEDIUM_RSS_FEED = `https://medium.com/feed/@${MEDIUM_USERNAME}`;
const PROXY_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_RSS_FEED)}`;

export async function fetchMediumStats(): Promise<MediumStats> {
  const cached = cacheGet<MediumStats>('medium_stats');
  if (cached) return cached;

  try {
    const res = await fetch(PROXY_URL);
    if (!res.ok) {
      throw new Error(`Proxy responded with status ${res.status}`);
    }

    const data = await res.json();
    if (data.status !== 'ok') {
      throw new Error(data.message || 'rss2json returned non-ok status');
    }

    const items = (data.items || []) as MediumArticle[];
    const stats: MediumStats = {
      latestPostsCount: items.length,
      articles: items,
    };

    cacheSet('medium_stats', stats);
    return stats;
  } catch (err) {
    console.warn('[Medium] Feed unavailable:', err);
    return { latestPostsCount: 0, articles: [] };
  }
}
