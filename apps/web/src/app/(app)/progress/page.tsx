import { ChartNoAxesColumnIncreasing } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";

export default function ProgressPage() {
  return (
    <EmptyState
      icon={ChartNoAxesColumnIncreasing}
      title="Chưa có bằng chứng học tập"
      description="Tiến độ chỉ được hiển thị khi có dữ liệu thật từ bài học và lịch sử ôn; ứng dụng không tạo số liệu giả."
    />
  );
}
