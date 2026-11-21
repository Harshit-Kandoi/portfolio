import { test, expect } from '@playwright/test';
test.describe('Legacy interactive entry compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('portfolio-os-portal-mode', JSON.stringify('os')));
  });
  test('saved desktop sessions now enter HarshitVerse instead of the OS', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('button', { name: 'Enter World' })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#start-menu-button')).toHaveCount(0);
    await expect(page.locator('.verse-world canvas')).toBeVisible();
    await page.getByRole('button', { name: 'Classic Portfolio', exact: true }).click();
    await expect(page.locator('#hero h1')).toContainText('Harshit Kandoi');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('portfolio-os-portal-mode')!))).toBe('classic');
  });
  test('WebGL failure preserves portfolio access and direct content', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) {
        if (type.startsWith('webgl')) return null;
        return original.call(this, type as '2d', ...args as [CanvasRenderingContext2DSettings?]);
      } as typeof original;
    });
    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'The world needs a different window.' })).toBeVisible();
    await page.getByRole('button', { name: 'Explore projects', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('Financial Mirror');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Classic Portfolio', exact: true }).click();
    await expect(page.locator('#contact')).toBeAttached();
  });
});
