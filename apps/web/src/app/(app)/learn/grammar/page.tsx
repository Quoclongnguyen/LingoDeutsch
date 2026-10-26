import type { Metadata } from "next";

import { GrammarLibraryWorkspace } from "@/components/grammar/grammar-library-workspace";

export const metadata: Metadata = { title: "Ngữ pháp A1" };

export default function GrammarPage() {
  return <GrammarLibraryWorkspace />;
}
