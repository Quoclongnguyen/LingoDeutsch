import { describe, expect, it } from "vitest";

import {
  buildLearningPath,
  type LearningPathLessonRecord,
} from "./learning-path";

const baseLessons: LearningPathLessonRecord[] = [
  {
    dueCount: 2,
    estimatedMinutes: 15,
    id: "lesson-1",
    lessonOrder: 1,
    moduleOrder: 1,
    objectiveVi: "Tự giới thiệu lịch sự.",
    progress: { currentActivityIndex: 0, status: "not_started" },
    slug: "lesson-1",
    titleDe: "Begrüßung und Vorstellung",
    titleVi: "Chào hỏi và giới thiệu",
    vocabularyCount: 10,
  },
  {
    dueCount: 0,
    estimatedMinutes: 18,
    id: "lesson-2",
    lessonOrder: 2,
    moduleOrder: 1,
    objectiveVi: "Đặt lịch hẹn cơ bản.",
    progress: { currentActivityIndex: 0, status: "not_started" },
    slug: "lesson-2",
    titleDe: "Uhrzeit und Termine",
    titleVi: "Giờ giấc và lịch hẹn",
    vocabularyCount: 10,
  },
];

describe("buildLearningPath", () => {
  it("unlocks only the first unfinished lesson and marks it as next", () => {
    const path = buildLearningPath("A1", baseLessons);

    expect(path.modules[0]?.lessons).toMatchObject([
      { isLocked: false, isNext: true },
      { isLocked: true, isNext: false },
    ]);
    expect(path.nextLesson?.id).toBe("lesson-1");
  });

  it("unlocks the following lesson after its prerequisite is complete", () => {
    const lessons = structuredClone(baseLessons);
    lessons[0]!.progress.status = "completed";

    const path = buildLearningPath("A1", lessons);

    expect(path.modules[0]?.lessons).toMatchObject([
      { isLocked: false, isNext: false },
      { isLocked: false, isNext: true },
    ]);
    expect(path.modules[0]?.completedLessons).toBe(1);
  });
});
