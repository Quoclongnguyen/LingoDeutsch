import { Types, type ClientSession, type PipelineStage } from "mongoose";

import { ReviewStateModel } from "@/models/review-state";

export async function createInitialReviewState(
  {
    dueAt,
    userId,
    wordId,
  }: {
    dueAt: Date;
    userId: string;
    wordId: Types.ObjectId;
  },
  session: ClientSession,
) {
  const [reviewState] = await ReviewStateModel.create(
    [
      {
        dueAt,
        easeFactor: 2.5,
        intervalDays: 0,
        lapseCount: 0,
        repetitions: 0,
        state: "new",
        userId: new Types.ObjectId(userId),
        wordId,
      },
    ],
    { session },
  );

  if (!reviewState) {
    throw new Error("Review state creation returned no document.");
  }

  return reviewState;
}

function objectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new Error("A valid ObjectId is required.");
  }
  return new Types.ObjectId(value);
}

export type DueReviewCandidate = {
  dueAt: Date;
  easeFactor: number;
  intervalDays: number;
  lapseCount: number;
  lastReviewedAt?: Date;
  repetitions: number;
  state: "new" | "learning" | "review" | "mastered";
  word: {
    article?: "der" | "die" | "das";
    createdAt: Date;
    examples: Array<{ de: string; vi?: string }>;
    grammar: Record<string, unknown>;
    headword: string;
    id: Types.ObjectId;
    meaningsVi: string[];
    noPlural: boolean;
    plural?: string;
    wordType: string;
  };
  wordId: Types.ObjectId;
};

function activeWordLookup(userId: Types.ObjectId): PipelineStage.Lookup {
  return {
    $lookup: {
      as: "word",
      from: "vocabularyWords",
      let: { candidateWordId: "$wordId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$_id", "$$candidateWordId"] },
                { $eq: ["$userId", userId] },
                { $eq: ["$isArchived", false] },
              ],
            },
          },
        },
      ],
    },
  };
}

const candidateProjection: PipelineStage.Project = {
  $project: {
    _id: 0,
    dueAt: 1,
    easeFactor: 1,
    intervalDays: 1,
    lapseCount: 1,
    lastReviewedAt: 1,
    repetitions: 1,
    state: 1,
    word: {
      article: "$word.article",
      createdAt: "$word.createdAt",
      examples: "$word.examples",
      grammar: "$word.grammar",
      headword: "$word.headword",
      id: "$word._id",
      meaningsVi: "$word.meaningsVi",
      noPlural: "$word.noPlural",
      plural: "$word.plural",
      wordType: "$word.wordType",
    },
    wordId: 1,
  },
};

export async function queryDueReviewCandidates({
  limit = 200,
  now,
  stateGroup,
  userId,
}: {
  limit?: number;
  now: Date;
  stateGroup?: "new" | "established";
  userId: string;
}) {
  const authenticatedUserId = objectId(userId);
  const stateMatch =
    stateGroup === "new"
      ? { state: "new" }
      : stateGroup === "established"
        ? { state: { $ne: "new" } }
        : {};
  return ReviewStateModel.aggregate<DueReviewCandidate>([
    {
      $match: {
        dueAt: { $lte: now },
        userId: authenticatedUserId,
        ...stateMatch,
      },
    },
    activeWordLookup(authenticatedUserId),
    { $unwind: "$word" },
    { $sort: { dueAt: 1, "word.createdAt": 1, _id: 1 } },
    { $limit: limit },
    candidateProjection,
  ]).exec();
}

export async function findReviewCandidateForWord(
  userId: string,
  wordId: Types.ObjectId,
) {
  const authenticatedUserId = objectId(userId);
  const result = await ReviewStateModel.aggregate<DueReviewCandidate>([
    { $match: { userId: authenticatedUserId, wordId } },
    activeWordLookup(authenticatedUserId),
    { $unwind: "$word" },
    candidateProjection,
    { $limit: 1 },
  ]).exec();
  return result[0];
}

export async function countDueReviewStates(userId: string, now: Date) {
  const authenticatedUserId = objectId(userId);
  const result = await ReviewStateModel.aggregate<{ count: number }>([
    { $match: { dueAt: { $lte: now }, userId: authenticatedUserId } },
    activeWordLookup(authenticatedUserId),
    { $unwind: "$word" },
    { $count: "count" },
  ]).exec();
  return result[0]?.count ?? 0;
}

export async function findNextReviewDueAt(userId: string) {
  const authenticatedUserId = objectId(userId);
  const result = await ReviewStateModel.aggregate<{ dueAt: Date }>([
    { $match: { userId: authenticatedUserId } },
    activeWordLookup(authenticatedUserId),
    { $unwind: "$word" },
    { $sort: { dueAt: 1 } },
    { $limit: 1 },
    { $project: { _id: 0, dueAt: 1 } },
  ]).exec();
  return result[0]?.dueAt;
}

export async function findReviewStateForWord(
  userId: string,
  wordId: Types.ObjectId,
  session?: ClientSession,
) {
  return ReviewStateModel.findOne({ userId: objectId(userId), wordId })
    .session(session ?? null)
    .exec();
}

export async function updateReviewStateRecord(
  reviewStateId: Types.ObjectId,
  nextState: {
    dueAt: Date;
    easeFactor: number;
    intervalDays: number;
    lapseCount: number;
    lastReviewedAt?: Date;
    repetitions: number;
    state: string;
  },
  session: ClientSession,
) {
  const updated = await ReviewStateModel.findByIdAndUpdate(
    reviewStateId,
    { $set: nextState },
    { returnDocument: "after", runValidators: true, session },
  ).exec();
  if (!updated) throw new Error("Review state disappeared during rating.");
  return updated;
}
