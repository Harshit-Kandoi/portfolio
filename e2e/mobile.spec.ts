import { test, expect } from '@playwright/test';
test.describe('Mobile classic portfolio', () => {
  test('saved desktop mode keeps prerender visible before React loads', async ({ page }) => {
    test.skip(!process.env.CI, 'prerender exists in the production build');
    await page.addInitScript(() => localStorage.setItem('portfolio-os-portal-mode', JSON.stringify('os')));
    await page.route('**/assets/index-*.js', route => route.abort());
    await page.goto('./');
    await expect(page.locator('[data-prerendered] #hero h1')).toContainText('Harshit Kandoi');
    await expect(page.locator('#contact')).toBeAttached();
  });
  test('saved desktop mode still opens the responsive classic portfolio on a phone', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('portfolio-os-portal-mode', JSON.stringify('os')));
    await page.goto('./');
    await expect(page.locator('#hero h1')).toContainText('Harshit Kandoi');
    await expect(page.locator('.harshitverse')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Resume' }).first()).toHaveAttribute('href', /Resume\.pdf$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
  test('mobile navigation and contact form remain usable', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('button', { name: 'Contact', exact: true }).last().click();
    await expect(page.getByPlaceholder('Your name')).toBeVisible();
    await page.route('**/api/send-email', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
    await page.getByPlaceholder('Your name').fill('Mobile Visitor');
    await page.getByPlaceholder('you@example.com').fill('mobile@example.com');
    await page.getByPlaceholder('Tell me what you are building or hiring for.').fill('Local browser test');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('status')).toContainText('on its way');
  });
  test('theme survives a mobile reload', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await expect(page.locator('.minimal-portfolio')).toHaveClass(/theme-dark/);
    await page.reload();
    await expect(page.locator('.minimal-portfolio')).toHaveClass(/theme-dark/);
  });
});
