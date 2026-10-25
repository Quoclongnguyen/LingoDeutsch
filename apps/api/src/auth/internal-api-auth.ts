import { timingSafeEqual } from "node:crypto";

import { Types } from "mongoose";

type RequestHeaders = Record<string, string | string[] | undefined>;

export class InternalApiAuthenticationError extends Error {
  constructor() {
    super("Authenticated API access is required.");
    this.name = "InternalApiAuthenticationError";
  }
}

function matchesSecret(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

export function authenticateInternalRequest(
  headers: RequestHeaders,
  internalApiSecret: string,
): string {
  const authorization = headers.authorization;
  const suppliedUserId = headers["x-lingo-user-id"];
  const token =
    typeof authorization === "string" && authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : "";

  if (
    !matchesSecret(token, internalApiSecret) ||
    typeof suppliedUserId !== "string" ||
    !Types.ObjectId.isValid(suppliedUserId)
  ) {
    throw new InternalApiAuthenticationError();
  }

  return suppliedUserId;
}
