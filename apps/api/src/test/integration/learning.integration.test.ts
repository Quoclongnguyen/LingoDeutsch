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
import { seedA1Lessons } from "@/seed/seed-a1-lessons";
import {
  getDashboard,
  getLearningPath,
  getLesson,
  LessonProgressConflictError,
  saveLessonVocabulary,
  updateLessonProgress,
} from "@/services/learning/learning";
import { createVocabularyWord } from "@/services/vocabulary/create-vocabulary-word";

const collections = [
  LessonProgressModel,
  ReviewLogModel,
  ReviewSessionModel,
  ReviewStateModel,
  VocabularySetModel,
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

describe("learning vertical slice", () => {
  it("rejects progress for a lesson whose prerequisite is incomplete", async () => {
    const userId = new Types.ObjectId().toHexString();
    const lockedLesson = await LessonModel.findOne({
      slug: "a1-uhrzeit-und-termine",
    }).lean();
    if (!lockedLesson) throw new Error("Seed lesson missing.");

    await expect(
      updateLessonProgress({
        input: {
          completedActivityIds: [],
          currentActivityIndex: 0,
          status: "completed",
        },
        lessonId: lockedLesson._id.toString(),
        userId,
      }),
    ).rejects.toBeInstanceOf(LessonProgressConflictError);
  });

  it("persists ordered progress for one learner and unlocks the next lesson", async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const otherUserId = new Types.ObjectId().toHexString();
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
      userId: ownerId,
    });

    const [ownerPath, otherPath, restoredLesson] = await Promise.all([
      getLearningPath({ level: "A1", userId: ownerId }),
      getLearningPath({ level: "A1", userId: otherUserId }),
      getLesson({ slug: lesson.slug, userId: ownerId }),
    ]);

    expect(ownerPath.nextLesson?.slug).toBe("a1-uhrzeit-und-termine");
    expect(otherPath.nextLesson?.slug).toBe("a1-begruessung-und-vorstellung");
    expect(restoredLesson.progress.status).toBe("completed");
  });

  it("saves a lesson word once, then links the same record idempotently", async () => {
    const userId = new Types.ObjectId().toHexString();
    const lesson = await LessonModel.findOne({
      slug: "a1-begruessung-und-vorstellung",
    }).lean();
    if (!lesson) throw new Error("Seed lesson missing.");
    const now = new Date("2026-10-26T05:00:00.000Z");

    const first = await saveLessonVocabulary({
      headword: "Name",
      lessonId: lesson._id.toString(),
      now,
      userId,
    });
    const second = await saveLessonVocabulary({
      headword: "Name",
      lessonId: lesson._id.toString(),
      now,
      userId,
    });

    expect(first.status).toBe("created");
    expect(second).toMatchObject({ status: "linked", word: first.word });
    expect(await VocabularyWordModel.countDocuments({ userId })).toBe(1);
    expect(await ReviewStateModel.countDocuments({ userId })).toBe(1);
    expect(
      await VocabularySetModel.countDocuments({ kind: "lesson", userId }),
    ).toBe(1);

    const dashboard = await getDashboard({ now, userId });
    expect(dashboard.due.count).toBe(1);
    expect(dashboard.due.words[0]?.headword).toBe("Name");
    expect(dashboard.milestone).toMatchObject({
      completedLessons: 0,
      titleDe: "A1",
      totalLessons: 4,
    });
  });

  it("links an existing word without replacing its original lesson source", async () => {
    const userId = new Types.ObjectId().toHexString();
    const [targetLesson, originalLesson] = await Promise.all([
      LessonModel.findOne({ slug: "a1-begruessung-und-vorstellung" }).lean(),
      LessonModel.findOne({ slug: "a1-uhrzeit-und-termine" }).lean(),
    ]);
    if (!targetLesson || !originalLesson) {
      throw new Error("Seed lessons missing.");
    }

    const existing = await createVocabularyWord({
      input: {
        article: "der",
        headword: "Name",
        level: "A1",
        meaningsVi: ["tên"],
        plural: "die Namen",
        sourceLessonId: originalLesson._id.toString(),
        wordType: "noun",
      },
      userId,
    });

    await saveLessonVocabulary({
      headword: "Name",
      lessonId: targetLesson._id.toString(),
      userId,
    });

    const linked = await VocabularyWordModel.findById(existing.word._id).lean();
    const lessonSet = await VocabularySetModel.findOne({
      kind: "lesson",
      sourceLessonId: targetLesson._id,
      userId,
    }).lean();

    expect(linked?.sourceLessonId?.toString()).toBe(
      originalLesson._id.toString(),
    );
    expect(linked?.setIds.map(String)).toContain(lessonSet?._id.toString());
  });
});
