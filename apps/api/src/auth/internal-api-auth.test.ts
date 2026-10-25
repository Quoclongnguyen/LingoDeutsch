import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import {
  authenticateInternalRequest,
  InternalApiAuthenticationError,
} from "@/auth/internal-api-auth";

describe("internal API authentication", () => {
  it("accepts a server-authenticated ObjectId with the internal secret", () => {
    const userId = new Types.ObjectId().toHexString();

    expect(
      authenticateInternalRequest(
        {
          authorization: "Bearer test-internal-secret-value",
          "x-lingo-user-id": userId,
        },
        "test-internal-secret-value",
      ),
    ).toBe(userId);
  });

  it("rejects a browser-selected owner without the internal secret", () => {
    expect(() =>
      authenticateInternalRequest(
        { "x-lingo-user-id": new Types.ObjectId().toHexString() },
        "test-internal-secret-value",
      ),
    ).toThrow(InternalApiAuthenticationError);
  });

  it("rejects a malformed authenticated user id", () => {
    expect(() =>
      authenticateInternalRequest(
        {
          authorization: "Bearer test-internal-secret-value",
          "x-lingo-user-id": "not-an-object-id",
        },
        "test-internal-secret-value",
      ),
    ).toThrow(InternalApiAuthenticationError);
  });
});
