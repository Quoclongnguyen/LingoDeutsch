"use client";

import { ChartNoAxesColumnIncreasing } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { readDomainJson } from "@/components/learning/read-domain-json";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { ActivityTimeline } from "./activity-timeline";
import {
  CompletedOutcomes,
  LearningEvidence,
  PracticeEvidence,
  VocabularyEvidence,
} from "./progress-evidence-panels";
import type { ProgressResponse } from "./types";

export function ProgressWorkspace() {
  const [progress, setProgress] = useState<ProgressResponse>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/domain/progress", { cache: "no-store" })
      .then(readDomainJson<ProgressResponse>)
      .then((result) => active && setProgress(result))
      .catch(
        (caught: unknown) =>
          active &&
          setError(
            caught instanceof Error
              ? caught.message
              : "Không thể tải dữ liệu tiến độ.",
          ),
      );
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <EmptyState
        icon={ChartNoAxesColumnIncreasing}
        title="Chưa thể tải tiến độ"
        description={`${error} Hãy tải lại trang để thử lại.`}
      />
    );
  }
  if (!progress) return <LoadingSkeleton />;

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
