"use client";

import { ArrowRight, BookOpen, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { readDomainJson } from "./read-domain-json";
import { RecentLearning, TodayRail } from "./today-supporting-panels";
import type { DashboardResponse } from "./types";

export function TodayDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/domain/dashboard", { cache: "no-store" })
      .then(readDomainJson<DashboardResponse>)
      .then((result) => active && setDashboard(result))
      .catch(
        (caught: unknown) =>
          active &&
          setError(
            caught instanceof Error ? caught.message : "Không thể tải Hôm nay.",
          ),
      );
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <EmptyState
        title="Chưa thể chuẩn bị buổi học hôm nay"
        description={`${error} Hãy tải lại trang để thử lại.`}
      />
    );
  }
  if (!dashboard) return <LoadingSkeleton />;

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
