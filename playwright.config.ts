import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT || 5173);
const previewURL = `http://localhost:${port}/`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'line',
  use: {
    baseURL: previewURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/mobile.spec.ts',
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/mobile.spec.ts',
    },
  ],
  webServer: {
    // CI tests the production build (the workflow provides dist/); locally the dev server.
    command: process.env.CI ? `npm run preview -- --port ${port} --strictPort` : `npm run dev -- --port ${port} --strictPort`,
    url: previewURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
