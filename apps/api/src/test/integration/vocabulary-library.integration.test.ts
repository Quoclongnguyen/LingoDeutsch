import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectToDatabase } from "@/lib/db/mongoose";
import { ReviewStateModel } from "@/models/review-state";
import { VocabularySetModel } from "@/models/vocabulary-set";
import { VocabularyWordModel } from "@/models/vocabulary-word";
import {
  addWordToVocabularySet,
  createVocabularySet,
  listVocabularySets,
} from "@/services/vocabulary/vocabulary-sets";
import {
  archiveVocabularyWord,
  listVocabularyWords,
  updateVocabularyWord,
  VocabularyWordNotFoundError,
} from "@/services/vocabulary/vocabulary-library";
import {
  commitVocabularyImport,
  previewVocabularyImport,
} from "@/services/vocabulary/vocabulary-import";
import { createVocabularyWord } from "@/services/vocabulary/create-vocabulary-word";

function noun(headword: string, meaning: string, plural: string) {
  return {
    article: "der" as const,
    examples: [
      {
        de: `Das ist der ${headword}.`,
        vi: `Đây là ${meaning}.`,
      },
    ],
    headword,
    level: "A1" as const,
    meaningsVi: [meaning],
    plural,
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

  await Promise.all([
    VocabularyWordModel.syncIndexes(),
    ReviewStateModel.syncIndexes(),
    VocabularySetModel.syncIndexes(),
  ]);
});

beforeEach(async () => {
  if (!mongoose.connection.name.endsWith("_test")) {
    throw new Error("Cleanup refused to run outside a _test database.");
  }

  await Promise.all([
    VocabularyWordModel.deleteMany(),
    ReviewStateModel.deleteMany(),
    VocabularySetModel.deleteMany(),
  ]);
});

afterAll(async () => {
  if (mongoose.connection.name?.endsWith("_test")) {
    await Promise.all([
      VocabularyWordModel.deleteMany(),
      ReviewStateModel.deleteMany(),
      VocabularySetModel.deleteMany(),
    ]);
  }
  await mongoose.disconnect();
});

describe("vocabulary library", () => {
  it("searches Vietnamese meanings and preserves filters across pagination", async () => {
    const userId = new Types.ObjectId().toHexString();
    const otherUserId = new Types.ObjectId().toHexString();

    await createVocabularyWord({
      input: noun("Termin", "cuộc hẹn", "die Termine"),
      userId,
    });
    await createVocabularyWord({
      input: {
        headword: "vereinbaren",
        level: "A1",
        meaningsVi: ["sắp xếp, hẹn"],
        wordType: "verb",
      },
      userId,
    });
    await createVocabularyWord({
      input: noun("Termin", "lịch hẹn của người khác", "die Termine"),
      userId: otherUserId,
    });

    const result = await listVocabularyWords({
      query: {
        level: "A1",
        page: 1,
        pageSize: 1,
        q: "cuộc hẹn",
        wordType: "noun",
      },
      userId,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      article: "der",
      headword: "Termin",
      meaningsVi: ["cuộc hẹn"],
      plural: "die Termine",
    });
    expect(result.pagination).toMatchObject({ page: 1, pageSize: 1, total: 1 });
    expect(result.summary.total).toBe(2);
  });

  it("updates and archives only an owned active word", async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const otherUserId = new Types.ObjectId().toHexString();
    const created = await createVocabularyWord({
      input: noun("Termin", "cuộc hẹn", "die Termine"),
      userId: ownerId,
    });

    await expect(
      updateVocabularyWord({
        input: { meaningsVi: ["cuộc hẹn, lịch hẹn"] },
        userId: otherUserId,
        wordId: created.word._id.toString(),
      }),
    ).rejects.toBeInstanceOf(VocabularyWordNotFoundError);

    const updated = await updateVocabularyWord({
      input: { meaningsVi: ["cuộc hẹn, lịch hẹn"] },
      userId: ownerId,
      wordId: created.word._id.toString(),
    });
    const archived = await archiveVocabularyWord({
      userId: ownerId,
      wordId: created.word._id.toString(),
    });

    expect(updated.meaningsVi).toEqual(["cuộc hẹn, lịch hẹn"]);
    expect(archived.isArchived).toBe(true);
    expect(
      await listVocabularyWords({
        query: { page: 1, pageSize: 20 },
        userId: ownerId,
      }),
    ).toMatchObject({ items: [], summary: { total: 0 } });
  });
});

describe("personal vocabulary sets", () => {
  it("rejects a foreign set id when creating a word", async () => {
    const userId = new Types.ObjectId().toHexString();
    const foreignUserId = new Types.ObjectId().toHexString();
    const foreignSet = await createVocabularySet({
      input: { name: "Foreign" },
      userId: foreignUserId,
    });

    await expect(
      createVocabularyWord({
        input: {
          ...noun("Beruf", "nghề nghiệp", "Berufe"),
          setIds: [foreignSet.id],
        },
        userId,
      }),
    ).rejects.toThrow("Vocabulary set was not found");
  });

  it("adds only an owned word and returns set counts", async () => {
    const userId = new Types.ObjectId().toHexString();
    const otherUserId = new Types.ObjectId().toHexString();
    const owned = await createVocabularyWord({
      input: noun("Termin", "cuộc hẹn", "die Termine"),
      userId,
    });
    const foreign = await createVocabularyWord({
      input: noun("Uhrzeit", "giờ giấc", "die Uhrzeiten"),
      userId: otherUserId,
    });
    const set = await createVocabularySet({
      input: { description: "Từ dùng khi đặt lịch", name: "Lịch hẹn" },
      userId,
    });

    await addWordToVocabularySet({
      setId: set.id,
      userId,
      wordId: owned.word._id.toString(),
    });
    await expect(
      addWordToVocabularySet({
        setId: set.id,
        userId,
        wordId: foreign.word._id.toString(),
      }),
    ).rejects.toBeInstanceOf(VocabularyWordNotFoundError);

    const sets = await listVocabularySets({ userId });
    const words = await listVocabularyWords({
      query: { page: 1, pageSize: 20 },
      userId,
    });
    expect(sets).toMatchObject([
      {
        dueCount: 1,
        name: "Lịch hẹn",
        wordCount: 1,
      },
    ]);
    expect(words.items[0]?.setIds).toEqual([set.id]);
  });
});

describe("vocabulary import", () => {
  it("previews row errors and existing duplicates without persisting", async () => {
    const userId = new Types.ObjectId().toHexString();
    await createVocabularyWord({
      input: noun("Termin", "cuộc hẹn", "die Termine"),
      userId,
    });

    const preview = await previewVocabularyImport({
      input: {
        content:
          "Termin | cuộc hẹn | noun | der | die Termine | A1\nUhrzeit | giờ giấc | noun",
        format: "lines",
      },
      userId,
    });

    expect(preview.rows.map((row) => row.status)).toEqual([
      "existing",
      "invalid",
    ]);
    expect(await VocabularyWordModel.countDocuments({ userId })).toBe(1);
  });

  it("commits all validated rows and their initial review states", async () => {
    const userId = new Types.ObjectId().toHexString();
    const items = [
      noun("Termin", "cuộc hẹn", "die Termine"),
      {
        headword: "vereinbaren",
        level: "A1" as const,
        meaningsVi: ["sắp xếp, hẹn"],
        wordType: "verb" as const,
      },
    ];

    const result = await commitVocabularyImport({ items, userId });

    expect(result.createdCount).toBe(2);
    expect(await VocabularyWordModel.countDocuments({ userId })).toBe(2);
    expect(await ReviewStateModel.countDocuments({ userId })).toBe(2);
  });
});
