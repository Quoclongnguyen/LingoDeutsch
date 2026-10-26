import { describe, expect, it } from "vitest";

import {
  learningPathQuerySchema,
  lessonProgressInputSchema,
  lessonVocabularySaveInputSchema,
} from "./learning";

describe("learning contracts", () => {
  it("accepts the supported CEFR path query and rejects unknown levels", () => {
    expect(learningPathQuerySchema.parse({ level: "A1" })).toEqual({
      level: "A1",
    });
    expect(learningPathQuerySchema.safeParse({ level: "C2" }).success).toBe(
      false,
    );
  });

  it("requires a bounded activity index and stable activity identifiers", () => {
    expect(
      lessonProgressInputSchema.parse({
        completedActivityIds: ["dialogue-1"],
        currentActivityIndex: 1,
        status: "in_progress",
      }),
    ).toEqual({
      completedActivityIds: ["dialogue-1"],
      currentActivityIndex: 1,
      status: "in_progress",
    });

    expect(
      lessonProgressInputSchema.safeParse({
        completedActivityIds: ["not valid"],
        currentActivityIndex: -1,
        status: "completed",
      }).success,
    ).toBe(false);

    expect(
      lessonProgressInputSchema.safeParse({
        completedActivityIds: Array.from(
          { length: 50 },
          (_, index) => `activity-${index}`,
        ),
        currentActivityIndex: 50,
        status: "completed",
      }).success,
    ).toBe(true);
  });

  it("normalizes the requested lesson vocabulary headword", () => {
    expect(
      lessonVocabularySaveInputSchema.parse({ headword: "  Übung  " }),
    ).toEqual({ headword: "Übung" });
  });
});
