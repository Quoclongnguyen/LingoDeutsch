import { z } from "zod";

import { cefrLevels } from "./vocabulary";
import { internalExerciseSchema, publicExerciseSchema } from "./exercise";

export const learningPathQuerySchema = z.object({
  level: z.enum(cefrLevels).default("A1"),
});

const activityIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

export const lessonActivitySchema = z.discriminatedUnion("type", [
  z.object({
    id: activityIdSchema,
    instructionVi: z.string().trim().min(1).max(320),
    lines: z
      .array(
        z.object({
          de: z.string().trim().min(1).max(320),
          speaker: z.string().trim().min(1).max(80),
          vi: z.string().trim().min(1).max(320),
        }),
      )
      .min(1)
      .max(12),
    titleDe: z.string().trim().min(1).max(160),
    type: z.literal("dialogue"),
  }),
  z.object({
    headwords: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
    id: activityIdSchema,
    instructionVi: z.string().trim().min(1).max(320),
    type: z.literal("vocabulary"),
  }),
  z.object({
    exercises: z.array(internalExerciseSchema).min(1).max(12),
    id: activityIdSchema,
    instructionVi: z.string().trim().min(1).max(320),
    type: z.literal("exercise_set"),
  }),
]);

export const publicLessonActivitySchema = z.discriminatedUnion("type", [
  lessonActivitySchema.options[0],
  lessonActivitySchema.options[1],
  z.object({
    exercises: z.array(publicExerciseSchema).min(1).max(12),
    id: activityIdSchema,
    instructionVi: z.string().trim().min(1).max(320),
    type: z.literal("exercise_set"),
  }),
]);

export const lessonContentSchema = z.object({
  activities: z.array(lessonActivitySchema).max(50),
});

export const lessonProgressStatuses = [
  "not_started",
  "in_progress",
  "completed",
] as const;

export const lessonProgressInputSchema = z.object({
  completedActivityIds: z.array(activityIdSchema).max(50),
  currentActivityIndex: z.number().int().min(0).max(50),
  status: z.enum(lessonProgressStatuses),
});

export const lessonVocabularySaveInputSchema = z.object({
  headword: z.string().trim().min(1).max(120),
});

export type LearningPathQuery = z.output<typeof learningPathQuerySchema>;
export type LessonActivity = z.output<typeof lessonActivitySchema>;
export type PublicLessonActivity = z.output<typeof publicLessonActivitySchema>;
export type LessonContent = z.output<typeof lessonContentSchema>;
export type LessonProgressInput = z.output<typeof lessonProgressInputSchema>;
export type LessonVocabularySaveInput = z.output<
  typeof lessonVocabularySaveInputSchema
>;
