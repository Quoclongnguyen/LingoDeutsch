import { CalendarDays } from "lucide-react";

import type { ProgressResponse } from "./types";

function dayLabel(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function ActivityTimeline({
  activity,
}: Pick<ProgressResponse, "activity">) {
  return (
    <section className="activity-evidence" aria-labelledby="activity-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">7 ngày gần nhất</p>
          <h2 id="activity-title">Nhịp học thực tế</h2>
        </div>
        <CalendarDays aria-hidden="true" size={24} />
      </div>
      <p>
        Có hoạt động vào <strong>{activity.activeDays}/7 ngày</strong>. Mỗi ô
        chỉ đếm cập nhật bài học, lượt ôn và lượt làm bài đã được lưu.
      </p>
      <ol className="activity-days">
        {activity.days.map((day) => {
          const total = day.lessonUpdates + day.reviews + day.exerciseAttempts;
          return (
            <li key={day.date} data-active={total > 0}>
              <span>{dayLabel(day.date)}</span>
              <strong>{total}</strong>
              <small>
                {day.lessonUpdates} học · {day.reviews} ôn ·{" "}
                {day.exerciseAttempts} bài tập
              </small>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
