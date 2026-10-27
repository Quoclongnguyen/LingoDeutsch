import { describe, expect, it } from "vitest";

import { buildProgressSnapshot } from "./progress-snapshot";

describe("buildProgressSnapshot", () => {
  it("reports whole-A1 completion and merges seven days of real evidence", () => {
    const snapshot = buildProgressSnapshot({
      exercise: {
        attempts: 2,
        correctAnswers: 5,
        days: [{ count: 2, date: "2026-10-26" }],
        recent: [
          {
            completedAt: new Date("2026-10-26T08:00:00.000Z"),
            score: 3,
            sourceTitleDe: "Uhrzeit und Termine",
            sourceType: "lesson",
            total: 4,
          },
        ],
        totalAnswers: 7,
      },
      lessonDays: [{ count: 1, date: "2026-10-25" }],
      now: new Date("2026-10-27T09:00:00.000Z"),
      path: {
        level: "A1",
        modules: [
          {
            completedLessons: 1,
            lessons: [
              {
                objectiveVi: "Tự giới thiệu lịch sự.",
                progress: {
                  status: "completed",
                  updatedAt: "2026-10-25T07:00:00.000Z",
                },
                slug: "a1-begruessung-und-vorstellung",
                titleDe: "Begrüßung und Vorstellung",
                titleVi: "Chào hỏi và giới thiệu",
              },
              {
                objectiveVi: "Đặt một cuộc hẹn đơn giản.",
                progress: { status: "in_progress" },
                slug: "a1-uhrzeit-und-termine",
                titleDe: "Uhrzeit und Termine",
                titleVi: "Giờ giấc và lịch hẹn",
              },
            ],
            moduleOrder: 1,
            titleDe: "Ankommen und vorstellen",
            titleVi: "Làm quen và giới thiệu",
            totalLessons: 2,
          },
          {
            completedLessons: 0,
            lessons: [
              {
                objectiveVi: "Mua những đồ thiết yếu.",
                progress: { status: "not_started" },
                slug: "a1-einkaufen-im-supermarkt",
                titleDe: "Einkaufen im Supermarkt",
                titleVi: "Mua sắm ở siêu thị",
              },
            ],
            moduleOrder: 2,
            titleDe: "Alltag und Arbeit",
            titleVi: "Đời sống và công việc",
            totalLessons: 1,
          },
        ],
        nextLesson: {
          slug: "a1-uhrzeit-und-termine",
          titleDe: "Uhrzeit und Termine",
          titleVi: "Giờ giấc và lịch hẹn",
        },
      },
      reviewHistory: {
        days: [
          { count: 3, date: "2026-10-25" },
          { count: 1, date: "2026-10-27" },
        ],
        difficultReviews: 1,
        totalReviews: 4,
      },
      vocabulary: {
        dueWords: 2,
        masteredWords: 1,
        reviewedWords: 3,
        totalWords: 5,
      },
    });

    expect(snapshot.learning).toMatchObject({
      completedLessons: 1,
      inProgressLessons: 1,
      totalLessons: 3,
    });
    expect(snapshot.learning.nextLesson?.slug).toBe("a1-uhrzeit-und-termine");
    expect(snapshot.learning.modules).toHaveLength(2);
    expect(snapshot.completedOutcomes).toEqual([
      expect.objectContaining({ titleDe: "Begrüßung und Vorstellung" }),
    ]);
    expect(snapshot.activity.activeDays).toBe(3);
    expect(snapshot.activity.days).toHaveLength(7);
    expect(snapshot.activity.days.at(-3)).toMatchObject({
      date: "2026-10-25",
      lessonUpdates: 1,
      reviews: 3,
    });
    expect(snapshot.activity.days.at(-2)).toMatchObject({
      date: "2026-10-26",
      exerciseAttempts: 2,
    });
    expect(snapshot.activity.days.at(-1)).toMatchObject({
      date: "2026-10-27",
      reviews: 1,
    });
  });

  it("keeps an evidence-free account exact instead of inventing progress", () => {
    const snapshot = buildProgressSnapshot({
      exercise: {
        attempts: 0,
        correctAnswers: 0,
        days: [],
        recent: [],
        totalAnswers: 0,
      },
      lessonDays: [],
      now: new Date("2026-10-27T09:00:00.000Z"),
      path: { level: "A1", modules: [] },
      reviewHistory: {
        days: [],
        difficultReviews: 0,
        totalReviews: 0,
      },
      vocabulary: {
        dueWords: 0,
        masteredWords: 0,
        reviewedWords: 0,
        totalWords: 0,
      },
    });

    expect(snapshot.learning).toMatchObject({
      completedLessons: 0,
      inProgressLessons: 0,
      totalLessons: 0,
    });
    expect(snapshot.completedOutcomes).toEqual([]);
    expect(snapshot.activity.activeDays).toBe(0);
  });
});
