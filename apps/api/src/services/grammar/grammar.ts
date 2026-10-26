import {
  grammarTopicContentSchema,
  grammarTopicListQuerySchema,
  toPublicExercise,
  type GrammarTopicContent,
} from "@lingo-deutsch/shared";
import {
  findPublishedGrammarTopicBySlug,
  queryPublishedGrammarTopics,
  queryPublishedGrammarTopicsForLesson,
  queryPublishedLessonsBySlugs,
} from "@/repositories/grammar-repository";

export class GrammarTopicNotFoundError extends Error {
  constructor() {
    super("Grammar topic was not found.");
    this.name = "GrammarTopicNotFoundError";
  }
}

type StoredGrammarTopic = GrammarTopicContent & {
  _id: { toString(): string };
};

type RelatedLesson = {
  slug: string;
  titleDe: string;
  titleVi: string;
};

function summary(topic: GrammarTopicContent) {
  return {
    example: topic.examples[0],
    order: topic.order,
    relatedLessonCount: topic.relatedLessonSlugs.length,
    slug: topic.slug,
    summaryVi: topic.summaryVi,
    titleDe: topic.titleDe,
    titleVi: topic.titleVi,
  };
}

export function toGrammarTopicDetail(
  rawTopic: StoredGrammarTopic,
  lessons: RelatedLesson[],
) {
  const topic = grammarTopicContentSchema.parse(rawTopic);
  const lessonBySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
  const relatedLessons = topic.relatedLessonSlugs
    .map((slug) => lessonBySlug.get(slug))
    .filter((lesson): lesson is RelatedLesson => Boolean(lesson));

  return {
    compactTable: topic.compactTable,
    examples: topic.examples,
    exercises: topic.exercises.map(toPublicExercise),
    id: rawTopic._id.toString(),
    level: topic.level,
    order: topic.order,
    relatedLessons,
    rules: topic.rules,
    slug: topic.slug,
    summaryVi: topic.summaryVi,
    titleDe: topic.titleDe,
    titleVi: topic.titleVi,
  };
}

export async function listGrammarTopics({ level }: { level: string }) {
  const query = grammarTopicListQuerySchema.parse({ level });
  const topics = await queryPublishedGrammarTopics(query.level);
  return {
    level: query.level,
    topics: topics.map((topic) =>
      summary(grammarTopicContentSchema.parse(topic)),
    ),
  };
}

export async function getGrammarTopic({ slug }: { slug: string }) {
  const topic = await findPublishedGrammarTopicBySlug(slug);
  if (!topic) throw new GrammarTopicNotFoundError();
  const parsed = grammarTopicContentSchema.parse(topic);
  const lessons = await queryPublishedLessonsBySlugs(parsed.relatedLessonSlugs);
  return toGrammarTopicDetail(topic as StoredGrammarTopic, lessons);
}

export async function listGrammarTopicsForLesson(lessonSlug: string) {
  const topics = await queryPublishedGrammarTopicsForLesson(lessonSlug);
  return topics.map((topic) => summary(grammarTopicContentSchema.parse(topic)));
}
