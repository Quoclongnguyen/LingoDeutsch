export type ReviewRating = "again" | "hard" | "good" | "easy";

export type ReviewSchedule = {
  dueAt: string;
  easeFactor?: number;
  intervalDays: number;
  lapseCount?: number;
  lastReviewedAt?: string;
  repetitions?: number;
  state?: "new" | "learning" | "review" | "mastered";
};

export type ReviewCardData = {
  intervalPreviews: Record<ReviewRating, ReviewSchedule>;
  reviewState: ReviewSchedule;
  word: {
    article?: "der" | "die" | "das";
    examples: Array<{ de: string; vi?: string }>;
    grammar: { notes?: string };
    headword: string;
    id: string;
    meaningsVi: string[];
    noPlural: boolean;
    plural?: string;
    wordType: string;
  };
};

export type ReviewSession = {
  currentCard?: ReviewCardData;
  currentIndex: number;
  id?: string;
  mode: string;
  resumed: boolean;
  reviewedCount: number;
  status: "active" | "completed" | "abandoned" | "empty";
  summary?: {
    difficultCount: number;
    nextDueAt?: string;
    reviewedCount: number;
  };
  total: number;
  wordIds: string[];
};
