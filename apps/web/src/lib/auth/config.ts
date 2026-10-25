import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

import { getAuthConfiguration, normalizeNextAuthUrl } from "@/lib/env/server";

export const localDevelopmentUser = {
  id: "000000000000000000000001",
  name: "Local Learner",
  email: "local@lingodeutsch.test",
  image: null,
};

export function getAuthOptions(
  environment: Record<string, string | undefined> = process.env,
): NextAuthOptions {
  normalizeNextAuthUrl(environment);
  const auth = getAuthConfiguration(environment);

  const providers =
    auth.mode === "development"
      ? [
          CredentialsProvider({
            id: "development",
            name: "Local development",
            credentials: {},
            authorize: async () => localDevelopmentUser,
          }),
        ]
      : [
          GitHubProvider({
            clientId: auth.AUTH_GITHUB_ID,
            clientSecret: auth.AUTH_GITHUB_SECRET,
          }),
        ];

  return {
    secret:
      auth.mode === "development"
        ? "lingo-deutsch-local-development-secret-only"
        : auth.AUTH_SECRET,
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/auth/signin",
    },
    providers,
    callbacks: {
      session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub ?? "";
        }

        return session;
      },
    },
  };
}
