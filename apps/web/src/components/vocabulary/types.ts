export type ReviewState = "new" | "learning" | "review" | "mastered";

export type VocabularyWord = {
  article?: "der" | "die" | "das";
  examples: Array<{ de: string; vi?: string }>;
  grammar: {
    governedCase?: string;
    governedPreposition?: string;
    notes?: string;
    reflexive?: boolean;
    separable?: boolean;
    separablePrefix?: string;
  };
  headword: string;
  id: string;
  level?: "A1" | "A2" | "B1" | "B2" | "C1";
  meaningsVi: string[];
  noPlural: boolean;
  plural?: string;
  review: { dueAt: string; state: ReviewState };
  setIds: string[];
  sourceLessonId?: string;
  updatedAt: string;
  wordType: "noun" | "verb" | "adjective" | "adverb" | "phrase" | "other";
};

export type VocabularyListResponse = {
  items: VocabularyWord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: { due: number; learning: number; mastered: number; total: number };
};

export type VocabularySet = {
  description?: string;
  dueCount: number;
  id: string;
  kind: "personal";
  name: string;
  wordCount: number;
};
