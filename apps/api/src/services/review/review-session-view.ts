import type { Types } from "mongoose";

import { reviewRatings } from "@lingo-deutsch/shared";
import { scheduleReview } from "@/lib/srs/schedule-review";
import { summarizeReviewSession } from "@/repositories/review-log-repository";
import {
  findNextReviewDueAt,
  findReviewCandidateForWord,
} from "@/repositories/review-state-repository";
import {
  schedulingState,
  stateDto,
} from "@/services/review/review-state-mappers";

async function cardView(userId: string, wordId: Types.ObjectId, now: Date) {
  const candidate = await findReviewCandidateForWord(userId, wordId);
  if (!candidate) return undefined;
  const currentState = schedulingState(candidate);
  return {
    intervalPreviews: Object.fromEntries(
      reviewRatings.map((rating) => [
        rating,
        stateDto(scheduleReview(currentState, rating, now)),
      ]),
    ),
    reviewState: stateDto(currentState),
    word: {
      article: candidate.word.article,
      examples: candidate.word.examples,
      grammar: candidate.word.grammar ?? {},
      headword: candidate.word.headword,
      id: candidate.word.id.toString(),
      meaningsVi: candidate.word.meaningsVi,
      noPlural: candidate.word.noPlural,
      plural: candidate.word.plural,
      wordType: candidate.word.wordType,
    },
  };
}

export async function reviewSessionView(
  session: {
    _id: Types.ObjectId;
    currentIndex: number;
    mode: string;
    reviewedWordIds: Types.ObjectId[];
    status: string;
    wordIds: Types.ObjectId[];
  },
  userId: string,
  now: Date,
  resumed = false,
) {
  const currentWordId = session.wordIds[session.currentIndex];
  const [currentCard, summary, nextDueAt] = await Promise.all([
    currentWordId ? cardView(userId, currentWordId, now) : undefined,
    session.status === "completed"
      ? summarizeReviewSession(userId, session._id)
      : Promise.resolve(undefined),
    session.status === "completed"
      ? findNextReviewDueAt(userId)
      : Promise.resolve(undefined),
  ]);
  return {
    currentCard,
    currentIndex: session.currentIndex,
    id: session._id.toString(),
    mode: session.mode,
    resumed,
    reviewedCount: session.reviewedWordIds.length,
    status: session.status,
    summary: summary
      ? { ...summary, nextDueAt: nextDueAt?.toISOString() }
      : undefined,
    total: session.wordIds.length,
    wordIds: session.wordIds.map((id) => id.toString()),
  };
}
