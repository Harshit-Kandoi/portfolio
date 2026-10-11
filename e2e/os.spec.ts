import { test, expect } from '@playwright/test';

test.describe('Desktop Workspace OS Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Force OS portal mode & desktop boot state before page script executes
    await page.addInitScript(() => {
      window.localStorage.setItem('portfolio-os-portal-mode', JSON.stringify('os'));
      window.localStorage.setItem('portfolio-os-boot-state', JSON.stringify('desktop'));
    });
    await page.goto('./');
    
    // Check that we are on the desktop by verifying taskbar start button is present
    await expect(page.locator('#start-menu-button')).toBeVisible({ timeout: 10000 });
  });

  test('should render every desktop app icon and taskbar components correctly', async ({ page }) => {
    // Verify specific icons exist on desktop — aria-labels use "Open {name} from desktop" format
    const appIcons = [
      'About.exe', 'Projects.exe', 'Experience.exe', 'Skills.exe', 'Resume.pdf',
      'Terminal.exe', 'Chatbot.exe', 'Writing.exe', 'Certifications.exe',
      'Arcade.exe', 'Contact.exe', 'Settings.exe', 'Swipe.exe', 'Products.exe'
    ];

    for (const app of appIcons) {
      // Mirror Desktop.tsx: aria-label uses title.replace('.exe', '') only
      const name = app.replace('.exe', '');
      const button = page.locator(`button[aria-label="Open ${name} from desktop"]`);
      await expect(button).toBeVisible();
    }

    // Verify taskbar components
    await expect(page.locator('#start-menu-button')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('should allow filtering apps via search bar in taskbar', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search apps..."]');
    await expect(searchInput).toBeVisible();

    // Type "terminal"
    await searchInput.fill('terminal');

    // Only terminal desktop icon should be visible; About desktop icon should be hidden
    await expect(page.locator('button[aria-label="Open Terminal from desktop"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Open About from desktop"]')).toBeHidden();

    // Clear search
    await searchInput.fill('');
    await expect(page.locator('button[aria-label="Open About from desktop"]')).toBeVisible();
  });

  test('should open, focus, minimize, maximize, and close windows', async ({ page }) => {
    // Open About app via double click simulation (desktop icon)
    const aboutIcon = page.locator('button[aria-label="Open About from desktop"]');
    await aboutIcon.dblclick();

    // Check window appears with title About.exe
    const windowHeader = page.locator('#about-window-title');
    await expect(windowHeader).toBeVisible();

    // Minimize window
    await page.locator('button[aria-label="Minimize Window"]').click();
    await expect(windowHeader).toBeHidden();

    // Restore from dock button. We locate the button inside the bottom dock container.
    const dockAboutBtn = page.locator('div.z-\\[9990\\] button', { hasText: 'About.exe' });
    await expect(dockAboutBtn).toBeVisible();
    await dockAboutBtn.click();
    await expect(windowHeader).toBeVisible();

    // Maximize window
    await page.locator('button[aria-label="Maximize Window"]').click();
    const windowElement = page.locator('div[role="dialog"]');
    await expect(windowElement).toHaveCSS('width', '1280px'); // Desktop Chrome base width

    // Close window
    await page.locator('button[aria-label="Close Window"]').click();
    await expect(windowHeader).toBeHidden();
  });

  test('should toggle Start Menu drawer and execute sleep transition', async ({ page }) => {
    // Open start menu
    await page.locator('#start-menu-button').click();
    await expect(page.locator('#start-menu')).toBeVisible();

    // Check user card shows Harshit Kandoi
    await expect(page.locator('#start-menu h3', { hasText: 'Harshit Kandoi' })).toBeVisible();

    // Sleep trigger
    await page.locator('button:has-text("Sleep")').click();
    // Should transition back to Lock Screen
    await expect(page.getByRole('button', { name: 'Unlock Workspace' })).toBeVisible();
  });

  test('should support Terminal commands execution and matrix mode toggle', async ({ page }) => {
    // Open Terminal
    await page.locator('button[aria-label="Open Terminal from desktop"]').dblclick();
    await expect(page.locator('#terminal-window-title')).toBeVisible();

    const termInput = page.locator('div[role="dialog"]:has-text("Terminal.exe") input[type="text"]');
    await expect(termInput).toBeVisible();

    // Type help
    await termInput.fill('help');
    await termInput.press('Enter');

    // Confirm commands list is rendered
    await expect(page.locator('text=neofetch - system config')).toBeVisible();

    // Type matrix
    await termInput.fill('matrix');
    await termInput.press('Enter');

    // Verify matrix canvas becomes active
    const matrixCanvas = page.locator('div[role="dialog"]:has-text("Terminal.exe") canvas');
    await expect(matrixCanvas).toBeVisible();

    // Close matrix via quit key
    await termInput.fill('q');
    await termInput.press('Enter');
    await expect(matrixCanvas).toBeHidden();
  });

  test('should cycle themes from the settings app swatches', async ({ page }) => {
    // Open settings app
    await page.locator('button[aria-label="Open Settings from desktop"]').dblclick();
    await expect(page.locator('#settings-window-title')).toBeVisible();

    // Default theme wrapper check
    const appWrapper = page.locator('.h-dvh');
    
    // Switch theme to retro
    await page.locator('button', { hasText: 'Retro CRT Green' }).click();
    await expect(appWrapper).toHaveClass(/retro-crt-theme/);

    // Switch theme to light
    await page.locator('button', { hasText: 'Arctic Light' }).click();
    // Light theme uses white classes on desktop
    await expect(page.locator('div[role="dialog"]:has-text("Settings.exe")')).toHaveClass(/bg-white/);
  });

  test('should converse with the AI Assistant and trigger shortcut actions', async ({ page }) => {
    // Open AI Assistant
    await page.locator('button[aria-label="Open Chatbot from desktop"]').dblclick();
    await expect(page.locator('#ai-window-title')).toBeVisible();

    const chatInput = page.locator('input[placeholder="Ask me anything..."]');
    await chatInput.fill('skills');
    await chatInput.press('Enter');

    // Bot response contains shortcut action
    const skillsButton = page.locator('button:has-text("Open Skills.exe")');
    await expect(skillsButton).toBeVisible({ timeout: 8000 });

    // Click shortcut button to open Skills window
    await skillsButton.click();
    await expect(page.locator('#skills-window-title')).toBeVisible();
  });
});
