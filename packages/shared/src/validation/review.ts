import { z } from "zod";

export const reviewRatings = ["again", "hard", "good", "easy"] as const;
export const reviewModes = ["de-vi", "vi-de", "cloze", "audio"] as const;

export const createReviewSessionInputSchema = z.object({
  mode: z.enum(reviewModes).default("de-vi"),
  restart: z.boolean().default(false),
});

export const reviewSessionIdentifierSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/iu),
});

export const rateReviewCardInputSchema = z.object({
  rating: z.enum(reviewRatings),
  responseTimeMs: z.number().int().min(0).max(86_400_000).optional(),
  reviewEventId: z.string().trim().min(16).max(120),
});

export type CreateReviewSessionInput = z.output<
  typeof createReviewSessionInputSchema
>;
export type RateReviewCardInput = z.output<typeof rateReviewCardInputSchema>;
export type ReviewMode = (typeof reviewModes)[number];
export type ReviewRating = (typeof reviewRatings)[number];
