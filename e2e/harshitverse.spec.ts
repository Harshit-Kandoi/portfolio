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
test('renders a real scene, moves, sprints, jumps and pauses with portfolio panels', async ({ page }, info) => {
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
  await expect.poll(async () => Number(await canvas.getAttribute('data-player-z')), movementCheck).toBeLessThan(-8.35);
  await page.keyboard.up('w');
  expect(Number(await canvas.getAttribute('data-player-z'))).toBeGreaterThan(-8.55); // building collision
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
  for (const name of ['Cloud Citadel', 'AI Nexus', 'Knowledge Tavern', 'Signal Peak']) {
    await page.locator('.verse-destinations').getByRole('button', { name: new RegExp(name) }).click(); await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Tab'); expect(await page.getByRole('dialog').evaluate(el => el.contains(document.activeElement))).toBe(true);
    if (name === 'Signal Peak') await expect(page.getByRole('link', { name: /hello@harshitkandoi.in/ })).toHaveAttribute('href', 'mailto:hello@harshitkandoi.in');
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
  expect(Number(await canvas.getAttribute('data-camera-z'))).toBeGreaterThan(-22.8); // camera remains in front of the citadel wall
  const calls = Number(await canvas.getAttribute('data-draw-calls')); expect(calls).toBeLessThan(80);
  console.log('HarshitVerse low quality: ' + calls + ' draw calls; software-renderer FPS sample: ' + await canvas.getAttribute('data-fps'));
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.pointerLockElement)).toBe(null);
});
