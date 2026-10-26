import type { FastifyInstance, FastifyRequest } from "fastify";

import {
  learningPathQuerySchema,
  lessonProgressInputSchema,
  lessonVocabularySaveInputSchema,
} from "@lingo-deutsch/shared";
import { authenticateInternalRequest } from "@/auth/internal-api-auth";
import {
  getDashboard,
  getLearningPath,
  getLesson,
  saveLessonVocabulary,
  updateLessonProgress,
} from "@/services/learning/learning";

export const defaultLearningServices = {
  getDashboard,
  getLearningPath,
  getLesson,
  saveLessonVocabulary,
  updateLessonProgress,
};

export type LearningRouteServices = typeof defaultLearningServices;

function authenticatedUserId(
  request: FastifyRequest,
  internalApiSecret: string,
) {
  return authenticateInternalRequest(request.headers, internalApiSecret);
}

function parameter(request: FastifyRequest, name: string) {
  const value = (request.params as Record<string, unknown>)[name];
  if (typeof value !== "string" || !value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

export async function registerLearningRoutes(
  api: FastifyInstance,
  {
    internalApiSecret,
    services,
  }: {
    internalApiSecret: string;
    services: LearningRouteServices;
  },
) {
  api.get("/api/v1/learning-path", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const { level } = learningPathQuerySchema.parse(request.query);
    return services.getLearningPath({ level, userId });
  });

  api.get("/api/v1/lessons/:slug", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    return services.getLesson({
      slug: parameter(request, "slug"),
      userId,
    });
  });

  api.patch("/api/v1/lesson-progress/:lessonId", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const input = lessonProgressInputSchema.parse(request.body);
    return services.updateLessonProgress({
      input,
      lessonId: parameter(request, "lessonId"),
      userId,
    });
  });

  api.post("/api/v1/lessons/:lessonId/vocabulary", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const input = lessonVocabularySaveInputSchema.parse(request.body);
    return services.saveLessonVocabulary({
      headword: input.headword,
      lessonId: parameter(request, "lessonId"),
      userId,
    });
  });

  api.get("/api/v1/dashboard", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    return services.getDashboard({ userId });
  });
}
