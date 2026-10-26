import Fastify from "fastify";
import { Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";

import {
  registerExerciseAttemptRoutes,
  type ExerciseAttemptRouteServices,
} from "./exercise-attempts";

const secret = "test-internal-api-secret-value-123";

function services(): ExerciseAttemptRouteServices {
  return {
    listExerciseAttempts: vi.fn(async () => ({ attempts: [] })),
    submitExerciseAttempt: vi.fn(async () => ({
      attempt: { score: 1, total: 1 },
      idempotent: false,
      results: [],
    })),
  } as unknown as ExerciseAttemptRouteServices;
}

describe("exercise attempt routes", () => {
  it("grades with the trusted user identity and no client owner field", async () => {
    const api = Fastify({ logger: false });
    const exerciseServices = services();
    const userId = new Types.ObjectId().toHexString();
    await registerExerciseAttemptRoutes(api, {
      internalApiSecret: secret,
      services: exerciseServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": userId,
      },
      method: "POST",
      payload: {
        answers: [
          {
            answer: "formal",
            exerciseId: "formal-address",
            type: "multiple_choice",
          },
        ],
        attemptEventId: "attempt-route-test-0001",
        sourceId: new Types.ObjectId().toHexString(),
        sourceType: "lesson",
      },
      url: "/api/v1/exercise-attempts",
    });

    expect(response.statusCode).toBe(200);
    expect(exerciseServices.submitExerciseAttempt).toHaveBeenCalledWith({
      input: expect.not.objectContaining({ userId: expect.anything() }),
      userId,
    });
    await api.close();
  });

  it("bounds history and derives ownership from the trusted boundary", async () => {
    const api = Fastify({ logger: false });
    const exerciseServices = services();
    const userId = new Types.ObjectId().toHexString();
    const sourceId = new Types.ObjectId().toHexString();
    await registerExerciseAttemptRoutes(api, {
      internalApiSecret: secret,
      services: exerciseServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": userId,
      },
      method: "GET",
      url: `/api/v1/exercise-attempts?sourceType=lesson&sourceId=${sourceId}&limit=999&userId=${new Types.ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(200);
    expect(exerciseServices.listExerciseAttempts).toHaveBeenCalledWith({
      limit: 50,
      sourceId,
      sourceType: "lesson",
      userId,
    });
    await api.close();
  });
});
