import { AudioLines } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";

export default function PracticePage() {
  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Übung · Luyện tập</p>
          <h1>Luyện tập</h1>
          <p>Củng cố những từ đã học bằng một phiên ôn ngắn, tập trung.</p>
        </div>
        <Link className="button button--primary" href="/practice/review">
          Ôn từ đến hạn
        </Link>
      </header>
      <EmptyState
        icon={AudioLines}
        title="Nghe và hội thoại sẽ được mở ở giai đoạn sau"
        description="Hiện tại, hãy dùng phiên ôn từ vựng để hoàn thành vòng học cốt lõi."
      />
    </div>
  );
}
