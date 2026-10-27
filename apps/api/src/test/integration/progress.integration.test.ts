import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectToDatabase } from "@/lib/db/mongoose";
import { ExerciseAttemptModel } from "@/models/exercise-attempt";
import { LessonModel } from "@/models/lesson";
import { LessonProgressModel } from "@/models/lesson-progress";
import { ReviewLogModel } from "@/models/review-log";
import { ReviewSessionModel } from "@/models/review-session";
import { ReviewStateModel } from "@/models/review-state";
import { VocabularyWordModel } from "@/models/vocabulary-word";
import { seedA1Lessons } from "@/seed/seed-a1-lessons";
import { updateLessonProgress } from "@/services/learning/learning";
import { getProgress } from "@/services/progress/progress";

const collections = [
  ExerciseAttemptModel,
  LessonProgressModel,
  ReviewLogModel,
  ReviewSessionModel,
  ReviewStateModel,
  VocabularyWordModel,
  LessonModel,
];

beforeAll(async () => {
  const database = await connectToDatabase();
  if (!database.connection.name.endsWith("_test")) {
    throw new Error(
      "Integration tests refused to run outside a _test database.",
    );
  }
  await Promise.all(collections.map((collection) => collection.syncIndexes()));
});

beforeEach(async () => {
  if (!mongoose.connection.name.endsWith("_test")) {
    throw new Error("Cleanup refused to run outside a _test database.");
  }
  await Promise.all(collections.map((collection) => collection.deleteMany()));
  await seedA1Lessons();
});

afterAll(async () => {
  if (mongoose.connection.name?.endsWith("_test")) {
    await Promise.all(collections.map((collection) => collection.deleteMany()));
  }
  await mongoose.disconnect();
});

describe("progress aggregation", () => {
  it("returns only evidence owned by the authenticated learner", async () => {
    const now = new Date("2026-10-27T09:00:00.000Z");
    const userId = new Types.ObjectId();
    const otherUserId = new Types.ObjectId();
    const lesson = await LessonModel.findOne({
      slug: "a1-begruessung-und-vorstellung",
    }).lean();
    if (!lesson) throw new Error("Seed lesson missing.");

    await updateLessonProgress({
      input: {
        completedActivityIds: [
          "dialogue-introduction",
          "vocabulary-introduction",
          "practice-introduction",
        ],
        currentActivityIndex: 3,
        status: "completed",
      },
      lessonId: lesson._id.toString(),
      now: new Date("2026-10-25T07:00:00.000Z"),
      userId: userId.toHexString(),
    });
    const word = await VocabularyWordModel.create({
      article: "der",
      headword: "Termin",
      isArchived: false,
      meaningsVi: ["cuộc hẹn"],
      noPlural: false,
      normalizedHeadword: "termin",
      plural: "die Termine",
      userId,
      wordType: "noun",
    });
    const session = await ReviewSessionModel.create({
      completedAt: now,
      currentIndex: 1,
      reviewedWordIds: [word._id],
      status: "completed",
      userId,
      wordIds: [word._id],
    });
    await Promise.all([
      ReviewStateModel.create({
        dueAt: new Date("2026-11-27T09:00:00.000Z"),
        easeFactor: 2.5,
        intervalDays: 31,
        lapseCount: 0,
        lastReviewedAt: now,
        repetitions: 3,
        state: "mastered",
        userId,
        wordId: word._id,
      }),
      ReviewLogModel.create({
        nextState: { state: "mastered" },
        previousState: { state: "review" },
        rating: "good",
        reviewEventId: "progress-integration-review-1",
        reviewedAt: now,
        sessionId: session._id,
        userId,
        wordId: word._id,
      }),
      ExerciseAttemptModel.create({
        attemptEventId: "progress-integration-attempt-1",
        completedAt: new Date("2026-10-26T08:00:00.000Z"),
        incorrectExerciseIds: ["one-error"],
        score: 2,
        sourceId: lesson._id,
        sourceType: "lesson",
        total: 3,
        userId,
      }),
    ]);

    const [owner, other] = await Promise.all([
      getProgress({ now, userId: userId.toHexString() }),
      getProgress({ now, userId: otherUserId.toHexString() }),
    ]);

    expect(owner.learning.completedLessons).toBe(1);
    expect(owner.vocabulary).toMatchObject({
      masteredWords: 1,
      reviewedWords: 1,
      totalWords: 1,
    });
    expect(owner.reviews.totalReviews).toBe(1);
    expect(owner.practice).toMatchObject({
      attempts: 1,
      correctAnswers: 2,
      totalAnswers: 3,
    });
    expect(owner.completedOutcomes).toHaveLength(1);

    expect(other.learning.completedLessons).toBe(0);
    expect(other.vocabulary.totalWords).toBe(0);
    expect(other.reviews.totalReviews).toBe(0);
    expect(other.practice.attempts).toBe(0);
  });
});
