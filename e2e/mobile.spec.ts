import { test, expect } from '@playwright/test';

test.describe('Mobile Smartphone AndroidOS Core Verification', () => {
  // Use Pixel 5 configuration
  test.use({ viewport: { width: 393, height: 851 } });

  test('should load mobile boot, lockscreen, and unlock to AndroidOS layout', async ({ page }) => {
    await page.goto('/');

    // Verify mobile header is present on lock screen
    await expect(page.locator('text=Harshit\'s Phone')).toBeVisible({ timeout: 8000 });

    // Click swipe-up unlock button (force click to bypass bounce stability check)
    await page.locator('button.animate-bounce').click({ force: true });

    // Verify AndroidOS is displayed by finding the search widget
    await expect(page.locator('input[placeholder="Search application grid..."]')).toBeVisible();

    // Check app grids on mobile home screen (first() to bypass duplicate home vs dock button matches)
    await expect(page.locator('text=About Me').first()).toBeVisible();
    await expect(page.locator('text=Projects').first()).toBeVisible();
  });

  test('should open, run full-screen, and close mobile apps with Android back action', async ({ page }) => {
    await page.goto('/');
    await page.locator('button.animate-bounce').click({ force: true });

    // Tap "About Me" app icon on home screen (first() to bypass double matches on dock vs grid)
    await page.locator('text=About Me').first().click();

    // The app should launch and display its full screen container (on mobile it is titled "About Me")
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
    await page.locator('button.animate-bounce').click({ force: true });

    // Click drawer toggle trigger
    const drawerHandle = page.locator('text=All Apps');
    await expect(drawerHandle).toBeVisible();
    await drawerHandle.click();

    // Verify App Drawer is visible containing a grid of apps
    await expect(page.locator('input[placeholder="Search drawer..."]')).toBeVisible();

    // Dismiss drawer by tapping close
    await page.locator('text=✕ Close').click();
    await expect(page.locator('input[placeholder="Search drawer..."]')).toBeHidden();
  });

  test('should support quick settings pull-down panel control', async ({ page }) => {
    await page.goto('/');
    await page.locator('button.animate-bounce').click({ force: true });

    // Tap status bar at the top to open quick settings
    // status bar is height 9 div (h-9 class)
    const statusBar = page.locator('.h-9');
    await expect(statusBar).toBeVisible();
    await statusBar.click();

    // Verify Quick Settings panel overlay containing sliders and toggle buttons
    await expect(page.locator('text=Display Brightness')).toBeVisible();
    await expect(page.locator('text=System Volume')).toBeVisible();

    // Toggle airplane mode
    const airplaneMode = page.locator('button', { hasText: 'Airplane' });
    await expect(airplaneMode).toBeVisible();
    await airplaneMode.click();

    // Close settings pull-down
    await page.locator('button:has-text("Close Panel")').click();
    await expect(page.locator('text=Display Brightness')).toBeHidden();
  });
});
