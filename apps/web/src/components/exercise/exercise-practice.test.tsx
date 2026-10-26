import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PublicExercise } from "@lingo-deutsch/shared";
import { ExercisePractice } from "./exercise-practice";

const exercises: PublicExercise[] = [
  {
    feedbackCorrectVi: "Đúng: Sie dùng trong tình huống trang trọng.",
    feedbackIncorrectVi: "Hãy dùng Sie.",
    id: "formal-address",
    instructionVi: "Chọn đại từ phù hợp.",
    options: [
      { id: "informal", text: "du" },
      { id: "formal", text: "Sie" },
    ],
    promptDe: "Wie heißen ___?",
    type: "multiple_choice",
  },
  {
    feedbackCorrectVi: "Đúng: động từ heißen đi với Sie.",
    feedbackIncorrectVi: "Giữ nguyên chữ ß.",
    id: "fill-heissen",
    instructionVi: "Điền động từ.",
    promptDe: "Wie ___ Sie?",
    type: "fill_blank",
  },
  {
    feedbackCorrectVi: "Đúng trật tự câu hỏi.",
    feedbackIncorrectVi: "Từ để hỏi đứng đầu.",
    id: "order-question",
    instructionVi: "Sắp xếp câu.",
    tokens: [
      { id: "sie", text: "Sie" },
      { id: "wie", text: "Wie" },
      { id: "heissen", text: "heißen" },
    ],
    type: "word_ordering",
  },
];

afterEach(() => vi.unstubAllGlobals());

describe("ExercisePractice", () => {
  it("completes all three types, submits once, and shows exact feedback", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        attempt: {
          attemptEventId: "attempt-ui-test-0001",
          completedAt: "2026-10-26T08:00:00.000Z",
          id: "attempt-1",
          incorrectExerciseIds: [],
          score: 3,
          sourceId: "000000000000000000000101",
          sourceType: "lesson",
          total: 3,
        },
        idempotent: false,
        results: exercises.map((exercise) => ({
          correct: true,
          exerciseId: exercise.id,
          feedbackVi: exercise.feedbackCorrectVi,
          type: exercise.type,
        })),
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(
      <ExercisePractice
        exercises={exercises}
        sourceId="000000000000000000000101"
        sourceType="lesson"
        title="Luyện tập lịch hẹn"
      />,
    );

    expect(screen.queryByText(/Đúng:/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sie" }));
    await user.click(screen.getByRole("button", { name: "Câu tiếp theo" }));
    await user.type(
      screen.getByRole("textbox", { name: "Câu trả lời" }),
      "heißen",
    );
    await user.click(screen.getByRole("button", { name: "Câu tiếp theo" }));

    const addWie = screen.getByRole("button", { name: "Thêm Wie" });
    addWie.focus();
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: "Thêm heißen" }));
    await user.click(screen.getByRole("button", { name: "Thêm Sie" }));
    expect(
      screen.getByRole("status", { name: "Thứ tự hiện tại" }),
    ).toHaveTextContent("Wie heißen Sie");
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));

    expect(
      await screen.findByRole("heading", { name: "Kết quả 3/3" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^Đúng$/)).toHaveLength(3);
    expect(screen.getByText("Đúng trật tự câu hỏi.")).toBeInTheDocument();
    await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
    const [, init] = fetcher.mock.calls[0]!;
    const payload = JSON.parse(String(init?.body));
    expect(payload).not.toHaveProperty("userId");
    expect(payload.answers).toHaveLength(3);
  });

  it("supports retry with a clean answer state and a new attempt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          attempt: { score: 0, total: 1 },
          idempotent: false,
          results: [
            {
              correct: false,
              exerciseId: "formal-address",
              feedbackVi: "Hãy dùng Sie.",
              type: "multiple_choice",
            },
          ],
        }),
      ),
    );
    const user = userEvent.setup();
    render(
      <ExercisePractice
        exercises={[exercises[0]!]}
        sourceId="000000000000000000000101"
        sourceType="lesson"
        title="Luyện tập"
      />,
    );

    await user.click(screen.getByRole("button", { name: "du" }));
    await user.click(screen.getByRole("button", { name: "Nộp bài" }));
    expect(
      await screen.findByRole("heading", { name: "Kết quả 0/1" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Làm lại" }));

    expect(screen.getByRole("button", { name: "du" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.queryByText("Hãy dùng Sie.")).not.toBeInTheDocument();
  });
});
