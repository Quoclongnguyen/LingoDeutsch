import { Types } from "mongoose";

import {
  learningPathQuerySchema,
  lessonContentSchema,
  lessonProgressInputSchema,
  normalizeGermanHeadword,
  vocabularySeedItemSchema,
  toPublicExercise,
  type LessonProgressInput,
} from "@lingo-deutsch/shared";
import { connectToDatabase } from "@/lib/db/mongoose";
import {
  countWeeklyLearningActivity,
  findLessonProgressForUser,
  findPublishedLessonById,
  findPublishedLessonBySlug,
  findSavedHeadwordsForLesson,
  hasIncompletePublishedPrerequisites,
  queryLearningPathLessonRecords,
  queryRecentLessonActivities,
  queryRecentReviewActivities,
  upsertLessonProgressForUser,
} from "@/repositories/learning-repository";
import {
  countDueReviewStates,
  createInitialReviewState,
  findNextReviewDueAt,
  queryDueReviewCandidates,
} from "@/repositories/review-state-repository";
import { findOrCreateLessonVocabularySet } from "@/repositories/vocabulary-set-repository";
import {
  attachLessonSourceToVocabularyWord,
  createVocabularyWordRecord,
  findActiveVocabularyWordByNormalizedHeadword,
} from "@/repositories/vocabulary-word-repository";
import { buildLearningPath } from "./learning-path";
import { listGrammarTopicsForLesson } from "@/services/grammar/grammar";
import { summarizeLearningPath } from "@/services/progress/progress-snapshot";

export class LessonNotFoundError extends Error {
  constructor() {
    super("Lesson was not found.");
    this.name = "LessonNotFoundError";
  }
}

export class LessonProgressConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LessonProgressConflictError";
  }
}

export class LessonVocabularyNotFoundError extends Error {
  constructor() {
    super("Vocabulary item is not part of this lesson.");
    this.name = "LessonVocabularyNotFoundError";
  }
}

function assertUserId(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("A valid authenticated userId is required.");
  }
}

function progressOrDefault(progress?: {
  completedActivityIds?: string[];
  currentActivityIndex?: number;
  status?: "not_started" | "in_progress" | "completed";
  updatedAt?: Date;
}) {
  return {
    completedActivityIds: progress?.completedActivityIds ?? [],
    currentActivityIndex: progress?.currentActivityIndex ?? 0,
    status: progress?.status ?? ("not_started" as const),
    updatedAt: progress?.updatedAt?.toISOString(),
  };
}

export async function getLearningPath({
  level,
  now = new Date(),
  userId,
}: {
  level: string;
  now?: Date;
  userId: string;
}) {
  assertUserId(userId);
  const query = learningPathQuerySchema.parse({ level });
  const records = await queryLearningPathLessonRecords({
    level: query.level,
    now,
    userId,
  });
  return buildLearningPath(
    query.level,
    records.map((record) => ({
      ...record,
      id: record.id.toString(),
      progress: progressOrDefault(record.progress),
    })),
  );
}

export async function getLesson({
  slug,
  userId,
}: {
  slug: string;
  userId: string;
}) {
  assertUserId(userId);
  const lesson = await findPublishedLessonBySlug(slug);
  if (!lesson) throw new LessonNotFoundError();
  const content = lessonContentSchema.parse(lesson.content);
  const publicContent = {
    activities: content.activities.map((activity) =>
      activity.type === "exercise_set"
        ? {
            ...activity,
            exercises: activity.exercises.map(toPublicExercise),
          }
        : activity,
    ),
  };
  const [progress, savedHeadwords, grammarTopics] = await Promise.all([
    findLessonProgressForUser(userId, lesson._id.toString()),
    findSavedHeadwordsForLesson(userId, lesson._id.toString()),
    listGrammarTopicsForLesson(lesson.slug),
  ]);
  const vocabulary = lesson.vocabularySeed.map((raw) => {
    const item = vocabularySeedItemSchema.parse(raw);
    return {
      ...item,
      isSaved: savedHeadwords.has(item.normalizedHeadword),
    };
  });

  return {
    content: publicContent,
    estimatedMinutes: lesson.estimatedMinutes,
    id: lesson._id.toString(),
    grammarTopics,
    level: lesson.level,
    objectiveVi: lesson.objectiveVi,
    progress: progressOrDefault(progress ?? undefined),
    slug: lesson.slug,
    titleDe: lesson.titleDe,
    titleVi: lesson.titleVi,
    vocabulary,
  };
}

function validateProgress(
  input: LessonProgressInput,
  activityIds: string[],
  completedBefore: number,
) {
  const completed = input.completedActivityIds;
  const expectedPrefix = activityIds.slice(0, completed.length);
  if (
    new Set(completed).size !== completed.length ||
    completed.some((id, index) => id !== expectedPrefix[index])
  ) {
    throw new LessonProgressConflictError(
      "Activities must be completed in lesson order.",
    );
  }
  if (completed.length < completedBefore) {
    throw new LessonProgressConflictError(
      "Lesson progress cannot move backward.",
    );
  }
  const isComplete = completed.length === activityIds.length;
  const expectedIndex = isComplete
    ? activityIds.length
    : Math.min(completed.length, Math.max(activityIds.length - 1, 0));
  const expectedStatus = isComplete
    ? "completed"
    : completed.length > 0
      ? "in_progress"
      : "not_started";
  if (
    input.currentActivityIndex !== expectedIndex ||
    input.status !== expectedStatus
  ) {
    throw new LessonProgressConflictError(
      "Progress state does not match completed activities.",
    );
  }
}

export async function updateLessonProgress({
  input,
  lessonId,
  now = new Date(),
  userId,
}: {
  input: LessonProgressInput;
  lessonId: string;
  now?: Date;
  userId: string;
}) {
  assertUserId(userId);
  const validated = lessonProgressInputSchema.parse(input);
  const lesson = await findPublishedLessonById(lessonId);
  if (!lesson) throw new LessonNotFoundError();
  const content = lessonContentSchema.parse(lesson.content);
  const [existing, hasIncompletePrerequisite] = await Promise.all([
    findLessonProgressForUser(userId, lessonId),
    hasIncompletePublishedPrerequisites({ lesson, userId }),
  ]);
  if (hasIncompletePrerequisite) {
    throw new LessonProgressConflictError(
      "Complete the preceding lesson before starting this lesson.",
    );
  }
  validateProgress(
    validated,
    content.activities.map((activity) => activity.id),
    existing?.completedActivityIds.length ?? 0,
  );
  const progress = await upsertLessonProgressForUser({
    input: validated,
    lessonId,
    now,
    userId,
  });
  return {
    completedActivityIds: progress.completedActivityIds,
    currentActivityIndex: progress.currentActivityIndex,
    status: progress.status,
    updatedAt: progress.updatedAt.toISOString(),
  };
}

export async function saveLessonVocabulary({
  headword,
  lessonId,
  now = new Date(),
  userId,
}: {
  headword: string;
  lessonId: string;
  now?: Date;
  userId: string;
}) {
  assertUserId(userId);
  const normalizedHeadword = normalizeGermanHeadword(headword);
  const database = await connectToDatabase();
  const session = await database.startSession();
  let response:
    | { status: "created" | "linked"; word: { headword: string; id: string } }
    | undefined;

  try {
    await session.withTransaction(async () => {
      const lesson = await findPublishedLessonById(lessonId, session);
      if (!lesson) throw new LessonNotFoundError();
      const seed = lesson.vocabularySeed
        .map((raw) => vocabularySeedItemSchema.parse(raw))
        .find((item) => item.normalizedHeadword === normalizedHeadword);
      if (!seed) throw new LessonVocabularyNotFoundError();
      const set = await findOrCreateLessonVocabularySet(
        userId,
        lesson,
        session,
      );
      const existing = await findActiveVocabularyWordByNormalizedHeadword(
        userId,
        normalizedHeadword,
        session,
      );
      if (existing) {
        const linked = await attachLessonSourceToVocabularyWord(
          userId,
          existing._id,
          lesson._id,
          set._id,
          session,
        );
        if (!linked)
          throw new Error("Vocabulary word disappeared while linking.");
        response = {
          status: "linked",
          word: { headword: linked.headword, id: linked._id.toString() },
        };
        return;
      }

      const word = await createVocabularyWordRecord(
        userId,
        {
          ...seed,
          setIds: [set._id.toString()],
          sourceLessonId: lesson._id.toString(),
        },
        session,
      );
      await createInitialReviewState(
        { dueAt: now, userId, wordId: word._id },
        session,
      );
      response = {
        status: "created",
        word: { headword: word.headword, id: word._id.toString() },
      };
    });
  } finally {
    await session.endSession();
  }
  if (!response) throw new Error("Lesson vocabulary save produced no result.");
  return response;
}

export async function getDashboard({
  now = new Date(),
  userId,
}: {
  now?: Date;
  userId: string;
}) {
  assertUserId(userId);
  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  weekStart.setUTCHours(0, 0, 0, 0);
  const [
    path,
    dueCount,
    dueCandidates,
    nextDueAt,
    lessonActivities,
    reviewActivities,
    weeklyCompleted,
  ] = await Promise.all([
    getLearningPath({ level: "A1", now, userId }),
    countDueReviewStates(userId, now),
    queryDueReviewCandidates({ limit: 3, now, userId }),
    findNextReviewDueAt(userId),
    queryRecentLessonActivities(userId),
    queryRecentReviewActivities(userId),
    countWeeklyLearningActivity(userId, weekStart),
  ]);
  const recentActivity = [...lessonActivities, ...reviewActivities]
    .sort((left, right) => right.at.getTime() - left.at.getTime())
    .slice(0, 5)
    .map((activity) => ({ ...activity, at: activity.at.toISOString() }));
  const a1Progress = summarizeLearningPath(path);

  return {
    due: {
      count: dueCount,
      nextDueAt: nextDueAt?.toISOString(),
      words: dueCandidates.slice(0, 3).map((candidate) => ({
        article: candidate.word.article,
        headword: candidate.word.headword,
        meaningsVi: candidate.word.meaningsVi,
        plural: candidate.word.plural,
      })),
    },
    milestone:
      a1Progress.totalLessons > 0
        ? {
            completedLessons: a1Progress.completedLessons,
            titleDe: "A1",
            titleVi: "Lộ trình A1",
            totalLessons: a1Progress.totalLessons,
          }
        : undefined,
    nextLesson: path.nextLesson,
    practicalGoal: {
      de: "Sich höflich vorstellen und einen Termin vereinbaren",
      vi: "Tự giới thiệu lịch sự và đặt một cuộc hẹn bằng tiếng Đức.",
    },
    recentActivity,
    weeklyGoal: {
      completed: Math.min(weeklyCompleted, 5),
      target: 5,
    },
  };
}
