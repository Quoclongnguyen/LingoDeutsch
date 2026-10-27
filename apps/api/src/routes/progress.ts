import type { FastifyInstance, FastifyRequest } from "fastify";

import { authenticateInternalRequest } from "@/auth/internal-api-auth";
import { getProgress } from "@/services/progress/progress";

export const defaultProgressServices = { getProgress };
export type ProgressRouteServices = typeof defaultProgressServices;

export async function registerProgressRoutes(
  api: FastifyInstance,
  {
    internalApiSecret,
    services,
  }: {
    internalApiSecret: string;
    services: ProgressRouteServices;
  },
) {
  api.get("/api/v1/progress", async (request: FastifyRequest) => {
    const userId = authenticateInternalRequest(
      request.headers,
      internalApiSecret,
    );
    return services.getProgress({ userId });
  });
}
