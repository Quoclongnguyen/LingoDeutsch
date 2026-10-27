import { BookCheck, Brain, Dumbbell, Languages } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import type { ProgressResponse } from "./types";

function progressStyle(completed: number, total: number) {
  const scale = total === 0 ? 0 : completed / total;
  return { "--progress-scale": scale } as CSSProperties;
}

export function LearningEvidence({
  learning,
}: Pick<ProgressResponse, "learning">) {
  return (
    <section className="progress-focus" aria-labelledby="a1-progress-title">
      <div className="panel-kicker">
        <BookCheck aria-hidden="true" size={18} /> Lộ trình A1
      </div>
      <div className="progress-focus__headline">
        <div>
          <strong id="a1-progress-title">
            {learning.completedLessons}/{learning.totalLessons} bài A1
          </strong>
          <span>{learning.inProgressLessons} bài đang học</span>
        </div>
        {learning.nextLesson ? (
          <Link
            className="button button--primary"
            href={`/learn/${learning.nextLesson.slug}`}
          >
            Tiếp tục {learning.nextLesson.titleDe}
          </Link>
        ) : (
          <Link className="button button--secondary" href="/learn">
            Xem lộ trình A1
          </Link>
        )}
      </div>
      <div className="progress-track" aria-hidden="true">
        <span
          style={progressStyle(
            learning.completedLessons,
            learning.totalLessons,
          )}
        />
      </div>
      <ol className="module-evidence">
        {learning.modules.map((module) => (
          <li key={module.moduleOrder}>
            <span className="module-evidence__index">
              {String(module.moduleOrder).padStart(2, "0")}
            </span>
            <div>
              <strong lang="de">{module.titleDe}</strong>
              <small>{module.titleVi}</small>
            </div>
            <span>
              {module.completedLessons}/{module.totalLessons} bài
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function VocabularyEvidence({
  reviews,
  vocabulary,
}: Pick<ProgressResponse, "reviews" | "vocabulary">) {
  return (
    <aside className="progress-rail" aria-label="Bằng chứng ôn từ">
      <div className="rail-section__heading">
        <Brain aria-hidden="true" size={20} />
        <h2>Từ vựng và SRS</h2>
      </div>
      <dl className="evidence-list">
        <div>
          <dt>Đã lưu</dt>
          <dd>{vocabulary.totalWords} từ</dd>
        </div>
        <div>
          <dt>Đã ôn ít nhất một lần</dt>
          <dd>{vocabulary.reviewedWords} từ đã ôn</dd>
        </div>
        <div>
          <dt>Trạng thái mastered</dt>
          <dd>{vocabulary.masteredWords} từ</dd>
        </div>
        <div>
          <dt>Đến hạn hiện tại</dt>
          <dd>{vocabulary.dueWords} từ</dd>
        </div>
        <div>
          <dt>Lịch sử SRS</dt>
          <dd>{reviews.totalReviews} lượt ôn</dd>
        </div>
      </dl>
      {reviews.totalReviews > 0 ? (
        <p className="evidence-note">
          {reviews.difficultReviews} lượt được đánh dấu Lại hoặc Khó.
        </p>
      ) : null}
      <Link className="text-link" href="/vocabulary">
        Mở kho từ vựng
      </Link>
    </aside>
  );
}

export function PracticeEvidence({
  practice,
}: Pick<ProgressResponse, "practice">) {
  return (
    <section
      className="evidence-panel"
      aria-labelledby="practice-evidence-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Bài tập đã chấm ở server</p>
          <h2 id="practice-evidence-title">Kết quả luyện tập</h2>
        </div>
        <Dumbbell aria-hidden="true" size={24} />
      </div>
      <p className="evidence-total">
        <strong>
          {practice.correctAnswers}/{practice.totalAnswers} câu đúng
        </strong>
        <span> trong {practice.attempts} lượt làm bài</span>
      </p>
      {practice.recent.length > 0 ? (
        <ol className="recent-attempts">
          {practice.recent.map((attempt) => (
            <li key={`${attempt.completedAt}-${attempt.sourceTitleDe}`}>
              <div>
                <strong lang="de">{attempt.sourceTitleDe}</strong>
                <small>
                  {attempt.sourceType === "lesson" ? "Bài học" : "Ngữ pháp"}
                </small>
              </div>
              <span>
                {attempt.score}/{attempt.total} câu
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted-copy">Chưa có lượt làm bài nào được lưu.</p>
      )}
      <Link className="text-link" href="/practice">
        Mở khu luyện tập
      </Link>
    </section>
  );
}

export function CompletedOutcomes({
  outcomes,
}: {
  outcomes: ProgressResponse["completedOutcomes"];
}) {
  return (
    <section className="evidence-panel" aria-labelledby="outcomes-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Tình huống thực tế</p>
          <h2 id="outcomes-title">Kết quả đã hoàn thành</h2>
        </div>
        <Languages aria-hidden="true" size={24} />
      </div>
      {outcomes.length > 0 ? (
        <ul className="outcome-list">
          {outcomes.map((outcome) => (
            <li key={outcome.slug}>
              <Link href={`/learn/${outcome.slug}?replay=1`}>
                <strong lang="de">{outcome.titleDe}</strong>
                <span>{outcome.objectiveVi}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted-copy">
          Hoàn thành một bài học để ghi nhận kết quả thực tế đầu tiên.
        </p>
      )}
    </section>
  );
}
