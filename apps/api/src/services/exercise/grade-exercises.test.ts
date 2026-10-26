import { describe, expect, it } from "vitest";

import type { InternalExercise } from "@lingo-deutsch/shared";
import { gradeExercises } from "./grade-exercises";

const exercises: InternalExercise[] = [
  {
    correctOptionId: "formal",
    feedbackCorrectVi: "Đúng.",
    feedbackIncorrectVi: "Dùng Sie trong tình huống trang trọng.",
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
    acceptedAnswers: ["heißen"],
    caseSensitive: false,
    feedbackCorrectVi: "Đúng.",
    feedbackIncorrectVi: "Giữ nguyên chữ ß trong heißen.",
    id: "fill-heissen",
    instructionVi: "Điền từ.",
    promptDe: "Wie ___ Sie?",
    type: "fill_blank",
  },
  {
    correctOrder: ["wie", "heissen", "sie"],
    feedbackCorrectVi: "Đúng.",
    feedbackIncorrectVi: "Động từ đứng sau từ để hỏi.",
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

describe("gradeExercises", () => {
  it("grades all three approved exercise types and totals exactly", () => {
    const result = gradeExercises(exercises, [
      {
        answer: "formal",
        exerciseId: "formal-address",
        type: "multiple_choice",
      },
      {
        answer: "  HEIẞEN  ",
        exerciseId: "fill-heissen",
        type: "fill_blank",
      },
      {
        answer: ["wie", "heissen", "sie"],
        exerciseId: "order-question",
        type: "word_ordering",
      },
    ]);

    expect(result.score).toBe(3);
    expect(result.total).toBe(3);
    expect(result.incorrectExerciseIds).toEqual([]);
    expect(result.results.every((item) => item.correct)).toBe(true);
  });

  it("preserves umlauts and ß as meaningful German spelling", () => {
    const result = gradeExercises(
      [exercises[1]!],
      [
        {
          answer: "heissen",
          exerciseId: "fill-heissen",
          type: "fill_blank",
        },
      ],
    );

    expect(result.score).toBe(0);
    expect(result.results[0]).toMatchObject({
      correct: false,
      feedbackVi: "Giữ nguyên chữ ß trong heißen.",
    });
  });

  it("rejects missing, duplicate, unknown, and mismatched answers", () => {
    expect(() => gradeExercises(exercises, [])).toThrow(/one answer/i);
    expect(() =>
      gradeExercises(
        [exercises[0]!],
        [
          {
            answer: "formal",
            exerciseId: "formal-address",
            type: "multiple_choice",
          },
          {
            answer: "formal",
            exerciseId: "formal-address",
            type: "multiple_choice",
          },
        ],
      ),
    ).toThrow(/one answer/i);
    expect(() =>
      gradeExercises(
        [exercises[0]!],
        [
          {
            answer: "formal",
            exerciseId: "unknown",
            type: "multiple_choice",
          },
        ],
      ),
    ).toThrow(/one answer/i);
    expect(() =>
      gradeExercises(
        [exercises[0]!],
        [
          {
            answer: "formal",
            exerciseId: "formal-address",
            type: "fill_blank",
          },
        ],
      ),
    ).toThrow(/type/i);
  });
});
