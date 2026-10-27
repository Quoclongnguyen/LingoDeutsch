import Fastify from "fastify";
import { Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";

import { registerProgressRoutes, type ProgressRouteServices } from "./progress";

const secret = "test-internal-api-secret-value-123";

describe("progress routes", () => {
  it("derives ownership from the trusted boundary and ignores query userId", async () => {
    const getProgress = vi.fn(async () => ({ generatedAt: "now" }));
    const api = Fastify({ logger: false });
    const userId = new Types.ObjectId().toHexString();
    await registerProgressRoutes(api, {
      internalApiSecret: secret,
      services: { getProgress } as unknown as ProgressRouteServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": userId,
      },
      method: "GET",
      url: `/api/v1/progress?userId=${new Types.ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(200);
    expect(getProgress).toHaveBeenCalledWith({ userId });
    await api.close();
  });
});
