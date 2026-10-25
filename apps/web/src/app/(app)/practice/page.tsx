import { AudioLines } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";

export default function PracticePage() {
  return (
    <EmptyState
      icon={AudioLines}
      title="Luyện tập sẽ theo sau vòng học cốt lõi"
      description="Phase 00 chỉ chuẩn bị vị trí ổn định trong điều hướng, chưa tạo bài nghe hoặc hội thoại."
    />
  );
}
