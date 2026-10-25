import { Types } from "mongoose";

import {
  importCommitInputSchema,
  parseVocabularyImport,
  type CreateVocabularyInput,
  type ImportPreviewInput,
} from "@lingo-deutsch/shared";
import { connectToDatabase } from "@/lib/db/mongoose";
import { createInitialReviewState } from "@/repositories/review-state-repository";
import {
  createVocabularyWordRecord,
  findActiveNormalizedHeadwords,
} from "@/repositories/vocabulary-word-repository";
import { DuplicateVocabularyWordError } from "@/services/vocabulary/create-vocabulary-word";
import { assertOwnedVocabularySets } from "@/services/vocabulary/assert-owned-sets";

function assertUserId(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("A valid authenticated userId is required.");
  }
}

export async function previewVocabularyImport({
  input,
  userId,
}: {
  input: ImportPreviewInput;
  userId: string;
}) {
  assertUserId(userId);
  const rows = parseVocabularyImport(input);
  const normalizedHeadwords = rows.flatMap((row) =>
    row.input ? [row.input.normalizedHeadword] : [],
  );
  const existing = await findActiveNormalizedHeadwords(
    userId,
    normalizedHeadwords,
  );

  const previewRows = rows.map((row) =>
    row.input && existing.has(row.input.normalizedHeadword)
      ? {
          ...row,
          errors: ["headword: Từ này đã có trong kho từ."],
          status: "existing" as const,
        }
      : row,
  );

  return {
    rows: previewRows,
    summary: {
      existing: previewRows.filter((row) => row.status === "existing").length,
      invalid: previewRows.filter((row) => row.status === "invalid").length,
      ready: previewRows.filter((row) => row.status === "valid").length,
      total: previewRows.length,
    },
  };
}

export async function commitVocabularyImport({
  items,
  now = new Date(),
  userId,
}: {
  items: CreateVocabularyInput[];
  now?: Date;
  userId: string;
}) {
  assertUserId(userId);
  const validated = importCommitInputSchema.parse({ items }).items;
  const normalizedHeadwords = validated.map((item) => item.normalizedHeadword);

  if (new Set(normalizedHeadwords).size !== normalizedHeadwords.length) {
    throw new DuplicateVocabularyWordError();
  }

  const database = await connectToDatabase();
  const session = await database.startSession();

  try {
    const existing = await findActiveNormalizedHeadwords(
      userId,
      normalizedHeadwords,
      session,
    );
    if (existing.size > 0) throw new DuplicateVocabularyWordError();

    await session.withTransaction(async () => {
      for (const item of validated) {
        await assertOwnedVocabularySets(userId, item.setIds, session);
        const word = await createVocabularyWordRecord(userId, item, session);
        await createInitialReviewState(
          { dueAt: now, userId, wordId: word._id },
          session,
        );
      }
    });

    return { createdCount: validated.length };
  } catch (error) {
    if (
      error instanceof DuplicateVocabularyWordError ||
      (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000)
    ) {
      throw new DuplicateVocabularyWordError();
    }
    throw error;
  } finally {
    await session.endSession();
  }
}
