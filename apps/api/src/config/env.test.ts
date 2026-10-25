import { describe, expect, it } from "vitest";

import {
  getApiRuntimeEnv,
  getDatabaseEnv,
  getInternalApiSecret,
} from "@/config/env";

describe("API environment", () => {
  it("rejects a missing MongoDB URI with a clear field name", () => {
    expect(() => getDatabaseEnv({})).toThrow("MONGODB_URI");
  });

  it("uses local-safe runtime defaults", () => {
    expect(getApiRuntimeEnv({})).toEqual({
      API_PORT: 4000,
      WEB_ORIGIN: "http://localhost:3000",
    });
  });

  it("validates an explicit web origin", () => {
    expect(() => getApiRuntimeEnv({ WEB_ORIGIN: "not-a-url" })).toThrow(
      "WEB_ORIGIN",
    );
  });

  it("uses a local-only internal API secret during development", () => {
    expect(getInternalApiSecret({ NODE_ENV: "development" })).toBe(
      "lingo-deutsch-local-internal-api-secret",
    );
  });

  it("requires an explicit internal API secret in production", () => {
    expect(() => getInternalApiSecret({ NODE_ENV: "production" })).toThrow(
      "INTERNAL_API_SECRET",
    );
  });
});
