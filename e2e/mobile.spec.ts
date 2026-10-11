import { test, expect, Page } from '@playwright/test';

async function ensureUnlocked(page: Page) {
  const searchInput = page.locator('input[placeholder="Search application grid..."]');
  const isSearchVisible = await searchInput.isVisible().catch(() => false);
  if (!isSearchVisible) {
    const unlockBtn = page.locator('button[aria-label="Touch & Hold Fingerprint to Unlock Mobile OS"]');
    if (await unlockBtn.isVisible().catch(() => false)) {
      // Unlock is press-and-hold (800ms), a plain tap must not unlock.
      const box = (await unlockBtn.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(1100);
      await page.mouse.up();
    }
  }
  await expect(searchInput).toBeVisible({ timeout: 10000 });
}

test.describe('Mobile Smartphone AndroidOS Core Verification', () => {
  // Use Pixel 5 viewport configuration
  test.use({ viewport: { width: 393, height: 851 } });

  // Classic is the default for every visitor; the Android OS is the opt-in interactive mode.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('portfolio-os-portal-mode', JSON.stringify('os'));
    });
  });

  test('should load mobile boot, lockscreen, and unlock to AndroidOS layout', async ({ page }) => {
    await page.goto('./');
    await ensureUnlocked(page);

    // Check app icons on mobile home screen (first() to bypass duplicate matches)
    await expect(page.locator('text=About Me').first()).toBeVisible();
    await expect(page.locator('text=Projects').first()).toBeVisible();
  });

  test('should open, run full-screen, and close mobile apps with Android back action', async ({ page }) => {
    await page.goto('./');
    await ensureUnlocked(page);

    // Tap "About Me" app icon on home screen
    await page.locator('text=About Me').first().click();

    // The app should launch and display its container
    await expect(page.locator('span:has-text("About Me")').first()).toBeVisible();

    // Click Android navigation bar Back button
    const backBtn = page.locator('button[title="Back"]');
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // We should return to home screen
    await expect(page.locator('input[placeholder="Search application grid..."]')).toBeVisible();
  });

  test('should open app drawer when simulated swipe-up or drawer trigger is clicked', async ({ page }) => {
    await page.goto('./');
    await ensureUnlocked(page);

    // Click drawer toggle trigger
    const drawerHandle = page.locator('text=All Apps');
    await expect(drawerHandle).toBeVisible();
    await drawerHandle.click();

    // Verify App Drawer is visible containing search input
    await expect(page.locator('input[placeholder="Search drawer..."]')).toBeVisible();

    // Dismiss drawer by tapping close
    await page.locator('text=✕ Close').click();
    await expect(page.locator('input[placeholder="Search drawer..."]')).toBeHidden();
  });

  test('should support quick settings pull-down panel control', async ({ page }) => {
    await page.goto('./');
    await ensureUnlocked(page);

    // Tap status bar at the top to open quick settings
    const statusBar = page.locator('button[aria-label="Open quick settings and notifications"]');
    await expect(statusBar).toBeVisible();
    await statusBar.click();

    // Verify Quick Settings panel overlay containing controls
    await expect(page.locator('text=Display Brightness')).toBeVisible();
    await expect(page.locator('text=System Volume')).toBeVisible();

    // Toggle Do Not Disturb (hides the status-bar alert bell)
    const dnd = page.locator('button', { hasText: 'Do Not Disturb' });
    await expect(dnd).toBeVisible();
    await dnd.click();

    // Close settings pull-down
    await page.locator('button:has-text("Close Panel")').click({ force: true });
    await expect(page.locator('text=Display Brightness')).toBeHidden();
  });
});
