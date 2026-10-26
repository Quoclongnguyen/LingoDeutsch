import { describe, expect, it } from "vitest";

import {
  createReviewSessionInputSchema,
  rateReviewCardInputSchema,
  reviewRatings,
} from "./review";

describe("review contracts", () => {
  it("defaults a session to the German-to-Vietnamese mode", () => {
    expect(createReviewSessionInputSchema.parse({})).toEqual({
      mode: "de-vi",
      restart: false,
    });
  });

  it("accepts an explicit restart without accepting an owner id", () => {
    const result = createReviewSessionInputSchema.parse({
      mode: "de-vi",
      restart: true,
    });

    expect(result).toEqual({ mode: "de-vi", restart: true });
    expect("userId" in result).toBe(false);
  });

  it("accepts exactly the four documented recall ratings", () => {
    expect(reviewRatings).toEqual(["again", "hard", "good", "easy"]);
  });

  it("requires an idempotency event id and bounds response time", () => {
    expect(
      rateReviewCardInputSchema.safeParse({
        rating: "good",
        responseTimeMs: 1_250,
        reviewEventId: "review-event-2026-10-26-0001",
      }).success,
    ).toBe(true);
    expect(
      rateReviewCardInputSchema.safeParse({
        rating: "good",
        responseTimeMs: -1,
        reviewEventId: "",
      }).success,
    ).toBe(false);
  });
});
