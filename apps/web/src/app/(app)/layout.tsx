import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return <AppShell userName={user.name ?? "Người học"}>{children}</AppShell>;
}
