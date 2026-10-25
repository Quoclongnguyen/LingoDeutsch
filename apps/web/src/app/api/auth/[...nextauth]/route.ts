import NextAuth from "next-auth";

import { getAuthOptions } from "@/lib/auth/config";

function createHandler() {
  return NextAuth(getAuthOptions());
}

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

export async function GET(request: Request, context: AuthRouteContext) {
  return createHandler()(request, context);
}

export async function POST(request: Request, context: AuthRouteContext) {
  return createHandler()(request, context);
}
