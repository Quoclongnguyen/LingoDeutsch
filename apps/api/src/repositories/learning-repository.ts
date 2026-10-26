import { Types, type ClientSession, type PipelineStage } from "mongoose";

import type { LessonProgressInput } from "@lingo-deutsch/shared";
import { LessonModel } from "@/models/lesson";
import { LessonProgressModel } from "@/models/lesson-progress";
import { ReviewLogModel } from "@/models/review-log";
import { VocabularySetModel } from "@/models/vocabulary-set";
import { VocabularyWordModel } from "@/models/vocabulary-word";

function objectId(value: string) {
  if (!Types.ObjectId.isValid(value)) {
    throw new Error("A valid ObjectId is required.");
  }
  return new Types.ObjectId(value);
}

export async function queryLearningPathLessonRecords({
  level,
  now,
  userId,
}: {
  level: string;
  now: Date;
  userId: string;
}) {
  const ownerId = objectId(userId);
  return LessonModel.aggregate<{
    dueCount: number;
    estimatedMinutes: number;
    id: Types.ObjectId;
    lessonOrder: number;
    moduleOrder: number;
    objectiveVi: string;
    progress?: {
      completedActivityIds: string[];
      currentActivityIndex: number;
      status: "not_started" | "in_progress" | "completed";
      updatedAt?: Date;
    };
    slug: string;
    titleDe: string;
    titleVi: string;
    vocabularyCount: number;
  }>([
    { $match: { level, published: true } },
    { $sort: { moduleOrder: 1, lessonOrder: 1 } },
    {
      $lookup: {
        as: "progressRows",
        from: "lessonProgress",
        let: { lessonId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$lessonId", "$$lessonId"] },
                  { $eq: ["$userId", ownerId] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
      },
    },
    {
      $lookup: {
        as: "lessonSets",
        from: "vocabularySets",
        let: { lessonId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$sourceLessonId", "$$lessonId"] },
                  { $eq: ["$userId", ownerId] },
                  { $eq: ["$kind", "lesson"] },
                  { $eq: ["$isArchived", false] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
      },
    },
    {
      $lookup: {
        as: "dueWords",
        from: "vocabularyWords",
        let: { lessonSetId: { $arrayElemAt: ["$lessonSets._id", 0] } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", ownerId] },
                  { $eq: ["$isArchived", false] },
                  { $in: ["$$lessonSetId", "$setIds"] },
                ],
              },
            },
          },
          {
            $lookup: {
              as: "review",
              from: "reviewStates",
              let: { wordId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$wordId", "$$wordId"] },
                        { $eq: ["$userId", ownerId] },
                        { $lte: ["$dueAt", now] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          { $match: { "review.0": { $exists: true } } },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        dueCount: { $size: "$dueWords" },
        estimatedMinutes: 1,
        id: "$_id",
        lessonOrder: 1,
        moduleOrder: 1,
        objectiveVi: 1,
        progress: { $arrayElemAt: ["$progressRows", 0] },
        slug: 1,
        titleDe: 1,
        titleVi: 1,
        vocabularyCount: { $size: "$vocabularySeed" },
      },
    },
  ]).exec();
}

export function findPublishedLessonBySlug(slug: string) {
  return LessonModel.findOne({ published: true, slug }).lean().exec();
}

export function findPublishedLessonById(
  lessonId: string,
  session?: ClientSession,
) {
  return LessonModel.findOne({ _id: objectId(lessonId), published: true })
    .session(session ?? null)
    .exec();
}

export function findLessonProgressForUser(userId: string, lessonId: string) {
  return LessonProgressModel.findOne({
    lessonId: objectId(lessonId),
    userId: objectId(userId),
  })
    .lean()
    .exec();
}

export async function hasIncompletePublishedPrerequisites({
  lesson,
  userId,
}: {
  lesson: { level: string; lessonOrder: number; moduleOrder: number };
  userId: string;
}) {
  const prerequisites = await LessonModel.aggregate<{ _id: Types.ObjectId }>([
    {
      $match: {
        level: lesson.level,
        published: true,
        $or: [
          { moduleOrder: { $lt: lesson.moduleOrder } },
          {
            lessonOrder: { $lt: lesson.lessonOrder },
            moduleOrder: lesson.moduleOrder,
          },
        ],
      },
    },
    { $project: { _id: 1 } },
  ]).exec();
  if (prerequisites.length === 0) return false;

  const completedCount = await LessonProgressModel.countDocuments({
    lessonId: { $in: prerequisites.map((item) => item._id) },
    status: "completed",
    userId: objectId(userId),
  }).exec();
  return completedCount !== prerequisites.length;
}

export function upsertLessonProgressForUser({
  input,
  lessonId,
  now,
  userId,
}: {
  input: LessonProgressInput;
  lessonId: string;
  now: Date;
  userId: string;
}) {
  return LessonProgressModel.findOneAndUpdate(
    { lessonId: objectId(lessonId), userId: objectId(userId) },
    {
      $set: {
        ...input,
        completedAt: input.status === "completed" ? now : undefined,
      },
      $setOnInsert: { startedAt: now },
    },
    { returnDocument: "after", runValidators: true, upsert: true },
  ).exec();
}

export async function findSavedHeadwordsForLesson(
  userId: string,
  lessonId: string,
) {
  const set = await VocabularySetModel.findOne({
    isArchived: false,
    kind: "lesson",
    sourceLessonId: objectId(lessonId),
    userId: objectId(userId),
  })
    .select({ _id: 1 })
    .lean()
    .exec();
  if (!set) return new Set<string>();
  const words = await VocabularyWordModel.find({
    isArchived: false,
    setIds: set._id,
    userId: objectId(userId),
  })
    .select({ normalizedHeadword: 1 })
    .lean()
    .exec();
  return new Set(words.map((word) => word.normalizedHeadword));
}

export async function queryRecentLessonActivities(userId: string) {
  const ownerId = objectId(userId);
  return LessonProgressModel.aggregate<{
    at: Date;
    kind: "lesson";
    status: string;
    titleDe: string;
    titleVi: string;
  }>([
    { $match: { userId: ownerId } },
    { $sort: { updatedAt: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        as: "lesson",
        foreignField: "_id",
        from: "lessons",
        localField: "lessonId",
      },
    },
    { $unwind: "$lesson" },
    {
      $project: {
        _id: 0,
        at: "$updatedAt",
        kind: { $literal: "lesson" },
        status: 1,
        titleDe: "$lesson.titleDe",
        titleVi: "$lesson.titleVi",
      },
    },
  ]).exec();
}

export async function queryRecentReviewActivities(userId: string) {
  const ownerId = objectId(userId);
  const pipeline: PipelineStage[] = [
    { $match: { userId: ownerId } },
    { $sort: { reviewedAt: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        as: "word",
        foreignField: "_id",
        from: "vocabularyWords",
        localField: "wordId",
      },
    },
    { $unwind: "$word" },
    {
      $project: {
        _id: 0,
        at: "$reviewedAt",
        headword: "$word.headword",
        kind: { $literal: "review" },
        rating: 1,
      },
    },
  ];
  return ReviewLogModel.aggregate<{
    at: Date;
    headword: string;
    kind: "review";
    rating: string;
  }>(pipeline).exec();
}

export async function countWeeklyLearningActivity(userId: string, since: Date) {
  const ownerId = objectId(userId);
  const [lessonCount, reviewDays] = await Promise.all([
    LessonProgressModel.countDocuments({
      updatedAt: { $gte: since },
      userId: ownerId,
    }).exec(),
    ReviewLogModel.aggregate<{ count: number }>([
      { $match: { reviewedAt: { $gte: since }, userId: ownerId } },
      {
        $group: {
          _id: {
            $dateToString: { date: "$reviewedAt", format: "%Y-%m-%d" },
          },
        },
      },
      { $count: "count" },
    ]).exec(),
  ]);
  return lessonCount + (reviewDays[0]?.count ?? 0);
}
