import { describe, expect, it } from "vitest";

import { resolveTestDatabaseUri } from "@/lib/db/test-database-uri";

describe("resolveTestDatabaseUri", () => {
  it("derives an isolated test database without changing credentials or options", () => {
    const uri = resolveTestDatabaseUri({
      MONGODB_URI:
        "mongodb+srv://example-user:example-password@example.mongodb.net/lingo_deutsch?retryWrites=true&w=majority",
    });
    const parsed = new URL(uri);

    expect(parsed.pathname).toBe("/lingo_deutsch_test");
    expect(parsed.username).toBe("example-user");
    expect(parsed.password).toBe("example-password");
    expect(parsed.searchParams.get("retryWrites")).toBe("true");
  });

  it("accepts an explicitly configured test database", () => {
    const uri = resolveTestDatabaseUri({
      MONGODB_TEST_URI:
        "mongodb+srv://example-user:example-password@example.mongodb.net/custom_test",
    });

    expect(new URL(uri).pathname).toBe("/custom_test");
  });

  it("rejects an explicit URI that could target production data", () => {
    expect(() =>
      resolveTestDatabaseUri({
        MONGODB_TEST_URI:
          "mongodb+srv://example-user:example-password@example.mongodb.net/lingo_deutsch",
      }),
    ).toThrow("_test");
  });
});
