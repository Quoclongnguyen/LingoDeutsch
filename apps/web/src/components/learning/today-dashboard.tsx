"use client";

import { ArrowRight, BookOpen, MapPin } from "lucide-react";
import Link from "next/link";

import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { RetryableErrorState } from "@/components/states/retryable-error-state";
import { useDomainResource } from "@/components/states/use-domain-resource";
import { RecentLearning, TodayRail } from "./today-supporting-panels";
import type { DashboardResponse } from "./types";

export function TodayDashboard() {
  const {
    data: dashboard,
    error,
    loading,
    retry,
  } = useDomainResource<DashboardResponse>(
    "/api/domain/dashboard",
    "Không thể tải Hôm nay.",
  );

  if (error) {
    return (
      <RetryableErrorState
        title="Chưa thể chuẩn bị buổi học hôm nay"
        description={`${error} Bạn có thể thử kết nối lại ngay.`}
        onRetry={retry}
      />
    );
  }
  if (loading || !dashboard) return <LoadingSkeleton />;

  return (
    <div className="page-stack today-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Heute · Kế hoạch cá nhân</p>
          <h1>Hôm nay</h1>
          <p>
            Một bài học tiếp theo, một lượt ôn rõ ràng và một mục tiêu thực tế.
          </p>
        </div>
        {dashboard.milestone ? (
          <span className="milestone-chip">
            A1 · {dashboard.milestone.completedLessons}/
            {dashboard.milestone.totalLessons} bài
          </span>
        ) : null}
      </header>

      <div className="dashboard-grid today-grid">
        <section className="continue-panel" aria-labelledby="continue-title">
          <div className="panel-kicker">
            <BookOpen aria-hidden="true" size={18} /> Tiếp tục A1
          </div>
          {dashboard.nextLesson ? (
            <>
              <div className="continue-panel__body">
                <span className="grammar-label">
                  A1 · {dashboard.nextLesson.estimatedMinutes} MIN
                </span>
                <h2 id="continue-title" lang="de">
                  {dashboard.nextLesson.titleDe}
                </h2>
                <p>{dashboard.nextLesson.titleVi}</p>
                <p>{dashboard.nextLesson.objectiveVi}</p>
              </div>
              <Link
                className="button button--primary"
                href={`/learn/${dashboard.nextLesson.slug}`}
              >
                Mở bài học <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </>
          ) : (
            <div className="continue-panel__body">
              <h2 id="continue-title">Đã hoàn thành nội dung A1 hiện có</h2>
              <p>Tiếp tục củng cố bằng lượt ôn từ vựng hôm nay.</p>
            </div>
          )}
        </section>

        <TodayRail due={dashboard.due} weeklyGoal={dashboard.weeklyGoal} />
      </div>

      <section
        className="practical-goal"
        aria-labelledby="practical-goal-title"
      >
        <MapPin aria-hidden="true" size={22} />
        <div>
          <p className="eyebrow">Mục tiêu thực tế</p>
          <h2 id="practical-goal-title" lang="de">
            {dashboard.practicalGoal.de}
          </h2>
          <p>{dashboard.practicalGoal.vi}</p>
        </div>
      </section>

      <RecentLearning activity={dashboard.recentActivity} />
    </div>
  );
}
