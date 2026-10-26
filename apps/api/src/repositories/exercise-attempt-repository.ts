import { Types } from "mongoose";

import type { ExerciseSourceType } from "@lingo-deutsch/shared";
import { ExerciseAttemptModel } from "@/models/exercise-attempt";

function objectId(value: string) {
  if (!Types.ObjectId.isValid(value))
    throw new Error("A valid ObjectId is required.");
  return new Types.ObjectId(value);
}

export function findExerciseAttemptByEventId(attemptEventId: string) {
  return ExerciseAttemptModel.findOne({ attemptEventId }).lean().exec();
}

export function createExerciseAttemptRecord(input: {
  attemptEventId: string;
  completedAt: Date;
  incorrectExerciseIds: string[];
  score: number;
  sourceId: string;
  sourceType: ExerciseSourceType;
  total: number;
  userId: string;
}) {
  return ExerciseAttemptModel.create({
    ...input,
    sourceId: objectId(input.sourceId),
    userId: objectId(input.userId),
  });
}

export function queryExerciseAttemptsForUser(input: {
  limit: number;
  sourceId: string;
  sourceType: ExerciseSourceType;
  userId: string;
}) {
  return ExerciseAttemptModel.find({
    sourceId: objectId(input.sourceId),
    sourceType: input.sourceType,
    userId: objectId(input.userId),
  })
    .sort({ completedAt: -1, _id: -1 })
    .limit(input.limit)
    .lean()
    .exec();
}
