import { config as loadEnvironment } from "dotenv";
import { defineConfig } from "vitest/config";

import { resolveTestDatabaseUri } from "./src/lib/db/test-database-uri.ts";

loadEnvironment({ path: "../../.env.local", quiet: true });
process.env.MONGODB_URI = resolveTestDatabaseUri(process.env);

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    fileParallelism: false,
    hookTimeout: 45_000,
    include: ["src/**/*.integration.test.ts"],
    testTimeout: 45_000,
  },
});
