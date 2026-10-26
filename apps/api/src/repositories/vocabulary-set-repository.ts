import { Types, type ClientSession } from "mongoose";

import type { VocabularySetInput } from "@lingo-deutsch/shared";
import { VocabularySetModel } from "@/models/vocabulary-set";
import { VocabularyWordModel } from "@/models/vocabulary-word";

function objectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new Error("A valid ObjectId is required.");
  }
  return new Types.ObjectId(value);
}

export async function createVocabularySetRecord(
  userId: string,
  input: VocabularySetInput,
) {
  return VocabularySetModel.create({
    ...input,
    isArchived: false,
    kind: "personal",
    userId: objectId(userId),
  });
}

export async function findOrCreateLessonVocabularySet(
  userId: string,
  lesson: { _id: Types.ObjectId; titleVi: string },
  session: ClientSession,
) {
  return VocabularySetModel.findOneAndUpdate(
    {
      isArchived: false,
      kind: "lesson",
      sourceLessonId: lesson._id,
      userId: objectId(userId),
    },
    {
      $setOnInsert: {
        description: "Từ vựng được lưu trực tiếp từ bài học.",
        isArchived: false,
        kind: "lesson",
        name: lesson.titleVi,
        sourceLessonId: lesson._id,
        userId: objectId(userId),
      },
    },
    { returnDocument: "after", session, upsert: true },
  ).exec();
}

export async function findActiveVocabularySetForUser(
  userId: string,
  setId: string,
) {
  return VocabularySetModel.findOne({
    _id: objectId(setId),
    isArchived: false,
    userId: objectId(userId),
  }).exec();
}

export async function countActiveVocabularySetsForUser(
  userId: string,
  setIds: string[],
  session?: ClientSession,
) {
  if (setIds.length === 0) return 0;
  return VocabularySetModel.countDocuments({
    _id: { $in: setIds.map(objectId) },
    isArchived: false,
    userId: objectId(userId),
  })
    .session(session ?? null)
    .exec();
}

export async function updateVocabularySetRecord(
  userId: string,
  setId: string,
  update: Record<string, unknown>,
) {
  return VocabularySetModel.findOneAndUpdate(
    {
      _id: objectId(setId),
      isArchived: false,
      userId: objectId(userId),
    },
    { $set: update },
    { returnDocument: "after", runValidators: true },
  ).exec();
}

export async function addSetToVocabularyWord(
  userId: string,
  wordId: string,
  setId: string,
) {
  return VocabularyWordModel.findOneAndUpdate(
    {
      _id: objectId(wordId),
      isArchived: false,
      userId: objectId(userId),
    },
    { $addToSet: { setIds: objectId(setId) } },
    { returnDocument: "after" },
  ).exec();
}

export async function removeSetFromVocabularyWord(
  userId: string,
  wordId: string,
  setId: string,
) {
  return VocabularyWordModel.findOneAndUpdate(
    {
      _id: objectId(wordId),
      isArchived: false,
      userId: objectId(userId),
    },
    { $pull: { setIds: objectId(setId) } },
    { returnDocument: "after" },
  ).exec();
}

export async function queryVocabularySetsForUser(userId: string, now: Date) {
  const authenticatedUserId = objectId(userId);
  return VocabularySetModel.aggregate<{
    description?: string;
    dueCount: number;
    id: Types.ObjectId;
    kind: string;
    name: string;
    wordCount: number;
  }>([
    { $match: { isArchived: false, userId: authenticatedUserId } },
    {
      $lookup: {
        as: "words",
        from: "vocabularyWords",
        let: { currentSetId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", authenticatedUserId] },
                  { $eq: ["$isArchived", false] },
                  { $in: ["$$currentSetId", "$setIds"] },
                ],
              },
            },
          },
          {
            $lookup: {
              as: "review",
              foreignField: "wordId",
              from: "reviewStates",
              localField: "_id",
            },
          },
          { $unwind: "$review" },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        description: 1,
        dueCount: {
          $size: {
            $filter: {
              as: "word",
              cond: { $lte: ["$$word.review.dueAt", now] },
              input: "$words",
            },
          },
        },
        id: "$_id",
        kind: 1,
        name: 1,
        wordCount: { $size: "$words" },
      },
    },
    { $sort: { name: 1 } },
  ]).exec();
}
