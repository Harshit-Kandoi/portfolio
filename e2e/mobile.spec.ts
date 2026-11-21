import { test, expect, type Page, type Locator } from '@playwright/test';
test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });
test.describe('Mobile classic portfolio', () => {
  test('saved desktop mode keeps prerender visible before React loads', async ({ page }) => {
    test.skip(!process.env.CI, 'prerender exists in the production build');
    await page.addInitScript(() => localStorage.setItem('portfolio-os-portal-mode', JSON.stringify('os')));
    await page.route('**/assets/index-*.js', route => route.abort());
    await page.goto('./');
    await expect(page.locator('[data-prerendered] #hero h1')).toContainText('Harshit Kandoi');
    await expect(page.locator('#contact')).toBeAttached();
  });
  test('new visitors still open the responsive classic portfolio on a phone', async ({ page }) => {
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

// Native Chromium touch dispatch exercises pointer capture and simultaneous fingers.
async function touchDriver(page: Page) {
  const session = await page.context().newCDPSession(page);
  const fingers = new Map<number, { id: number; x: number; y: number }>();
  const send = (type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel') => session.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.values()] });
  const start = async (id: number, x: number, y: number) => { fingers.set(id, { id, x, y }); await send('touchStart'); };
  const move = async (id: number, x: number, y: number) => { fingers.set(id, { id, x, y }); await send('touchMove'); };
  const end = async (id: number) => { fingers.delete(id); await send(fingers.size ? 'touchMove' : 'touchEnd'); };
  let tapId = 100;
  const tap = async (target: Locator) => { const rect = await target.boundingBox(); expect(rect).not.toBeNull(); const id = tapId++; await start(id, rect!.x + rect!.width / 2, rect!.y + rect!.height / 2); await end(id); };
  const cancel = async () => { fingers.clear(); await send('touchCancel'); };
  return { start, move, end, tap, cancel };
}
const movementCheck = { timeout: 20000, intervals: [50, 150, 300] };
test.describe('Mobile HarshitVerse', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    await page.addInitScript(() => localStorage.setItem('harshitverse-v1', JSON.stringify({ state: { reducedMotion: true, sound: false, visited: [], completed: [] }, version: 1 })));
  });
  test('launches from the phone menu and supports movement, camera, jump and interaction', async ({ page }, info) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('./');
    await page.getByRole('button', { name: 'Open menu' }).tap();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Enter HarshitVerse', exact: true }).tap();
    await expect(page.getByRole('button', { name: 'Enter World' })).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: 'Settings', exact: true }).tap();
    await expect(page.getByRole('button', { name: 'low', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Close panel' }).tap();
    await page.getByRole('button', { name: 'Enter World' }).tap();
    const canvas = page.locator('.verse-world canvas');
    await expect(canvas).toHaveAttribute('data-pixel-ratio', '1.00');
    await expect(page.getByRole('button', { name: 'Jump', exact: true })).toBeVisible();
    for (const close of ['Continue exploring', 'Close panel', 'Close']) {
      await page.getByRole('button', { name: 'Settings', exact: true }).tap();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('dialog').getByRole('button', { name: close, exact: true }).tap();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Jump', exact: true })).toBeVisible();
    }
    await page.screenshot({ path: info.outputPath('mobile-portrait.png'), animations: 'disabled', scale: 'css' });
    const touch = await touchDriver(page);
    const stick = page.getByRole('group', { name: 'Movement stick' }); const rect = (await stick.boundingBox())!;
    const sx = rect.x + rect.width / 2, sy = rect.y + rect.height / 2;
    await touch.start(1, sx, sy); await touch.move(1, sx, sy - 42);
    await expect.poll(async () => Number(await canvas.getAttribute('data-player-z')), movementCheck).toBeLessThan(12);
    await touch.start(2, 285, 330); await touch.move(2, 215, 330);
    await expect.poll(async () => Number(await canvas.getAttribute('data-camera-yaw')), movementCheck).toBeGreaterThan(0.3);
    await touch.end(2);
    await touch.tap(page.getByRole('button', { name: 'Jump', exact: true }));
    // Peak height verifies a real jump even when the software renderer finishes the arc between polls.
    await expect.poll(async () => Number(await canvas.getAttribute('data-jump-peak-y')), movementCheck).toBeGreaterThan(0.1);
    await touch.end(1);
    expect(await page.evaluate(() => document.pointerLockElement)).toBeNull();
    await expect.poll(async () => Number(await canvas.getAttribute('data-player-y')), movementCheck).toBe(0);
    const distance = Number(await canvas.getAttribute('data-camera-distance'));
    await touch.start(3, 180, 330); await touch.start(4, 300, 330);
    await touch.move(3, 210, 330); await touch.move(4, 270, 330);
    await expect.poll(async () => Number(await canvas.getAttribute('data-camera-distance')), movementCheck).toBeGreaterThan(distance + 1);
    await touch.end(3); await touch.end(4);
    await touch.start(1, sx, sy); await touch.move(1, sx, sy - 42);
    await touch.tap(page.getByRole('button', { name: 'Sprint', exact: true }));
    await expect(page.getByRole('button', { name: 'Sprint', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await touch.tap(page.getByRole('button', { name: /World map/ }).last());
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(stick).toHaveCount(0);
    let previous = await canvas.getAttribute('data-player-z'), stableReports = 0;
    await expect.poll(async () => {
      const position = await canvas.getAttribute('data-player-z');
      stableReports = position === previous ? stableReports + 1 : 0; previous = position;
      return stableReports;
    }, { timeout: 5000, intervals: [200] }).toBeGreaterThanOrEqual(3);
    await touch.end(1);
    await page.getByRole('dialog').getByRole('button', { name: /Project District/ }).tap();
    await expect.poll(async () => Number(await canvas.getAttribute('data-player-x')), movementCheck).toBe(-23);
    await expect(page.getByRole('button', { name: 'Sprint', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Tap Explore Project District' }).tap();
    await page.getByRole('dialog').getByRole('button', { name: /Financial Mirror/ }).tap();
    await expect(page.getByRole('link', { name: 'Open project' })).toHaveAttribute('href', 'https://mirror.harshitkandoi.in');
    await page.getByRole('button', { name: 'Close panel' }).tap();
    await page.getByRole('button', { name: 'Places', exact: true }).tap();
    await page.getByRole('dialog').getByRole('button', { name: /Career Guild/ }).tap();
    await expect(page.getByRole('dialog')).toContainText('Associate Software Engineer');
    const categories = page.getByRole('navigation', { name: 'Career Guild categories' });
    await touch.tap(categories.getByRole('button', { name: 'Education', exact: true }));
    await expect(page.locator('.verse-timeline article')).toHaveCount(4);
    await expect(page.locator('.verse-timeline')).toContainText('M.Tech.');
    await touch.tap(categories.getByRole('button', { name: 'Certifications', exact: true }));
    await expect(page.locator('.verse-timeline article')).toHaveCount(7);
    await expect(page.locator('.verse-timeline')).toContainText('Google Associate Cloud Engineer (ACE)');
    const phoneViewport = page.viewportSize()!;
    await page.setViewportSize({ width: 320, height: 568 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    for (const button of await categories.getByRole('button').all()) {
      const bounds = (await button.boundingBox())!;
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
    }
    await page.screenshot({ path: info.outputPath('career-filters-compact.png'), animations: 'disabled', scale: 'css' });
    await page.setViewportSize(phoneViewport);
    await page.screenshot({ path: info.outputPath('career-filters-mobile.png'), animations: 'disabled', scale: 'css' });
    await touch.tap(categories.getByRole('button', { name: 'Work Experience', exact: true }));
    await expect(page.locator('.verse-timeline article')).toHaveCount(4);
    await expect(page.locator('.verse-timeline')).toContainText('Associate Software Engineer');
    await touch.tap(categories.getByRole('button', { name: 'All', exact: true }));
    await expect(page.locator('.verse-timeline article')).toHaveCount(15);
    await page.getByRole('button', { name: 'Close panel' }).tap();
    await page.getByRole('button', { name: 'Classic Portfolio', exact: true }).tap();
    await expect(page.locator('#hero h1')).toContainText('Harshit Kandoi');
    expect(errors).toEqual([]);
  });
  test('saved mobile sessions and rotation preserve gameplay with usable touch layouts', async ({ page }, info) => {
    await page.addInitScript(() => localStorage.setItem('portfolio-os-portal-mode', JSON.stringify('os')));
    await page.goto('./');
    await expect(page.getByRole('button', { name: 'Enter World' })).toBeVisible({ timeout: 30000 });
    await page.setViewportSize({ width: 320, height: 568 });
    const copy = (await page.locator('.verse-lobby-copy').boundingBox())!;
    const help = (await page.getByRole('button', { name: 'First time here? How to play' }).boundingBox())!;
    expect(help.y + help.height).toBeLessThanOrEqual(copy.y + copy.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'First time here? How to play' }).tap();
    await expect(page.getByRole('dialog')).toContainText('Movement stick');
    await page.getByRole('button', { name: 'Close panel' }).tap();
    await page.getByRole('button', { name: 'Enter World' }).tap();
    const canvas = page.locator('.verse-world canvas'); const touch = await touchDriver(page);
    const rect = (await page.getByRole('group', { name: 'Movement stick' }).boundingBox())!;
    await touch.start(1, rect.x + rect.width / 2, rect.y + rect.height / 2 - 38);
    await expect.poll(async () => Number(await canvas.getAttribute('data-player-z')), movementCheck).toBeLessThan(12.5);
    await page.setViewportSize({ width: 851, height: 393 });
    await touch.cancel();
    await expect(page.locator('.harshitverse')).toHaveCount(1);
    const position = await canvas.getAttribute('data-player-z');
    await page.waitForTimeout(500); // Rotation/cancel must clear a held joystick, rather than keep walking.
    const stopped = Number(await canvas.getAttribute('data-player-z')); expect(Math.abs(stopped - Number(position))).toBeLessThan(0.3);
    const stick = (await page.getByRole('group', { name: 'Movement stick' }).boundingBox())!;
    const jump = (await page.getByRole('button', { name: 'Jump', exact: true }).boundingBox())!;
    const dock = (await page.locator('.verse-bottom').boundingBox())!;
    const prompt = (await page.locator('.verse-interaction').boundingBox())!;
    expect(stick.y + stick.height).toBeLessThan(dock.y);
    expect(jump.y + jump.height).toBeLessThan(dock.y);
    expect(prompt.x).toBeGreaterThan(stick.x + stick.width);
    expect(prompt.x + prompt.width).toBeLessThan(jump.x);
    await page.screenshot({ path: info.outputPath('mobile-landscape.png'), animations: 'disabled', scale: 'css' });
    await page.getByRole('button', { name: /World map/ }).last().tap();
    await page.getByRole('dialog').getByRole('button', { name: /Career Guild/ }).tap();
    await expect.poll(async () => Number(await canvas.getAttribute('data-player-x')), movementCheck).toBe(25);
    await page.setViewportSize({ width: 393, height: 727 });
    await expect.poll(async () => Number(await canvas.getAttribute('data-player-x')), movementCheck).toBe(25);
    await page.getByRole('button', { name: 'Tap Explore Career Guild' }).tap();
    await expect(page.getByRole('dialog')).toContainText('Associate Software Engineer');
    await page.screenshot({ path: info.outputPath('career-exhibit-mobile.png'), animations: 'disabled', scale: 'css' });
    await page.getByRole('button', { name: 'Close panel' }).tap();
    await page.getByRole('button', { name: 'Places', exact: true }).tap();
    await page.getByRole('dialog').getByRole('button', { name: /Cloud Citadel/ }).tap();
    await expect(page.getByRole('dialog')).toContainText('Google Cloud Platform (GCP)');
    expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath('cloud-exhibit-mobile.png'), animations: 'disabled', scale: 'css' });
    await page.getByRole('button', { name: 'Inspect Local GCP Emulator', exact: true }).tap();
    await expect(page.getByRole('heading', { name: 'Local GCP Emulator', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Source code', exact: true })).toHaveAttribute('href', 'https://github.com/Harshit-Kandoi/Local-GCP-Emulator');
    await page.getByRole('button', { name: 'Close panel' }).tap();
    await page.getByRole('button', { name: 'Places', exact: true }).tap();
    await page.getByRole('dialog').getByRole('button', { name: /AI Nexus/ }).tap();
    await page.screenshot({ path: info.outputPath('ai-exhibit-mobile.png'), animations: 'disabled', scale: 'css' });
    const sections = page.getByRole('navigation', { name: 'AI Nexus sections' });
    await sections.getByRole('button', { name: 'Learning', exact: true }).tap();
    await expect(page.getByRole('heading', { name: 'M.Tech. Artificial Intelligence & Machine Learning', exact: true })).toBeVisible();
    await sections.getByRole('button', { name: 'Projects', exact: true }).tap();
    await page.getByRole('button', { name: 'Inspect Financial Mirror', exact: true }).tap();
    await expect(page.getByRole('link', { name: 'Open project', exact: true })).toHaveAttribute('href', 'https://mirror.harshitkandoi.in');
  });
  test('mobile WebGL failure keeps direct content and classic access usable', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('portfolio-os-portal-mode', JSON.stringify('os'));
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) {
        if (type.startsWith('webgl')) return null;
        return original.call(this, type as '2d', ...args as [CanvasRenderingContext2DSettings?]);
      } as typeof original;
    });
    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'The world needs a different window.' })).toBeVisible();
    const touch = await touchDriver(page);
    const destinations = page.locator('.verse-destinations'); const strip = (await destinations.boundingBox())!;
    const stripY = strip.y + strip.height / 2;
    await touch.start(20, strip.x + strip.width - 35, stripY);
    for (const offset of [75, 150, 225]) await touch.move(20, strip.x + strip.width - 35 - offset, stripY);
    await touch.end(20);
    await expect.poll(() => destinations.evaluate(el => el.scrollLeft)).toBeGreaterThan(40);
    let previousScroll = -1, settled = 0;
    await expect.poll(async () => {
      const scroll = await destinations.evaluate(el => el.scrollLeft);
      settled = Math.abs(scroll - previousScroll) < 1 ? settled + 1 : 0; previousScroll = scroll;
      return settled;
    }, { intervals: [100] }).toBeGreaterThanOrEqual(3);
    await touch.tap(page.getByRole('button', { name: 'Explore projects', exact: true }));
    await expect(page.getByRole('dialog')).toContainText('Financial Mirror');
    const body = page.locator('.verse-panel-body'); const content = (await body.boundingBox())!;
    const centerX = content.x + content.width / 2, startY = content.y + content.height * 0.75;
    await touch.start(21, centerX, startY);
    for (const offset of [40, 80, 120]) await touch.move(21, centerX, startY - offset);
    await touch.end(21);
    await expect.poll(() => body.evaluate(el => el.scrollTop)).toBeGreaterThan(30);
    await page.getByRole('button', { name: 'Close panel' }).tap();
    await page.getByRole('button', { name: 'Classic Portfolio', exact: true }).tap();
    await expect(page.locator('#hero h1')).toContainText('Harshit Kandoi');
  });
});
