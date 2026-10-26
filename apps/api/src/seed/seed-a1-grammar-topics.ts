import { connectToDatabase } from "@/lib/db/mongoose";
import { GrammarTopicModel } from "@/models/grammar-topic";
import {
  A1_GRAMMAR_EXERCISES,
  A1_GRAMMAR_TOPICS,
} from "@/seed/a1-grammar-topics";

export async function seedA1GrammarTopics() {
  await connectToDatabase();
  await GrammarTopicModel.syncIndexes();

  const result = await GrammarTopicModel.bulkWrite(
    A1_GRAMMAR_TOPICS.map((topic) => ({
      updateOne: {
        filter: { slug: topic.slug },
        update: {
          $set: {
            ...topic,
            exercises: A1_GRAMMAR_EXERCISES[topic.slug] ?? [],
          },
        },
        upsert: true,
      },
    })),
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
  };
}
