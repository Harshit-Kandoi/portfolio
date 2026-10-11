import { test, expect } from '@playwright/test';

// The scroll-first page every visitor lands on (desktop project; the mobile project runs mobile.spec.ts).
test.describe('Classic portfolio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#hero h1')).toBeVisible();
  });

  test('shows the hero with the current role and working CTAs', async ({ page }) => {
    await expect(page.locator('#hero h1')).toContainText('Harshit Kandoi');
    await expect(page.locator('#hero')).toContainText('Associate Software Engineer');
    await expect(page.getByRole('link', { name: 'Resume' }).first()).toHaveAttribute('href', /Resume\.pdf$/);
  });

  test('in-page links scroll to their section without adding a #hash or history entry', async ({ page }) => {
    const historyBefore = await page.evaluate(() => history.length);

    await page.locator('a.minimal-button-primary', { hasText: 'Contact me' }).click();
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById('contact')!.getBoundingClientRect().top))).toBeLessThan(5);

    await page.locator('nav').getByRole('button', { name: 'Experience' }).click();
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById('experience')!.getBoundingClientRect().top))).toBeLessThan(5);

    expect(new URL(page.url()).hash).toBe('');
    expect(await page.evaluate(() => history.length)).toBe(historyBefore);
  });

  test('a shared #section link opens at that section and cleans the URL', async ({ page, baseURL }) => {
    await page.goto('about:blank'); // a fresh visit, not an in-page jump
    await page.goto(`${baseURL}#contact`);
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById('contact')!.getBoundingClientRect().top))).toBeLessThan(5);
    expect(new URL(page.url()).hash).toBe('');
  });

  test('the browser Back button leaves the site (no history trap)', async ({ page, baseURL }) => {
    await page.goto('about:blank');
    await page.goto(baseURL!);
    await expect(page.locator('#hero h1')).toBeVisible();
    await page.goBack();
    expect(page.url()).toBe('about:blank');
  });

  test('theme toggle switches to dark and is remembered', async ({ page }) => {
    const root = page.locator('.minimal-portfolio');
    await expect(root).toHaveClass(/theme-light/);
    await page.getByRole('button', { name: 'Toggle theme' }).first().click();
    await expect(root).toHaveClass(/theme-dark/);
    await page.reload();
    await expect(page.locator('.minimal-portfolio')).toHaveClass(/theme-dark/);
  });

  test.describe('contact form', () => {
    const fill = async (page: import('@playwright/test').Page) => {
      await page.getByPlaceholder('Your name').fill('Test Visitor');
      await page.getByPlaceholder('you@example.com').fill('visitor@example.com');
      await page.getByPlaceholder('Tell me what you are building or hiring for.').fill('Hello from the e2e suite');
    };

    test('sends and confirms', async ({ page }) => {
      let payload: Record<string, unknown> = {};
      await page.route('**/api/send-email', async (route) => {
        payload = route.request().postDataJSON();
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
      });
      await fill(page);
      await page.getByRole('button', { name: 'Send message' }).click();
      await expect(page.getByRole('status')).toContainText('on its way');
      expect(payload).toMatchObject({ email: 'visitor@example.com', website: '' });
    });

    test('explains rate limiting and offers email instead of redirecting', async ({ page }) => {
      await page.route('**/api/send-email', (route) => route.fulfill({ status: 429, contentType: 'application/json', body: '{}' }));
      await fill(page);
      await page.getByRole('button', { name: 'Send message' }).click();
      const status = page.getByRole('status');
      await expect(status).toContainText('Too many messages');
      await expect(status.getByRole('link')).toHaveAttribute('href', /^mailto:/);
      await expect(page).not.toHaveURL(/^mailto:/); // still on the page
    });
  });

  test('HarshitVerse opens the playable portfolio lobby', async ({ page }) => {
    await page.locator('nav').getByRole('button', { name: 'HarshitVerse' }).first().click();
    await expect(page.getByRole('button', { name: 'Enter World' })).toBeVisible({ timeout: 30000 });
  });
});

// Only meaningful against the production build (CI runs e2e on `vite preview`), where the
// classic page is prerendered into index.html.
test.describe('Prerendered HTML', () => {
  test.skip(!process.env.CI, 'prerender only exists in the production build');
  test.use({ javaScriptEnabled: false });

  test('the page has real content before any JavaScript runs', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#hero h1')).toContainText('Harshit Kandoi');
    await expect(page.locator('#contact')).toBeAttached();
  });
});
