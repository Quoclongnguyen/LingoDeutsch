import Fastify from "fastify";
import { Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";

import { registerLearningRoutes, type LearningRouteServices } from "./learning";

const secret = "test-internal-api-secret-value-123";

function services(): LearningRouteServices {
  return {
    getDashboard: vi.fn(async () => ({ due: { count: 0 } })),
    getLearningPath: vi.fn(async () => ({ level: "A1", modules: [] })),
    getLesson: vi.fn(async () => ({ slug: "a1-sample" })),
    saveLessonVocabulary: vi.fn(async () => ({ status: "created" })),
    updateLessonProgress: vi.fn(async () => ({ status: "in_progress" })),
  } as unknown as LearningRouteServices;
}

describe("learning routes", () => {
  it("derives learning-path ownership from the trusted boundary", async () => {
    const api = Fastify({ logger: false });
    const learningServices = services();
    const userId = new Types.ObjectId().toHexString();
    await registerLearningRoutes(api, {
      internalApiSecret: secret,
      services: learningServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": userId,
      },
      method: "GET",
      url: `/api/v1/learning-path?level=A1&userId=${new Types.ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(200);
    expect(learningServices.getLearningPath).toHaveBeenCalledWith({
      level: "A1",
      userId,
    });
    await api.close();
  });

  it("validates and forwards progress for the authenticated learner", async () => {
    const api = Fastify({ logger: false });
    const learningServices = services();
    const userId = new Types.ObjectId().toHexString();
    const lessonId = new Types.ObjectId().toHexString();
    await registerLearningRoutes(api, {
      internalApiSecret: secret,
      services: learningServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": userId,
      },
      method: "PATCH",
      payload: {
        completedActivityIds: ["dialogue-introduction"],
        currentActivityIndex: 1,
        status: "in_progress",
      },
      url: `/api/v1/lesson-progress/${lessonId}`,
    });

    expect(response.statusCode).toBe(200);
    expect(learningServices.updateLessonProgress).toHaveBeenCalledWith({
      input: expect.objectContaining({ currentActivityIndex: 1 }),
      lessonId,
      userId,
    });
    await api.close();
  });

  it("forwards a lesson word save without accepting client ownership", async () => {
    const api = Fastify({ logger: false });
    const learningServices = services();
    const userId = new Types.ObjectId().toHexString();
    const lessonId = new Types.ObjectId().toHexString();
    await registerLearningRoutes(api, {
      internalApiSecret: secret,
      services: learningServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": userId,
      },
      method: "POST",
      payload: { headword: "Name", userId: new Types.ObjectId().toHexString() },
      url: `/api/v1/lessons/${lessonId}/vocabulary`,
    });

    expect(response.statusCode).toBe(200);
    expect(learningServices.saveLessonVocabulary).toHaveBeenCalledWith({
      headword: "Name",
      lessonId,
      userId,
    });
    await api.close();
  });
});
