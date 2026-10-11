import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'line',
  use: {
    // The app is served under /portfolio/; tests navigate relative to this (page.goto('./')).
    baseURL: 'http://localhost:5173/portfolio/',
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
    command: process.env.CI ? 'npm run preview -- --port 5173 --strictPort' : 'npm run dev',
    url: 'http://localhost:5173/portfolio/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
