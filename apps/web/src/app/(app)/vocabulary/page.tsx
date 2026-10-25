import type { Metadata } from "next";

import { VocabularyWorkspace } from "@/components/vocabulary/vocabulary-workspace";

export const metadata: Metadata = { title: "Từ vựng" };

export default function VocabularyPage() {
  return <VocabularyWorkspace />;
}
