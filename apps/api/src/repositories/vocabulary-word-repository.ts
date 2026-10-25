import { Types, type ClientSession, type PipelineStage } from "mongoose";

import type {
  ValidatedVocabularyInput,
  VocabularyListQuery,
} from "@lingo-deutsch/shared";
import { VocabularyWordModel } from "@/models/vocabulary-word";

function objectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new Error("A valid ObjectId is required.");
  }
  return new Types.ObjectId(value);
}

export async function findActiveVocabularyWordByNormalizedHeadword(
  userId: string,
  normalizedHeadword: string,
  session?: ClientSession,
) {
  return VocabularyWordModel.findOne({
    isArchived: false,
    normalizedHeadword,
    userId: objectId(userId),
  })
    .session(session ?? null)
    .exec();
}

export async function createVocabularyWordRecord(
  userId: string,
  input: ValidatedVocabularyInput,
  session: ClientSession,
) {
  const [word] = await VocabularyWordModel.create(
    [
      {
        ...input,
        isArchived: false,
        sourceLessonId: input.sourceLessonId
          ? objectId(input.sourceLessonId)
          : undefined,
        setIds: input.setIds.map((id) => objectId(id)),
        userId: objectId(userId),
      },
    ],
    { session },
  );

  if (!word) {
    throw new Error("Vocabulary word creation returned no document.");
  }

  return word;
}

export async function findVocabularyWordByIdForUser(
  userId: string,
  wordId: string,
) {
  return VocabularyWordModel.findOne({
    _id: objectId(wordId),
    userId: objectId(userId),
  }).exec();
}

export async function findActiveVocabularyWordByIdForUser(
  userId: string,
  wordId: string,
  session?: ClientSession,
) {
  return VocabularyWordModel.findOne({
    _id: objectId(wordId),
    isArchived: false,
    userId: objectId(userId),
  })
    .session(session ?? null)
    .exec();
}

export async function findActiveNormalizedHeadwords(
  userId: string,
  normalizedHeadwords: string[],
  session?: ClientSession,
) {
  const words = await VocabularyWordModel.find({
    isArchived: false,
    normalizedHeadword: { $in: normalizedHeadwords },
    userId: objectId(userId),
  })
    .select({ normalizedHeadword: 1 })
    .session(session ?? null)
    .lean()
    .exec();

  return new Set(words.map((word) => word.normalizedHeadword));
}

export async function updateVocabularyWordRecord(
  userId: string,
  wordId: string,
  input: ValidatedVocabularyInput,
) {
  return VocabularyWordModel.findOneAndUpdate(
    {
      _id: objectId(wordId),
      isArchived: false,
      userId: objectId(userId),
    },
    {
      $set: {
        ...input,
        sourceLessonId: input.sourceLessonId
          ? objectId(input.sourceLessonId)
          : undefined,
        setIds: input.setIds.map((id) => objectId(id)),
      },
    },
    { returnDocument: "after", runValidators: true },
  ).exec();
}

function escapedRegex(value: string) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "iu");
}

export type VocabularyListRecord = {
  article?: string;
  examples: Array<{ de: string; vi?: string }>;
  grammar: Record<string, unknown>;
  headword: string;
  id: Types.ObjectId;
  level?: string;
  meaningsVi: string[];
  noPlural: boolean;
  plural?: string;
  review: {
    dueAt: Date;
    state: string;
  };
  setIds: Types.ObjectId[];
  sourceLessonId?: Types.ObjectId;
  updatedAt: Date;
  wordType: string;
};

export async function queryVocabularyWordsForUser({
  now,
  query,
  userId,
}: {
  now: Date;
  query: VocabularyListQuery;
  userId: string;
}) {
  const authenticatedUserId = objectId(userId);
  const wordMatch: Record<string, unknown> = {
    isArchived: false,
    userId: authenticatedUserId,
  };

  if (query.level) wordMatch.level = query.level;
  if (query.wordType) wordMatch.wordType = query.wordType;
  if (query.source === "lesson") wordMatch.sourceLessonId = { $exists: true };
  if (query.source === "manual") wordMatch.sourceLessonId = { $exists: false };
  if (query.q) {
    const search = escapedRegex(query.q);
    wordMatch.$or = [
      { headword: search },
      { plural: search },
      { meaningsVi: search },
    ];
  }

  const reviewMatch: Record<string, unknown> = {};
  if (query.state) reviewMatch["review.state"] = query.state;
  if (query.due === true) reviewMatch["review.dueAt"] = { $lte: now };
  if (query.due === false) reviewMatch["review.dueAt"] = { $gt: now };

  const pipeline: PipelineStage[] = [
    { $match: wordMatch },
    {
      $lookup: {
        as: "review",
        from: "reviewStates",
        let: { currentWordId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$wordId", "$$currentWordId"] },
                  { $eq: ["$userId", authenticatedUserId] },
                ],
              },
            },
          },
        ],
      },
    },
    { $unwind: "$review" },
    ...(Object.keys(reviewMatch).length > 0
      ? ([{ $match: reviewMatch }] as PipelineStage[])
      : []),
    { $sort: { updatedAt: -1, _id: -1 } },
    {
      $facet: {
        items: [
          { $skip: (query.page - 1) * query.pageSize },
          { $limit: query.pageSize },
          {
            $project: {
              _id: 0,
              article: 1,
              examples: 1,
              grammar: 1,
              headword: 1,
              id: "$_id",
              level: 1,
              meaningsVi: 1,
              noPlural: 1,
              plural: 1,
              review: { dueAt: "$review.dueAt", state: "$review.state" },
              setIds: 1,
              sourceLessonId: 1,
              updatedAt: 1,
              wordType: 1,
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    },
  ];

  const [pageResult, summaryResult] = await Promise.all([
    VocabularyWordModel.aggregate<{
      items: VocabularyListRecord[];
      total: Array<{ count: number }>;
    }>(pipeline).exec(),
    VocabularyWordModel.aggregate<{
      due: number;
      learning: number;
      mastered: number;
      total: number;
    }>([
      { $match: { isArchived: false, userId: authenticatedUserId } },
      {
        $lookup: {
          as: "review",
          from: "reviewStates",
          let: { currentWordId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$wordId", "$$currentWordId"] },
                    { $eq: ["$userId", authenticatedUserId] },
                  ],
                },
              },
            },
          ],
        },
      },
      { $unwind: "$review" },
      {
        $group: {
          _id: null,
          due: { $sum: { $cond: [{ $lte: ["$review.dueAt", now] }, 1, 0] } },
          learning: {
            $sum: {
              $cond: [{ $in: ["$review.state", ["new", "learning"]] }, 1, 0],
            },
          },
          mastered: {
            $sum: {
              $cond: [{ $eq: ["$review.state", "mastered"] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
      { $project: { _id: 0, due: 1, learning: 1, mastered: 1, total: 1 } },
    ]).exec(),
  ]);

  return {
    items: pageResult[0]?.items ?? [],
    summary: summaryResult[0] ?? {
      due: 0,
      learning: 0,
      mastered: 0,
      total: 0,
    },
    total: pageResult[0]?.total[0]?.count ?? 0,
  };
}

export async function archiveVocabularyWordForUser(
  userId: string,
  wordId: string,
) {
  return VocabularyWordModel.findOneAndUpdate(
    {
      _id: objectId(wordId),
      isArchived: false,
      userId: objectId(userId),
    },
    { $set: { isArchived: true } },
    { returnDocument: "after", runValidators: true },
  ).exec();
}
