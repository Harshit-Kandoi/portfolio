import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Unit tests in src/ and netlify/functions/ — never touch e2e/ Playwright specs
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'netlify/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'e2e'],
  },
});
