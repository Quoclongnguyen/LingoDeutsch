import type { FastifyInstance, FastifyRequest } from "fastify";

import {
  createVocabularyInputSchema,
  importCommitInputSchema,
  importPreviewInputSchema,
  updateVocabularyInputSchema,
  updateVocabularySetInputSchema,
  vocabularyListQuerySchema,
  vocabularySetInputSchema,
  vocabularySetMembershipSchema,
} from "@lingo-deutsch/shared";
import { authenticateInternalRequest } from "@/auth/internal-api-auth";
import { vocabularyImportRateLimiter } from "@/auth/import-rate-limit";
import {
  archiveVocabularyWord,
  getVocabularyWord,
  listVocabularyWords,
  updateVocabularyWord,
} from "@/services/vocabulary/vocabulary-library";
import {
  commitVocabularyImport,
  previewVocabularyImport,
} from "@/services/vocabulary/vocabulary-import";
import { createVocabularyWord } from "@/services/vocabulary/create-vocabulary-word";
import {
  addWordToVocabularySet,
  archiveVocabularySet,
  createVocabularySet,
  listVocabularySets,
  removeWordFromVocabularySet,
  updateVocabularySet,
} from "@/services/vocabulary/vocabulary-sets";

export const defaultVocabularyServices = {
  addWordToVocabularySet,
  archiveVocabularySet,
  archiveVocabularyWord,
  commitVocabularyImport,
  createVocabularySet,
  createVocabularyWord,
  getVocabularyWord,
  listVocabularySets,
  listVocabularyWords,
  previewVocabularyImport,
  removeWordFromVocabularySet,
  updateVocabularySet,
  updateVocabularyWord,
};

export type VocabularyRouteServices = typeof defaultVocabularyServices;

function authenticatedUserId(
  request: FastifyRequest,
  internalApiSecret: string,
) {
  return authenticateInternalRequest(request.headers, internalApiSecret);
}

function identifier(request: FastifyRequest, name: string): string {
  const params = request.params as Record<string, unknown>;
  const value = params[name];
  if (typeof value !== "string") throw new Error(`${name} is required.`);
  return value;
}

export async function registerVocabularyRoutes(
  api: FastifyInstance,
  {
    internalApiSecret,
    services,
  }: {
    internalApiSecret: string;
    services: VocabularyRouteServices;
  },
) {
  api.get("/api/v1/vocabulary", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const query = vocabularyListQuerySchema.parse(request.query);
    return services.listVocabularyWords({ query, userId });
  });

  api.post("/api/v1/vocabulary", async (request, reply) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const input = createVocabularyInputSchema.parse(request.body);
    const result = await services.createVocabularyWord({ input, userId });

    return reply.code(201).send({
      reviewState: {
        dueAt: result.reviewState.dueAt.toISOString(),
        id: result.reviewState._id.toString(),
        state: result.reviewState.state,
      },
      word: {
        headword: result.word.headword,
        id: result.word._id.toString(),
      },
    });
  });

  api.post("/api/v1/vocabulary/import/preview", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    vocabularyImportRateLimiter.assertAllowed(userId);
    const input = importPreviewInputSchema.parse(request.body);
    return services.previewVocabularyImport({ input, userId });
  });

  api.post("/api/v1/vocabulary/import/commit", async (request, reply) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    vocabularyImportRateLimiter.assertAllowed(userId);
    const input = importCommitInputSchema.parse(request.body);
    const result = await services.commitVocabularyImport({
      items: input.items,
      userId,
    });
    return reply.code(201).send(result);
  });

  api.get("/api/v1/vocabulary/:id", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    return services.getVocabularyWord({
      userId,
      wordId: identifier(request, "id"),
    });
  });

  api.patch("/api/v1/vocabulary/:id", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const input = updateVocabularyInputSchema.parse(request.body);
    return services.updateVocabularyWord({
      input,
      userId,
      wordId: identifier(request, "id"),
    });
  });

  api.delete("/api/v1/vocabulary/:id", async (request, reply) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    await services.archiveVocabularyWord({
      userId,
      wordId: identifier(request, "id"),
    });
    return reply.code(204).send();
  });

  api.get("/api/v1/vocabulary-sets", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    return { items: await services.listVocabularySets({ userId }) };
  });

  api.post("/api/v1/vocabulary-sets", async (request, reply) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const input = vocabularySetInputSchema.parse(request.body);
    return reply
      .code(201)
      .send(await services.createVocabularySet({ input, userId }));
  });

  api.patch("/api/v1/vocabulary-sets/:id", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const input = updateVocabularySetInputSchema.parse(request.body);
    return services.updateVocabularySet({
      input,
      setId: identifier(request, "id"),
      userId,
    });
  });

  api.delete("/api/v1/vocabulary-sets/:id", async (request, reply) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    await services.archiveVocabularySet({
      setId: identifier(request, "id"),
      userId,
    });
    return reply.code(204).send();
  });

  api.post("/api/v1/vocabulary-sets/:id/words", async (request) => {
    const userId = authenticatedUserId(request, internalApiSecret);
    const { wordId } = vocabularySetMembershipSchema.parse(request.body);
    return services.addWordToVocabularySet({
      setId: identifier(request, "id"),
      userId,
      wordId,
    });
  });

  api.delete(
    "/api/v1/vocabulary-sets/:id/words/:wordId",
    async (request, reply) => {
      const userId = authenticatedUserId(request, internalApiSecret);
      await services.removeWordFromVocabularySet({
        setId: identifier(request, "id"),
        userId,
        wordId: identifier(request, "wordId"),
      });
      return reply.code(204).send();
    },
  );
}
