import { z } from "zod";

const stableIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
  .max(120);
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/iu);
const learnerTextSchema = z.string().trim().min(1).max(500);

const optionSchema = z.object({
  id: stableIdSchema,
  text: learnerTextSchema,
});

const tokenSchema = z.object({
  id: stableIdSchema,
  text: learnerTextSchema,
});

const sharedExerciseFields = {
  feedbackCorrectVi: learnerTextSchema,
  feedbackIncorrectVi: learnerTextSchema,
  id: stableIdSchema,
  instructionVi: learnerTextSchema,
};

export const multipleChoiceExerciseSchema = z
  .object({
    ...sharedExerciseFields,
    correctOptionId: stableIdSchema,
    options: z.array(optionSchema).min(2).max(6),
    promptDe: learnerTextSchema,
    type: z.literal("multiple_choice"),
  })
  .superRefine((exercise, context) => {
    const optionIds = exercise.options.map((option) => option.id);
    if (new Set(optionIds).size !== optionIds.length) {
      context.addIssue({
        code: "custom",
        message: "Option ids must be unique.",
        path: ["options"],
      });
    }
    if (!optionIds.includes(exercise.correctOptionId)) {
      context.addIssue({
        code: "custom",
        message: "The correct option must exist in options.",
        path: ["correctOptionId"],
      });
    }
  });

export const fillBlankExerciseSchema = z.object({
  ...sharedExerciseFields,
  acceptedAnswers: z.array(learnerTextSchema).min(1).max(8),
  caseSensitive: z.boolean(),
  promptDe: learnerTextSchema.refine((prompt) => prompt.includes("___"), {
    message: "Fill-blank prompts must contain ___.",
  }),
  type: z.literal("fill_blank"),
});

export const wordOrderingExerciseSchema = z
  .object({
    ...sharedExerciseFields,
    correctOrder: z.array(stableIdSchema).min(2).max(16),
    tokens: z.array(tokenSchema).min(2).max(16),
    type: z.literal("word_ordering"),
  })
  .superRefine((exercise, context) => {
    const tokenIds = exercise.tokens.map((token) => token.id);
    if (new Set(tokenIds).size !== tokenIds.length) {
      context.addIssue({
        code: "custom",
        message: "Token ids must be unique.",
        path: ["tokens"],
      });
    }
    if (
      exercise.correctOrder.length !== tokenIds.length ||
      exercise.correctOrder.some((id) => !tokenIds.includes(id)) ||
      new Set(exercise.correctOrder).size !== exercise.correctOrder.length
    ) {
      context.addIssue({
        code: "custom",
        message: "The correct order must contain every token exactly once.",
        path: ["correctOrder"],
      });
    }
  });

export const internalExerciseSchema = z.discriminatedUnion("type", [
  multipleChoiceExerciseSchema,
  fillBlankExerciseSchema,
  wordOrderingExerciseSchema,
]);

export const publicExerciseSchema = z.discriminatedUnion("type", [
  z.object({
    ...sharedExerciseFields,
    options: z.array(optionSchema).min(2).max(6),
    promptDe: learnerTextSchema,
    type: z.literal("multiple_choice"),
  }),
  z.object({
    ...sharedExerciseFields,
    promptDe: learnerTextSchema,
    type: z.literal("fill_blank"),
  }),
  z.object({
    ...sharedExerciseFields,
    tokens: z.array(tokenSchema).min(2).max(16),
    type: z.literal("word_ordering"),
  }),
]);

export const exerciseAnswerSchema = z.discriminatedUnion("type", [
  z.object({
    answer: stableIdSchema,
    exerciseId: stableIdSchema,
    type: z.literal("multiple_choice"),
  }),
  z.object({
    answer: z.string().max(500),
    exerciseId: stableIdSchema,
    type: z.literal("fill_blank"),
  }),
  z.object({
    answer: z.array(stableIdSchema).min(2).max(16),
    exerciseId: stableIdSchema,
    type: z.literal("word_ordering"),
  }),
]);

export const exerciseSourceTypes = ["lesson", "grammar_topic"] as const;

export const submitExerciseAttemptSchema = z
  .object({
    answers: z.array(exerciseAnswerSchema).min(1).max(50),
    attemptEventId: z.string().trim().min(16).max(120),
    sourceId: objectIdSchema,
    sourceType: z.enum(exerciseSourceTypes),
  })
  .strict();

export const exerciseAttemptListQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .transform((limit) => Math.min(limit, 50))
    .default(20),
  sourceId: objectIdSchema,
  sourceType: z.enum(exerciseSourceTypes),
});

export function toPublicExercise(exercise: InternalExercise): PublicExercise {
  return publicExerciseSchema.parse(exercise);
}

export type ExerciseAnswer = z.output<typeof exerciseAnswerSchema>;
export type ExerciseSourceType = (typeof exerciseSourceTypes)[number];
export type InternalExercise = z.output<typeof internalExerciseSchema>;
export type PublicExercise = z.output<typeof publicExerciseSchema>;
export type SubmitExerciseAttempt = z.output<
  typeof submitExerciseAttemptSchema
>;
