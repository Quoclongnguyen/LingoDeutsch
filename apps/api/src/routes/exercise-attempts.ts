import type { FastifyInstance, FastifyRequest } from "fastify";

import {
  exerciseAttemptListQuerySchema,
  submitExerciseAttemptSchema,
} from "@lingo-deutsch/shared";
import { authenticateInternalRequest } from "@/auth/internal-api-auth";
import {
  listExerciseAttempts,
  submitExerciseAttempt,
} from "@/services/exercise/exercise-attempts";

export const defaultExerciseAttemptServices = {
  listExerciseAttempts,
  submitExerciseAttempt,
};

export type ExerciseAttemptRouteServices =
  typeof defaultExerciseAttemptServices;

function authenticatedUserId(
  request: FastifyRequest,
  internalApiSecret: string,
) {
  return authenticateInternalRequest(request.headers, internalApiSecret);
}

export async function registerExerciseAttemptRoutes(
  api: FastifyInstance,
  {
    internalApiSecret,
    services,
  }: {
    internalApiSecret: string;
    services: ExerciseAttemptRouteServices;
  },
) {
  api.post("/api/v1/exercise-attempts", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const input = submitExerciseAttemptSchema.parse(request.body);
    return services.submitExerciseAttempt({ input, userId });
  });

  api.get("/api/v1/exercise-attempts", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const query = exerciseAttemptListQuerySchema.parse(request.query);
    return services.listExerciseAttempts({ ...query, userId });
  });
}
