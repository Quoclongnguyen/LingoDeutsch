import { Types } from "mongoose";

import {
  queryLessonActivityDays,
  summarizeExerciseProgress,
  summarizeReviewHistory,
  summarizeVocabularyProgress,
} from "@/repositories/progress-repository";
import { getLearningPath } from "@/services/learning/learning";
import { buildProgressSnapshot } from "./progress-snapshot";

export async function getProgress({
  now = new Date(),
  userId,
}: {
  now?: Date;
  userId: string;
}) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("A valid authenticated userId is required.");
  }
  const since = new Date(now);
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 6);

  const [path, vocabulary, reviewHistory, exercise, lessonDays] =
    await Promise.all([
      getLearningPath({ level: "A1", now, userId }),
      summarizeVocabularyProgress(userId, now),
      summarizeReviewHistory(userId, since),
      summarizeExerciseProgress(userId, since),
      queryLessonActivityDays(userId, since),
    ]);

  return buildProgressSnapshot({
    exercise,
    lessonDays,
    now,
    path,
    reviewHistory,
    vocabulary,
  });
}
