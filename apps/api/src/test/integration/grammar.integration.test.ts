import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectToDatabase } from "@/lib/db/mongoose";
import { GrammarTopicModel } from "@/models/grammar-topic";
import { LessonModel } from "@/models/lesson";
import { seedA1GrammarTopics } from "@/seed/seed-a1-grammar-topics";
import { seedA1Lessons } from "@/seed/seed-a1-lessons";
import {
  getGrammarTopic,
  GrammarTopicNotFoundError,
  listGrammarTopics,
} from "@/services/grammar/grammar";
import { getLesson } from "@/services/learning/learning";

const collections = [GrammarTopicModel, LessonModel];

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
  await Promise.all([seedA1Lessons(), seedA1GrammarTopics()]);
});

afterAll(async () => {
  if (mongoose.connection.name?.endsWith("_test")) {
    await Promise.all(collections.map((collection) => collection.deleteMany()));
  }
  await mongoose.disconnect();
});

describe("grammar library persistence", () => {
  it("upserts the five ordered A1 topics idempotently", async () => {
    await seedA1GrammarTopics();
    await seedA1GrammarTopics();

    const topics = await GrammarTopicModel.find({ level: "A1" })
      .sort({ order: 1 })
      .lean();
    expect(topics).toHaveLength(5);
    expect(topics.map((topic) => topic.order)).toEqual([1, 2, 3, 4, 5]);
    expect(topics.every((topic) => topic.exercises.length === 0)).toBe(true);
  });

  it("returns only published topics and resolves published related lessons", async () => {
    await GrammarTopicModel.updateOne(
      { slug: "a1-praesens" },
      { $set: { published: false } },
    );

    const library = await listGrammarTopics({ level: "A1" });
    const detail = await getGrammarTopic({ slug: "a1-sein-und-haben" });

    expect(library.topics).toHaveLength(4);
    expect(library.topics.map((topic) => topic.order)).toEqual([1, 2, 3, 4]);
    expect(detail.relatedLessons.map((lesson) => lesson.slug)).toEqual([
      "a1-begruessung-und-vorstellung",
      "a1-uhrzeit-und-termine",
    ]);
    await expect(
      getGrammarTopic({ slug: "a1-praesens" }),
    ).rejects.toBeInstanceOf(GrammarTopicNotFoundError);
  });

  it("links grammar topics into lesson detail without changing progress", async () => {
    const lesson = await getLesson({
      slug: "a1-begruessung-und-vorstellung",
      userId: new Types.ObjectId().toHexString(),
    });

    expect(lesson.progress.status).toBe("not_started");
    expect(lesson.grammarTopics.map((topic) => topic.slug)).toEqual([
      "a1-begruessung-und-anrede",
      "a1-personalpronomen",
      "a1-sein-und-haben",
      "a1-artikel-der-die-das",
      "a1-praesens",
    ]);
  });
});
