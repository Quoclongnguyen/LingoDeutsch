import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ExerciseSourceWorkspace } from "./exercise-source-workspace";

const exercise = {
  feedbackCorrectVi: "Đúng.",
  feedbackIncorrectVi: "Thử lại.",
  id: "formal-address",
  instructionVi: "Chọn đáp án.",
  options: [
    { id: "du", text: "du" },
    { id: "sie", text: "Sie" },
  ],
  promptDe: "Wie heißen ___?",
  type: "multiple_choice",
};

afterEach(() => vi.unstubAllGlobals());

describe("ExerciseSourceWorkspace", () => {
  it("shows loading instead of stale exercises when the source changes", async () => {
    let resolveSecond!: (response: Response) => void;
    const secondResponse = new Promise<Response>((resolve) => {
      resolveSecond = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>((input) => {
        if (String(input).includes("topic-b")) return secondResponse;
        return Promise.resolve(
          Response.json({
            exercises: [exercise],
            id: "000000000000000000000301",
            titleDe: "Thema A",
          }),
        );
      }),
    );

    const { container, rerender } = render(
      <ExerciseSourceWorkspace slug="topic-a" sourceType="grammar_topic" />,
    );
    expect(
      (await screen.findAllByText("Luyện ngữ pháp: Thema A"))[0],
    ).toBeVisible();

    rerender(
      <ExerciseSourceWorkspace slug="topic-b" sourceType="grammar_topic" />,
    );

    expect(screen.queryAllByText("Luyện ngữ pháp: Thema A")).toHaveLength(0);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    resolveSecond(
      Response.json({
        exercises: [exercise],
        id: "000000000000000000000302",
        titleDe: "Thema B",
      }),
    );
    expect(
      (await screen.findAllByText("Luyện ngữ pháp: Thema B"))[0],
    ).toBeVisible();
  });
});
