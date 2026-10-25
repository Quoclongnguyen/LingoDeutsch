import { describe, expect, it } from "vitest";

import {
  createVocabularyInputSchema,
  importCommitInputSchema,
  updateVocabularyInputSchema,
  vocabularyListQuerySchema,
  vocabularySeedItemSchema,
  vocabularySetInputSchema,
} from "./vocabulary";

describe("createVocabularyInputSchema", () => {
  it("adds a normalized headword while preserving learner-facing German", () => {
    const result = createVocabularyInputSchema.parse({
      article: "der",
      headword: "  Termin ",
      meaningsVi: ["cuộc hẹn"],
      plural: "die Termine",
      wordType: "noun",
    });

    expect(result.headword).toBe("Termin");
    expect(result.normalizedHeadword).toBe("termin");
    expect(result.plural).toBe("die Termine");
  });

  it("requires an article for a noun", () => {
    const result = createVocabularyInputSchema.safeParse({
      headword: "Termin",
      meaningsVi: ["cuộc hẹn"],
      plural: "die Termine",
      wordType: "noun",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join(".") === "article"),
      ).toBe(true);
    }
  });

  it("rejects a plural together with noPlural", () => {
    const result = createVocabularyInputSchema.safeParse({
      article: "das",
      headword: "Wasser",
      meaningsVi: ["nước"],
      noPlural: true,
      plural: "die Wasser",
      wordType: "noun",
    });

    expect(result.success).toBe(false);
  });

  it("rejects noun-only fields on a verb", () => {
    const result = createVocabularyInputSchema.safeParse({
      article: "der",
      headword: "vereinbaren",
      meaningsVi: ["sắp xếp, hẹn"],
      wordType: "verb",
    });

    expect(result.success).toBe(false);
  });

  it("preserves governed case metadata for a reflexive verb", () => {
    const result = createVocabularyInputSchema.parse({
      grammar: {
        governedCase: "Akk",
        governedPreposition: "um",
        reflexive: true,
      },
      headword: "sich bewerben",
      meaningsVi: ["ứng tuyển"],
      wordType: "verb",
    });

    expect(result.grammar).toMatchObject({
      governedCase: "Akk",
      governedPreposition: "um",
      reflexive: true,
    });
  });
});

describe("vocabularySeedItemSchema", () => {
  it("requires at least one bilingual example for curated seed data", () => {
    const result = vocabularySeedItemSchema.safeParse({
      article: "die",
      headword: "Uhrzeit",
      meaningsVi: ["giờ, thời điểm"],
      plural: "die Uhrzeiten",
      wordType: "noun",
    });

    expect(result.success).toBe(false);
  });
});

describe("vocabularyListQuerySchema", () => {
  it("normalizes bounded pagination and focused filters", () => {
    expect(
      vocabularyListQuerySchema.parse({
        level: "A1",
        page: "2",
        pageSize: "20",
        q: "  Termin  ",
        state: "learning",
        wordType: "noun",
      }),
    ).toEqual({
      level: "A1",
      page: 2,
      pageSize: 20,
      q: "Termin",
      state: "learning",
      wordType: "noun",
    });
  });

  it("rejects unbounded page sizes", () => {
    expect(
      vocabularyListQuerySchema.safeParse({ pageSize: "201" }).success,
    ).toBe(false);
  });
});

describe("updateVocabularyInputSchema", () => {
  it("requires at least one editable field", () => {
    expect(updateVocabularyInputSchema.safeParse({}).success).toBe(false);
  });

  it("accepts a focused partial update", () => {
    expect(
      updateVocabularyInputSchema.parse({ meaningsVi: ["cuộc hẹn"] }),
    ).toEqual({ meaningsVi: ["cuộc hẹn"] });
  });
});

describe("vocabulary set and import contracts", () => {
  it("trims a private vocabulary-set name", () => {
    expect(vocabularySetInputSchema.parse({ name: "  Lịch hẹn  " })).toEqual({
      name: "Lịch hẹn",
    });
  });

  it("limits an import commit to 200 validated rows", () => {
    const item = {
      headword: "vereinbaren",
      meaningsVi: ["sắp xếp, hẹn"],
      wordType: "verb" as const,
    };

    expect(
      importCommitInputSchema.safeParse({ items: Array(201).fill(item) })
        .success,
    ).toBe(false);
  });
});
