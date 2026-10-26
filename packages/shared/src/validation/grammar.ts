import { z } from "zod";

import { cefrLevels } from "./vocabulary";
import { internalExerciseSchema, publicExerciseSchema } from "./exercise";

const htmlTagPattern = /<\/?[a-z][^>]*>/iu;

function learnerText(max: number) {
  return z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) => !htmlTagPattern.test(value), {
      message: "HTML markup is not allowed.",
    });
}

const stableSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
  .max(120);

export const grammarExampleSchema = z.object({
  de: learnerText(320),
  vi: learnerText(320),
});

export const grammarRuleSchema = z.object({
  explanationVi: learnerText(800),
  id: stableSlugSchema,
  titleDe: learnerText(160),
});

export const grammarCompactTableSchema = z
  .object({
    captionVi: learnerText(240),
    headers: z.array(learnerText(120)).min(2).max(5),
    rows: z
      .array(z.array(learnerText(160)).min(2).max(5))
      .min(1)
      .max(12),
  })
  .superRefine((table, context) => {
    table.rows.forEach((row, index) => {
      if (row.length !== table.headers.length) {
        context.addIssue({
          code: "custom",
          message: "Each table row must match the header width.",
          path: ["rows", index],
        });
      }
    });
  });

export const grammarTopicListQuerySchema = z.object({
  level: z.enum(cefrLevels).default("A1"),
});

export const grammarTopicContentSchema = z.object({
  compactTable: grammarCompactTableSchema.optional(),
  examples: z.array(grammarExampleSchema).min(2).max(12),
  exercises: z.array(internalExerciseSchema).max(24).default([]),
  level: z.enum(cefrLevels),
  order: z.number().int().min(1).max(200),
  published: z.boolean(),
  relatedLessonSlugs: z.array(stableSlugSchema).min(1).max(8),
  rules: z.array(grammarRuleSchema).min(1).max(8),
  slug: stableSlugSchema,
  summaryVi: learnerText(500),
  titleDe: learnerText(160),
  titleVi: learnerText(160),
});

export const grammarTopicSummarySchema = z.object({
  example: grammarExampleSchema.optional(),
  order: z.number().int().min(1),
  relatedLessonCount: z.number().int().min(0),
  slug: stableSlugSchema,
  summaryVi: learnerText(500),
  titleDe: learnerText(160),
  titleVi: learnerText(160),
});

export const grammarTopicListResponseSchema = z.object({
  level: z.enum(cefrLevels),
  topics: z.array(grammarTopicSummarySchema),
});

export const grammarRelatedLessonSchema = z.object({
  slug: stableSlugSchema,
  titleDe: learnerText(160),
  titleVi: learnerText(160),
});

export const grammarTopicDetailSchema = grammarTopicContentSchema
  .omit({ exercises: true, published: true, relatedLessonSlugs: true })
  .extend({
    exercises: z.array(publicExerciseSchema).max(24),
    id: z.string().min(1),
    relatedLessons: z.array(grammarRelatedLessonSchema).max(8),
  });

export type GrammarTopicContent = z.output<typeof grammarTopicContentSchema>;
export type GrammarTopicContentInput = z.input<typeof grammarTopicContentSchema>;
export type GrammarTopicDetail = z.output<typeof grammarTopicDetailSchema>;
export type GrammarTopicListQuery = z.output<
  typeof grammarTopicListQuerySchema
>;
export type GrammarTopicListResponse = z.output<
  typeof grammarTopicListResponseSchema
>;
