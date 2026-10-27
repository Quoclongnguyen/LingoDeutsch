import { Types } from "mongoose";

import { ExerciseAttemptModel } from "@/models/exercise-attempt";
import { LessonProgressModel } from "@/models/lesson-progress";
import { ReviewLogModel } from "@/models/review-log";
import { ReviewStateModel } from "@/models/review-state";

function objectId(value: string) {
  if (!Types.ObjectId.isValid(value)) {
    throw new Error("A valid ObjectId is required.");
  }
  return new Types.ObjectId(value);
}

export async function summarizeVocabularyProgress(userId: string, now: Date) {
  const ownerId = objectId(userId);
  const result = await ReviewStateModel.aggregate<{
    dueWords: number;
    masteredWords: number;
    reviewedWords: number;
    totalWords: number;
  }>([
    { $match: { userId: ownerId } },
    {
      $lookup: {
        as: "word",
        from: "vocabularyWords",
        let: { wordId: "$wordId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$wordId"] },
                  { $eq: ["$userId", ownerId] },
                  { $eq: ["$isArchived", false] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
      },
    },
    { $unwind: "$word" },
    {
      $group: {
        _id: null,
        dueWords: { $sum: { $cond: [{ $lte: ["$dueAt", now] }, 1, 0] } },
        masteredWords: {
          $sum: { $cond: [{ $eq: ["$state", "mastered"] }, 1, 0] },
        },
        reviewedWords: {
          $sum: {
            $cond: [{ $ne: [{ $type: "$lastReviewedAt" }, "missing"] }, 1, 0],
          },
        },
        totalWords: { $sum: 1 },
      },
    },
    { $project: { _id: 0 } },
  ]).exec();
  return (
    result[0] ?? {
      dueWords: 0,
      masteredWords: 0,
      reviewedWords: 0,
      totalWords: 0,
    }
  );
}

export async function summarizeReviewHistory(userId: string, since: Date) {
  const ownerId = objectId(userId);
  const [summary, days] = await Promise.all([
    ReviewLogModel.aggregate<{
      difficultReviews: number;
      totalReviews: number;
    }>([
      { $match: { userId: ownerId } },
      {
        $group: {
          _id: null,
          difficultReviews: {
            $sum: { $cond: [{ $in: ["$rating", ["again", "hard"]] }, 1, 0] },
          },
          totalReviews: { $sum: 1 },
        },
      },
      { $project: { _id: 0 } },
    ]).exec(),
    ReviewLogModel.aggregate<{ count: number; date: string }>([
      { $match: { reviewedAt: { $gte: since }, userId: ownerId } },
      {
        $group: {
          _id: { $dateToString: { date: "$reviewedAt", format: "%Y-%m-%d" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, count: 1, date: "$_id" } },
    ]).exec(),
  ]);
  return {
    days,
    difficultReviews: summary[0]?.difficultReviews ?? 0,
    totalReviews: summary[0]?.totalReviews ?? 0,
  };
}

export async function summarizeExerciseProgress(userId: string, since: Date) {
  const ownerId = objectId(userId);
  const [summary, days, recent] = await Promise.all([
    ExerciseAttemptModel.aggregate<{
      attempts: number;
      correctAnswers: number;
      totalAnswers: number;
    }>([
      { $match: { userId: ownerId } },
      {
        $group: {
          _id: null,
          attempts: { $sum: 1 },
          correctAnswers: { $sum: "$score" },
          totalAnswers: { $sum: "$total" },
        },
      },
      { $project: { _id: 0 } },
    ]).exec(),
    ExerciseAttemptModel.aggregate<{ count: number; date: string }>([
      { $match: { completedAt: { $gte: since }, userId: ownerId } },
      {
        $group: {
          _id: { $dateToString: { date: "$completedAt", format: "%Y-%m-%d" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, count: 1, date: "$_id" } },
    ]).exec(),
    ExerciseAttemptModel.aggregate<{
      completedAt: Date;
      score: number;
      sourceTitleDe: string;
      sourceType: "lesson" | "grammar_topic";
      total: number;
    }>([
      { $match: { userId: ownerId } },
      { $sort: { completedAt: -1, _id: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          as: "lesson",
          foreignField: "_id",
          from: "lessons",
          localField: "sourceId",
        },
      },
      {
        $lookup: {
          as: "grammar",
          foreignField: "_id",
          from: "grammarTopics",
          localField: "sourceId",
        },
      },
      {
        $project: {
          _id: 0,
          completedAt: 1,
          score: 1,
          sourceTitleDe: {
            $ifNull: [
              { $arrayElemAt: ["$lesson.titleDe", 0] },
              {
                $ifNull: [{ $arrayElemAt: ["$grammar.titleDe", 0] }, "Übung"],
              },
            ],
          },
          sourceType: 1,
          total: 1,
        },
      },
    ]).exec(),
  ]);
  return {
    attempts: summary[0]?.attempts ?? 0,
    correctAnswers: summary[0]?.correctAnswers ?? 0,
    days,
    recent,
    totalAnswers: summary[0]?.totalAnswers ?? 0,
  };
}

export async function queryLessonActivityDays(userId: string, since: Date) {
  return LessonProgressModel.aggregate<{ count: number; date: string }>([
    { $match: { updatedAt: { $gte: since }, userId: objectId(userId) } },
    {
      $group: {
        _id: { $dateToString: { date: "$updatedAt", format: "%Y-%m-%d" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, count: 1, date: "$_id" } },
  ]).exec();
}
