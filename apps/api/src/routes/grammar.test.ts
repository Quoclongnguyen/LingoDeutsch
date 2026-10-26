import Fastify from "fastify";
import { Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";

import { InternalApiAuthenticationError } from "@/auth/internal-api-auth";
import { registerGrammarRoutes, type GrammarRouteServices } from "./grammar";

const secret = "test-internal-api-secret-value-123";

function services(): GrammarRouteServices {
  return {
    getGrammarTopic: vi.fn(async () => ({ slug: "a1-personalpronomen" })),
    listGrammarTopics: vi.fn(async () => ({ level: "A1", topics: [] })),
  } as unknown as GrammarRouteServices;
}

describe("grammar routes", () => {
  it("requires the trusted server boundary", async () => {
    const api = Fastify({ logger: false });
    await registerGrammarRoutes(api, {
      internalApiSecret: secret,
      services: services(),
    });
    api.setErrorHandler((error, _request, reply) => {
      if (error instanceof InternalApiAuthenticationError) {
        return reply.code(401).send({ error: "authentication_required" });
      }
      return reply.code(500).send({ error: "internal_error" });
    });

    const response = await api.inject({
      method: "GET",
      url: "/api/v1/grammar-topics?level=A1",
    });

    expect(response.statusCode).toBe(401);
    await api.close();
  });

  it("validates the level and lists published grammar through the service", async () => {
    const api = Fastify({ logger: false });
    const grammarServices = services();
    await registerGrammarRoutes(api, {
      internalApiSecret: secret,
      services: grammarServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": new Types.ObjectId().toHexString(),
      },
      method: "GET",
      url: "/api/v1/grammar-topics?level=A1&userId=browser-controlled",
    });

    expect(response.statusCode).toBe(200);
    expect(grammarServices.listGrammarTopics).toHaveBeenCalledWith({
      level: "A1",
    });
    await api.close();
  });

  it("forwards a stable topic slug after authentication", async () => {
    const api = Fastify({ logger: false });
    const grammarServices = services();
    await registerGrammarRoutes(api, {
      internalApiSecret: secret,
      services: grammarServices,
    });

    const response = await api.inject({
      headers: {
        authorization: `Bearer ${secret}`,
        "x-lingo-user-id": new Types.ObjectId().toHexString(),
      },
      method: "GET",
      url: "/api/v1/grammar-topics/a1-personalpronomen",
    });

    expect(response.statusCode).toBe(200);
    expect(grammarServices.getGrammarTopic).toHaveBeenCalledWith({
      slug: "a1-personalpronomen",
    });
    await api.close();
  });
});
