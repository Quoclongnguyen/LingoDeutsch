import { notFound } from "next/navigation";

import { ExerciseSourceWorkspace } from "@/components/exercise/exercise-source-workspace";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ slug: string; sourceType: string }>;
}) {
  const { slug, sourceType } = await params;
  if (sourceType !== "lesson" && sourceType !== "grammar_topic") notFound();

  return <ExerciseSourceWorkspace slug={slug} sourceType={sourceType} />;
}
