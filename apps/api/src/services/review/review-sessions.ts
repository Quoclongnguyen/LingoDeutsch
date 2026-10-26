import { Types } from "mongoose";

import {
  createReviewSessionInputSchema,
  type CreateReviewSessionInput,
} from "@lingo-deutsch/shared";
import { connectToDatabase } from "@/lib/db/mongoose";
import {
  abandonActiveReviewSessions,
  completeReviewSessionRecord,
  createReviewSessionRecord,
  findActiveReviewSession,
  findReviewSessionForUser,
} from "@/repositories/review-session-repository";
import { findNextReviewDueAt } from "@/repositories/review-state-repository";
import { ReviewSessionNotFoundError } from "@/services/review/review-errors";
import {
  getDueReviewCountForUser,
  selectDueReviewQueue,
} from "@/services/review/review-queue";
import { rateReviewCard } from "@/services/review/rate-review-card";
import { reviewSessionView } from "@/services/review/review-session-view";

export {
  ReviewEventConflictError,
  ReviewSessionNotFoundError,
  ReviewSessionStateError,
} from "@/services/review/review-errors";
export { rateReviewCard };

function assertUserId(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("A valid authenticated userId is required.");
  }
}

export async function getDueReviewCount({
  now = new Date(),
  userId,
}: {
  now?: Date;
  userId: string;
}) {
  assertUserId(userId);
  return getDueReviewCountForUser(userId, now);
}

export async function startOrResumeReviewSession({
  input,
  now = new Date(),
  userId,
}: {
  input: CreateReviewSessionInput | Record<string, unknown>;
  now?: Date;
  userId: string;
}) {
  assertUserId(userId);
  const validated = createReviewSessionInputSchema.parse(input);
  await connectToDatabase();
  const active = await findActiveReviewSession(userId, validated.mode);
  if (active && !validated.restart) {
    return reviewSessionView(active, userId, now, true);
  }
  if (active && validated.restart) {
    await abandonActiveReviewSessions(userId, validated.mode, now);
  }

  const due = await selectDueReviewQueue(userId, now);
  if (due.length === 0) {
    const nextDueAt = await findNextReviewDueAt(userId);
    return {
      currentCard: undefined,
      currentIndex: 0,
      id: undefined,
      mode: validated.mode,
      resumed: false,
      reviewedCount: 0,
      status: "empty",
      summary: {
        difficultCount: 0,
        reviewedCount: 0,
        nextDueAt: nextDueAt?.toISOString(),
      },
      total: 0,
      wordIds: [],
    };
  }

  try {
    const created = await createReviewSessionRecord({
      mode: validated.mode,
      now,
      userId,
      wordIds: due.map((candidate) => candidate.wordId),
    });
    return reviewSessionView(created, userId, now);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      const recovered = await findActiveReviewSession(userId, validated.mode);
      if (recovered) return reviewSessionView(recovered, userId, now, true);
    }
    throw error;
  }
}

export async function getReviewSession({
  now = new Date(),
  sessionId,
  userId,
}: {
  now?: Date;
  sessionId: string;
  userId: string;
}) {
  assertUserId(userId);
  const session = await findReviewSessionForUser(userId, sessionId);
  if (!session) throw new ReviewSessionNotFoundError();
  return reviewSessionView(session, userId, now);
}

export async function completeReviewSession({
  now = new Date(),
  sessionId,
  userId,
}: {
  now?: Date;
  sessionId: string;
  userId: string;
}) {
  assertUserId(userId);
  const completed = await completeReviewSessionRecord(userId, sessionId, now);
  if (!completed) throw new ReviewSessionNotFoundError();
  return reviewSessionView(completed, userId, now);
}
