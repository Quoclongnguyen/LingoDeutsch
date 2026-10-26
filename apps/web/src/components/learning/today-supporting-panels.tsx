import { CalendarCheck2, CalendarClock, RotateCcw, Target } from "lucide-react";
import Link from "next/link";

import type { DashboardResponse } from "./types";

export function TodayRail({
  due,
  weeklyGoal,
}: Pick<DashboardResponse, "due" | "weeklyGoal">) {
  return (
    <aside className="dashboard-rail" aria-label="Tóm tắt hôm nay">
      <section className="rail-section" aria-labelledby="review-heading">
        <div className="rail-section__heading">
          {due.count > 0 ? (
            <CalendarClock aria-hidden="true" size={20} />
          ) : (
            <CalendarCheck2 aria-hidden="true" size={20} />
          )}
          <h2 id="review-heading">Từ đến hạn</h2>
        </div>
        <strong className="metric">{due.count}</strong>
        {due.count > 0 ? (
          <>
            <ul className="due-preview">
              {due.words.map((word) => (
                <li key={word.headword}>
                  <span lang="de">
                    {[word.article, word.headword].filter(Boolean).join(" ")}
                  </span>
                  <small>{word.meaningsVi.join("; ")}</small>
                </li>
              ))}
            </ul>
            <Link className="button button--primary" href="/practice/review">
              <RotateCcw aria-hidden="true" size={17} /> Ôn {due.count} từ
            </Link>
          </>
        ) : (
          <p>
            Đã hoàn thành lượt ôn hiện tại.
            {due.nextDueAt
              ? ` Lượt tiếp theo: ${formatDateTime(due.nextDueAt)}.`
              : " Chưa có lượt ôn tiếp theo."}
          </p>
        )}
        <Link className="text-link" href="/vocabulary">
          Mở kho từ
        </Link>
      </section>

      <section className="rail-section" aria-labelledby="weekly-heading">
        <div className="rail-section__heading">
          <Target aria-hidden="true" size={20} />
          <h2 id="weekly-heading">Mục tiêu tuần</h2>
        </div>
        <p>
          <strong>
            {weeklyGoal.completed}/{weeklyGoal.target}
          </strong>{" "}
          buổi học hoặc ngày ôn
        </p>
        <div
          className="weekly-marks"
          aria-label={`${weeklyGoal.completed} trên ${weeklyGoal.target} mục tiêu`}
          aria-valuemax={weeklyGoal.target}
          aria-valuemin={0}
          aria-valuenow={weeklyGoal.completed}
          role="progressbar"
        >
          {Array.from({ length: weeklyGoal.target }, (_, index) => (
            <span key={index} data-complete={index < weeklyGoal.completed} />
          ))}
        </div>
      </section>
    </aside>
  );
}

export function RecentLearning({
  activity,
}: {
  activity: DashboardResponse["recentActivity"];
}) {
  return (
    <section
      className="recent-learning"
      aria-labelledby="recent-learning-title"
    >
      <h2 id="recent-learning-title">Hoạt động gần đây</h2>
      {activity.length > 0 ? (
        <ol>
          {activity.map((item, index) => (
            <li key={`${item.at}-${index}`}>
              <span>{item.kind === "review" ? "Ôn từ" : "Bài học"}</span>
              <strong lang="de">{item.headword ?? item.titleDe}</strong>
              <small>{formatDateTime(item.at)}</small>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted-copy">
          Hoàn thành một hoạt động hoặc ôn từ để bắt đầu lịch sử học tập.
        </p>
      )}
    </section>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
