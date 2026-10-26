import { describe, expect, it } from "vitest";

import {
  grammarTopicContentSchema,
  grammarTopicListQuerySchema,
} from "./grammar";

const validTopic = {
  compactTable: {
    captionVi: "Đại từ nhân xưng ở ngôi thứ nhất và thứ hai",
    headers: ["Đại từ", "sein", "haben"],
    rows: [
      ["ich", "bin", "habe"],
      ["du", "bist", "hast"],
    ],
  },
  examples: [
    { de: "Ich bin Long.", vi: "Tôi là Long." },
    { de: "Haben Sie heute Zeit?", vi: "Hôm nay ông/bà có thời gian không?" },
  ],
  level: "A1",
  order: 2,
  published: true,
  relatedLessonSlugs: ["a1-begruessung-und-vorstellung"],
  rules: [
    {
      explanationVi: "Dùng Sie trong tình huống trang trọng.",
      id: "sie-formell",
      titleDe: "Sie und du",
    },
  ],
  slug: "a1-personalpronomen",
  summaryVi: "Chọn đại từ phù hợp với người nói và tình huống.",
  titleDe: "Personalpronomen",
  titleVi: "Đại từ nhân xưng",
};

describe("grammar validation", () => {
  it("defaults the grammar list to A1", () => {
    expect(grammarTopicListQuerySchema.parse({})).toEqual({ level: "A1" });
  });

  it("accepts structured topic content and a rectangular compact table", () => {
    expect(grammarTopicContentSchema.parse(validTopic)).toMatchObject({
      level: "A1",
      slug: "a1-personalpronomen",
    });
  });

  it("rejects arbitrary HTML in learner-facing content", () => {
    expect(
      grammarTopicContentSchema.safeParse({
        ...validTopic,
        summaryVi: "<strong>Quy tắc</strong>",
      }).success,
    ).toBe(false);
  });

  it("rejects table rows that do not match the header width", () => {
    expect(
      grammarTopicContentSchema.safeParse({
        ...validTopic,
        compactTable: {
          ...validTopic.compactTable,
          rows: [["ich", "bin"]],
        },
      }).success,
    ).toBe(false);
  });
});
