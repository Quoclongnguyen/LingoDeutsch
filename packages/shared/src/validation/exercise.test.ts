import { describe, expect, it } from "vitest";

import {
  exerciseAttemptListQuerySchema,
  internalExerciseSchema,
  submitExerciseAttemptSchema,
  toPublicExercise,
} from "./exercise";

const exercises = [
  {
    correctOptionId: "formal",
    feedbackCorrectVi: "Đúng: Sie dùng trong tình huống trang trọng.",
    feedbackIncorrectVi: "Hãy dùng đại từ Sie trong tình huống trang trọng.",
    id: "formal-address",
    instructionVi: "Chọn đại từ phù hợp.",
    options: [
      { id: "informal", text: "du" },
      { id: "formal", text: "Sie" },
    ],
    promptDe: "Wie heißen ___?",
    type: "multiple_choice" as const,
  },
  {
    acceptedAnswers: ["heißen"],
    caseSensitive: false,
    feedbackCorrectVi: "Đúng: động từ heißen đi với Sie.",
    feedbackIncorrectVi: "Giữ nguyên chữ ß trong heißen.",
    id: "fill-heissen",
    instructionVi: "Điền động từ còn thiếu.",
    promptDe: "Wie ___ Sie?",
    type: "fill_blank" as const,
  },
  {
    correctOrder: ["wie", "heissen", "sie"],
    feedbackCorrectVi: "Đúng trật tự câu hỏi W-Frage.",
    feedbackIncorrectVi: "Từ để hỏi đứng đầu, sau đó là động từ.",
    id: "order-question",
    instructionVi: "Sắp xếp thành câu hỏi.",
    tokens: [
      { id: "sie", text: "Sie" },
      { id: "wie", text: "Wie" },
      { id: "heissen", text: "heißen" },
    ],
    type: "word_ordering" as const,
  },
];

describe("exercise contracts", () => {
  it.each(exercises)("accepts the $type stored exercise", (exercise) => {
    expect(internalExerciseSchema.parse(exercise)).toEqual(exercise);
  });

  it("creates public DTOs without any grading key", () => {
    const publicExercises = exercises.map((exercise) =>
      toPublicExercise(internalExerciseSchema.parse(exercise)),
    );

    expect(JSON.stringify(publicExercises)).not.toMatch(
      /correctOptionId|acceptedAnswers|correctOrder/,
    );
    expect(publicExercises.map((exercise) => exercise.type)).toEqual([
      "multiple_choice",
      "fill_blank",
      "word_ordering",
    ]);
  });

  it("rejects unsupported exercise types and client-owned user ids", () => {
    expect(
      internalExerciseSchema.safeParse({
        ...exercises[0],
        type: "free_form",
      }).success,
    ).toBe(false);

    expect(
      submitExerciseAttemptSchema.safeParse({
        answers: [],
        attemptEventId: "attempt-event-contract-0001",
        sourceId: "000000000000000000000101",
        sourceType: "lesson",
        userId: "000000000000000000000999",
      }).success,
    ).toBe(false);
  });

  it("bounds attempt history queries", () => {
    expect(
      exerciseAttemptListQuerySchema.parse({
        limit: "200",
        sourceId: "000000000000000000000101",
        sourceType: "lesson",
      }),
    ).toMatchObject({ limit: 50 });
  });
});
