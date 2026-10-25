import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authHandler: vi.fn(async () => new Response(null, { status: 204 })),
}));

vi.mock("next-auth", () => ({
  default: vi.fn(() => mocks.authHandler),
}));

vi.mock("@/lib/auth/config", () => ({
  getAuthOptions: vi.fn(() => ({})),
}));

import { GET } from "@/app/api/auth/[...nextauth]/route";

describe("Auth.js route handler", () => {
  it("forwards the App Router context to NextAuth", async () => {
    const request = new Request("http://localhost/api/auth/providers");
    const context = {
      params: Promise.resolve({ nextauth: ["providers"] }),
    };

    await GET(request, context);

    expect(mocks.authHandler).toHaveBeenCalledWith(request, context);
  });
});
