import type { ClientSession } from "mongoose";

import { countActiveVocabularySetsForUser } from "@/repositories/vocabulary-set-repository";

export class VocabularySetOwnershipError extends Error {
  constructor() {
    super("Vocabulary set was not found for the authenticated user.");
    this.name = "VocabularySetOwnershipError";
  }
}

export async function assertOwnedVocabularySets(
  userId: string,
  setIds: string[],
  session?: ClientSession,
) {
  const uniqueIds = [...new Set(setIds)];
  if (uniqueIds.length === 0) return;
  const count = await countActiveVocabularySetsForUser(
    userId,
    uniqueIds,
    session,
  );
  if (count !== uniqueIds.length) throw new VocabularySetOwnershipError();
}
