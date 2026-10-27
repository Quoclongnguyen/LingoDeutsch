"use client";

import { ArrowRight, Check, Clock3, LockKeyhole, Target } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { RetryableErrorState } from "@/components/states/retryable-error-state";
import { useDomainResource } from "@/components/states/use-domain-resource";
import type { LearningPathResponse } from "./types";
import { LearnSectionNavigation } from "./learn-section-navigation";

export function LearningPathWorkspace() {
  const {
    data: path,
    error,
    loading,
    retry,
  } = useDomainResource<LearningPathResponse>(
    "/api/domain/learning-path?level=A1",
    "Không thể tải lộ trình.",
  );

  if (error) {
    return (
      <RetryableErrorState
        title="Chưa thể tải lộ trình A1"
        description={`${error} Bạn có thể thử kết nối lại ngay.`}
        onRetry={retry}
      />
    );
  }
  if (loading || !path) return <LoadingSkeleton />;
  if (path.modules.length === 0) {
    return (
      <EmptyState
        title="Chưa có bài học A1"
        description="Hãy chạy seed A1 để thêm nội dung học mẫu vào cơ sở dữ liệu."
      />
    );
  }

  return (
    <div className="page-stack learning-path-page">
      <LearnSectionNavigation />
      <header className="page-heading learning-heading">
        <div>
          <p className="eyebrow">Lernweg · Lộ trình cá nhân</p>
          <h1>Lộ trình tiếng Đức A1</h1>
          <p>
            Học theo tình huống thực tế, lưu từ quan trọng và quay lại ôn đúng
            thời điểm.
          </p>
        </div>
        {path.nextLesson ? (
          <Link
            className="button button--primary"
            href={`/learn/${path.nextLesson.slug}`}
          >
            Bắt đầu bài tiếp theo
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        ) : (
          <span className="completion-chip">
            <Check aria-hidden="true" size={17} /> Hoàn thành A1 hiện có
          </span>
        )}
      </header>

      <nav className="level-tabs" aria-label="Trình độ CEFR">
        {(["A1", "A2", "B1", "B2"] as const).map((level) => (
          <button
            key={level}
            type="button"
            aria-current={level === "A1" ? "page" : undefined}
            disabled={level !== "A1"}
          >
            {level}
            {level !== "A1" ? <span>Chưa mở</span> : null}
          </button>
        ))}
      </nav>

      <div className="module-timeline">
        {path.modules.map((module) => (
          <section
            className="learning-module"
            key={module.moduleOrder}
            aria-labelledby={`module-${module.moduleOrder}`}
          >
            <header className="module-heading">
              <div className="module-index" aria-hidden="true">
                {String(module.moduleOrder).padStart(2, "0")}
              </div>
              <div>
                <p className="eyebrow">Modul {module.moduleOrder}</p>
                <h2 id={`module-${module.moduleOrder}`} lang="de">
                  {module.titleDe}
                </h2>
                <p>
                  {module.titleVi} · {module.descriptionVi}
                </p>
              </div>
              <div className="module-outcome">
                <Target aria-hidden="true" size={18} />
                <span>{module.outcomeVi}</span>
              </div>
            </header>

            <div
              className="module-progress"
              aria-label={`${module.progressPercent}% hoàn thành`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={module.progressPercent}
              data-progress={module.progressPercent}
              role="progressbar"
            >
              <span />
            </div>
            <p className="module-meta">
              {module.completedLessons}/{module.totalLessons} bài ·{" "}
              {module.vocabularyCount} từ · {module.estimatedMinutes} phút
            </p>

            <ol className="lesson-list">
              {module.lessons.map((lesson) => (
                <li className="lesson-row" key={lesson.id}>
                  <span className="lesson-state" aria-hidden="true">
                    {lesson.progress.status === "completed" ? (
                      <Check size={18} />
                    ) : lesson.isLocked ? (
                      <LockKeyhole size={18} />
                    ) : (
                      String(lesson.lessonOrder).padStart(2, "0")
                    )}
                  </span>
                  <div className="lesson-copy">
                    <div>
                      <h3 lang="de">{lesson.titleDe}</h3>
                      <p>{lesson.titleVi}</p>
                    </div>
                    <small>
                      <Clock3 aria-hidden="true" size={15} />{" "}
                      {lesson.estimatedMinutes} phút · {lesson.vocabularyCount}{" "}
                      từ
                    </small>
                  </div>
                  {lesson.isLocked ? (
                    <span className="locked-label">Đang khóa</span>
                  ) : (
                    <Link
                      className="lesson-link"
                      href={`/learn/${lesson.slug}${lesson.progress.status === "completed" ? "?replay=1" : ""}`}
                      aria-label={`${lesson.progress.status === "completed" ? "Học lại" : lesson.progress.status === "in_progress" ? "Tiếp tục" : "Mở bài"} ${lesson.titleDe}`}
                    >
                      {lesson.progress.status === "completed"
                        ? "Học lại"
                        : lesson.progress.status === "in_progress"
                          ? "Tiếp tục"
                          : "Mở bài"}
                      <ArrowRight aria-hidden="true" size={17} />
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
