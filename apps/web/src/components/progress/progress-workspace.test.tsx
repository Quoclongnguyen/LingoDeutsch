import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProgressWorkspace } from "./progress-workspace";

afterEach(() => vi.unstubAllGlobals());

const populatedProgress = {
  activity: {
    activeDays: 2,
    days: [
      {
        date: "2026-10-26",
        exerciseAttempts: 1,
        lessonUpdates: 1,
        reviews: 3,
      },
      {
        date: "2026-10-27",
        exerciseAttempts: 0,
        lessonUpdates: 0,
        reviews: 1,
      },
    ],
  },
  completedOutcomes: [
    {
      objectiveVi: "Tự giới thiệu lịch sự.",
      slug: "a1-begruessung-und-vorstellung",
      titleDe: "Begrüßung und Vorstellung",
      titleVi: "Chào hỏi và giới thiệu",
    },
  ],
  generatedAt: "2026-10-27T09:00:00.000Z",
  learning: {
    completedLessons: 1,
    inProgressLessons: 1,
    modules: [
      {
        completedLessons: 1,
        moduleOrder: 1,
        titleDe: "Ankommen und vorstellen",
        titleVi: "Làm quen và giới thiệu",
        totalLessons: 2,
      },
    ],
    nextLesson: {
      slug: "a1-uhrzeit-und-termine",
      titleDe: "Uhrzeit und Termine",
      titleVi: "Giờ giấc và lịch hẹn",
    },
    totalLessons: 3,
  },
  practice: {
    attempts: 2,
    correctAnswers: 5,
    recent: [
      {
        completedAt: "2026-10-26T08:00:00.000Z",
        score: 3,
        sourceTitleDe: "Uhrzeit und Termine",
        sourceType: "lesson",
        total: 4,
      },
    ],
    totalAnswers: 7,
  },
  reviews: { difficultReviews: 1, totalReviews: 4 },
  vocabulary: {
    dueWords: 2,
    masteredWords: 1,
    reviewedWords: 3,
    totalWords: 5,
  },
};

describe("ProgressWorkspace", () => {
  it("renders evidence-backed learning, review, and exercise progress", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(populatedProgress)),
    );

    render(<ProgressWorkspace />);

    expect(
      await screen.findByRole("heading", { name: "Tiến độ", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("1/3 bài A1")).toBeInTheDocument();
    expect(screen.getByText("3 từ đã ôn")).toBeInTheDocument();
    expect(screen.getByText("5/7 câu đúng")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Tiếp tục Uhrzeit und Termine/i }),
    ).toHaveAttribute("href", "/learn/a1-uhrzeit-und-termine");
  });

  it("shows a useful zero-evidence state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          ...populatedProgress,
          activity: { activeDays: 0, days: [] },
          completedOutcomes: [],
          learning: {
            completedLessons: 0,
            inProgressLessons: 0,
            modules: [],
            totalLessons: 0,
          },
          practice: {
            attempts: 0,
            correctAnswers: 0,
            recent: [],
            totalAnswers: 0,
          },
          reviews: { difficultReviews: 0, totalReviews: 0 },
          vocabulary: {
            dueWords: 0,
            masteredWords: 0,
            reviewedWords: 0,
            totalWords: 0,
          },
        }),
      ),
    );

    render(<ProgressWorkspace />);

    expect(
      await screen.findByText("Chưa có bằng chứng học tập"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Mở lộ trình A1" }),
    ).toHaveAttribute("href", "/learn");
  });

  it("treats saved vocabulary as progress evidence before the first review", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          ...populatedProgress,
          activity: { activeDays: 0, days: [] },
          completedOutcomes: [],
          learning: {
            completedLessons: 0,
            inProgressLessons: 0,
            modules: [],
            totalLessons: 0,
          },
          practice: {
            attempts: 0,
            correctAnswers: 0,
            recent: [],
            totalAnswers: 0,
          },
          reviews: { difficultReviews: 0, totalReviews: 0 },
          vocabulary: {
            dueWords: 1,
            masteredWords: 0,
            reviewedWords: 0,
            totalWords: 1,
          },
        }),
      ),
    );

    render(<ProgressWorkspace />);

    expect(
      await screen.findByRole("heading", { name: "Tiến độ", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Đã lưu")).toBeInTheDocument();
    expect(
      screen.queryByText("Chưa có bằng chứng học tập"),
    ).not.toBeInTheDocument();
  });

  it("shows a recoverable message when progress cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { message: "Dịch vụ học tập đang tạm thời không phản hồi." },
          { status: 503 },
        ),
      ),
    );

    render(<ProgressWorkspace />);

    expect(await screen.findByText("Chưa thể tải tiến độ")).toBeInTheDocument();
    expect(
      screen.getByText(/Dịch vụ học tập đang tạm thời không phản hồi/),
    ).toBeInTheDocument();
  });
});
