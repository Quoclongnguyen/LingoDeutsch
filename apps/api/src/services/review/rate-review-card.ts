import { Types } from "mongoose";

import {
  rateReviewCardInputSchema,
  type RateReviewCardInput,
} from "@lingo-deutsch/shared";
import { connectToDatabase } from "@/lib/db/mongoose";
import {
  scheduleReview,
  type SchedulingState,
} from "@/lib/srs/schedule-review";
import {
  createReviewLogRecord,
  findReviewLogByEventId,
} from "@/repositories/review-log-repository";
import {
  advanceReviewSession,
  findReviewSessionForUser,
} from "@/repositories/review-session-repository";
import {
  findReviewStateForWord,
  updateReviewStateRecord,
} from "@/repositories/review-state-repository";
import {
  ReviewEventConflictError,
  ReviewSessionNotFoundError,
  ReviewSessionStateError,
} from "@/services/review/review-errors";
import { reviewSessionView } from "@/services/review/review-session-view";
import {
  schedulingState,
  stateDto,
  stateSnapshot,
} from "@/services/review/review-state-mappers";

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function assertMatchingEvent(
  log: { rating: string; sessionId: Types.ObjectId; userId: Types.ObjectId },
  input: RateReviewCardInput,
  sessionId: string,
  userId: string,
) {
  if (
    log.userId.toString() !== userId ||
    log.sessionId.toString() !== sessionId ||
    log.rating !== input.rating
  ) {
    throw new ReviewEventConflictError();
  }
}

async function idempotentResult(
  log: { nextState: unknown },
  now: Date,
  sessionId: string,
  userId: string,
) {
  const session = await findReviewSessionForUser(userId, sessionId);
  if (!session) throw new ReviewSessionNotFoundError();
  return {
    idempotent: true,
    nextState: stateDto(schedulingState(log.nextState as never)),
    session: await reviewSessionView(session, userId, now),
  };
}

export async function rateReviewCard({
  input,
  now = new Date(),
  sessionId,
  userId,
}: {
  input: RateReviewCardInput | Record<string, unknown>;
  now?: Date;
  sessionId: string;
  userId: string;
}) {
  const validated = rateReviewCardInputSchema.parse(input);
  const database = await connectToDatabase();
  const priorLog = await findReviewLogByEventId(validated.reviewEventId);
  if (priorLog) {
    assertMatchingEvent(priorLog, validated, sessionId, userId);
    return idempotentResult(priorLog, now, sessionId, userId);
  }

  const transaction = await database.startSession();
  let nextState: SchedulingState | undefined;
  try {
    await transaction.withTransaction(async () => {
      const reviewSession = await findReviewSessionForUser(
        userId,
        sessionId,
        transaction,
      );
      if (!reviewSession) throw new ReviewSessionNotFoundError();
      if (reviewSession.status !== "active")
        throw new ReviewSessionStateError();
      const wordId = reviewSession.wordIds[reviewSession.currentIndex];
      if (!wordId) {
        throw new ReviewSessionStateError("The session has no current card.");
      }
      const reviewState = await findReviewStateForWord(
        userId,
        wordId,
        transaction,
      );
      if (!reviewState) {
        throw new ReviewSessionStateError(
          "The current review state is missing.",
        );
      }

      const previous = schedulingState(reviewState);
      nextState = scheduleReview(previous, validated.rating, now);
      await updateReviewStateRecord(reviewState._id, nextState, transaction);
      await createReviewLogRecord(
        {
          nextState: stateSnapshot(nextState),
          previousState: stateSnapshot(previous),
          rating: validated.rating,
          responseTimeMs: validated.responseTimeMs,
          reviewEventId: validated.reviewEventId,
          reviewedAt: now,
          sessionId: reviewSession._id,
          userId,
          wordId,
        },
        transaction,
      );
      await advanceReviewSession(
        reviewSession._id,
        wordId,
        reviewSession.currentIndex + 1 >= reviewSession.wordIds.length,
        now,
        transaction,
      );
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const existing = await findReviewLogByEventId(validated.reviewEventId);
      if (existing) {
        assertMatchingEvent(existing, validated, sessionId, userId);
        return idempotentResult(existing, now, sessionId, userId);
      }
    }
    throw error;
  } finally {
    await transaction.endSession();
  }
  if (!nextState) throw new Error("Rating transaction produced no next state.");
  const updatedSession = await findReviewSessionForUser(userId, sessionId);
  if (!updatedSession) throw new ReviewSessionNotFoundError();
  return {
    idempotent: false,
    nextState: stateDto(nextState),
    session: await reviewSessionView(updatedSession, userId, now),
  };
}
