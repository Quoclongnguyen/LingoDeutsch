import type { Metadata } from "next";

import { LessonWorkspace } from "@/components/learning/lesson-workspace";

export const metadata: Metadata = { title: "Bài học A1" };

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LessonWorkspace slug={slug} />;
}
