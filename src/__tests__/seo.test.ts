// @vitest-environment node
// index.html is static, so it can silently drift from src/data/config.ts. This keeps them in sync.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PORTFOLIO_META } from '../data/config';

const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8');
const canonicalUrl = `${PORTFOLIO_META.siteUrl}/`;

const attr = (pattern: RegExp) => html.match(pattern)?.[1];

describe('index.html SEO metadata', () => {
  it('points canonical, og:url and JSON-LD at the portfolio URL', () => {
    expect(attr(/<link rel="canonical" href="([^"]+)"/)).toBe(canonicalUrl);
    expect(attr(/<meta property="og:url" content="([^"]+)"/)).toBe(canonicalUrl);
    expect(attr(/<meta property="og:image" content="([^"]+)"/)).toBe(`${canonicalUrl}og-preview.png`);
  });

  it('has a title and description of sensible length', () => {
    const title = attr(/<title>([^<]+)<\/title>/)!.replace(/&amp;/g, '&');
    const description = attr(/<meta name="description" content="([^"]+)"/)!;
    expect(title).toContain(PORTFOLIO_META.name);
    expect(title.length).toBeLessThanOrEqual(65);
    expect(description.length).toBeGreaterThan(70);
    expect(description.length).toBeLessThanOrEqual(170);
  });

  it('describes the owner with the current role in JSON-LD', () => {
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1];
    const data = JSON.parse(json);
    const person = data.mainEntity;
    expect(data['@type']).toBe('ProfilePage');
    expect(person.name).toBe(PORTFOLIO_META.name);
    expect(person.jobTitle).toBe(PORTFOLIO_META.role);
    expect(person.url).toBe(canonicalUrl);
    expect(person.sameAs).toEqual(expect.arrayContaining([PORTFOLIO_META.github, PORTFOLIO_META.linkedin, PORTFOLIO_META.medium]));
  });

  it('keeps an empty #root for the build-time prerender to fill', () => {
    expect(html).toContain('<div id="root"></div>');
  });
});
