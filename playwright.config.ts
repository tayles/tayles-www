import { defineConfig, devices } from '@playwright/test';

// Deliberately not Astro's default 4321 — a dev server left running there
// would be reused, and its dev toolbar swallows clicks.
const PORT = 4399;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  ...(process.env['CI'] ? { workers: 1 } : {}),
  // Nothing uploads the HTML report in CI, so don't spend time writing it.
  reporter: process.env['CI'] ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Serve the real built output — that is what actually ships.
    command: `bun run build && bun run scripts/serve-dist.ts ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
