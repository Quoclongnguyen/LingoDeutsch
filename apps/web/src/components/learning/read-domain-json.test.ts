import { describe, expect, it } from "vitest";

import { readDomainJson } from "./read-domain-json";

describe("readDomainJson", () => {
  it("uses the API message for a structured error response", async () => {
    const response = Response.json(
      {
        error: "domain_api_unavailable",
        message: "Dịch vụ học tập đang tạm thời không phản hồi.",
      },
      { status: 503 },
    );

    await expect(readDomainJson(response)).rejects.toThrow(
      "Dịch vụ học tập đang tạm thời không phản hồi.",
    );
  });

  it("returns a stable message instead of a JSON parser error for an empty failure", async () => {
    const response = new Response(null, { status: 500 });

    await expect(readDomainJson(response)).rejects.toThrow(
      "Không thể tải dữ liệu học tập.",
    );
  });
});
