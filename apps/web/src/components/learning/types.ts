export type LessonProgress = {
  completedActivityIds: string[];
  currentActivityIndex: number;
  status: "not_started" | "in_progress" | "completed";
  updatedAt?: string;
};

export type LearningPathLesson = {
  dueCount: number;
  estimatedMinutes: number;
  id: string;
  isLocked: boolean;
  isNext: boolean;
  lessonOrder: number;
  moduleOrder: number;
  objectiveVi: string;
  progress: LessonProgress;
  slug: string;
  titleDe: string;
  titleVi: string;
  vocabularyCount: number;
};

export type LearningPathResponse = {
  level: string;
  modules: Array<{
    completedLessons: number;
    descriptionVi: string;
    dueCount: number;
    estimatedMinutes: number;
    lessons: LearningPathLesson[];
    moduleOrder: number;
    outcomeVi: string;
    progressPercent: number;
    titleDe: string;
    titleVi: string;
    totalLessons: number;
    vocabularyCount: number;
  }>;
  nextLesson?: LearningPathLesson;
};

export type LessonVocabulary = {
  article?: string;
  examples: Array<{ de: string; vi?: string }>;
  headword: string;
  isSaved: boolean;
  meaningsVi: string[];
  noPlural: boolean;
  plural?: string;
  wordType: string;
};

export type LessonActivity =
  | {
      id: string;
      instructionVi: string;
      lines: Array<{ de: string; speaker: string; vi: string }>;
      titleDe: string;
      type: "dialogue";
    }
  | {
      headwords: string[];
      id: string;
      instructionVi: string;
      type: "vocabulary";
    }
  | {
      correctOptionId: string;
      feedbackVi: string;
      id: string;
      instructionVi: string;
      options: Array<{ id: string; text: string }>;
      questionDe: string;
      type: "check";
    };

export type LessonResponse = {
  content: { activities: LessonActivity[] };
  estimatedMinutes: number;
  id: string;
  level: string;
  objectiveVi: string;
  progress: LessonProgress;
  slug: string;
  titleDe: string;
  titleVi: string;
  vocabulary: LessonVocabulary[];
};

export type DashboardResponse = {
  due: {
    count: number;
    nextDueAt?: string;
    words: Array<{
      article?: string;
      headword: string;
      meaningsVi: string[];
      plural?: string;
    }>;
  };
  milestone?: {
    completedLessons: number;
    titleDe: string;
    titleVi: string;
    totalLessons: number;
  };
  nextLesson?: Pick<
    LearningPathLesson,
    "estimatedMinutes" | "objectiveVi" | "slug" | "titleDe" | "titleVi"
  >;
  practicalGoal: { de: string; vi: string };
  recentActivity: Array<{
    at: string;
    headword?: string;
    kind: "lesson" | "review";
    rating?: string;
    status?: string;
    titleDe?: string;
    titleVi?: string;
  }>;
  weeklyGoal: { completed: number; target: number };
};
