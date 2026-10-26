import { selectReviewQueue } from "@/lib/srs/select-review-queue";
import { countNewCardsReviewedSince } from "@/repositories/review-log-repository";
import {
  countDueReviewStates,
  findNextReviewDueAt,
  queryDueReviewCandidates,
  type DueReviewCandidate,
} from "@/repositories/review-state-repository";

const MAX_SESSION_CARDS = 50;
const MAX_NEW_CARDS_PER_UTC_DAY = 10;

function utcDayStart(now: Date) {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function compareDueCandidates(
  left: DueReviewCandidate,
  right: DueReviewCandidate,
) {
  return (
    left.dueAt.getTime() - right.dueAt.getTime() ||
    left.word.createdAt.getTime() - right.word.createdAt.getTime() ||
    left.wordId.toString().localeCompare(right.wordId.toString())
  );
}

export async function selectDueReviewQueue(userId: string, now: Date) {
  const introducedNewToday = await countNewCardsReviewedSince(
    userId,
    utcDayStart(now),
  );
  const remainingNew = Math.max(
    0,
    MAX_NEW_CARDS_PER_UTC_DAY - introducedNewToday,
  );
  const [established, newCards] = await Promise.all([
    queryDueReviewCandidates({
      limit: MAX_SESSION_CARDS,
      now,
      stateGroup: "established",
      userId,
    }),
    remainingNew > 0
      ? queryDueReviewCandidates({
          limit: remainingNew,
          now,
          stateGroup: "new",
          userId,
        })
      : Promise.resolve([]),
  ]);

  return selectReviewQueue(
    [...established, ...newCards].sort(compareDueCandidates),
    {
      introducedNewToday,
      maxCards: MAX_SESSION_CARDS,
      maxNewPerDay: MAX_NEW_CARDS_PER_UTC_DAY,
    },
  );
}

export async function getDueReviewCountForUser(userId: string, now: Date) {
  const [count, nextDueAt] = await Promise.all([
    countDueReviewStates(userId, now),
    findNextReviewDueAt(userId),
  ]);
  return { count, nextDueAt: nextDueAt?.toISOString() };
}
