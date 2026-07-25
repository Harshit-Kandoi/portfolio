import { test, expect, Page } from '@playwright/test';

async function ensureUnlocked(page: Page) {
  const searchInput = page.locator('input[placeholder="Search application grid..."]');
  const isSearchVisible = await searchInput.isVisible().catch(() => false);
  if (!isSearchVisible) {
    const unlockBtn = page.locator('button[aria-label="Touch & Hold Fingerprint to Unlock Mobile OS"]');
    if (await unlockBtn.isVisible().catch(() => false)) {
      await unlockBtn.click({ force: true });
    }
  }
  await expect(searchInput).toBeVisible({ timeout: 10000 });
}

test.describe('Mobile Smartphone AndroidOS Core Verification', () => {
  // Use Pixel 5 viewport configuration
  test.use({ viewport: { width: 393, height: 851 } });

  test('should load mobile boot, lockscreen, and unlock to AndroidOS layout', async ({ page }) => {
    await page.goto('/');
    await ensureUnlocked(page);

    // Check app icons on mobile home screen (first() to bypass duplicate matches)
    await expect(page.locator('text=About Me').first()).toBeVisible();
    await expect(page.locator('text=Projects').first()).toBeVisible();
  });

  test('should open, run full-screen, and close mobile apps with Android back action', async ({ page }) => {
    await page.goto('/');
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
    await page.goto('/');
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
    await page.goto('/');
    await ensureUnlocked(page);

    // Tap status bar at the top to open quick settings
    const statusBar = page.locator('.h-9').first();
    await expect(statusBar).toBeVisible();
    await statusBar.click();

    // Verify Quick Settings panel overlay containing controls
    await expect(page.locator('text=Display Brightness')).toBeVisible();
    await expect(page.locator('text=System Volume')).toBeVisible();

    // Toggle airplane mode
    const airplaneMode = page.locator('button', { hasText: 'Airplane' });
    await expect(airplaneMode).toBeVisible();
    await airplaneMode.click();

    // Close settings pull-down
    await page.locator('button:has-text("Close Panel")').click({ force: true });
    await expect(page.locator('text=Display Brightness')).toBeHidden();
  });
});
