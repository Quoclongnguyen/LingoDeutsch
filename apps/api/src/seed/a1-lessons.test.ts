import { describe, expect, it } from "vitest";

import { vocabularySeedItemSchema } from "@lingo-deutsch/shared";
import { A1_LESSONS } from "@/seed/a1-lessons";

describe("A1 lesson seed", () => {
  it("contains four lessons and exactly forty unique vocabulary items", () => {
    const items = A1_LESSONS.flatMap((lesson) => lesson.vocabularySeed);
    const normalizedHeadwords = items.map((item) => item.normalizedHeadword);

    expect(A1_LESSONS).toHaveLength(4);
    expect(items).toHaveLength(40);
    expect(new Set(normalizedHeadwords).size).toBe(40);
  });

  it("passes curated vocabulary validation", () => {
    for (const lesson of A1_LESSONS) {
      for (const item of lesson.vocabularySeed) {
        expect(vocabularySeedItemSchema.safeParse(item).success).toBe(true);
      }
    }
  });

  it("contains every mandatory German example from the PRD", () => {
    const items = A1_LESSONS.flatMap((lesson) => lesson.vocabularySeed);
    const keys = new Set(
      items.map((item) =>
        [
          item.article,
          item.headword,
          item.grammar?.governedPreposition,
          item.grammar?.governedCase,
        ]
          .filter(Boolean)
          .join(" "),
      ),
    );

    expect(keys).toContain("der Termin");
    expect(keys).toContain("die Uhrzeit");
    expect(keys).toContain("vereinbaren");
    expect(keys).toContain("pünktlich");
    expect(keys).toContain("die Verspätung");
    expect(keys).toContain("sich bewerben um Akk");
  });

  it("provides bilingual examples and complete noun metadata", () => {
    const items = A1_LESSONS.flatMap((lesson) => lesson.vocabularySeed);
    const bilingualExamples = items
      .flatMap((item) => item.examples)
      .filter((example) => Boolean(example.de && example.vi));

    expect(bilingualExamples.length).toBeGreaterThanOrEqual(20);

    for (const noun of items.filter((item) => item.wordType === "noun")) {
      expect(noun.article).toMatch(/^(der|die|das)$/);
      expect(Boolean(noun.plural) || noun.noPlural === true).toBe(true);
    }
  });

  it("provides one complete sample lesson with stable activity identifiers", () => {
    const sample = A1_LESSONS[0];
    const activityIds = sample?.content.activities.map(
      (activity) => activity.id,
    );

    expect(sample?.slug).toBe("a1-begruessung-und-vorstellung");
    expect(activityIds).toEqual([
      "dialogue-introduction",
      "vocabulary-introduction",
      "practice-introduction",
    ]);
    expect(sample?.content.activities.at(-1)?.type).toBe("exercise_set");
  });
});
