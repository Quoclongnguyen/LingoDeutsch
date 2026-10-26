import type { Metadata } from "next";

import { LessonWorkspace } from "@/components/learning/lesson-workspace";

export const metadata: Metadata = { title: "Bài học A1" };

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ replay?: string }>;
}) {
  const { slug } = await params;
  const { replay } = await searchParams;
  return <LessonWorkspace replay={replay === "1"} slug={slug} />;
}
