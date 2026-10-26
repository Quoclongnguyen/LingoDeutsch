"use client";

import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { LessonActivityView } from "./lesson-activity";
import { LessonComplete } from "./lesson-complete";
import { readDomainJson } from "./read-domain-json";
import type { LessonResponse } from "./types";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";

export function LessonWorkspace({ slug }: { slug: string }) {
  const [lesson, setLesson] = useState<LessonResponse>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [savingHeadword, setSavingHeadword] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");

  useEffect(() => {
    let active = true;
    void fetch(`/api/domain/lessons/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
      .then(readDomainJson<LessonResponse>)
      .then((result) => active && setLesson(result))
      .catch(
        (caught: unknown) =>
          active &&
          setError(
            caught instanceof Error ? caught.message : "Không thể tải bài học.",
          ),
      );
    return () => {
      active = false;
    };
  }, [slug]);

  if (error) {
    return (
      <EmptyState
        title="Chưa thể mở bài học"
        description={`${error} Hãy quay lại lộ trình và thử lại.`}
        action={
          <Link className="button button--secondary" href="/learn">
            Quay lại lộ trình
          </Link>
        }
      />
    );
  }
  if (!lesson) return <LoadingSkeleton />;

  const activities = lesson.content.activities;
  const completed = lesson.progress.completedActivityIds;
  const currentIndex = Math.min(
    lesson.progress.currentActivityIndex,
    Math.max(activities.length - 1, 0),
  );
  const activity = activities[currentIndex];
  const completedLesson = lesson.progress.status === "completed";
  const checkReady =
    activity?.type !== "check" || selectedAnswer === activity.correctOptionId;

  async function saveWord(headword: string) {
    setSavingHeadword(headword);
    setError("");
    try {
      await readDomainJson(
        await fetch(`/api/domain/lessons/${lesson!.id}/vocabulary`, {
          body: JSON.stringify({ headword }),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
      );
      setLesson((current) =>
        current
          ? {
              ...current,
              vocabulary: current.vocabulary.map((word) =>
                word.headword === headword ? { ...word, isSaved: true } : word,
              ),
            }
          : current,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể lưu từ.");
    } finally {
      setSavingHeadword("");
    }
  }

  async function completeActivity() {
    if (!activity || !checkReady) return;
    setPending(true);
    setError("");
    const completedActivityIds = activities
      .slice(0, currentIndex + 1)
      .map((item) => item.id);
    const isComplete = completedActivityIds.length === activities.length;
    try {
      const progress = await readDomainJson<LessonResponse["progress"]>(
        await fetch(`/api/domain/lesson-progress/${lesson!.id}`, {
          body: JSON.stringify({
            completedActivityIds,
            currentActivityIndex: isComplete
              ? activities.length
              : completedActivityIds.length,
            status: isComplete ? "completed" : "in_progress",
          }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }),
      );
      setLesson((current) => (current ? { ...current, progress } : current));
      setSelectedAnswer("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Không thể lưu tiến độ.",
      );
    } finally {
      setPending(false);
    }
  }

  if (completedLesson) {
    return <LessonComplete titleDe={lesson.titleDe} />;
  }

  return (
    <div className="lesson-player">
      <header className="lesson-player__header">
        <Link className="back-link" href="/learn">
          <ArrowLeft aria-hidden="true" size={18} /> Lộ trình A1
        </Link>
        <div>
          <span className="grammar-label">{lesson.level} · Lektion</span>
          <h1 lang="de">{lesson.titleDe}</h1>
          <p>
            {lesson.titleVi} · {lesson.objectiveVi}
          </p>
        </div>
        <span className="lesson-duration">
          <Clock3 aria-hidden="true" size={17} /> {lesson.estimatedMinutes} phút
        </span>
      </header>

      <div
        className="lesson-progress"
        aria-label={`Hoạt động ${currentIndex + 1} trên ${activities.length}`}
        aria-valuemax={activities.length}
        aria-valuemin={1}
        aria-valuenow={currentIndex + 1}
        role="progressbar"
      >
        <p>
          <strong>{currentIndex + 1}</strong> / {activities.length}
        </p>
        <div className="lesson-progress__segments" aria-hidden="true">
          {activities.map((item, index) => (
            <span key={item.id} data-complete={index <= completed.length} />
          ))}
        </div>
      </div>

      {activity ? (
        <LessonActivityView
          activity={activity}
          onSaveWord={saveWord}
          onSelectAnswer={setSelectedAnswer}
          savingHeadword={savingHeadword}
          selectedAnswer={selectedAnswer}
          vocabulary={lesson.vocabulary}
        />
      ) : (
        <EmptyState
          title="Bài học chưa có hoạt động"
          description="Nội dung đang được chuẩn bị."
        />
      )}

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {activity ? (
        <footer className="lesson-player__actions">
          <button
            className="button button--primary"
            type="button"
            disabled={pending || !checkReady}
            onClick={() => void completeActivity()}
          >
            {pending
              ? "Đang lưu…"
              : currentIndex === activities.length - 1
                ? "Hoàn thành bài học"
                : "Hoàn thành hoạt động"}
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </footer>
      ) : null}
    </div>
  );
}
