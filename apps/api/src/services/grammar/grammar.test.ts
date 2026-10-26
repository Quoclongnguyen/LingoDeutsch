import { describe, expect, it } from "vitest";

import { toGrammarTopicDetail } from "./grammar";

describe("grammar topic mapping", () => {
  it("preserves related-lesson order and omits unavailable lessons", () => {
    const detail = toGrammarTopicDetail(
      {
        _id: { toString: () => "topic-1" },
        examples: [
          { de: "Ich bin Long.", vi: "Tôi là Long." },
          { de: "Du bist Anna.", vi: "Bạn là Anna." },
        ],
        level: "A1",
        order: 3,
        published: true,
        relatedLessonSlugs: ["lesson-b", "missing", "lesson-a"],
        rules: [
          {
            explanationVi: "Động từ thay đổi theo chủ ngữ.",
            id: "verb-form",
            titleDe: "Verbform",
          },
        ],
        slug: "a1-sein-und-haben",
        summaryVi: "Dùng hai động từ cơ bản.",
        titleDe: "sein und haben",
        titleVi: "Động từ sein và haben",
      },
      [
        { slug: "lesson-a", titleDe: "A", titleVi: "Bài A" },
        { slug: "lesson-b", titleDe: "B", titleVi: "Bài B" },
      ],
    );

    expect(detail.relatedLessons.map((lesson) => lesson.slug)).toEqual([
      "lesson-b",
      "lesson-a",
    ]);
    expect(detail).not.toHaveProperty("published");
  });
});
