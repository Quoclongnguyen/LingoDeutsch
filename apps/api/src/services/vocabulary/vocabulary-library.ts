import { Types } from "mongoose";

import {
  createVocabularyInputSchema,
  updateVocabularyInputSchema,
  vocabularyListQuerySchema,
  type UpdateVocabularyInput,
  type VocabularyListQuery,
} from "@lingo-deutsch/shared";
import {
  archiveVocabularyWordForUser,
  findActiveVocabularyWordByIdForUser,
  queryVocabularyWordsForUser,
  updateVocabularyWordRecord,
} from "@/repositories/vocabulary-word-repository";
import { DuplicateVocabularyWordError } from "@/services/vocabulary/create-vocabulary-word";
import { assertOwnedVocabularySets } from "@/services/vocabulary/assert-owned-sets";

export class VocabularyWordNotFoundError extends Error {
  constructor() {
    super("Vocabulary word was not found for the authenticated user.");
    this.name = "VocabularyWordNotFoundError";
  }
}

function assertUserId(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("A valid authenticated userId is required.");
  }
}

function wordDocumentToInput(word: {
  article?: string | null;
  examples: Array<{ de: string; vi?: string | null }>;
  grammar?: {
    governedCase?: string | null;
    governedPreposition?: string | null;
    notes?: string | null;
    reflexive?: boolean | null;
    separable?: boolean | null;
    separablePrefix?: string | null;
  } | null;
  headword: string;
  level?: string | null;
  meaningsVi: string[];
  noPlural: boolean;
  plural?: string | null;
  setIds: Types.ObjectId[];
  sourceLessonId?: Types.ObjectId | null;
  wordType: string;
}) {
  return {
    article: word.article ?? undefined,
    examples: word.examples.map((example) => ({
      de: example.de,
      vi: example.vi ?? undefined,
    })),
    grammar: {
      governedCase: word.grammar?.governedCase ?? undefined,
      governedPreposition: word.grammar?.governedPreposition ?? undefined,
      notes: word.grammar?.notes ?? undefined,
      reflexive: word.grammar?.reflexive ?? undefined,
      separable: word.grammar?.separable ?? undefined,
      separablePrefix: word.grammar?.separablePrefix ?? undefined,
    },
    headword: word.headword,
    level: word.level ?? undefined,
    meaningsVi: [...word.meaningsVi],
    noPlural: word.noPlural,
    plural: word.plural ?? undefined,
    setIds: word.setIds.map((id) => id.toString()),
    sourceLessonId: word.sourceLessonId?.toString(),
    wordType: word.wordType,
  };
}

function wordDto(word: {
  _id: Types.ObjectId;
  article?: string | null;
  examples: Array<{ de: string; vi?: string | null }>;
  grammar?: unknown;
  headword: string;
  isArchived: boolean;
  level?: string | null;
  meaningsVi: string[];
  noPlural: boolean;
  plural?: string | null;
  setIds: Types.ObjectId[];
  sourceLessonId?: Types.ObjectId | null;
  updatedAt: Date;
  wordType: string;
}) {
  return {
    article: word.article ?? undefined,
    examples: word.examples.map((example) => ({
      de: example.de,
      vi: example.vi ?? undefined,
    })),
    grammar: word.grammar ?? {},
    headword: word.headword,
    id: word._id.toString(),
    isArchived: word.isArchived,
    level: word.level ?? undefined,
    meaningsVi: [...word.meaningsVi],
    noPlural: word.noPlural,
    plural: word.plural ?? undefined,
    setIds: word.setIds.map((id) => id.toString()),
    sourceLessonId: word.sourceLessonId?.toString(),
    updatedAt: word.updatedAt.toISOString(),
    wordType: word.wordType,
  };
}

export async function listVocabularyWords({
  now = new Date(),
  query,
  userId,
}: {
  now?: Date;
  query: VocabularyListQuery | Record<string, unknown>;
  userId: string;
}) {
  assertUserId(userId);
  const validatedQuery = vocabularyListQuerySchema.parse(query);
  const result = await queryVocabularyWordsForUser({
    now,
    query: validatedQuery,
    userId,
  });

  return {
    items: result.items.map((word) => ({
      ...word,
      id: word.id.toString(),
      review: {
        dueAt: word.review.dueAt.toISOString(),
        state: word.review.state,
      },
      setIds: word.setIds.map((id) => id.toString()),
      sourceLessonId: word.sourceLessonId?.toString(),
      updatedAt: word.updatedAt.toISOString(),
    })),
    pagination: {
      page: validatedQuery.page,
      pageSize: validatedQuery.pageSize,
      total: result.total,
      totalPages: Math.max(
        1,
        Math.ceil(result.total / validatedQuery.pageSize),
      ),
    },
    summary: result.summary,
  };
}

export async function getVocabularyWord({
  userId,
  wordId,
}: {
  userId: string;
  wordId: string;
}) {
  assertUserId(userId);
  const word = await findActiveVocabularyWordByIdForUser(userId, wordId);
  if (!word) throw new VocabularyWordNotFoundError();
  return wordDto(word);
}

export async function updateVocabularyWord({
  input,
  userId,
  wordId,
}: {
  input: UpdateVocabularyInput;
  userId: string;
  wordId: string;
}) {
  assertUserId(userId);
  const patch = updateVocabularyInputSchema.parse(input);
  const current = await findActiveVocabularyWordByIdForUser(userId, wordId);
  if (!current) throw new VocabularyWordNotFoundError();

  const currentInput = wordDocumentToInput(current);
  const validated = createVocabularyInputSchema.parse({
    ...currentInput,
    ...patch,
    grammar: patch.grammar
      ? { ...currentInput.grammar, ...patch.grammar }
      : currentInput.grammar,
  });
  await assertOwnedVocabularySets(userId, validated.setIds);

  try {
    const updated = await updateVocabularyWordRecord(userId, wordId, validated);
    if (!updated) throw new VocabularyWordNotFoundError();
    return wordDto(updated);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new DuplicateVocabularyWordError();
    }
    throw error;
  }
}

export async function archiveVocabularyWord({
  userId,
  wordId,
}: {
  userId: string;
  wordId: string;
}) {
  assertUserId(userId);
  const word = await archiveVocabularyWordForUser(userId, wordId);
  if (!word) throw new VocabularyWordNotFoundError();
  return wordDto(word);
}
