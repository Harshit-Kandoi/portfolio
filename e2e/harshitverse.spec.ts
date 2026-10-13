import { test, expect, type Page } from '@playwright/test';
test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(90000);
test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });
test.beforeEach(() => { test.setTimeout(120000); });
const movementCheck = { timeout: 20000, intervals: [100, 250, 500] };
async function launch(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('portfolio-os-portal-mode', JSON.stringify('os'));
    if (!localStorage.getItem('harshitverse-v1')) localStorage.setItem('harshitverse-v1', JSON.stringify({ state: { quality: 'low', reducedMotion: true, sound: false, completed: [], visited: [] }, version: 1 }));
  });
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Enter World' })).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.verse-world canvas')).toBeVisible();
}
async function travel(page: Page, name: string) {
  await page.getByRole('button', { name: /World map/ }).last().click();
  await page.getByRole('dialog').getByRole('button', { name: new RegExp(name) }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.locator('.verse-world canvas').focus();
}
test('pause dismissal survives delayed pointer unlocks and held Escape', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await launch(page); await page.getByRole('button', { name: 'Enter World' }).click();
  const dialog = page.getByRole('dialog');
  // Model the browser's asynchronous unlock notification without relying on timing.
  const lock = () => page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.verse-world canvas')!;
    Object.defineProperty(canvas, 'requestPointerLock', { configurable: true, value: () => { document.documentElement.dataset.lockRequested = 'true'; } });
    Object.defineProperty(document, 'pointerLockElement', { configurable: true, value: canvas });
    Object.defineProperty(document, 'exitPointerLock', { configurable: true, value: () => { document.documentElement.dataset.unlockRequested = 'true'; } });
    document.documentElement.dataset.unlockRequested = 'false';
    document.documentElement.dataset.lockRequested = 'false';
    document.dispatchEvent(new Event('pointerlockchange'));
  });
  const unlock = () => page.evaluate(() => {
    Object.defineProperty(document, 'pointerLockElement', { configurable: true, value: null });
    document.dispatchEvent(new Event('pointerlockchange'));
  });
  for (const close of ['Continue exploring', 'Close panel', 'Close ESC', 'Escape']) {
    await lock(); await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.dataset.unlockRequested)).toBe('true');
    if (close === 'Escape') await page.keyboard.press('Escape');
    else await dialog.getByRole('button', { name: close, exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.locator('.verse-world canvas').evaluate(canvas => canvas.dispatchEvent(new PointerEvent('click', { bubbles: true, pointerType: 'mouse' })));
    expect(await page.evaluate(() => document.documentElement.dataset.lockRequested)).toBe('false');
    await unlock(); // A late event must not reopen the menu after the user closed it.
    await expect(dialog).toHaveCount(0);
    await page.locator('.verse-world canvas').evaluate(canvas => canvas.dispatchEvent(new PointerEvent('click', { bubbles: true, pointerType: 'mouse' })));
    expect(await page.evaluate(() => document.documentElement.dataset.lockRequested)).toBe('true');
  }
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await lock(); // A pending capture request may finish after a panel opens.
  expect(await page.evaluate(() => document.documentElement.dataset.unlockRequested)).toBe('true');
  await dialog.getByRole('button', { name: 'Continue exploring' }).click();
  await unlock(); await expect(dialog).toHaveCount(0);
  await lock(); await unlock(); // An unexpected mouse capture loss should still pause.
  await expect(dialog).toBeVisible(); await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.keyboard.down('Escape'); await expect(dialog).toBeVisible();
  await page.keyboard.down('Escape'); await expect(dialog).toBeVisible(); // Auto-repeat.
  await page.keyboard.up('Escape'); await page.keyboard.down('Escape');
  await expect(dialog).toHaveCount(0);
  await page.keyboard.down('Escape'); await expect(dialog).toHaveCount(0);
  await page.keyboard.up('Escape');
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'pointerLockElement'); Reflect.deleteProperty(document, 'exitPointerLock');
    Reflect.deleteProperty(document.querySelector('.verse-world canvas')!, 'requestPointerLock');
    window.dispatchEvent(new Event('blur'));
  });
  await expect(dialog).toBeVisible(); await dialog.getByRole('button', { name: 'Continue exploring' }).click();
  await expect(dialog).toHaveCount(0);
  const canvas = page.locator('.verse-world canvas'); await canvas.focus();
  await page.keyboard.down('w');
  await expect.poll(async () => Number(await canvas.getAttribute('data-player-z')), movementCheck).toBeLessThan(12);
  await page.keyboard.up('w');
  for (const key of ['m', 'Escape']) {
    await canvas.click({ position: { x: 1000, y: 430 } });
    await expect.poll(() => page.evaluate(() => document.pointerLockElement?.tagName)).toBe('CANVAS');
    await page.keyboard.press(key); await expect(dialog).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.pointerLockElement)).toBe(null);
    await dialog.getByRole('button', { name: 'Close panel' }).click();
    await expect(dialog).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
test('renders a real scene, moves, sprints, jumps and pauses with portfolio panels', async ({ page }, info) => {
  test.setTimeout(180000); // Balanced screenshots and native collisions on the software renderer.
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', msg => { if (msg.type() === 'error' && /THREE|WebGL|shader/i.test(msg.text())) errors.push(msg.text()); });
  await launch(page);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'balanced', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.screenshot({ path: info.outputPath('lobby.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'low', exact: true }).click(); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Enter World' }).click();
  const canvas = page.locator('.verse-world canvas'); await canvas.focus();
  await page.keyboard.down('w');
  await expect.poll(async () => Number(await canvas.getAttribute('data-player-z')), movementCheck).toBeLessThan(11.5);
  await page.keyboard.up('w');
  const walking = Number(await canvas.getAttribute('data-player-z'));
  await page.keyboard.down('Shift'); await page.keyboard.down('w');
  await expect.poll(async () => Number(await canvas.getAttribute('data-player-z')), movementCheck).toBeLessThan(walking - 2);
  await page.keyboard.up('w'); await page.keyboard.up('Shift');
  await page.keyboard.press('Space');
  await expect.poll(async () => Number(await canvas.getAttribute('data-player-y')), { intervals: [30, 50, 100] }).toBeGreaterThan(0.1);
  await expect.poll(async () => Number(await canvas.getAttribute('data-player-y'))).toBe(0);
  await page.screenshot({ path: info.outputPath('gameplay.png'), animations: 'disabled' });
  await travel(page, 'Project District');
  await expect(page.getByRole('button', { name: 'E Explore Project District' })).toBeVisible();
  await page.keyboard.press('e');
  await expect(page.getByRole('dialog')).toBeVisible();
  const position = await canvas.getAttribute('data-player-z'); await page.keyboard.press('w'); expect(await canvas.getAttribute('data-player-z')).toBe(position);
  await page.getByRole('dialog').getByRole('button', { name: /Financial Mirror/ }).click();
  await expect(page.getByRole('heading', { name: 'Financial Mirror' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open project' })).toHaveAttribute('href', 'https://mirror.harshitkandoi.in');
  await page.screenshot({ path: info.outputPath('project.png'), animations: 'disabled' });
  await page.keyboard.press('Escape'); await canvas.focus();
  await page.keyboard.down('w');
  await expect.poll(async () => Number(await canvas.getAttribute('data-player-z')), movementCheck).toBeLessThan(-4.25);
  await page.keyboard.up('w');
  await page.waitForTimeout(400);
  expect(Number(await canvas.getAttribute('data-player-z'))).toBeGreaterThan(-4.5); // solid terminal
  await page.keyboard.down('d');
  await expect.poll(async () => Number(await canvas.getAttribute('data-player-x')), movementCheck).toBeGreaterThan(-21);
  await page.keyboard.up('d');
  await page.keyboard.down('w');
  await expect.poll(async () => Number(await canvas.getAttribute('data-player-z')), movementCheck).toBeLessThan(-8.5);
  await page.keyboard.up('w');
  expect(Number(await canvas.getAttribute('data-player-z'))).toBeGreaterThan(-8.75); // facade collision
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'balanced', exact: true }).click();
  await expect(page.getByRole('button', { name: 'balanced', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Classic Portfolio', exact: true }).click();
  await expect(page.locator('#hero h1')).toContainText('Harshit Kandoi'); expect(errors).toEqual([]);
});
test('guide dialogue, fast travel and mission completion persist on reload', async ({ page }, info) => {
  await launch(page); await page.getByRole('button', { name: 'Enter World' }).click();
  await travel(page, 'Central Hub'); const canvas = page.locator('.verse-world canvas');
  // Reach the guide from the spawn using actual movement, crossing the bridge.
  await page.keyboard.down('w'); await expect.poll(async () => Number(await canvas.getAttribute('data-player-z')), movementCheck).toBeLessThan(3); await page.keyboard.up('w');
  await page.keyboard.down('a'); await expect.poll(async () => Number(await canvas.getAttribute('data-player-x')), movementCheck).toBeLessThan(-3); await page.keyboard.up('a');
  await page.keyboard.press('e'); await expect(page.getByRole('heading', { name: 'A little guidance.' })).toBeVisible();
  await page.getByRole('button', { name: 'Who is Harshit?' }).click(); await expect(page.locator('.verse-dialogue')).toContainText('ThoughtIn Solutions');
  await page.keyboard.press('Escape');
  await travel(page, 'Project District'); await page.keyboard.press('e'); await page.getByRole('dialog').getByRole('button', { name: /Financial Mirror/ }).click(); await page.keyboard.press('Escape');
  await travel(page, 'Career Guild'); await page.keyboard.press('e'); await expect(page.getByRole('dialog')).toContainText('Associate Software Engineer'); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Journal/ }).click(); await expect(page.getByRole('dialog')).toContainText('Adventure complete.');
  await page.screenshot({ path: info.outputPath('journal.png'), animations: 'disabled' });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('harshitverse-v1')!).state.completed); expect(saved).toEqual(expect.arrayContaining(['guide', 'projects', 'inspect', 'career']));
  await page.reload();
  await expect(page.getByRole('button', { name: 'Enter World' })).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: /Journal/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Adventure complete.');
});
test('all direct sections, map and keyboard focus remain accessible from the lobby', async ({ page }, info) => {
  await launch(page);
  for (const name of ['Cloud Citadel', 'AI Nexus', 'Career Guild', 'Knowledge Tavern', 'Contact Beacon']) {
    await page.locator('.verse-destinations').getByRole('button', { name: new RegExp(name) }).click(); await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Tab'); expect(await page.getByRole('dialog').evaluate(el => el.contains(document.activeElement))).toBe(true);
    if (name === 'Cloud Citadel') {
      await expect(page.getByRole('dialog')).toContainText('Google Cloud Platform (GCP)');
      await expect(page.getByRole('dialog')).toContainText('Associate Software Engineer');
      await expect(page.getByRole('dialog')).toContainText('Google Associate Cloud Engineer (ACE)');
      await expect(page.getByRole('link', { name: 'View credential' }).first()).toHaveAttribute('href', /^https:\/\//);
      await expect(page.getByRole('button', { name: /Local GCP Emulator/ })).toBeAttached();
      await page.screenshot({ path: info.outputPath('cloud-exhibit.png'), animations: 'disabled' });
    }
    if (name === 'AI Nexus') {
      await expect(page.getByRole('button', { name: 'Inspect Financial Mirror', exact: true })).toBeVisible();
      await expect.poll(() => page.locator('.verse-ai-project-image img').evaluateAll(images => images.slice(0, 2).every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
      await page.screenshot({ path: info.outputPath('ai-exhibit.png'), animations: 'disabled' });
      const sections = page.getByRole('navigation', { name: 'AI Nexus sections' });
      await sections.getByRole('button', { name: 'Applied AI', exact: true }).click();
      const work = page.getByRole('article').filter({ hasText: 'Associate Software Engineer' });
      await work.getByRole('button', { name: 'Read details', exact: true }).click();
      await expect(work.getByRole('button', { name: 'Hide details' })).toHaveAttribute('aria-expanded', 'true');
      await expect(work).toContainText('Developed and supported full-stack business applications');
      await sections.getByRole('button', { name: 'Learning', exact: true }).click();
      await expect(page.getByRole('dialog')).toContainText('M.Tech. Artificial Intelligence & Machine Learning');
    }
    if (name === 'Career Guild') {
      await expect(page.getByRole('dialog')).toContainText('Associate Software Engineer');
      const categories = page.getByRole('navigation', { name: 'Career Guild categories' });
      await expect(page.locator('.verse-timeline article')).toHaveCount(15);
      await categories.getByRole('button', { name: 'Work Experience', exact: true }).click();
      await expect(page.locator('.verse-timeline article')).toHaveCount(4);
      await expect(page.locator('.verse-timeline')).not.toContainText('M.Tech.');
      await categories.getByRole('button', { name: 'Education', exact: true }).click();
      await expect(page.locator('.verse-timeline article')).toHaveCount(4);
      await expect(page.locator('.verse-timeline')).toContainText('M.Tech. Artificial Intelligence & Machine Learning');
      await expect(page.locator('.verse-timeline')).not.toContainText('Associate Software Engineer');
      await categories.getByRole('button', { name: 'Certifications', exact: true }).click();
      await expect(page.locator('.verse-timeline article')).toHaveCount(7);
      await expect(page.locator('.verse-timeline')).toContainText('Google Associate Cloud Engineer (ACE)');
      await expect(page.locator('.verse-timeline').getByRole('link', { name: 'View credential' })).toHaveCount(6);
      await categories.getByRole('button', { name: 'All', exact: true }).click();
      await expect(page.locator('.verse-timeline article')).toHaveCount(15);
      await page.screenshot({ path: info.outputPath('career-exhibit.png'), animations: 'disabled' });
    }
    if (name === 'Contact Beacon') {
      await expect(page.getByRole('link', { name: /hello@harshitkandoi.in/ })).toHaveAttribute('href', 'mailto:hello@harshitkandoi.in');
      await expect(page.getByRole('link', { name: 'Email Harshit' })).toHaveAttribute('href', 'mailto:hello@harshitkandoi.in');
      await expect(page.getByRole('link', { name: 'Connect on LinkedIn' })).toHaveAttribute('href', 'https://linkedin.com/in/harshit-kandoi');
      await page.screenshot({ path: info.outputPath('contact-exhibit.png'), animations: 'disabled' });
    }
    await page.keyboard.press('Escape');
  }
  await page.getByRole('button', { name: /World map/ }).click(); await page.screenshot({ path: info.outputPath('map.png'), animations: 'disabled' });
  await page.getByRole('dialog').getByRole('button', { name: /Cloud Citadel/ }).click(); await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-player-x'))).toBe(19);
  const canvas = page.locator('.verse-world canvas');
  await canvas.click({ position: { x: 1000, y: 430 } });
  await expect.poll(() => page.evaluate(() => document.pointerLockElement?.tagName)).toBe('CANVAS');
  await page.mouse.move(20, 430);
  await expect.poll(async () => Math.abs(Number(await canvas.getAttribute('data-camera-yaw')))).toBeGreaterThan(2);
  await expect.poll(async () => Number(await canvas.getAttribute('data-camera-z'))).toBeLessThan(-20);
  expect(Number(await canvas.getAttribute('data-camera-z'))).toBeGreaterThan(-23); // camera remains in front of the rendered citadel wings (z = -23.25)
  const calls = Number(await canvas.getAttribute('data-draw-calls')); expect(calls).toBeLessThan(80);
  console.log('HarshitVerse low quality: ' + calls + ' draw calls; software-renderer FPS sample: ' + await canvas.getAttribute('data-fps'));
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.pointerLockElement)).toBe(null);
  await page.getByRole('button', { name: 'Continue exploring' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await canvas.click({ position: { x: 1000, y: 430 } });
  await expect.poll(() => page.evaluate(() => document.pointerLockElement?.tagName)).toBe('CANVAS');
  await page.keyboard.press('m'); await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.pointerLockElement)).toBe(null);
  await page.getByRole('button', { name: 'Close panel' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('lobby and gameplay layouts fit laptop and compact desktop viewports', async ({ page }, info) => {
  test.setTimeout(180000); // Multiple sizes and destination screenshots share one WebGL session.
  await launch(page);
  for (const size of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 1024, height: 640 }, { width: 900, height: 500 }]) {
    await page.setViewportSize(size);
    const copy = await page.locator('.verse-lobby-copy').boundingBox();
    const dock = await page.locator('.verse-bottom').boundingBox();
    expect(copy!.y + copy!.height).toBeLessThanOrEqual(dock!.y);
    const help = await page.getByRole('button', { name: 'First time here? How to play' }).boundingBox();
    expect(help!.y + help!.height).toBeLessThanOrEqual(copy!.y + copy!.height);
    for (const button of await page.locator('.verse-destinations>button').all()) {
      const rect = await button.boundingBox();
      expect(rect!.x).toBeGreaterThanOrEqual(0);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(size.width + 1);
      const label = button.locator('strong');
      expect(await label.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
    if (size.width === 1024) await page.screenshot({ path: info.outputPath(`lobby-${size.width}.png`), animations: 'disabled' });
  }
  await page.getByRole('button', { name: 'Enter World' }).click();
  for (const size of [{ width: 900, height: 500 }, { width: 1024, height: 640 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(size);
    const mission = await page.locator('.verse-mission-card').boundingBox();
    const dock = await page.locator('.verse-bottom').boundingBox();
    const prompt = await page.locator('.verse-interaction').boundingBox();
    const controls = await page.locator('.verse-key-hints').boundingBox();
    expect(mission!.y + mission!.height).toBeLessThan(dock!.y);
    expect(prompt!.y + prompt!.height).toBeLessThan(dock!.y);
    if (controls) expect(controls.x + controls.width).toBeLessThan(prompt!.x);
    if (size.width === 900) await page.screenshot({ path: info.outputPath(`gameplay-${size.width}.png`), animations: 'disabled' });
  }
  await travel(page, 'Project District');
  await page.screenshot({ path: info.outputPath('project-path.png'), animations: 'disabled' });
  await travel(page, 'Cloud Citadel');
  await page.screenshot({ path: info.outputPath('cloud-path.png'), animations: 'disabled' });
  await travel(page, 'Career Guild');
  await page.screenshot({ path: info.outputPath('career-path.png'), animations: 'disabled' });
  await travel(page, 'Contact Beacon');
  await page.screenshot({ path: info.outputPath('contact-path.png'), animations: 'disabled' });
});
