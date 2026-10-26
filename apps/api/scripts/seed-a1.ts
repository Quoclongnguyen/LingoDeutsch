import { config as loadEnvironment } from "dotenv";
import mongoose from "mongoose";
import path from "node:path";

import { seedA1Lessons } from "../src/seed/seed-a1-lessons";
import { seedA1GrammarTopics } from "../src/seed/seed-a1-grammar-topics";

loadEnvironment({
  path: path.resolve(process.cwd(), "../../.env.local"),
  quiet: true,
});

try {
  const [lessons, grammar] = await Promise.all([
    seedA1Lessons(),
    seedA1GrammarTopics(),
  ]);
  console.log(
    `A1 lesson seed complete: ${lessons.upsertedCount} inserted, ${lessons.modifiedCount} updated, ${lessons.matchedCount} matched.`,
  );
  console.log(
    `A1 grammar seed complete: ${grammar.upsertedCount} inserted, ${grammar.modifiedCount} updated, ${grammar.matchedCount} matched.`,
  );
} catch (error) {
  console.error(
    `A1 seed failed: ${error instanceof Error ? error.name : "UnknownError"}`,
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
