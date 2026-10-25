import { Types, type ClientSession } from "mongoose";

import { ReviewStateModel } from "@/models/review-state";

export async function createInitialReviewState(
  {
    dueAt,
    userId,
    wordId,
  }: {
    dueAt: Date;
    userId: string;
    wordId: Types.ObjectId;
  },
  session: ClientSession,
) {
  const [reviewState] = await ReviewStateModel.create(
    [
      {
        dueAt,
        easeFactor: 2.5,
        intervalDays: 0,
        lapseCount: 0,
        repetitions: 0,
        state: "new",
        userId: new Types.ObjectId(userId),
        wordId,
      },
    ],
    { session },
  );

  if (!reviewState) {
    throw new Error("Review state creation returned no document.");
  }

  return reviewState;
}
