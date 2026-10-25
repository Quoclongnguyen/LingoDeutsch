import { describe, expect, it, vi } from "vitest";

import { proxyDomainRequest } from "@/lib/api/proxy-request";

describe("proxyDomainRequest", () => {
  it("injects the trusted identity and never forwards browser auth headers", async () => {
    const fetcher = vi.fn<
      (input: string | URL | Request, init?: RequestInit) => Promise<Response>
    >(async () => new Response(JSON.stringify({ ok: true })));
    const request = new Request(
      "http://localhost/api/domain/vocabulary?q=Termin",
      {
        headers: {
          authorization: "Bearer browser-controlled",
          "x-lingo-user-id": "browser-controlled",
        },
      },
    );

    const response = await proxyDomainRequest({
      baseUrl: "http://api.test/api/v1",
      fetcher,
      internalApiSecret: "trusted-secret",
      path: ["vocabulary"],
      request,
      userId: "000000000000000000000001",
    });

    expect(await response.json()).toEqual({ ok: true });
    const [url, init] = fetcher.mock.calls[0] ?? [undefined, undefined];
    expect(url).toBe("http://api.test/api/v1/vocabulary?q=Termin");
    expect(init?.headers).toEqual({
      accept: "application/json",
      authorization: "Bearer trusted-secret",
      "x-lingo-user-id": "000000000000000000000001",
    });
  });

  it("rejects paths outside the vocabulary boundary", async () => {
    const fetcher = vi.fn();
    const response = await proxyDomainRequest({
      baseUrl: "http://api.test/api/v1",
      fetcher,
      internalApiSecret: "trusted-secret",
      path: ["admin", "users"],
      request: new Request("http://localhost/api/domain/admin/users"),
      userId: "000000000000000000000001",
    });

    expect(response.status).toBe(404);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("forwards JSON bodies and upstream response status", async () => {
    const fetcher = vi.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        expect(init?.body).toBe(JSON.stringify({ headword: "der Termin" }));
        return new Response(JSON.stringify({ id: "word-1" }), {
          status: 201,
          headers: { "content-type": "application/json" },
        });
      },
    );

    const response = await proxyDomainRequest({
      baseUrl: "http://api.test/api/v1",
      fetcher,
      internalApiSecret: "trusted-secret",
      path: ["vocabulary"],
      request: new Request("http://localhost/api/domain/vocabulary", {
        body: JSON.stringify({ headword: "der Termin" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      userId: "000000000000000000000001",
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "word-1" });
  });

  it("does not send an empty JSON body for DELETE requests", async () => {
    const fetcher = vi.fn<
      (input: string | URL | Request, init?: RequestInit) => Promise<Response>
    >(async (_input, init) => {
      expect(init?.body).toBeUndefined();
      expect(init?.headers).not.toHaveProperty("content-type");
      return new Response(null, { status: 204 });
    });

    const response = await proxyDomainRequest({
      baseUrl: "http://api.test/api/v1",
      fetcher,
      internalApiSecret: "trusted-secret",
      path: ["vocabulary", "000000000000000000000010"],
      request: new Request(
        "http://localhost/api/domain/vocabulary/000000000000000000000010",
        { method: "DELETE" },
      ),
      userId: "000000000000000000000001",
    });

    expect(response.status).toBe(204);
  });
});
