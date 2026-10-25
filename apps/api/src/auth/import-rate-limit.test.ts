import { describe, expect, it } from "vitest";

import {
  createImportRateLimiter,
  ImportRateLimitError,
} from "@/auth/import-rate-limit";

describe("import rate limiter", () => {
  it("limits repeated import requests per authenticated user", () => {
    const limiter = createImportRateLimiter({ limit: 2, windowMs: 60_000 });

    limiter.assertAllowed("user-a", 1_000);
    limiter.assertAllowed("user-a", 1_001);

    expect(() => limiter.assertAllowed("user-a", 1_002)).toThrow(
      ImportRateLimitError,
    );
    expect(() => limiter.assertAllowed("user-b", 1_002)).not.toThrow();
  });

  it("opens a new window after the previous one expires", () => {
    const limiter = createImportRateLimiter({ limit: 1, windowMs: 1_000 });

    limiter.assertAllowed("user-a", 1_000);
    expect(() => limiter.assertAllowed("user-a", 2_001)).not.toThrow();
  });
});
