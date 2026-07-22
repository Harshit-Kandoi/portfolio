// ─── Spotify Embed Utility & URL Normalizer ──────────────────────────────────
// Automatically converts standard Spotify URLs (open.spotify.com/playlist/...) 
// into iframe-compatible embed URLs (open.spotify.com/embed/playlist/...) to prevent
// "spotify.com refused to connect" (X-Frame-Options DENY) errors.

export const FALLBACK_SPOTIFY_EMBED = 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Ueb9qMvV2n?utm_source=generator&theme=0';

/**
 * Normalizes any Spotify URL or ID into a valid iframe embed URL.
 */
export function toSpotifyEmbedUrl(input: string): string {
  if (!input) return FALLBACK_SPOTIFY_EMBED;
  
  // If already an embed URL, return as-is (with theme params)
  if (input.includes('open.spotify.com/embed/')) {
    return input.includes('utm_source=generator') ? input : `${input}${input.includes('?') ? '&' : '?'}utm_source=generator&theme=0`;
  }
  
  // Match playlist ID from URL: open.spotify.com/playlist/2WSmlNi6hcFutn7q5samOV?si=...
  const playlistMatch = input.match(/playlist\/([a-zA-Z0-9]+)/);
  if (playlistMatch) {
    return `https://open.spotify.com/embed/playlist/${playlistMatch[1]}?utm_source=generator&theme=0`;
  }
  
  // Match track ID from URL: open.spotify.com/track/xyz
  const trackMatch = input.match(/track\/([a-zA-Z0-9]+)/);
  if (trackMatch) {
    return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`;
  }

  // Match album ID from URL: open.spotify.com/album/xyz
  const albumMatch = input.match(/album\/([a-zA-Z0-9]+)/);
  if (albumMatch) {
    return `https://open.spotify.com/embed/album/${albumMatch[1]}?utm_source=generator&theme=0`;
  }
  
  // If raw alphanumeric ID passed
  if (/^[a-zA-Z0-9]+$/.test(input.trim())) {
    return `https://open.spotify.com/embed/playlist/${input.trim()}?utm_source=generator&theme=0`;
  }
  
  return input;
}

/**
 * Extracts external Spotify URL for opening directly in Spotify app/browser.
 */
export function toSpotifyExternalUrl(input: string): string {
  if (!input) return 'https://open.spotify.com/playlist/37i9dQZF1DX8Ueb9qMvV2n';
  
  const playlistMatch = input.match(/playlist\/([a-zA-Z0-9]+)/);
  if (playlistMatch) {
    return `https://open.spotify.com/playlist/${playlistMatch[1]}`;
  }
  const trackMatch = input.match(/track\/([a-zA-Z0-9]+)/);
  if (trackMatch) {
    return `https://open.spotify.com/track/${trackMatch[1]}`;
  }
  return input.replace('/embed/', '/');
}
