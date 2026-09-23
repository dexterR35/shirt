import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:5173", headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
  reporter: "list",
});
