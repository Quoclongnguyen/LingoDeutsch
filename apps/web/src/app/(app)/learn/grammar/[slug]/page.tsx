import type { Metadata } from "next";

import { GrammarTopicWorkspace } from "@/components/grammar/grammar-topic-workspace";

export const metadata: Metadata = { title: "Chủ đề ngữ pháp A1" };

export default async function GrammarTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <GrammarTopicWorkspace slug={slug} />;
}
