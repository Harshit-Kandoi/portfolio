import { describe, it, expect } from 'vitest';
import {
  toSpotifyEmbedUrl,
  toSpotifyExternalUrl,
  FALLBACK_SPOTIFY_EMBED,
} from '../spotify';

describe('Spotify Utilities Tests', () => {
  it('should return fallback embed URL when empty string provided', () => {
    expect(toSpotifyEmbedUrl('')).toBe(FALLBACK_SPOTIFY_EMBED);
  });

  it('should preserve existing embed URLs with generator query parameters', () => {
    const embedUrl = 'https://open.spotify.com/embed/playlist/12345?utm_source=generator&theme=0';
    expect(toSpotifyEmbedUrl(embedUrl)).toBe(embedUrl);
  });

  it('should convert standard Spotify playlist URL to embed URL', () => {
    const standardUrl = 'https://open.spotify.com/playlist/37i9dQZF1DX8Ueb9qMvV2n?si=12345';
    expect(toSpotifyEmbedUrl(standardUrl)).toBe(
      'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Ueb9qMvV2n?utm_source=generator&theme=0'
    );
  });

  it('should convert standard Spotify track URL to embed URL', () => {
    const trackUrl = 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC';
    expect(toSpotifyEmbedUrl(trackUrl)).toBe(
      'https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC?utm_source=generator&theme=0'
    );
  });

  it('should convert raw ID string to playlist embed URL', () => {
    expect(toSpotifyEmbedUrl('37i9dQZF1DX8Ueb9qMvV2n')).toBe(
      'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Ueb9qMvV2n?utm_source=generator&theme=0'
    );
  });

  it('should extract external web link from embed or standard URL', () => {
    const embedUrl = 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Ueb9qMvV2n';
    expect(toSpotifyExternalUrl(embedUrl)).toBe(
      'https://open.spotify.com/playlist/37i9dQZF1DX8Ueb9qMvV2n'
    );
  });
});
