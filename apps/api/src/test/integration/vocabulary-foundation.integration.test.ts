import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectToDatabase } from "@/lib/db/mongoose";
import { LessonModel } from "@/models/lesson";
import { LessonProgressModel } from "@/models/lesson-progress";
import { ReviewLogModel } from "@/models/review-log";
import { ReviewSessionModel } from "@/models/review-session";
import { ReviewStateModel } from "@/models/review-state";
import { VocabularySetModel } from "@/models/vocabulary-set";
import { VocabularyWordModel } from "@/models/vocabulary-word";
import {
  archiveVocabularyWordForUser,
  findVocabularyWordByIdForUser,
} from "@/repositories/vocabulary-word-repository";
import { seedA1Lessons } from "@/seed/seed-a1-lessons";
import {
  createVocabularyWord,
  DuplicateVocabularyWordError,
} from "@/services/vocabulary/create-vocabulary-word";

const collections = [
  LessonProgressModel,
  ReviewLogModel,
  ReviewSessionModel,
  ReviewStateModel,
  VocabularySetModel,
  VocabularyWordModel,
  LessonModel,
];

function vocabularyInput() {
  return {
    article: "der" as const,
    examples: [
      {
        de: "Ich habe morgen einen Termin.",
        vi: "Ngày mai tôi có một cuộc hẹn.",
      },
    ],
    headword: "Termin",
    level: "A1" as const,
    meaningsVi: ["cuộc hẹn"],
    plural: "die Termine",
    wordType: "noun" as const,
  };
}

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
});

afterAll(async () => {
  if (mongoose.connection.name?.endsWith("_test")) {
    await Promise.all(collections.map((collection) => collection.deleteMany()));
  }
  await mongoose.disconnect();
});

describe("vocabulary persistence foundation", () => {
  it("creates one vocabulary word and one initial review state atomically", async () => {
    const userId = new Types.ObjectId().toHexString();
    const now = new Date("2026-10-25T08:00:00.000Z");

    const result = await createVocabularyWord({
      input: vocabularyInput(),
      now,
      userId,
    });

    expect(result.word.userId.toString()).toBe(userId);
    expect(result.word.normalizedHeadword).toBe("termin");
    expect(result.reviewState).toMatchObject({
      easeFactor: 2.5,
      intervalDays: 0,
      lapseCount: 0,
      repetitions: 0,
      state: "new",
    });
    expect(result.reviewState.dueAt).toEqual(now);
    expect(await VocabularyWordModel.countDocuments({ userId })).toBe(1);
    expect(await ReviewStateModel.countDocuments({ userId })).toBe(1);
  });

  it("rejects duplicate active headwords for one user but permits another user", async () => {
    const firstUserId = new Types.ObjectId().toHexString();
    const secondUserId = new Types.ObjectId().toHexString();

    await createVocabularyWord({
      input: vocabularyInput(),
      userId: firstUserId,
    });

    await expect(
      createVocabularyWord({ input: vocabularyInput(), userId: firstUserId }),
    ).rejects.toBeInstanceOf(DuplicateVocabularyWordError);
    await expect(
      createVocabularyWord({ input: vocabularyInput(), userId: secondUserId }),
    ).resolves.toBeDefined();
  });

  it("never returns or archives another user's word", async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const otherUserId = new Types.ObjectId().toHexString();
    const { word } = await createVocabularyWord({
      input: vocabularyInput(),
      userId: ownerId,
    });

    await expect(
      findVocabularyWordByIdForUser(otherUserId, word._id.toString()),
    ).resolves.toBeNull();
    await expect(
      archiveVocabularyWordForUser(otherUserId, word._id.toString()),
    ).resolves.toBeNull();

    const unchanged = await VocabularyWordModel.findById(word._id).lean();
    expect(unchanged?.isArchived).toBe(false);
  });

  it("allows the owner to archive a word and create it again", async () => {
    const userId = new Types.ObjectId().toHexString();
    const first = await createVocabularyWord({
      input: vocabularyInput(),
      userId,
    });

    const archived = await archiveVocabularyWordForUser(
      userId,
      first.word._id.toString(),
    );
    const replacement = await createVocabularyWord({
      input: vocabularyInput(),
      userId,
    });

    expect(archived?.isArchived).toBe(true);
    expect(replacement.word._id.toString()).not.toBe(first.word._id.toString());
  });
});

describe("A1 seed persistence", () => {
  it("upserts four lessons idempotently", async () => {
    await seedA1Lessons();
    await seedA1Lessons();

    expect(await LessonModel.countDocuments({ level: "A1" })).toBe(4);
    const words = await LessonModel.aggregate<{ count: number }>([
      { $match: { level: "A1" } },
      { $unwind: "$vocabularySeed" },
      { $count: "count" },
    ]);
    expect(words[0]?.count).toBe(40);
  });
});
