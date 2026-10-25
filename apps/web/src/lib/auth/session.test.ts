import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("server-only", () => ({}));
vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { requireUser } from "@/lib/auth/session";

describe("requireUser", () => {
  beforeEach(() => {
    mocks.getServerSession.mockReset();
    mocks.redirect.mockClear();
  });

  it("returns a local learner without opening a session in development mode", async () => {
    await expect(
      requireUser({
        NODE_ENV: "development",
        AUTH_SECRET: "",
        AUTH_GITHUB_ID: "",
        AUTH_GITHUB_SECRET: "",
      }),
    ).resolves.toEqual({
      id: "000000000000000000000001",
      name: "Local Learner",
      email: "local@lingodeutsch.test",
      image: null,
    });

    expect(mocks.getServerSession).not.toHaveBeenCalled();
  });
});
