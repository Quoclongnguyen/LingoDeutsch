import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LearningPathWorkspace } from "./learning-path-workspace";
import { LessonWorkspace } from "./lesson-workspace";
import { TodayDashboard } from "./today-dashboard";

const lessonRecord = {
  content: {
    activities: [
      {
        headwords: ["Name"],
        id: "vocabulary-introduction",
        instructionVi: "Lưu từ để ôn tập.",
        type: "vocabulary",
      },
    ],
  },
  estimatedMinutes: 15,
  id: "000000000000000000000101",
  level: "A1",
  objectiveVi: "Tự giới thiệu lịch sự.",
  progress: {
    completedActivityIds: [],
    currentActivityIndex: 0,
    status: "not_started",
  },
  slug: "a1-begruessung-und-vorstellung",
  titleDe: "Begrüßung und Vorstellung",
  titleVi: "Chào hỏi và giới thiệu",
  vocabulary: [
    {
      article: "der",
      examples: [{ de: "Mein Name ist Long.", vi: "Tên tôi là Long." }],
      headword: "Name",
      isSaved: false,
      level: "A1",
      meaningsVi: ["tên"],
      noPlural: false,
      normalizedHeadword: "name",
      plural: "die Namen",
      wordType: "noun",
    },
  ],
};

afterEach(() => vi.unstubAllGlobals());

describe("Phase 04 learning workspaces", () => {
  it("renders the ordered A1 path and labels locked lessons", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          level: "A1",
          modules: [
            {
              completedLessons: 0,
              descriptionVi: "Ngôn ngữ nền tảng.",
              dueCount: 0,
              estimatedMinutes: 33,
              lessons: [
                {
                  ...lessonRecord,
                  isLocked: false,
                  isNext: true,
                  lessonOrder: 1,
                  moduleOrder: 1,
                  progress: lessonRecord.progress,
                  vocabularyCount: 10,
                },
                {
                  ...lessonRecord,
                  id: "000000000000000000000102",
                  isLocked: true,
                  isNext: false,
                  lessonOrder: 2,
                  moduleOrder: 1,
                  slug: "a1-uhrzeit-und-termine",
                  titleDe: "Uhrzeit und Termine",
                  titleVi: "Giờ giấc và lịch hẹn",
                  vocabularyCount: 10,
                },
              ],
              moduleOrder: 1,
              outcomeVi: "Tự giới thiệu và đặt lịch.",
              progressPercent: 0,
              titleDe: "Ankommen und vorstellen",
              titleVi: "Làm quen và giới thiệu",
              totalLessons: 2,
              vocabularyCount: 20,
            },
          ],
          nextLesson: { slug: lessonRecord.slug },
        }),
      ),
    );

    render(<LearningPathWorkspace />);

    expect(
      await screen.findByRole("heading", { name: "Ankommen und vorstellen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Bắt đầu bài tiếp theo/i }),
    ).toHaveAttribute("href", `/learn/${lessonRecord.slug}`);
    expect(screen.getByText("Đang khóa")).toBeInTheDocument();
  });

  it("saves a word from the lesson and persists the activity progress", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(lessonRecord))
      .mockResolvedValueOnce(
        Response.json({
          status: "created",
          word: { headword: "Name", id: "word" },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          completedActivityIds: ["vocabulary-introduction"],
          currentActivityIndex: 1,
          status: "completed",
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(<LessonWorkspace slug={lessonRecord.slug} />);
    expect(await screen.findByText("der Name · die Namen")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Lưu vào kho từ" }));
    expect(await screen.findByText("Đã lưu vào kho từ")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Hoàn thành bài học" }),
    );
    await waitFor(() =>
      expect(fetcher).toHaveBeenLastCalledWith(
        "/api/domain/lesson-progress/000000000000000000000101",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
  });

  it("replays a completed lesson without writing progress backward", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(
      Response.json({
        ...lessonRecord,
        progress: {
          completedActivityIds: ["vocabulary-introduction"],
          currentActivityIndex: 1,
          status: "completed",
        },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    const { container } = render(
      <LessonWorkspace replay slug={lessonRecord.slug} />,
    );

    expect(await screen.findByText("der Name · die Namen")).toBeInTheDocument();
    expect(
      container.querySelector(".lesson-progress__segments span"),
    ).toHaveAttribute("data-complete", "false");
    await user.click(
      screen.getByRole("button", { name: "Hoàn thành lượt luyện" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Bạn đã luyện lại bài học" }),
    ).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("unlocks lesson progress only after the server grades its exercise set", async () => {
    const exerciseLesson = {
      ...lessonRecord,
      content: {
        activities: [
          {
            exercises: [
              {
                feedbackCorrectVi: "Đúng: Sie là cách xưng hô trang trọng.",
                feedbackIncorrectVi: "Hãy dùng Sie.",
                id: "formal-address",
                instructionVi: "Chọn đại từ phù hợp.",
                options: [
                  { id: "du", text: "du" },
                  { id: "sie", text: "Sie" },
                ],
                promptDe: "Wie heißen ___?",
                type: "multiple_choice",
              },
            ],
            id: "practice-introduction",
            instructionVi: "Luyện cách xưng hô.",
            type: "exercise_set",
          },
        ],
      },
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(exerciseLesson))
      .mockResolvedValueOnce(
        Response.json({
          attempt: { score: 1, total: 1 },
          idempotent: false,
          results: [
            {
              correct: true,
              exerciseId: "formal-address",
              feedbackVi: "Đúng: Sie là cách xưng hô trang trọng.",
              type: "multiple_choice",
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          completedActivityIds: ["practice-introduction"],
          currentActivityIndex: 1,
          status: "completed",
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(<LessonWorkspace slug={exerciseLesson.slug} />);
    const complete = await screen.findByRole("button", {
      name: "Hoàn thành bài học",
    });
    expect(complete).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Sie" }));
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));
    expect(
      await screen.findByRole("heading", { name: "Kết quả 1/1" }),
    ).toBeInTheDocument();
    expect(complete).toBeEnabled();
    await user.click(complete);

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
    expect(fetcher.mock.calls[2]?.[0]).toBe(
      "/api/domain/lesson-progress/000000000000000000000101",
    );
  });

  it("renders the real Today due action and next lesson", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          due: {
            count: 2,
            words: [
              { article: "der", headword: "Termin", meaningsVi: ["cuộc hẹn"] },
            ],
          },
          nextLesson: {
            estimatedMinutes: 15,
            slug: lessonRecord.slug,
            titleDe: lessonRecord.titleDe,
            titleVi: lessonRecord.titleVi,
          },
          practicalGoal: {
            de: "Einen Termin vereinbaren",
            vi: "Đặt một cuộc hẹn bằng tiếng Đức.",
          },
          recentActivity: [],
          weeklyGoal: { completed: 1, target: 5 },
        }),
      ),
    );

    render(<TodayDashboard />);

    expect(
      await screen.findByRole("heading", { name: lessonRecord.titleDe }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ôn 2 từ" })).toHaveAttribute(
      "href",
      "/practice/review",
    );
    expect(screen.getByText("der Termin")).toBeInTheDocument();
  });

  it("retries the Today request without reloading the page", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          { message: "Dịch vụ đang tạm thời gián đoạn." },
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json({
          due: { count: 0, words: [] },
          nextLesson: {
            estimatedMinutes: 15,
            objectiveVi: lessonRecord.objectiveVi,
            slug: lessonRecord.slug,
            titleDe: lessonRecord.titleDe,
            titleVi: lessonRecord.titleVi,
          },
          practicalGoal: {
            de: "Einen Termin vereinbaren",
            vi: "Đặt một cuộc hẹn bằng tiếng Đức.",
          },
          recentActivity: [],
          weeklyGoal: { completed: 0, target: 5 },
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(<TodayDashboard />);

    const retry = await screen.findByRole("button", { name: "Thử lại" });
    await user.click(retry);

    expect(
      await screen.findByRole("heading", { name: lessonRecord.titleDe }),
    ).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("retries the A1 learning path request without reloading the page", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          { message: "Dịch vụ đang tạm thời gián đoạn." },
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json({
          level: "A1",
          modules: [
            {
              completedLessons: 0,
              descriptionVi: "Ngôn ngữ nền tảng.",
              dueCount: 0,
              estimatedMinutes: 15,
              lessons: [
                {
                  ...lessonRecord,
                  isLocked: false,
                  isNext: true,
                  lessonOrder: 1,
                  moduleOrder: 1,
                  vocabularyCount: 10,
                },
              ],
              moduleOrder: 1,
              outcomeVi: "Tự giới thiệu lịch sự.",
              progressPercent: 0,
              titleDe: "Ankommen und vorstellen",
              titleVi: "Làm quen và giới thiệu",
              totalLessons: 1,
              vocabularyCount: 10,
            },
          ],
          nextLesson: { slug: lessonRecord.slug },
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(<LearningPathWorkspace />);

    const retry = await screen.findByRole("button", { name: "Thử lại" });
    await user.click(retry);

    expect(
      await screen.findByRole("heading", { name: "Ankommen und vorstellen" }),
    ).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("retries the lesson request without reloading the page", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          { message: "Dịch vụ đang tạm thời gián đoạn." },
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(Response.json(lessonRecord));
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(<LessonWorkspace slug={lessonRecord.slug} />);

    const retry = await screen.findByRole("button", { name: "Thử lại" });
    await user.click(retry);

    expect(await screen.findByText("der Name · die Namen")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("keeps the lesson visible when saving a word fails", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(lessonRecord))
      .mockResolvedValueOnce(
        Response.json({ message: "Chưa thể lưu từ." }, { status: 503 }),
      );
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(<LessonWorkspace slug={lessonRecord.slug} />);
    await user.click(
      await screen.findByRole("button", { name: "Lưu vào kho từ" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Chưa thể lưu từ.",
    );
    expect(
      screen.getByRole("heading", { name: lessonRecord.titleDe }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Chưa thể mở bài học")).not.toBeInTheDocument();
  });
});
