import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { connectToDatabase } from "@/lib/db/mongoose";
import { ReviewLogModel } from "@/models/review-log";
import { ReviewSessionModel } from "@/models/review-session";
import { ReviewStateModel } from "@/models/review-state";
import { VocabularyWordModel } from "@/models/vocabulary-word";
import { createVocabularyWord } from "@/services/vocabulary/create-vocabulary-word";
import {
  ReviewSessionNotFoundError,
  getReviewSession,
  getDueReviewCount,
  rateReviewCard,
  startOrResumeReviewSession,
} from "@/services/review/review-sessions";

const now = new Date("2026-10-26T12:00:00.000Z");

function word(headword: string) {
  return {
    examples: [
      {
        de: `Ich lerne ${headword}.`,
        vi: `Tôi học ${headword}.`,
      },
    ],
    headword,
    level: "A1" as const,
    meaningsVi: [`nghĩa của ${headword}`],
    wordType: "phrase" as const,
  };
}

beforeAll(async () => {
  const database = await connectToDatabase();
  if (!database.connection.name.endsWith("_test")) {
    throw new Error(
      "Integration tests refused to run outside a _test database.",
    );
  }

  await Promise.all([
    VocabularyWordModel.syncIndexes(),
    ReviewStateModel.syncIndexes(),
    ReviewLogModel.syncIndexes(),
    ReviewSessionModel.syncIndexes(),
  ]);
});

beforeEach(async () => {
  if (!mongoose.connection.name.endsWith("_test")) {
    throw new Error("Cleanup refused to run outside a _test database.");
  }

  await Promise.all([
    ReviewLogModel.deleteMany(),
    ReviewSessionModel.deleteMany(),
    ReviewStateModel.deleteMany(),
    VocabularyWordModel.deleteMany(),
  ]);
});

afterAll(async () => {
  if (mongoose.connection.name?.endsWith("_test")) {
    await Promise.all([
      ReviewLogModel.deleteMany(),
      ReviewSessionModel.deleteMany(),
      ReviewStateModel.deleteMany(),
      VocabularyWordModel.deleteMany(),
    ]);
  }
  await mongoose.disconnect();
});

describe("review session vertical slice", () => {
  it("builds an owned due queue and excludes future and foreign cards", async () => {
    const userId = new Types.ObjectId().toHexString();
    const otherUserId = new Types.ObjectId().toHexString();
    const oldest = await createVocabularyWord({
      input: word("Guten Morgen"),
      now,
      userId,
    });
    const newer = await createVocabularyWord({
      input: word("Auf Wiedersehen"),
      now,
      userId,
    });
    const future = await createVocabularyWord({
      input: word("Bis später"),
      now,
      userId,
    });
    await createVocabularyWord({
      input: word("Fremdes Wort"),
      now,
      userId: otherUserId,
    });

    await ReviewStateModel.updateOne(
      { _id: oldest.reviewState._id },
      { $set: { dueAt: new Date("2026-10-24T12:00:00.000Z") } },
    );
    await ReviewStateModel.updateOne(
      { _id: newer.reviewState._id },
      { $set: { dueAt: new Date("2026-10-25T12:00:00.000Z") } },
    );
    await ReviewStateModel.updateOne(
      { _id: future.reviewState._id },
      { $set: { dueAt: new Date("2026-10-27T12:00:00.000Z") } },
    );

    await expect(getDueReviewCount({ now, userId })).resolves.toMatchObject({
      count: 2,
    });

    const session = await startOrResumeReviewSession({
      input: { mode: "de-vi", restart: false },
      now,
      userId,
    });

    expect(session).toMatchObject({
      currentCard: { word: { headword: "Guten Morgen" } },
      currentIndex: 0,
      resumed: false,
      status: "active",
      total: 2,
    });
    expect(session.wordIds).toEqual([
      oldest.word._id.toString(),
      newer.word._id.toString(),
    ]);
  });

  it("recovers the active session at its persisted current card", async () => {
    const userId = new Types.ObjectId().toHexString();
    await createVocabularyWord({ input: word("der Termin"), now, userId });

    const created = await startOrResumeReviewSession({
      input: { mode: "de-vi", restart: false },
      now,
      userId,
    });
    const recovered = await startOrResumeReviewSession({
      input: { mode: "de-vi", restart: false },
      now,
      userId,
    });

    expect(recovered.id).toBe(created.id);
    expect(recovered.resumed).toBe(true);
    expect(recovered.currentCard?.word.headword).toBe("der Termin");
  });

  it("rates once atomically and returns the same outcome for a repeated event", async () => {
    const userId = new Types.ObjectId().toHexString();
    const createdWord = await createVocabularyWord({
      input: word("vereinbaren"),
      now,
      userId,
    });
    const session = await startOrResumeReviewSession({
      input: { mode: "de-vi", restart: false },
      now,
      userId,
    });
    expect(session.id).toBeDefined();
    const sessionId = session.id!;
    const input = {
      rating: "good" as const,
      responseTimeMs: 1_400,
      reviewEventId: "review-event-2026-10-26-0001",
    };

    const first = await rateReviewCard({
      input,
      now,
      sessionId,
      userId,
    });
    const repeated = await rateReviewCard({
      input,
      now: new Date("2026-10-26T12:05:00.000Z"),
      sessionId,
      userId,
    });

    expect(first.idempotent).toBe(false);
    expect(repeated.idempotent).toBe(true);
    expect(repeated.nextState).toEqual(first.nextState);
    expect(await ReviewLogModel.countDocuments()).toBe(1);
    expect(await ReviewSessionModel.findById(sessionId).lean()).toMatchObject({
      currentIndex: 1,
      status: "completed",
    });
    expect(
      await ReviewStateModel.findOne({ wordId: createdWord.word._id }).lean(),
    ).toMatchObject({
      dueAt: new Date("2026-10-29T12:00:00.000Z"),
      intervalDays: 3,
      state: "review",
    });
  });

  it("does not expose another learner's session", async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const strangerId = new Types.ObjectId().toHexString();
    await createVocabularyWord({
      input: word("pünktlich"),
      now,
      userId: ownerId,
    });
    const session = await startOrResumeReviewSession({
      input: { mode: "de-vi", restart: false },
      now,
      userId: ownerId,
    });
    expect(session.id).toBeDefined();

    await expect(
      getReviewSession({ now, sessionId: session.id!, userId: strangerId }),
    ).rejects.toBeInstanceOf(ReviewSessionNotFoundError);
  });
});
