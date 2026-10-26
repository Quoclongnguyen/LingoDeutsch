type LessonProgressStatus = "not_started" | "in_progress" | "completed";

export type LearningPathLessonRecord = {
  dueCount: number;
  estimatedMinutes: number;
  id: string;
  lessonOrder: number;
  moduleOrder: number;
  objectiveVi: string;
  progress: {
    currentActivityIndex: number;
    status: LessonProgressStatus;
  };
  slug: string;
  titleDe: string;
  titleVi: string;
  vocabularyCount: number;
};

const moduleCopy: Record<
  number,
  { descriptionVi: string; outcomeVi: string; titleDe: string; titleVi: string }
> = {
  1: {
    descriptionVi: "Ngôn ngữ nền tảng cho những cuộc gặp và lịch hẹn đầu tiên.",
    outcomeVi: "Tự giới thiệu lịch sự và sắp xếp một cuộc hẹn đơn giản.",
    titleDe: "Ankommen und vorstellen",
    titleVi: "Làm quen và giới thiệu",
  },
  2: {
    descriptionVi: "Từ siêu thị đến những trao đổi đầu tiên về công việc.",
    outcomeVi: "Mua sắm thiết yếu và nói ngắn gọn về nghề nghiệp.",
    titleDe: "Alltag und Arbeit",
    titleVi: "Đời sống và công việc",
  },
};

export function buildLearningPath(
  level: string,
  lessonRecords: LearningPathLessonRecord[],
) {
  const ordered = [...lessonRecords].sort(
    (left, right) =>
      left.moduleOrder - right.moduleOrder ||
      left.lessonOrder - right.lessonOrder,
  );
  let prerequisitesComplete = true;
  let nextLesson:
    | (LearningPathLessonRecord & { isLocked: boolean; isNext: boolean })
    | undefined;

  const lessons = ordered.map((lesson) => {
    const isLocked = !prerequisitesComplete;
    const isNext =
      !isLocked && lesson.progress.status !== "completed" && !nextLesson;
    const view = { ...lesson, isLocked, isNext };
    if (isNext) nextLesson = view;
    prerequisitesComplete &&= lesson.progress.status === "completed";
    return view;
  });

  const moduleOrders = [
    ...new Set(lessons.map((lesson) => lesson.moduleOrder)),
  ];
  const modules = moduleOrders.map((moduleOrder) => {
    const moduleLessons = lessons.filter(
      (lesson) => lesson.moduleOrder === moduleOrder,
    );
    const completedLessons = moduleLessons.filter(
      (lesson) => lesson.progress.status === "completed",
    ).length;
    const copy = moduleCopy[moduleOrder] ?? {
      descriptionVi: "Bài học theo lộ trình CEFR.",
      outcomeVi: "Hoàn thành các tình huống giao tiếp trong module.",
      titleDe: `Modul ${moduleOrder}`,
      titleVi: `Module ${moduleOrder}`,
    };

    return {
      ...copy,
      completedLessons,
      dueCount: moduleLessons.reduce((sum, lesson) => sum + lesson.dueCount, 0),
      estimatedMinutes: moduleLessons.reduce(
        (sum, lesson) => sum + lesson.estimatedMinutes,
        0,
      ),
      lessons: moduleLessons,
      moduleOrder,
      progressPercent:
        moduleLessons.length === 0
          ? 0
          : Math.round((completedLessons / moduleLessons.length) * 100),
      totalLessons: moduleLessons.length,
      vocabularyCount: moduleLessons.reduce(
        (sum, lesson) => sum + lesson.vocabularyCount,
        0,
      ),
    };
  });

  return { level, modules, nextLesson };
}
