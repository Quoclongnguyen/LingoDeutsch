import type { SchedulingState } from "@/lib/srs/schedule-review";

export function stateSnapshot(state: SchedulingState) {
  return {
    dueAt: state.dueAt,
    easeFactor: state.easeFactor,
    intervalDays: state.intervalDays,
    lapseCount: state.lapseCount,
    lastReviewedAt: state.lastReviewedAt,
    repetitions: state.repetitions,
    state: state.state,
  };
}

export function stateDto(state: SchedulingState) {
  return {
    ...stateSnapshot(state),
    dueAt: state.dueAt.toISOString(),
    lastReviewedAt: state.lastReviewedAt?.toISOString(),
  };
}

export function schedulingState(source: {
  dueAt: Date;
  easeFactor: number;
  intervalDays: number;
  lapseCount: number;
  lastReviewedAt?: Date | null;
  repetitions: number;
  state: string;
}): SchedulingState {
  return {
    dueAt: source.dueAt,
    easeFactor: source.easeFactor,
    intervalDays: source.intervalDays,
    lapseCount: source.lapseCount,
    lastReviewedAt: source.lastReviewedAt ?? undefined,
    repetitions: source.repetitions,
    state: source.state as SchedulingState["state"],
  };
}
