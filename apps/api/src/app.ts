import cors from "@fastify/cors";
import Fastify, { type FastifyServerOptions } from "fastify";
import { ZodError } from "zod";

import { ImportFormatError, ImportRowLimitError } from "@lingo-deutsch/shared";
import { InternalApiAuthenticationError } from "@/auth/internal-api-auth";
import { ImportRateLimitError } from "@/auth/import-rate-limit";
import {
  defaultVocabularyServices,
  registerVocabularyRoutes,
  type VocabularyRouteServices,
} from "@/routes/vocabulary";
import { DuplicateVocabularyWordError } from "@/services/vocabulary/create-vocabulary-word";
import { VocabularyWordNotFoundError } from "@/services/vocabulary/vocabulary-library";
import { VocabularySetNotFoundError } from "@/services/vocabulary/vocabulary-sets";
import { VocabularySetOwnershipError } from "@/services/vocabulary/assert-owned-sets";

export async function buildApi({
  logger = true,
  internalApiSecret,
  vocabularyServices,
  webOrigin,
}: {
  internalApiSecret: string;
  logger?: FastifyServerOptions["logger"];
  vocabularyServices?: Partial<VocabularyRouteServices>;
  webOrigin: string;
}) {
  const api = Fastify({ logger });

  await api.register(cors, {
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE", "OPTIONS"],
    origin: webOrigin,
  });

  api.get("/api/v1/health", async () => ({
    service: "lingo-deutsch-api",
    status: "ok",
  }));

  api.setErrorHandler((error, request, reply) => {
    if (error instanceof InternalApiAuthenticationError) {
      return reply.code(401).send({ error: "authentication_required" });
    }
    if (error instanceof ZodError || error instanceof ImportFormatError) {
      return reply.code(400).send({
        error: "invalid_request",
        issues:
          error instanceof ZodError
            ? error.issues.map((issue) => ({
                message: issue.message,
                path: issue.path.join("."),
              }))
            : [{ message: error.message, path: "content" }],
      });
    }
    if (error instanceof ImportRowLimitError) {
      return reply.code(413).send({
        error: "import_too_large",
        message: error.message,
      });
    }
    if (error instanceof ImportRateLimitError) {
      return reply.code(429).send({
        error: "import_rate_limited",
        message: error.message,
      });
    }
    if (error instanceof DuplicateVocabularyWordError) {
      return reply.code(409).send({ error: "duplicate_vocabulary_word" });
    }
    if (
      error instanceof VocabularyWordNotFoundError ||
      error instanceof VocabularySetNotFoundError ||
      error instanceof VocabularySetOwnershipError
    ) {
      return reply.code(404).send({ error: "not_found" });
    }

    request.log.error(error);
    return reply.code(500).send({ error: "internal_error" });
  });

  await registerVocabularyRoutes(api, {
    internalApiSecret,
    services: { ...defaultVocabularyServices, ...vocabularyServices },
  });

  return api;
}
