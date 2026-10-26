import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { vi } from "vitest";

import { buildApi } from "@/app";
import { ExerciseAttemptConflictError } from "@/services/exercise/exercise-attempts";

describe("Lingo Deutsch API", () => {
  it("reports readiness from the versioned backend health route", async () => {
    const api = await buildApi({
      internalApiSecret: "test-internal-api-secret-value-123",
      logger: false,
      webOrigin: "http://localhost:3000",
    });

    const response = await api.inject({
      method: "GET",
      url: "/api/v1/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: "lingo-deutsch-api",
      status: "ok",
    });

    await api.close();
  });

  it("allows CORS only for the configured frontend origin", async () => {
    const api = await buildApi({
      internalApiSecret: "test-internal-api-secret-value-123",
      logger: false,
      webOrigin: "http://localhost:3000",
    });

    const response = await api.inject({
      headers: { origin: "http://localhost:3000" },
      method: "OPTIONS",
      url: "/api/v1/health",
    });

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );

    await api.close();
  });

  it("rejects a vocabulary request without the trusted server boundary", async () => {
    const api = await buildApi({
      internalApiSecret: "test-internal-api-secret-value-123",
      logger: false,
      webOrigin: "http://localhost:3000",
    });

    const response = await api.inject({
      method: "GET",
      url: "/api/v1/vocabulary",
    });

    expect(response.statusCode).toBe(401);
    await api.close();
  });

  it("derives vocabulary ownership from trusted headers, never the query", async () => {
    const authenticatedUserId = new Types.ObjectId().toHexString();
    const arbitraryUserId = new Types.ObjectId().toHexString();
    const listVocabularyWords = vi.fn(async () => ({
      items: [],
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
      summary: { due: 0, learning: 0, mastered: 0, total: 0 },
    }));
    const api = await buildApi({
      internalApiSecret: "test-internal-api-secret-value-123",
      logger: false,
      vocabularyServices: { listVocabularyWords },
      webOrigin: "http://localhost:3000",
    });

    const response = await api.inject({
      headers: {
        authorization: "Bearer test-internal-api-secret-value-123",
        "x-lingo-user-id": authenticatedUserId,
      },
      method: "GET",
      url: `/api/v1/vocabulary?userId=${arbitraryUserId}&q=Termin`,
    });

    expect(response.statusCode).toBe(200);
    expect(listVocabularyWords).toHaveBeenCalledWith({
      query: expect.objectContaining({ q: "Termin" }),
      userId: authenticatedUserId,
    });
    await api.close();
  });

  it("returns an exercise-specific conflict code for reused attempt events", async () => {
    const userId = new Types.ObjectId().toHexString();
    const sourceId = new Types.ObjectId().toHexString();
    const api = await buildApi({
      exerciseAttemptServices: {
        submitExerciseAttempt: vi.fn(async () => {
          throw new ExerciseAttemptConflictError();
        }),
      },
      internalApiSecret: "test-internal-api-secret-value-123",
      logger: false,
      webOrigin: "http://localhost:3000",
    });

    const response = await api.inject({
      headers: {
        authorization: "Bearer test-internal-api-secret-value-123",
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
        attemptEventId: "attempt-app-test-0001",
        sourceId,
        sourceType: "lesson",
      },
      url: "/api/v1/exercise-attempts",
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ error: "exercise_attempt_conflict" });
    await api.close();
  });
});
