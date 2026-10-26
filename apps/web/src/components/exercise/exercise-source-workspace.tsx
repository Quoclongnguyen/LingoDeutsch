"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type {
  ExerciseSourceType,
  GrammarTopicDetail,
  PublicExercise,
} from "@lingo-deutsch/shared";
import { ExercisePractice } from "./exercise-practice";
import { readDomainJson } from "@/components/learning/read-domain-json";
import type { LessonResponse } from "@/components/learning/types";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";

type SourceView = {
  exercises: PublicExercise[];
  id: string;
  title: string;
};

type LoadState =
  | { requestKey: string; status: "loading" }
  | { error: string; requestKey: string; status: "error" }
  | { requestKey: string; source: SourceView; status: "ready" };

export function ExerciseSourceWorkspace({
  slug,
  sourceType,
}: {
  slug: string;
  sourceType: ExerciseSourceType;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${sourceType}:${slug}:${reloadKey}`;
  const [loadState, setLoadState] = useState<LoadState>({
    requestKey: "",
    status: "loading",
  });

  useEffect(() => {
    let active = true;
    const path = sourceType === "lesson" ? "lessons" : "grammar-topics";
    void fetch(`/api/domain/${path}/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
      .then(readDomainJson<LessonResponse | GrammarTopicDetail>)
      .then((data) => {
        if (!active) return;
        if (sourceType === "lesson" && "content" in data) {
          setLoadState({
            requestKey,
            source: {
              exercises: data.content.activities.flatMap((activity) =>
                activity.type === "exercise_set" ? activity.exercises : [],
              ),
              id: data.id,
              title: `Luyện bài ${data.titleDe}`,
            },
            status: "ready",
          });
          return;
        }
        if (sourceType === "grammar_topic" && "exercises" in data) {
          setLoadState({
            requestKey,
            source: {
              exercises: data.exercises,
              id: data.id,
              title: `Luyện ngữ pháp: ${data.titleDe}`,
            },
            status: "ready",
          });
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setLoadState({
            error:
              caught instanceof Error
                ? caught.message
                : "Chưa thể tải bài luyện tập.",
            requestKey,
            status: "error",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [requestKey, slug, sourceType]);

  const currentState =
    loadState.requestKey === requestKey
      ? loadState
      : ({ requestKey, status: "loading" } satisfies LoadState);

  if (currentState.status === "error") {
    return (
      <EmptyState
        title="Chưa thể tải bài luyện tập"
        description={`${currentState.error} Hãy kiểm tra kết nối và thử lại.`}
        action={
          <button
            className="button button--secondary"
            onClick={() => setReloadKey((key) => key + 1)}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={18} /> Thử lại
          </button>
        }
      />
    );
  }
  if (currentState.status !== "ready") return <LoadingSkeleton />;
  const { source } = currentState;

  return (
    <div className="exercise-page">
      <Link
        className="back-link"
        href={
          sourceType === "lesson" ? `/learn/${slug}` : `/learn/grammar/${slug}`
        }
      >
        <ArrowLeft aria-hidden="true" size={18} /> Quay lại nội dung
      </Link>
      <header className="exercise-page__header">
        <p className="eyebrow">Praxis</p>
        <h1>Bài luyện tập</h1>
        <p>{source.title}</p>
      </header>
      <ExercisePractice
        exercises={source.exercises}
        sourceId={source.id}
        sourceType={sourceType}
        title={source.title}
      />
    </div>
  );
}
