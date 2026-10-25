import { Types } from "mongoose";

import {
  updateVocabularySetInputSchema,
  vocabularySetInputSchema,
  type VocabularySetInput,
} from "@lingo-deutsch/shared";
import {
  addSetToVocabularyWord,
  createVocabularySetRecord,
  findActiveVocabularySetForUser,
  queryVocabularySetsForUser,
  removeSetFromVocabularyWord,
  updateVocabularySetRecord,
} from "@/repositories/vocabulary-set-repository";
import { findActiveVocabularyWordByIdForUser } from "@/repositories/vocabulary-word-repository";
import { VocabularyWordNotFoundError } from "@/services/vocabulary/vocabulary-library";

export class VocabularySetNotFoundError extends Error {
  constructor() {
    super("Vocabulary set was not found for the authenticated user.");
    this.name = "VocabularySetNotFoundError";
  }
}

function assertUserId(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("A valid authenticated userId is required.");
  }
}

function setDto(set: {
  _id: Types.ObjectId;
  description?: string | null;
  kind: string;
  name: string;
}) {
  return {
    description: set.description ?? undefined,
    id: set._id.toString(),
    kind: set.kind,
    name: set.name,
  };
}

export async function createVocabularySet({
  input,
  userId,
}: {
  input: VocabularySetInput;
  userId: string;
}) {
  assertUserId(userId);
  const set = await createVocabularySetRecord(
    userId,
    vocabularySetInputSchema.parse(input),
  );
  return setDto(set);
}

export async function listVocabularySets({
  now = new Date(),
  userId,
}: {
  now?: Date;
  userId: string;
}) {
  assertUserId(userId);
  const sets = await queryVocabularySetsForUser(userId, now);
  return sets.map((set) => ({ ...set, id: set.id.toString() }));
}

export async function updateVocabularySet({
  input,
  setId,
  userId,
}: {
  input: Record<string, unknown>;
  setId: string;
  userId: string;
}) {
  assertUserId(userId);
  const updated = await updateVocabularySetRecord(
    userId,
    setId,
    updateVocabularySetInputSchema.parse(input),
  );
  if (!updated) throw new VocabularySetNotFoundError();
  return setDto(updated);
}

export async function archiveVocabularySet({
  setId,
  userId,
}: {
  setId: string;
  userId: string;
}) {
  assertUserId(userId);
  const updated = await updateVocabularySetRecord(userId, setId, {
    isArchived: true,
  });
  if (!updated) throw new VocabularySetNotFoundError();
  return setDto(updated);
}

export async function addWordToVocabularySet({
  setId,
  userId,
  wordId,
}: {
  setId: string;
  userId: string;
  wordId: string;
}) {
  assertUserId(userId);
  const [set, word] = await Promise.all([
    findActiveVocabularySetForUser(userId, setId),
    findActiveVocabularyWordByIdForUser(userId, wordId),
  ]);
  if (!set) throw new VocabularySetNotFoundError();
  if (!word) throw new VocabularyWordNotFoundError();

  const updated = await addSetToVocabularyWord(userId, wordId, setId);
  if (!updated) throw new VocabularyWordNotFoundError();
  return { setId, wordId };
}

export async function removeWordFromVocabularySet({
  setId,
  userId,
  wordId,
}: {
  setId: string;
  userId: string;
  wordId: string;
}) {
  assertUserId(userId);
  const set = await findActiveVocabularySetForUser(userId, setId);
  if (!set) throw new VocabularySetNotFoundError();
  const updated = await removeSetFromVocabularyWord(userId, wordId, setId);
  if (!updated) throw new VocabularyWordNotFoundError();
  return { setId, wordId };
}
