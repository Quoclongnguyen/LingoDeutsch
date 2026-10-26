import { Types } from "mongoose";

import {
  exerciseAttemptListQuerySchema,
  grammarTopicContentSchema,
  internalExerciseSchema,
  lessonContentSchema,
  submitExerciseAttemptSchema,
  type ExerciseSourceType,
  type InternalExercise,
  type SubmitExerciseAttempt,
} from "@lingo-deutsch/shared";
import {
  createExerciseAttemptRecord,
  findExerciseAttemptByEventId,
  queryExerciseAttemptsForUser,
} from "@/repositories/exercise-attempt-repository";
import { findPublishedGrammarTopicById } from "@/repositories/grammar-repository";
import { findPublishedLessonById } from "@/repositories/learning-repository";
import {
  gradeExercises,
  InvalidExerciseAnswersError,
} from "./grade-exercises";

export class ExerciseSourceNotFoundError extends Error {
  constructor() {
    super("Exercise source was not found.");
    this.name = "ExerciseSourceNotFoundError";
  }
}

export class ExerciseAttemptConflictError extends Error {
  constructor() {
    super("Attempt event is already associated with another submission.");
    this.name = "ExerciseAttemptConflictError";
  }
}

function assertUserId(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("A valid authenticated userId is required.");
  }
}

async function loadExercises(sourceType: ExerciseSourceType, sourceId: string) {
  let exercises: InternalExercise[] = [];
  if (sourceType === "lesson") {
    const lesson = await findPublishedLessonById(sourceId);
    if (!lesson) throw new ExerciseSourceNotFoundError();
    const content = lessonContentSchema.parse(lesson.content);
    exercises = content.activities.flatMap((activity) =>
      activity.type === "exercise_set" ? activity.exercises : [],
    );
  } else {
    const topic = await findPublishedGrammarTopicById(sourceId);
    if (!topic) throw new ExerciseSourceNotFoundError();
    exercises = grammarTopicContentSchema.parse(topic).exercises;
  }
  if (exercises.length === 0) throw new ExerciseSourceNotFoundError();
  return exercises.map((exercise) => internalExerciseSchema.parse(exercise));
}

function attemptSummary(attempt: {
  _id: { toString(): string };
  attemptEventId: string;
  completedAt: Date;
  incorrectExerciseIds: string[];
  score: number;
  sourceId: { toString(): string };
  sourceType: ExerciseSourceType;
  total: number;
}) {
  return {
    attemptEventId: attempt.attemptEventId,
    completedAt: attempt.completedAt.toISOString(),
    id: attempt._id.toString(),
    incorrectExerciseIds: attempt.incorrectExerciseIds,
    score: attempt.score,
    sourceId: attempt.sourceId.toString(),
    sourceType: attempt.sourceType,
    total: attempt.total,
  };
}

function restoredResults(exercises: InternalExercise[], incorrectIds: string[]) {
  const incorrect = new Set(incorrectIds);
  return exercises.map((exercise) => {
    const correct = !incorrect.has(exercise.id);
    return {
      correct,
      exerciseId: exercise.id,
      feedbackVi: correct
        ? exercise.feedbackCorrectVi
        : exercise.feedbackIncorrectVi,
      type: exercise.type,
    };
  });
}

function isDuplicateKey(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function submitExerciseAttempt({
  input,
  now = new Date(),
  userId,
}: {
  input: SubmitExerciseAttempt;
  now?: Date;
  userId: string;
}) {
  assertUserId(userId);
  const validated = submitExerciseAttemptSchema.parse(input);
  const exercises = await loadExercises(validated.sourceType, validated.sourceId);
  const existing = await findExerciseAttemptByEventId(validated.attemptEventId);
  if (existing) {
    if (
      existing.userId.toString() !== userId ||
      existing.sourceType !== validated.sourceType ||
      existing.sourceId.toString() !== validated.sourceId
    ) {
      throw new ExerciseAttemptConflictError();
    }
    return {
      attempt: attemptSummary(existing),
      idempotent: true,
      results: restoredResults(exercises, existing.incorrectExerciseIds),
    };
  }

  const grade = gradeExercises(exercises, validated.answers);
  try {
    const attempt = await createExerciseAttemptRecord({
      attemptEventId: validated.attemptEventId,
      completedAt: now,
      incorrectExerciseIds: grade.incorrectExerciseIds,
      score: grade.score,
      sourceId: validated.sourceId,
      sourceType: validated.sourceType,
      total: grade.total,
      userId,
    });
    return {
      attempt: attemptSummary(attempt),
      idempotent: false,
      results: grade.results,
    };
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    const raced = await findExerciseAttemptByEventId(validated.attemptEventId);
    if (
      !raced ||
      raced.userId.toString() !== userId ||
      raced.sourceType !== validated.sourceType ||
      raced.sourceId.toString() !== validated.sourceId
    ) {
      throw new ExerciseAttemptConflictError();
    }
    return {
      attempt: attemptSummary(raced),
      idempotent: true,
      results: restoredResults(exercises, raced.incorrectExerciseIds),
    };
  }
}

export async function listExerciseAttempts(input: {
  limit: number;
  sourceId: string;
  sourceType: ExerciseSourceType;
  userId: string;
}) {
  assertUserId(input.userId);
  const query = exerciseAttemptListQuerySchema.parse(input);
  const attempts = await queryExerciseAttemptsForUser({
    ...query,
    userId: input.userId,
  });
  return { attempts: attempts.map(attemptSummary) };
}

export { InvalidExerciseAnswersError };
