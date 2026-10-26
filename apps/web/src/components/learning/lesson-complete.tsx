import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function LessonComplete({
  replayHref,
  replayed = false,
  titleDe,
}: {
  replayHref: string;
  replayed?: boolean;
  titleDe: string;
}) {
  return (
    <section
      className="lesson-complete"
      aria-labelledby="lesson-complete-title"
    >
      <CheckCircle2 aria-hidden="true" size={36} />
      <p className="eyebrow">
        {replayed ? "Wiederholt" : "Lektion abgeschlossen"}
      </p>
      <h1 id="lesson-complete-title">
        {replayed ? "Bạn đã luyện lại bài học" : "Bạn đã hoàn thành bài học"}
      </h1>
      <p lang="de">{titleDe}</p>
      <p>
        {replayed
          ? "Tiến độ hoàn thành trước đó vẫn được giữ nguyên."
          : "Từ đã lưu sẽ xuất hiện trong kho và hàng đợi ôn tập."}
      </p>
      <div className="heading-actions">
        <Link className="button button--primary" href="/learn">
          Tiếp tục lộ trình <ArrowRight aria-hidden="true" size={18} />
        </Link>
        <Link className="button button--secondary" href="/vocabulary">
          Mở kho từ
        </Link>
        {!replayed ? (
          <Link className="button button--secondary" href={replayHref}>
            Luyện lại bài này
          </Link>
        ) : null}
      </div>
    </section>
  );
}
