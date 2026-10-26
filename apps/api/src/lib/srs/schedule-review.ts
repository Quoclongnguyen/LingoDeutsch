import type { ReviewRating } from "@lingo-deutsch/shared";

const DAY_IN_MS = 86_400_000;
const TEN_MINUTES_IN_MS = 600_000;

export type SchedulingStatus = "new" | "learning" | "review" | "mastered";

export type SchedulingState = {
  dueAt: Date;
  easeFactor: number;
  intervalDays: number;
  lapseCount: number;
  lastReviewedAt?: Date;
  repetitions: number;
  state: SchedulingStatus;
};

function clampEase(value: number) {
  return Math.min(3, Math.max(1.3, Number(value.toFixed(2))));
}

function scheduledAt(now: Date, intervalDays: number) {
  return new Date(now.getTime() + intervalDays * DAY_IN_MS);
}

export function scheduleReview(
  previous: SchedulingState,
  rating: ReviewRating,
  now: Date,
): SchedulingState {
  if (previous.state === "new") {
    const newCardIntervals = {
      again: 0,
      easy: 7,
      good: 3,
      hard: 1,
    } satisfies Record<ReviewRating, number>;
    const intervalDays = newCardIntervals[rating];

    return {
      ...previous,
      dueAt:
        rating === "again"
          ? new Date(now.getTime() + TEN_MINUTES_IN_MS)
          : scheduledAt(now, intervalDays),
      easeFactor: clampEase(
        previous.easeFactor + (rating === "easy" ? 0.15 : 0),
      ),
      intervalDays,
      lastReviewedAt: new Date(now),
      repetitions: rating === "again" ? 0 : 1,
      state: rating === "again" || rating === "hard" ? "learning" : "review",
    };
  }

  if (rating === "again") {
    return {
      ...previous,
      dueAt: new Date(now.getTime() + TEN_MINUTES_IN_MS),
      easeFactor: clampEase(previous.easeFactor - 0.2),
      intervalDays: 0,
      lapseCount: previous.lapseCount + 1,
      lastReviewedAt: new Date(now),
      repetitions: 0,
      state: "learning",
    };
  }

  const intervalDays =
    rating === "hard"
      ? Math.max(1, Math.ceil(previous.intervalDays * 1.2))
      : rating === "good"
        ? Math.max(3, Math.ceil(previous.intervalDays * previous.easeFactor))
        : Math.max(
            7,
            Math.ceil(previous.intervalDays * previous.easeFactor * 1.3),
          );
  const repetitions = previous.repetitions + 1;
  const easeFactor = clampEase(
    previous.easeFactor +
      (rating === "hard" ? -0.05 : rating === "easy" ? 0.15 : 0),
  );
  const mastered = intervalDays >= 21 && repetitions >= 3;
  const nextState: SchedulingStatus =
    previous.state === "mastered" || mastered
      ? "mastered"
      : rating === "hard"
        ? previous.state
        : "review";

  return {
    ...previous,
    dueAt: scheduledAt(now, intervalDays),
    easeFactor,
    intervalDays,
    lastReviewedAt: new Date(now),
    repetitions,
    state: nextState,
  };
}
