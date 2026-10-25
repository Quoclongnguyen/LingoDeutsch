import { connectToDatabase } from "@/lib/db/mongoose";
import { LessonModel } from "@/models/lesson";
import { A1_LESSONS } from "@/seed/a1-lessons";

export async function seedA1Lessons() {
  await connectToDatabase();
  await LessonModel.syncIndexes();

  const result = await LessonModel.bulkWrite(
    A1_LESSONS.map((lesson) => ({
      updateOne: {
        filter: { slug: lesson.slug },
        update: { $set: lesson },
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
