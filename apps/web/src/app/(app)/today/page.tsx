import { ArrowRight, BookOpen, CalendarClock, MapPin } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/states/empty-state";

export const metadata: Metadata = {
  title: "Hôm nay",
};

export default function TodayPage() {
  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Chủ nhật · Lernplan A1</p>
          <h1>Hôm nay</h1>
          <p>Một buổi học ngắn, rõ ràng và vừa sức.</p>
        </div>
        <span className="foundation-badge">Nền tảng Phase 00</span>
      </header>

      <div className="dashboard-grid">
        <section className="continue-panel" aria-labelledby="continue-title">
          <div className="panel-kicker">
            <BookOpen aria-hidden="true" size={18} />
            Bài học tiếp theo
          </div>
          <div className="continue-panel__body">
            <span className="grammar-label">A1 · LEKTION 01</span>
            <h2 id="continue-title">Chào hỏi và giới thiệu</h2>
            <p>
              Luyện cách giới thiệu bản thân, hỏi tên và dùng{" "}
              <span lang="de">Sie</span> trong tình huống trang trọng.
            </p>
          </div>
          <button className="button button--primary" type="button" disabled>
            Bắt đầu sau Phase 00
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </section>

        <aside className="dashboard-rail" aria-label="Tóm tắt hôm nay">
          <section className="rail-section" aria-labelledby="review-heading">
            <div className="rail-section__heading">
              <CalendarClock aria-hidden="true" size={20} />
              <h2 id="review-heading">Từ đến hạn</h2>
            </div>
            <strong className="metric">—</strong>
            <p>Dữ liệu ôn tập sẽ được kết nối trong Phase 03.</p>
          </section>
          <section className="rail-section" aria-labelledby="goal-heading">
            <div className="rail-section__heading">
              <MapPin aria-hidden="true" size={20} />
              <h2 id="goal-heading">Mục tiêu thực tế</h2>
            </div>
            <p lang="de">Einen Termin vereinbaren</p>
            <small>Đặt một cuộc hẹn bằng tiếng Đức.</small>
          </section>
        </aside>
      </div>

      <EmptyState
        title="Chưa có hoạt động học gần đây"
        description="Khi dữ liệu học tập được kết nối, các bài đã học và lượt ôn gần nhất sẽ xuất hiện tại đây."
      />
    </div>
  );
}
