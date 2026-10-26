import { AlertTriangle, CalendarClock, RotateCcw } from "lucide-react";

import type { ReviewSession } from "@/components/review/types";

function dateLabel(value?: string) {
  if (!value) return "Chưa có lịch ôn tiếp theo";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ReviewLoading() {
  return (
    <div
      className="review-loading"
      role="status"
      aria-label="Đang chuẩn bị phiên ôn"
    >
      <span className="loading-line" />
      <span className="loading-line" />
      <span className="loading-line" />
    </div>
  );
}

export function ReviewRecovery({
  onContinue,
  onRestart,
  session,
}: {
  onContinue: () => void;
  onRestart: () => void;
  session: ReviewSession;
}) {
  return (
    <section className="review-recovery" aria-labelledby="recovery-title">
      <RotateCcw aria-hidden="true" size={28} />
      <div>
        <p className="eyebrow">Đã tìm thấy tiến độ</p>
        <h1 id="recovery-title">Tiếp tục phiên đang dở?</h1>
        <p>
          Bạn đã ôn {session.reviewedCount}/{session.total} từ. Các lượt đã chấm
          sẽ không bị ghi lại.
        </p>
        <div className="heading-actions">
          <button
            className="button button--primary"
            type="button"
            onClick={onContinue}
          >
            Tiếp tục
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={onRestart}
          >
            Bắt đầu lại hàng đợi
          </button>
        </div>
      </div>
    </section>
  );
}

export function ReviewEmpty({ session }: { session: ReviewSession }) {
  return (
    <section className="review-empty" aria-labelledby="empty-review-title">
      <CalendarClock aria-hidden="true" size={30} />
      <div>
        <p className="eyebrow">Hàng đợi đã sạch</p>
        <h1 id="empty-review-title">Chưa có từ đến hạn</h1>
        <p>Lượt tiếp theo: {dateLabel(session.summary?.nextDueAt)}.</p>
      </div>
    </section>
  );
}

export function ReviewComplete({ session }: { session: ReviewSession }) {
  return (
    <section className="review-complete" aria-labelledby="complete-title">
      <p className="eyebrow">Sitzung abgeschlossen</p>
      <h1 id="complete-title">Phiên ôn đã hoàn thành</h1>
      <dl>
        <div>
          <dt>Đã ôn</dt>
          <dd>{session.summary?.reviewedCount ?? session.reviewedCount}</dd>
        </div>
        <div>
          <dt>Cần chú ý</dt>
          <dd>{session.summary?.difficultCount ?? 0}</dd>
        </div>
      </dl>
      <p>
        Lượt ôn gần nhất tiếp theo: {dateLabel(session.summary?.nextDueAt)}.
      </p>
    </section>
  );
}

export function ReviewError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="inline-error" role="alert">
      <AlertTriangle aria-hidden="true" />
      <div>
        <h1>Chưa mở được phiên ôn</h1>
        <p>{message}</p>
        <button
          className="button button--secondary"
          type="button"
          onClick={onRetry}
        >
          Thử lại
        </button>
      </div>
    </section>
  );
}
