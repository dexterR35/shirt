import { defineConfig } from "@playwright/test";
// E2E_PORT runs a second checkout (e.g. a feature worktree) beside one already on 5173.
const port = Number(process.env.E2E_PORT || 5173);
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  use: { baseURL: `http://localhost:${port}`, headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
  },
  reporter: "list",
});
