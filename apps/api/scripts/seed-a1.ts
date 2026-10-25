import { config as loadEnvironment } from "dotenv";
import mongoose from "mongoose";
import path from "node:path";

import { seedA1Lessons } from "../src/seed/seed-a1-lessons";

loadEnvironment({
  path: path.resolve(process.cwd(), "../../.env.local"),
  quiet: true,
});

try {
  const result = await seedA1Lessons();
  console.log(
    `A1 seed complete: ${result.upsertedCount} inserted, ${result.modifiedCount} updated, ${result.matchedCount} matched.`,
  );
} catch (error) {
  console.error(
    `A1 seed failed: ${error instanceof Error ? error.name : "UnknownError"}`,
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
