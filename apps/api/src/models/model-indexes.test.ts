import type { IndexDefinition, IndexOptions } from "mongoose";
import { describe, expect, it } from "vitest";

import { LessonProgressModel } from "@/models/lesson-progress";
import { ReviewLogModel } from "@/models/review-log";
import { ReviewSessionModel } from "@/models/review-session";
import { ReviewStateModel } from "@/models/review-state";
import { VocabularySetModel } from "@/models/vocabulary-set";
import { VocabularyWordModel } from "@/models/vocabulary-word";

function hasIndex(
  indexes: Array<[IndexDefinition, IndexOptions]>,
  keys: IndexDefinition,
  options: Partial<IndexOptions> = {},
) {
  return indexes.some(
    ([candidateKeys, candidateOptions]) =>
      JSON.stringify(candidateKeys) === JSON.stringify(keys) &&
      Object.entries(options).every(
        ([key, value]) => candidateOptions[key as keyof IndexOptions] === value,
      ),
  );
}

describe("Phase 01 model indexes", () => {
  it("defines tenant-safe vocabulary indexes and active-word uniqueness", () => {
    const indexes = VocabularyWordModel.schema.indexes();

    expect(
      hasIndex(indexes, { userId: 1, normalizedHeadword: 1 }, { unique: true }),
    ).toBe(true);
    expect(hasIndex(indexes, { userId: 1, setIds: 1 })).toBe(true);
    expect(hasIndex(indexes, { userId: 1, level: 1, wordType: 1 })).toBe(true);
  });

  it("defines unique review state and due-queue indexes", () => {
    const indexes = ReviewStateModel.schema.indexes();

    expect(hasIndex(indexes, { userId: 1, wordId: 1 }, { unique: true })).toBe(
      true,
    );
    expect(hasIndex(indexes, { userId: 1, dueAt: 1, state: 1 })).toBe(true);
  });

  it("defines immutable review-log identity and history indexes", () => {
    const indexes = ReviewLogModel.schema.indexes();

    expect(hasIndex(indexes, { reviewEventId: 1 }, { unique: true })).toBe(
      true,
    );
    expect(hasIndex(indexes, { userId: 1, reviewedAt: -1 })).toBe(true);
    expect(hasIndex(indexes, { userId: 1, wordId: 1, reviewedAt: -1 })).toBe(
      true,
    );
  });

  it("defines session, set, and lesson-progress lookup indexes", () => {
    expect(
      hasIndex(ReviewSessionModel.schema.indexes(), {
        userId: 1,
        status: 1,
        updatedAt: -1,
      }),
    ).toBe(true);
    expect(
      hasIndex(VocabularySetModel.schema.indexes(), { userId: 1, name: 1 }),
    ).toBe(true);
    expect(
      hasIndex(
        VocabularySetModel.schema.indexes(),
        { userId: 1, sourceLessonId: 1 },
        { unique: true },
      ),
    ).toBe(true);
    expect(
      hasIndex(
        LessonProgressModel.schema.indexes(),
        { userId: 1, lessonId: 1 },
        { unique: true },
      ),
    ).toBe(true);
  });
});
