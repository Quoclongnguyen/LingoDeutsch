import { defineConfig, devices } from "@playwright/test";

const testAuthSecret = "lingo-deutsch-playwright-secret-value";
const usesExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: usesExternalServer
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1",
        env: {
          AUTH_GITHUB_ID: "playwright-github-client",
          AUTH_GITHUB_SECRET: "playwright-github-secret",
          AUTH_SECRET: testAuthSecret,
          NEXTAUTH_URL: "http://127.0.0.1:3100",
        },
        url: "http://127.0.0.1:3100/api/health",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
