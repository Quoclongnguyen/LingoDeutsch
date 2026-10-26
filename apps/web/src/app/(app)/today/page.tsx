import type { Metadata } from "next";

import { TodayDashboard } from "@/components/learning/today-dashboard";

export const metadata: Metadata = { title: "Hôm nay" };

export default function TodayPage() {
  return <TodayDashboard />;
}
