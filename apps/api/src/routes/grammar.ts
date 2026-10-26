import type { FastifyInstance, FastifyRequest } from "fastify";

import { grammarTopicListQuerySchema } from "@lingo-deutsch/shared";
import { authenticateInternalRequest } from "@/auth/internal-api-auth";
import { getGrammarTopic, listGrammarTopics } from "@/services/grammar/grammar";

export const defaultGrammarServices = {
  getGrammarTopic,
  listGrammarTopics,
};

export type GrammarRouteServices = typeof defaultGrammarServices;

function authenticate(request: FastifyRequest, internalApiSecret: string) {
  authenticateInternalRequest(request.headers, internalApiSecret);
}

function slugParameter(request: FastifyRequest) {
  const slug = (request.params as Record<string, unknown>).slug;
  if (typeof slug !== "string" || !slug) {
    throw new Error("slug is required.");
  }
  return slug;
}

export async function registerGrammarRoutes(
  api: FastifyInstance,
  {
    internalApiSecret,
    services,
  }: {
    internalApiSecret: string;
    services: GrammarRouteServices;
  },
) {
  api.get("/api/v1/grammar-topics", async (request) => {
    authenticate(request, internalApiSecret);
    const { level } = grammarTopicListQuerySchema.parse(request.query);
    return services.listGrammarTopics({ level });
  });

  api.get("/api/v1/grammar-topics/:slug", async (request) => {
    authenticate(request, internalApiSecret);
    return services.getGrammarTopic({ slug: slugParameter(request) });
  });
}
