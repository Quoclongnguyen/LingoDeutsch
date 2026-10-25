import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { vi } from "vitest";

import { buildApi } from "@/app";

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
});
