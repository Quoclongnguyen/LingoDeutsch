import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import {
  createVocabularyInputSchema,
  type CreateVocabularyInput,
} from "@lingo-deutsch/shared";
import { createInitialReviewState } from "@/repositories/review-state-repository";
import {
  createVocabularyWordRecord,
  findActiveVocabularyWordByNormalizedHeadword,
} from "@/repositories/vocabulary-word-repository";
import { assertOwnedVocabularySets } from "@/services/vocabulary/assert-owned-sets";

export class DuplicateVocabularyWordError extends Error {
  constructor() {
    super("An active vocabulary word with this headword already exists.");
    this.name = "DuplicateVocabularyWordError";
  }
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function createVocabularyWord({
  input,
  now = new Date(),
  userId,
}: {
  input: CreateVocabularyInput;
  now?: Date;
  userId: string;
}) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("A valid authenticated userId is required.");
  }

  const validated = createVocabularyInputSchema.parse(input);
  const database = await connectToDatabase();
  const session = await database.startSession();
  let result:
    | {
        reviewState: Awaited<ReturnType<typeof createInitialReviewState>>;
        word: Awaited<ReturnType<typeof createVocabularyWordRecord>>;
      }
    | undefined;

  try {
    await session.withTransaction(async () => {
      await assertOwnedVocabularySets(userId, validated.setIds, session);
      const existing = await findActiveVocabularyWordByNormalizedHeadword(
        userId,
        validated.normalizedHeadword,
        session,
      );

      if (existing) {
        throw new DuplicateVocabularyWordError();
      }

      const word = await createVocabularyWordRecord(userId, validated, session);
      const reviewState = await createInitialReviewState(
        { dueAt: now, userId, wordId: word._id },
        session,
      );
      result = { reviewState, word };
    });
  } catch (error) {
    if (
      error instanceof DuplicateVocabularyWordError ||
      isDuplicateKeyError(error)
    ) {
      throw new DuplicateVocabularyWordError();
    }
    throw error;
  } finally {
    await session.endSession();
  }

  if (!result) {
    throw new Error(
      "Vocabulary creation transaction did not produce a result.",
    );
  }

  return result;
}
