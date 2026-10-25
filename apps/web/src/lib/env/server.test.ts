import { describe, expect, it } from "vitest";

import {
  getAuthConfiguration,
  getAuthEnv,
  getDomainApiConfiguration,
  normalizeNextAuthUrl,
} from "@/lib/env/server";

describe("server environment", () => {
  it("does not include a supplied secret value in validation errors", () => {
    const leakedValue = "do-not-print-this-sensitive-value";

    try {
      getAuthEnv({ AUTH_SECRET: leakedValue });
    } catch (error) {
      expect(String(error)).not.toContain(leakedValue);
    }
  });

  it("accepts the complete authentication environment", () => {
    expect(
      getAuthEnv({
        AUTH_SECRET: "a-development-secret-with-at-least-32-characters",
        AUTH_GITHUB_ID: "github-client-id",
        AUTH_GITHUB_SECRET: "github-client-secret",
      }),
    ).toEqual({
      AUTH_SECRET: "a-development-secret-with-at-least-32-characters",
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "github-client-secret",
    });
  });

  it("uses local authentication when all OAuth values are empty in development", () => {
    expect(
      getAuthConfiguration({
        NODE_ENV: "development",
        AUTH_SECRET: "",
        AUTH_GITHUB_ID: "",
        AUTH_GITHUB_SECRET: "",
      }),
    ).toEqual({ mode: "development" });
  });

  it("does not allow local authentication in production", () => {
    expect(() =>
      getAuthConfiguration({
        NODE_ENV: "production",
        AUTH_SECRET: "",
        AUTH_GITHUB_ID: "",
        AUTH_GITHUB_SECRET: "",
      }),
    ).toThrow("Invalid authentication environment");
  });

  it("does not hide a partially configured OAuth environment in development", () => {
    expect(() =>
      getAuthConfiguration({
        NODE_ENV: "development",
        AUTH_SECRET: "a-development-secret-with-at-least-32-characters",
        AUTH_GITHUB_ID: "",
        AUTH_GITHUB_SECRET: "",
      }),
    ).toThrow("Invalid authentication environment");
  });

  it("treats an empty optional NextAuth URL as unset", () => {
    const environment = { NEXTAUTH_URL: "  " };

    normalizeNextAuthUrl(environment);

    expect(environment).not.toHaveProperty("NEXTAUTH_URL");
  });

  it("uses safe local domain API defaults in development", () => {
    expect(
      getDomainApiConfiguration({
        NODE_ENV: "development",
        NEXT_PUBLIC_API_URL: " ",
        INTERNAL_API_SECRET: "",
      }),
    ).toEqual({
      baseUrl: "http://127.0.0.1:4000/api/v1",
      internalApiSecret: "lingo-deutsch-local-internal-api-secret",
    });
  });

  it("requires an explicit internal API secret in production", () => {
    expect(() =>
      getDomainApiConfiguration({
        NODE_ENV: "production",
        NEXT_PUBLIC_API_URL: "https://api.example.test/api/v1",
        INTERNAL_API_SECRET: "",
      }),
    ).toThrow("Invalid domain API environment");
  });

  it("never includes the internal secret in validation errors", () => {
    const leakedValue = "short-secret";

    try {
      getDomainApiConfiguration({
        NODE_ENV: "production",
        NEXT_PUBLIC_API_URL: "not-a-url",
        INTERNAL_API_SECRET: leakedValue,
      });
    } catch (error) {
      expect(String(error)).not.toContain(leakedValue);
    }
  });
});
