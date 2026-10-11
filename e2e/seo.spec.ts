import { test, expect } from '@playwright/test';

const SITE = 'https://www.harshitkandoi.in/portfolio/';

test.describe('SEO and Meta Tags Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('has a title, description and canonical URL', async ({ page }) => {
    await expect(page).toHaveTitle(/^Harshit Kandoi — Software Engineer/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Associate Software Engineer/);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE);
  });

  test('declares Open Graph and Twitter metadata', async ({ page }) => {
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', SITE);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${SITE}og-preview.png`);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  });

  test('embeds ProfilePage + Person JSON-LD', async ({ page }) => {
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerHTML());
    expect(schema['@type']).toBe('ProfilePage');
    expect(schema.mainEntity.name).toBe('Harshit Kandoi');
    expect(schema.mainEntity.jobTitle).toBe('Associate Software Engineer');
    expect(schema.mainEntity.sameAs).toContain('https://github.com/Harshit-Kandoi');
  });
});
