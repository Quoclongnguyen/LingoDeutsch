import { Types, type ClientSession } from "mongoose";

import { ReviewLogModel } from "@/models/review-log";
import type { ReviewRating } from "@lingo-deutsch/shared";

function objectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value))
    throw new Error("A valid ObjectId is required.");
  return new Types.ObjectId(value);
}

export async function findReviewLogByEventId(reviewEventId: string) {
  return ReviewLogModel.findOne({ reviewEventId }).lean().exec();
}

export async function createReviewLogRecord(
  input: {
    nextState: Record<string, unknown>;
    previousState: Record<string, unknown>;
    rating: ReviewRating;
    responseTimeMs?: number;
    reviewEventId: string;
    reviewedAt: Date;
    sessionId: Types.ObjectId;
    userId: string;
    wordId: Types.ObjectId;
  },
  session: ClientSession,
) {
  const [log] = await ReviewLogModel.create(
    [{ ...input, userId: objectId(input.userId) }],
    { session },
  );
  if (!log) throw new Error("Review log creation returned no document.");
  return log;
}

export async function countNewCardsReviewedSince(userId: string, since: Date) {
  return ReviewLogModel.countDocuments({
    "previousState.state": "new",
    reviewedAt: { $gte: since },
    userId: objectId(userId),
  }).exec();
}

export async function summarizeReviewSession(
  userId: string,
  sessionId: Types.ObjectId,
) {
  const result = await ReviewLogModel.aggregate<{
    difficultCount: number;
    reviewedCount: number;
  }>([
    { $match: { sessionId, userId: objectId(userId) } },
    {
      $group: {
        _id: null,
        difficultCount: {
          $sum: {
            $cond: [{ $in: ["$rating", ["again", "hard"]] }, 1, 0],
          },
        },
        reviewedCount: { $sum: 1 },
      },
    },
    { $project: { _id: 0, difficultCount: 1, reviewedCount: 1 } },
  ]).exec();
  return result[0] ?? { difficultCount: 0, reviewedCount: 0 };
}
