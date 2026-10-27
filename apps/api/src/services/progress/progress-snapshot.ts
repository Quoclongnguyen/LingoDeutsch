type ProgressStatus = "not_started" | "in_progress" | "completed";

type ProgressPath = {
  level: string;
  modules: Array<{
    completedLessons: number;
    lessons: Array<{
      objectiveVi: string;
      progress: { status: ProgressStatus; updatedAt?: string };
      slug: string;
      titleDe: string;
      titleVi: string;
    }>;
    moduleOrder: number;
    titleDe: string;
    titleVi: string;
    totalLessons: number;
  }>;
  nextLesson?: {
    slug: string;
    titleDe: string;
    titleVi: string;
  };
};

type CountByDate = { count: number; date: string };

export type ProgressSnapshotInput = {
  exercise: {
    attempts: number;
    correctAnswers: number;
    days: CountByDate[];
    recent: Array<{
      completedAt: Date;
      score: number;
      sourceTitleDe: string;
      sourceType: "lesson" | "grammar_topic";
      total: number;
    }>;
    totalAnswers: number;
  };
  lessonDays: CountByDate[];
  now: Date;
  path: ProgressPath;
  reviewHistory: {
    days: CountByDate[];
    difficultReviews: number;
    totalReviews: number;
  };
  vocabulary: {
    dueWords: number;
    masteredWords: number;
    reviewedWords: number;
    totalWords: number;
  };
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function countMap(items: CountByDate[]) {
  return new Map(items.map((item) => [item.date, item.count]));
}

export function summarizeLearningPath(path: ProgressPath) {
  const lessons = path.modules.flatMap((module) => module.lessons);
  return {
    completedLessons: lessons.filter(
      (lesson) => lesson.progress.status === "completed",
    ).length,
    inProgressLessons: lessons.filter(
      (lesson) => lesson.progress.status === "in_progress",
    ).length,
    modules: path.modules.map((module) => ({
      completedLessons: module.completedLessons,
      moduleOrder: module.moduleOrder,
      titleDe: module.titleDe,
      titleVi: module.titleVi,
      totalLessons: module.totalLessons,
    })),
    nextLesson: path.nextLesson
      ? {
          slug: path.nextLesson.slug,
          titleDe: path.nextLesson.titleDe,
          titleVi: path.nextLesson.titleVi,
        }
      : undefined,
    totalLessons: lessons.length,
  };
}

export function buildProgressSnapshot(input: ProgressSnapshotInput) {
  const lessonCounts = countMap(input.lessonDays);
  const reviewCounts = countMap(input.reviewHistory.days);
  const exerciseCounts = countMap(input.exercise.days);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(input.now);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const key = dateKey(date);
    return {
      date: key,
      exerciseAttempts: exerciseCounts.get(key) ?? 0,
      lessonUpdates: lessonCounts.get(key) ?? 0,
      reviews: reviewCounts.get(key) ?? 0,
    };
  });

  return {
    activity: {
      activeDays: days.filter(
        (day) => day.exerciseAttempts + day.lessonUpdates + day.reviews > 0,
      ).length,
      days,
    },
    completedOutcomes: input.path.modules
      .flatMap((module) => module.lessons)
      .filter((lesson) => lesson.progress.status === "completed")
      .slice(0, 8)
      .map((lesson) => ({
        completedAt: lesson.progress.updatedAt,
        objectiveVi: lesson.objectiveVi,
        slug: lesson.slug,
        titleDe: lesson.titleDe,
        titleVi: lesson.titleVi,
      })),
    generatedAt: input.now.toISOString(),
    learning: summarizeLearningPath(input.path),
    practice: {
      attempts: input.exercise.attempts,
      correctAnswers: input.exercise.correctAnswers,
      recent: input.exercise.recent.map((attempt) => ({
        ...attempt,
        completedAt: attempt.completedAt.toISOString(),
      })),
      totalAnswers: input.exercise.totalAnswers,
    },
    reviews: {
      difficultReviews: input.reviewHistory.difficultReviews,
      totalReviews: input.reviewHistory.totalReviews,
    },
    vocabulary: input.vocabulary,
  };
}
