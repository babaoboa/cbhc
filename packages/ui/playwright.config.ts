import { defineConfig, devices } from "@playwright/test";

const port = 4174;

// 2x so pixel measurements in the optical spacing specs have half-pixel precision.
const browser = (device: keyof typeof devices) => ({
  ...devices[device],
  deviceScaleFactor: 2,
});

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: browser("Desktop Chrome") },
    { name: "firefox", use: browser("Desktop Firefox") },
    { name: "webkit", use: browser("Desktop Safari") },
  ],
  webServer: {
    command: `pnpm exec vite tests/harness --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
