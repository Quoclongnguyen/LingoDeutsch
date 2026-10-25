import { z } from "zod";

import { normalizeGermanHeadword } from "../vocabulary/normalize-headword";

export const articles = ["der", "die", "das"] as const;
export const cefrLevels = ["A1", "A2", "B1", "B2", "C1"] as const;
export const governedCases = ["Akk", "Dat", "Gen", "Nom"] as const;
export const reviewStates = ["new", "learning", "review", "mastered"] as const;
export const wordTypes = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "other",
] as const;

const requiredText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => requiredText(max).optional();

const vocabularyExampleSchema = z.object({
  de: requiredText(320),
  vi: optionalText(320),
});

const bilingualVocabularyExampleSchema = vocabularyExampleSchema.extend({
  vi: requiredText(320),
});

const grammarSchema = z
  .object({
    reflexive: z.boolean().optional(),
    separable: z.boolean().optional(),
    separablePrefix: optionalText(40),
    governedPreposition: optionalText(40),
    governedCase: z.enum(governedCases).optional(),
    notes: optionalText(500),
  })
  .default({});

const vocabularyBaseSchema = z.object({
  article: z.enum(articles).optional(),
  examples: z.array(vocabularyExampleSchema).max(8).default([]),
  grammar: grammarSchema,
  headword: requiredText(120),
  level: z.enum(cefrLevels).optional(),
  meaningsVi: z.array(requiredText(160)).min(1).max(8),
  noPlural: z.boolean().default(false),
  plural: optionalText(160),
  setIds: z
    .array(z.string().regex(/^[a-f\d]{24}$/i))
    .max(50)
    .default([]),
  sourceLessonId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  wordType: z.enum(wordTypes),
});

type VocabularyBase = z.infer<typeof vocabularyBaseSchema>;

function validateVocabularyMetadata(
  data: VocabularyBase,
  context: z.RefinementCtx,
) {
  if (data.wordType === "noun" && !data.article) {
    context.addIssue({
      code: "custom",
      message: "Danh từ tiếng Đức cần có mạo từ.",
      path: ["article"],
    });
  }

  if (data.plural && data.noPlural) {
    context.addIssue({
      code: "custom",
      message: "Không thể vừa có số nhiều vừa đánh dấu không có số nhiều.",
      path: ["noPlural"],
    });
  }

  if (
    data.wordType !== "noun" &&
    (data.article !== undefined || data.plural !== undefined || data.noPlural)
  ) {
    context.addIssue({
      code: "custom",
      message: "Mạo từ và số nhiều chỉ áp dụng cho danh từ.",
      path: ["wordType"],
    });
  }

  if (data.grammar.separablePrefix && data.wordType !== "verb") {
    context.addIssue({
      code: "custom",
      message: "Tiền tố tách chỉ áp dụng cho động từ.",
      path: ["grammar", "separablePrefix"],
    });
  }

  if (data.grammar.governedCase && !data.grammar.governedPreposition) {
    context.addIssue({
      code: "custom",
      message: "Cách chi phối cần đi cùng giới từ.",
      path: ["grammar", "governedPreposition"],
    });
  }
}

function addNormalizedHeadword<T extends VocabularyBase>(data: T) {
  return {
    ...data,
    normalizedHeadword: normalizeGermanHeadword(data.headword),
  };
}

export const createVocabularyInputSchema = vocabularyBaseSchema
  .superRefine(validateVocabularyMetadata)
  .transform(addNormalizedHeadword);

export const updateVocabularyInputSchema = z
  .object({
    article: z.enum(articles).optional(),
    examples: z.array(vocabularyExampleSchema).max(8).optional(),
    grammar: z
      .object({
        governedCase: z.enum(governedCases).optional(),
        governedPreposition: optionalText(40),
        notes: optionalText(500),
        reflexive: z.boolean().optional(),
        separable: z.boolean().optional(),
        separablePrefix: optionalText(40),
      })
      .optional(),
    headword: requiredText(120).optional(),
    level: z.enum(cefrLevels).optional(),
    meaningsVi: z.array(requiredText(160)).min(1).max(8).optional(),
    noPlural: z.boolean().optional(),
    plural: optionalText(160),
    setIds: z
      .array(z.string().regex(/^[a-f\d]{24}$/i))
      .max(50)
      .optional(),
    sourceLessonId: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
    wordType: z.enum(wordTypes).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Cần có ít nhất một trường để cập nhật.",
  });

export const vocabularyListQuerySchema = z.object({
  due: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  level: z.enum(cefrLevels).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  q: optionalText(120),
  source: z.enum(["manual", "lesson"]).optional(),
  state: z.enum(reviewStates).optional(),
  wordType: z.enum(wordTypes).optional(),
});

export const vocabularySetInputSchema = z.object({
  description: optionalText(320),
  name: requiredText(80),
});

export const updateVocabularySetInputSchema = vocabularySetInputSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Cần có ít nhất một trường để cập nhật bộ từ.",
  });

export const vocabularySetMembershipSchema = z.object({
  wordId: z.string().regex(/^[a-f\d]{24}$/i),
});

export const importPreviewInputSchema = z.object({
  content: z.string().trim().min(1).max(100_000),
  format: z.enum(["lines", "csv"]),
});

export const importCommitInputSchema = z.object({
  items: z.array(createVocabularyInputSchema).min(1).max(200),
});

export const vocabularySeedItemSchema = vocabularyBaseSchema
  .extend({
    examples: z.array(bilingualVocabularyExampleSchema).min(1).max(8),
    level: z.enum(cefrLevels),
  })
  .superRefine(validateVocabularyMetadata)
  .transform(addNormalizedHeadword);

export type CreateVocabularyInput = z.input<typeof createVocabularyInputSchema>;
export type ImportCommitInput = z.input<typeof importCommitInputSchema>;
export type ImportPreviewInput = z.input<typeof importPreviewInputSchema>;
export type UpdateVocabularyInput = z.input<typeof updateVocabularyInputSchema>;
export type ValidatedVocabularyInput = z.output<
  typeof createVocabularyInputSchema
>;
export type VocabularyListQuery = z.output<typeof vocabularyListQuerySchema>;
export type VocabularySetInput = z.output<typeof vocabularySetInputSchema>;
export type VocabularySeedItem = z.output<typeof vocabularySeedItemSchema>;
