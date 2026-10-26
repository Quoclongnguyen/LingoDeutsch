import { describe, expect, it } from "vitest";

import { selectReviewQueue } from "./select-review-queue";

describe("selectReviewQueue", () => {
  it("preserves due order while respecting the remaining daily new-card budget", () => {
    const candidates = [
      { id: "review-1", state: "review" },
      ...Array.from({ length: 12 }, (_, index) => ({
        id: `new-${index + 1}`,
        state: "new",
      })),
      { id: "learning-1", state: "learning" },
    ];

    const selected = selectReviewQueue(candidates, {
      introducedNewToday: 4,
      maxCards: 50,
      maxNewPerDay: 10,
    });

    expect(selected.map((candidate) => candidate.id)).toEqual([
      "review-1",
      "new-1",
      "new-2",
      "new-3",
      "new-4",
      "new-5",
      "new-6",
      "learning-1",
    ]);
  });

  it("caps a session at fifty cards", () => {
    const candidates = Array.from({ length: 70 }, (_, index) => ({
      id: String(index),
      state: "review",
    }));

    expect(
      selectReviewQueue(candidates, {
        introducedNewToday: 0,
        maxCards: 50,
        maxNewPerDay: 10,
      }),
    ).toHaveLength(50);
  });
});
