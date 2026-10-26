import Fastify from "fastify";
import { Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";

import { registerReviewRoutes, type ReviewRouteServices } from "./reviews";

const secret = "test-internal-api-secret-value-123";

function services(): ReviewRouteServices {
  return {
    completeReviewSession: vi.fn(async () => ({ status: "completed" })),
    getDueReviewCount: vi.fn(async () => ({ count: 2 })),
    getReviewSession: vi.fn(async () => ({ id: "session", status: "active" })),
    rateReviewCard: vi.fn(async () => ({ idempotent: false })),
    startOrResumeReviewSession: vi.fn(async () => ({
      id: "session",
      status: "active",
    })),
  } as unknown as ReviewRouteServices;
}

describe("review routes", () => {
  it("derives due-count ownership from the trusted boundary", async () => {
    const api = Fastify({ logger: false });
    const reviewServices = services();
    const userId = new Types.ObjectId().toHexString();
    await registerReviewRoutes(api, {
      internalApiSecret: secret,
      services: reviewServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": userId,
      },
      method: "GET",
      url: `/api/v1/reviews/due-count?userId=${new Types.ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(200);
    expect(reviewServices.getDueReviewCount).toHaveBeenCalledWith({ userId });
    await api.close();
  });

  it("validates a rating and forwards the server-owned session", async () => {
    const api = Fastify({ logger: false });
    const reviewServices = services();
    const userId = new Types.ObjectId().toHexString();
    const sessionId = new Types.ObjectId().toHexString();
    await registerReviewRoutes(api, {
      internalApiSecret: secret,
      services: reviewServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": userId,
      },
      method: "POST",
      payload: {
        rating: "good",
        responseTimeMs: 800,
        reviewEventId: "review-event-route-test-0001",
      },
      url: `/api/v1/review-sessions/${sessionId}/rate`,
    });

    expect(response.statusCode).toBe(200);
    expect(reviewServices.rateReviewCard).toHaveBeenCalledWith({
      input: {
        rating: "good",
        responseTimeMs: 800,
        reviewEventId: "review-event-route-test-0001",
      },
      sessionId,
      userId,
    });
    await api.close();
  });
});
