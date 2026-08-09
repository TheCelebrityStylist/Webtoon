import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 3,
  retries: 0,
  timeout: 30000,
  use: { baseURL: "http://127.0.0.1:3100" },
  webServer: {
    command: "npm run build && npm start -- --port 3100",
    url: "http://127.0.0.1:3100",
    timeout: 120000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: "postgresql://e2e:e2e@localhost:5432/e2e",
      AUTH_SECRET: "e2e-secret-that-is-at-least-thirty-two-characters",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3100",
    },
  },
});
