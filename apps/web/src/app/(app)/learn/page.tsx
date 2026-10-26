import type { Metadata } from "next";

import { LearningPathWorkspace } from "@/components/learning/learning-path-workspace";

export const metadata: Metadata = { title: "Lộ trình A1" };

export default function LearnPage() {
  return <LearningPathWorkspace />;
}
