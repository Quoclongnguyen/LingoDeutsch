import { describe, expect, it } from "vitest";

import { grammarTopicContentSchema } from "@lingo-deutsch/shared";
import { A1_GRAMMAR_TOPICS } from "@/seed/a1-grammar-topics";

describe("A1 grammar topic seed", () => {
  it("contains the five approved topics in deterministic order", () => {
    expect(
      A1_GRAMMAR_TOPICS.map(({ order, slug }) => ({ order, slug })),
    ).toEqual([
      { order: 1, slug: "a1-begruessung-und-anrede" },
      { order: 2, slug: "a1-personalpronomen" },
      { order: 3, slug: "a1-sein-und-haben" },
      { order: 4, slug: "a1-artikel-der-die-das" },
      { order: 5, slug: "a1-praesens" },
    ]);
  });

  it("passes structured grammar validation with bilingual examples", () => {
    for (const topic of A1_GRAMMAR_TOPICS) {
      expect(grammarTopicContentSchema.safeParse(topic).success).toBe(true);
      expect(topic.examples.length).toBeGreaterThanOrEqual(2);
      expect(topic.relatedLessonSlugs.length).toBeGreaterThan(0);
    }
  });

  it("preserves formal address, umlauts, and authentic A1 verb forms", () => {
    const text = JSON.stringify(A1_GRAMMAR_TOPICS);

    expect(text).toContain("Wie heißen Sie?");
    expect(text).toContain("Begrüßung");
    expect(text).toContain("Präsens");
    const seinTopic = A1_GRAMMAR_TOPICS.find(
      (topic) => topic.slug === "a1-sein-und-haben",
    );
    const praesensTopic = A1_GRAMMAR_TOPICS.find(
      (topic) => topic.slug === "a1-praesens",
    );

    expect(seinTopic?.compactTable?.rows).toContainEqual([
      "du",
      "bist",
      "hast",
    ]);
    expect(praesensTopic?.compactTable?.rows).toContainEqual([
      "er / sie / es",
      "lernt",
      "arbeitet",
    ]);
  });
});
