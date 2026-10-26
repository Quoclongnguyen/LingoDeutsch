import { Types, type ClientSession } from "mongoose";

import { ReviewSessionModel } from "@/models/review-session";
import type { ReviewMode } from "@lingo-deutsch/shared";

function objectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value))
    throw new Error("A valid ObjectId is required.");
  return new Types.ObjectId(value);
}

export async function findActiveReviewSession(
  userId: string,
  mode: ReviewMode,
) {
  return ReviewSessionModel.findOne({
    mode,
    status: "active",
    userId: objectId(userId),
  })
    .sort({ updatedAt: -1 })
    .exec();
}

export async function findReviewSessionForUser(
  userId: string,
  sessionId: string,
  session?: ClientSession,
) {
  return ReviewSessionModel.findOne({
    _id: objectId(sessionId),
    userId: objectId(userId),
  })
    .session(session ?? null)
    .exec();
}

export async function abandonActiveReviewSessions(
  userId: string,
  mode: ReviewMode,
  now: Date,
) {
  return ReviewSessionModel.updateMany(
    { mode, status: "active", userId: objectId(userId) },
    { $set: { completedAt: now, status: "abandoned" } },
  ).exec();
}

export async function createReviewSessionRecord({
  mode,
  now,
  userId,
  wordIds,
}: {
  mode: ReviewMode;
  now: Date;
  userId: string;
  wordIds: Types.ObjectId[];
}) {
  return ReviewSessionModel.create({
    currentIndex: 0,
    mode,
    reviewedWordIds: [],
    startedAt: now,
    status: "active",
    userId: objectId(userId),
    wordIds,
  });
}

export async function advanceReviewSession(
  sessionId: Types.ObjectId,
  wordId: Types.ObjectId,
  completed: boolean,
  now: Date,
  transaction: ClientSession,
) {
  const updated = await ReviewSessionModel.findByIdAndUpdate(
    sessionId,
    {
      $addToSet: { reviewedWordIds: wordId },
      $inc: { currentIndex: 1 },
      ...(completed ? { $set: { completedAt: now, status: "completed" } } : {}),
    },
    { returnDocument: "after", runValidators: true, session: transaction },
  ).exec();
  if (!updated) throw new Error("Review session disappeared during rating.");
  return updated;
}

export async function completeReviewSessionRecord(
  userId: string,
  sessionId: string,
  now: Date,
) {
  return ReviewSessionModel.findOneAndUpdate(
    {
      _id: objectId(sessionId),
      status: "active",
      userId: objectId(userId),
    },
    { $set: { completedAt: now, status: "completed" } },
    { returnDocument: "after", runValidators: true },
  ).exec();
}
