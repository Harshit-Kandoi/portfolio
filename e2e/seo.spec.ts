import { test, expect } from '@playwright/test';

test.describe('SEO and Meta Tags Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Go to default localhost homepage
    await page.goto('/');
  });

  test('should have the correct primary document title and meta description', async ({ page }) => {
    // Check primary title
    await expect(page).toHaveTitle('Harshit Kandoi | Full Stack Software Engineer | Google Cloud Certified (ACE)');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute(
      'content',
      'Harshit Kandoi - Full Stack Software Engineer and Google Associate Cloud Engineer (ACE). Exploring backend systems, cloud-native services, and event-driven automation.'
    );
  });

  test('should have appropriate robots, viewport, and canonical link configurations', async ({ page }) => {
    // Viewport tag checking
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute(
      'content',
      'width=device-width, initial-scale=1.0'
    );

    // Robots indexing metadata
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'index, follow');

    // Canonical link tag checking
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://harshitkandoi.in/');
  });

  test('should declare accurate Open Graph (Facebook) and Twitter metadata properties', async ({ page }) => {
    // Open Graph
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://harshitkandoi.in/');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Harshit Kandoi | Full Stack Software Engineer | Google Cloud Certified (ACE)'
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://harshitkandoi.in/profile.jpg'
    );

    // Twitter
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      'Harshit Kandoi | Full Stack Software Engineer | Google Cloud Certified (ACE)'
    );
  });

  test('should embed valid JSON-LD Person structured schema', async ({ page }) => {
    // Grab the script element containing application/ld+json
    const scriptElement = page.locator('script[type="application/ld+json"]');
    await expect(scriptElement).toBeAttached();

    const innerHTML = await scriptElement.innerHTML();
    const schema = JSON.parse(innerHTML);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Person');
    expect(schema.name).toBe('Harshit Kandoi');
    expect(schema.jobTitle).toBe('Full Stack Software Engineer');
    expect(schema.url).toBe('https://harshitkandoi.in/');
    expect(schema.sameAs).toContain('https://github.com/Harshit-Kandoi');
    expect(schema.sameAs).toContain('https://linkedin.com/in/harshit-kandoi');
  });

  test('should render proper noscript crawler fallback text content', async ({ page }) => {
    // Check noscript tag exists — use body noscript to avoid matching the font-fallback noscript in head
    const noscript = page.locator('body noscript');
    await expect(noscript).toBeAttached();

    const noscriptContent = await noscript.innerHTML();
    expect(noscriptContent).toContain('<h1>Harshit Kandoi | Full Stack Software Engineer | Google Cloud Certified (ACE)</h1>');
    expect(noscriptContent).toContain('<h2>Professional Experience</h2>');
    expect(noscriptContent).toContain('<h2>Technical Skills</h2>');
    expect(noscriptContent).toContain('<h2>Featured Software Engineering Projects</h2>');
  });
});
