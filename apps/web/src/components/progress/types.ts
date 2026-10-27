export type ProgressResponse = {
  activity: {
    activeDays: number;
    days: Array<{
      date: string;
      exerciseAttempts: number;
      lessonUpdates: number;
      reviews: number;
    }>;
  };
  completedOutcomes: Array<{
    completedAt?: string;
    objectiveVi: string;
    slug: string;
    titleDe: string;
    titleVi: string;
  }>;
  generatedAt: string;
  learning: {
    completedLessons: number;
    inProgressLessons: number;
    modules: Array<{
      completedLessons: number;
      moduleOrder: number;
      titleDe: string;
      titleVi: string;
      totalLessons: number;
    }>;
    nextLesson?: { slug: string; titleDe: string; titleVi: string };
    totalLessons: number;
  };
  practice: {
    attempts: number;
    correctAnswers: number;
    recent: Array<{
      completedAt: string;
      score: number;
      sourceTitleDe: string;
      sourceType: "lesson" | "grammar_topic";
      total: number;
    }>;
    totalAnswers: number;
  };
  reviews: { difficultReviews: number; totalReviews: number };
  vocabulary: {
    dueWords: number;
    masteredWords: number;
    reviewedWords: number;
    totalWords: number;
  };
};
