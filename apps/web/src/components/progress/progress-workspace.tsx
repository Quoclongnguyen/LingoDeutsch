"use client";

import { ChartNoAxesColumnIncreasing } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { RetryableErrorState } from "@/components/states/retryable-error-state";
import { useDomainResource } from "@/components/states/use-domain-resource";
import { ActivityTimeline } from "./activity-timeline";
import {
  CompletedOutcomes,
  LearningEvidence,
  PracticeEvidence,
  VocabularyEvidence,
} from "./progress-evidence-panels";
import type { ProgressResponse } from "./types";

export function ProgressWorkspace() {
  const {
    data: progress,
    error,
    loading,
    retry,
  } = useDomainResource<ProgressResponse>(
    "/api/domain/progress",
    "Không thể tải dữ liệu tiến độ.",
  );

  if (error) {
    return (
      <RetryableErrorState
        icon={ChartNoAxesColumnIncreasing}
        title="Chưa thể tải tiến độ"
        description={`${error} Bạn có thể thử kết nối lại ngay.`}
        onRetry={retry}
      />
    );
  }
  if (loading || !progress) return <LoadingSkeleton />;

  const hasEvidence =
    progress.learning.completedLessons > 0 ||
    progress.learning.inProgressLessons > 0 ||
    progress.vocabulary.totalWords > 0 ||
    progress.vocabulary.reviewedWords > 0 ||
    progress.practice.attempts > 0 ||
    progress.activity.activeDays > 0;

  if (!hasEvidence) {
    return (
      <EmptyState
        icon={ChartNoAxesColumnIncreasing}
        title="Chưa có bằng chứng học tập"
        description="Bắt đầu bài A1 đầu tiên. Tiến độ sẽ chỉ xuất hiện sau khi dữ liệu bài học, bài tập hoặc lượt ôn được lưu."
        action={
          <Link className="button button--primary" href="/learn">
            Mở lộ trình A1
          </Link>
        }
      />
    );
  }

  return (
    <div className="page-stack progress-page">
      <header className="page-heading progress-heading">
        <div>
          <p className="eyebrow">Fortschritt · Dữ liệu đã lưu</p>
          <h1>Tiến độ</h1>
          <p>
            Theo dõi bằng chứng từ bài học, SRS và bài tập; không phải chứng
            nhận CEFR.
          </p>
        </div>
        <span className="milestone-chip">A1 · cập nhật theo dữ liệu thật</span>
      </header>

      <div className="progress-overview">
        <LearningEvidence learning={progress.learning} />
        <VocabularyEvidence
          reviews={progress.reviews}
          vocabulary={progress.vocabulary}
        />
      </div>
      <ActivityTimeline activity={progress.activity} />
      <div className="progress-evidence-grid">
        <PracticeEvidence practice={progress.practice} />
        <CompletedOutcomes outcomes={progress.completedOutcomes} />
      </div>
    </div>
  );
}
