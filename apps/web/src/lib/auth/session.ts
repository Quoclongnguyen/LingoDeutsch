import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { getAuthOptions, localDevelopmentUser } from "@/lib/auth/config";
import { getAuthConfiguration } from "@/lib/env/server";

export async function requireUser(
  environment: Record<string, string | undefined> = process.env,
) {
  const auth = getAuthConfiguration(environment);

  if (auth.mode === "development") {
    return localDevelopmentUser;
  }

  const session = await getServerSession(getAuthOptions(environment));

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return session.user;
}
