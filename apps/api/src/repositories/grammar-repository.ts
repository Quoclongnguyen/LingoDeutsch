import type { GrammarTopicListQuery } from "@lingo-deutsch/shared";
import { GrammarTopicModel } from "@/models/grammar-topic";
import { LessonModel } from "@/models/lesson";

export function queryPublishedGrammarTopics(
  level: GrammarTopicListQuery["level"],
) {
  return GrammarTopicModel.find({ level, published: true })
    .sort({ order: 1, slug: 1 })
    .lean()
    .exec();
}

export function findPublishedGrammarTopicBySlug(slug: string) {
  return GrammarTopicModel.findOne({ published: true, slug }).lean().exec();
}

export function queryPublishedLessonsBySlugs(slugs: string[]) {
  return LessonModel.find({ published: true, slug: { $in: slugs } })
    .select({ _id: 0, slug: 1, titleDe: 1, titleVi: 1 })
    .lean()
    .exec();
}

export function queryPublishedGrammarTopicsForLesson(lessonSlug: string) {
  return GrammarTopicModel.find({
    published: true,
    relatedLessonSlugs: lessonSlug,
  })
    .sort({ order: 1, slug: 1 })
    .lean()
    .exec();
}
