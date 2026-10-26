import { describe, expect, it } from "vitest";

import { scheduleReview, type SchedulingState } from "./schedule-review";

const now = new Date("2026-10-26T12:00:00.000Z");

function state(overrides: Partial<SchedulingState> = {}): SchedulingState {
  return {
    dueAt: new Date("2026-10-26T11:00:00.000Z"),
    easeFactor: 2.5,
    intervalDays: 0,
    lapseCount: 0,
    lastReviewedAt: undefined,
    repetitions: 0,
    state: "new",
    ...overrides,
  };
}

describe("scheduleReview", () => {
  it.each([
    ["again", "learning", 0, "2026-10-26T12:10:00.000Z", 2.5],
    ["hard", "learning", 1, "2026-10-27T12:00:00.000Z", 2.5],
    ["good", "review", 3, "2026-10-29T12:00:00.000Z", 2.5],
    ["easy", "review", 7, "2026-11-02T12:00:00.000Z", 2.65],
  ] as const)(
    "schedules a new card rated %s",
    (rating, expectedState, intervalDays, dueAt, easeFactor) => {
      expect(scheduleReview(state(), rating, now)).toMatchObject({
        dueAt: new Date(dueAt),
        easeFactor,
        intervalDays,
        lastReviewedAt: now,
        repetitions: rating === "again" ? 0 : 1,
        state: expectedState,
      });
    },
  );

  it.each([
    ["hard", 5, 2.45],
    ["good", 10, 2.5],
    ["easy", 13, 2.65],
  ] as const)(
    "schedules an existing card rated %s",
    (rating, intervalDays, easeFactor) => {
      expect(
        scheduleReview(
          state({ intervalDays: 4, repetitions: 1, state: "review" }),
          rating,
          now,
        ),
      ).toMatchObject({
        dueAt: new Date(now.getTime() + intervalDays * 86_400_000),
        easeFactor,
        intervalDays,
        repetitions: 2,
        state: "review",
      });
    },
  );

  it("resets an existing card on again and records a lapse", () => {
    expect(
      scheduleReview(
        state({
          easeFactor: 1.4,
          intervalDays: 12,
          lapseCount: 2,
          repetitions: 4,
          state: "review",
        }),
        "again",
        now,
      ),
    ).toMatchObject({
      dueAt: new Date("2026-10-26T12:10:00.000Z"),
      easeFactor: 1.3,
      intervalDays: 0,
      lapseCount: 3,
      repetitions: 0,
      state: "learning",
    });
  });

  it("clamps ease at 3.0", () => {
    expect(
      scheduleReview(
        state({ easeFactor: 2.95, intervalDays: 8, state: "review" }),
        "easy",
        now,
      ).easeFactor,
    ).toBe(3);
  });

  it("promotes a card after three successful repetitions and 21 days", () => {
    expect(
      scheduleReview(
        state({ intervalDays: 9, repetitions: 2, state: "review" }),
        "good",
        now,
      ),
    ).toMatchObject({ intervalDays: 23, repetitions: 3, state: "mastered" });
  });

  it("keeps a mastered card scheduled until a lapse", () => {
    expect(
      scheduleReview(
        state({ intervalDays: 30, repetitions: 6, state: "mastered" }),
        "hard",
        now,
      ).state,
    ).toBe("mastered");
  });
});
