import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectToDatabase } from "@/lib/db/mongoose";
import { ExerciseAttemptModel } from "@/models/exercise-attempt";
import { GrammarTopicModel } from "@/models/grammar-topic";
import { LessonModel } from "@/models/lesson";
import { ReviewLogModel } from "@/models/review-log";
import { ReviewStateModel } from "@/models/review-state";
import { seedA1GrammarTopics } from "@/seed/seed-a1-grammar-topics";
import { seedA1Lessons } from "@/seed/seed-a1-lessons";
import {
  listExerciseAttempts,
  submitExerciseAttempt,
} from "@/services/exercise/exercise-attempts";
import { getGrammarTopic } from "@/services/grammar/grammar";
import { getLesson } from "@/services/learning/learning";

const collections = [
  ExerciseAttemptModel,
  GrammarTopicModel,
  LessonModel,
  ReviewLogModel,
  ReviewStateModel,
];

beforeAll(async () => {
  const database = await connectToDatabase();
  if (!database.connection.name.endsWith("_test")) {
    throw new Error("Integration tests refused to run outside a _test database.");
  }
  await Promise.all(collections.map((collection) => collection.syncIndexes()));
});

beforeEach(async () => {
  if (!mongoose.connection.name.endsWith("_test")) {
    throw new Error("Cleanup refused to run outside a _test database.");
  }
  await Promise.all(collections.map((collection) => collection.deleteMany()));
  await Promise.all([seedA1Lessons(), seedA1GrammarTopics()]);
});

afterAll(async () => {
  if (mongoose.connection.name?.endsWith("_test")) {
    await Promise.all(collections.map((collection) => collection.deleteMany()));
  }
  await mongoose.disconnect();
});

describe("exercise attempt persistence", () => {
  it("never exposes answer keys from lesson or grammar reads", async () => {
    const userId = new Types.ObjectId().toHexString();
    const [lesson, topic] = await Promise.all([
      getLesson({ slug: "a1-uhrzeit-und-termine", userId }),
      getGrammarTopic({ slug: "a1-begruessung-und-anrede" }),
    ]);
    const serialized = JSON.stringify({ lesson, topic });

    expect(serialized).not.toMatch(
      /correctOptionId|acceptedAnswers|correctOrder/,
    );
    expect(
      lesson.content.activities.some(
        (activity) => activity.type === "exercise_set",
      ),
    ).toBe(true);
    expect(topic.exercises).toHaveLength(1);
  });

  it("grades server-side, preserves SRS, and keeps retries idempotent", async () => {
    const userId = new Types.ObjectId().toHexString();
    const lesson = await LessonModel.findOne({
      slug: "a1-uhrzeit-und-termine",
    }).lean();
    if (!lesson) throw new Error("Seed lesson missing.");
    const sourceId = lesson._id.toString();
    const input = {
      answers: [
        {
          answer: "um-zehn",
          exerciseId: "appointment-preposition",
          type: "multiple_choice" as const,
        },
        {
          answer: " pünktlich ",
          exerciseId: "appointment-punctual",
          type: "fill_blank" as const,
        },
        {
          answer: ["wir", "vereinbaren", "einen", "termin"],
          exerciseId: "appointment-order",
          type: "word_ordering" as const,
        },
      ],
      attemptEventId: "attempt-integration-0001",
      sourceId,
      sourceType: "lesson" as const,
    };
    const srsBefore = {
      logs: await ReviewLogModel.countDocuments(),
      states: await ReviewStateModel.countDocuments(),
    };

    const first = await submitExerciseAttempt({ input, userId });
    const repeated = await submitExerciseAttempt({ input, userId });
    const retry = await submitExerciseAttempt({
      input: {
        ...input,
        answers: input.answers.map((answer) =>
          answer.type === "multiple_choice"
            ? { ...answer, answer: "am-zehn" }
            : answer,
        ),
        attemptEventId: "attempt-integration-0002",
      },
      userId,
    });

    expect(first).toMatchObject({
      attempt: { score: 3, total: 3 },
      idempotent: false,
    });
    expect(repeated).toMatchObject({
      attempt: { id: first.attempt.id, score: 3, total: 3 },
      idempotent: true,
    });
    expect(retry.attempt).toMatchObject({ score: 2, total: 3 });
    expect(await ExerciseAttemptModel.countDocuments({ userId })).toBe(2);
    expect(await ReviewLogModel.countDocuments()).toBe(srsBefore.logs);
    expect(await ReviewStateModel.countDocuments()).toBe(srsBefore.states);
  });

  it("isolates owners and caps requested attempt history", async () => {
    const ownerId = new Types.ObjectId();
    const otherId = new Types.ObjectId();
    const sourceId = new Types.ObjectId();
    await ExerciseAttemptModel.insertMany(
      Array.from({ length: 55 }, (_, index) => ({
        attemptEventId: `bounded-history-attempt-${String(index).padStart(3, "0")}`,
        completedAt: new Date(Date.UTC(2026, 9, 26, 0, index)),
        incorrectExerciseIds: [],
        score: 1,
        sourceId,
        sourceType: "lesson",
        total: 1,
        userId: ownerId,
      })),
    );
    await ExerciseAttemptModel.create({
      attemptEventId: "other-owner-attempt-0001",
      incorrectExerciseIds: [],
      score: 1,
      sourceId,
      sourceType: "lesson",
      total: 1,
      userId: otherId,
    });

    const ownerHistory = await listExerciseAttempts({
      limit: 999,
      sourceId: sourceId.toString(),
      sourceType: "lesson",
      userId: ownerId.toString(),
    });
    const otherHistory = await listExerciseAttempts({
      limit: 50,
      sourceId: sourceId.toString(),
      sourceType: "lesson",
      userId: otherId.toString(),
    });

    expect(ownerHistory.attempts).toHaveLength(50);
    expect(ownerHistory.attempts.every((attempt) => attempt.score === 1)).toBe(
      true,
    );
    expect(otherHistory.attempts).toHaveLength(1);
  });
});
