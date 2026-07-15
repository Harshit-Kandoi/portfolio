import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Only pick up unit/integration tests inside src/ — never touch e2e/ Playwright specs
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'e2e'],
  },
});
