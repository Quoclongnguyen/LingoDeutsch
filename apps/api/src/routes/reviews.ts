import type { FastifyInstance, FastifyRequest } from "fastify";

import {
  createReviewSessionInputSchema,
  rateReviewCardInputSchema,
  reviewSessionIdentifierSchema,
} from "@lingo-deutsch/shared";
import { authenticateInternalRequest } from "@/auth/internal-api-auth";
import {
  completeReviewSession,
  getDueReviewCount,
  getReviewSession,
  rateReviewCard,
  startOrResumeReviewSession,
} from "@/services/review/review-sessions";

export const defaultReviewServices = {
  completeReviewSession,
  getDueReviewCount,
  getReviewSession,
  rateReviewCard,
  startOrResumeReviewSession,
};

export type ReviewRouteServices = typeof defaultReviewServices;

function authenticatedUserId(
  request: FastifyRequest,
  internalApiSecret: string,
) {
  return authenticateInternalRequest(request.headers, internalApiSecret);
}

function sessionIdentifier(request: FastifyRequest) {
  return reviewSessionIdentifierSchema.parse(request.params).id;
}

export async function registerReviewRoutes(
  api: FastifyInstance,
  {
    internalApiSecret,
    services,
  }: {
    internalApiSecret: string;
    services: ReviewRouteServices;
  },
) {
  api.get("/api/v1/reviews/due-count", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    return services.getDueReviewCount({ userId });
  });

  api.post("/api/v1/review-sessions", async (request, reply) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const input = createReviewSessionInputSchema.parse(request.body ?? {});
    const result = await services.startOrResumeReviewSession({ input, userId });
    return reply.code(result.resumed ? 200 : 201).send(result);
  });

  api.get("/api/v1/review-sessions/:id", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    return services.getReviewSession({
      sessionId: sessionIdentifier(request),
      userId,
    });
  });

  api.post("/api/v1/review-sessions/:id/rate", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const input = rateReviewCardInputSchema.parse(request.body);
    return services.rateReviewCard({
      input,
      sessionId: sessionIdentifier(request),
      userId,
    });
  });

  api.post("/api/v1/review-sessions/:id/complete", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    return services.completeReviewSession({
      sessionId: sessionIdentifier(request),
      userId,
    });
  });
}
