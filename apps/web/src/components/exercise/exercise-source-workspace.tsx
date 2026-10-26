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

export function ExerciseSourceWorkspace({
  slug,
  sourceType,
}: {
  slug: string;
  sourceType: ExerciseSourceType;
}) {
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [source, setSource] = useState<SourceView>();

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
          setSource({
            exercises: data.content.activities.flatMap((activity) =>
              activity.type === "exercise_set" ? activity.exercises : [],
            ),
            id: data.id,
            title: `Luyện bài ${data.titleDe}`,
          });
          return;
        }
        if (sourceType === "grammar_topic" && "exercises" in data) {
          setSource({
            exercises: data.exercises,
            id: data.id,
            title: `Luyện ngữ pháp: ${data.titleDe}`,
          });
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Chưa thể tải bài luyện tập.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [reloadKey, slug, sourceType]);

  if (error) {
    return (
      <EmptyState
        title="Chưa thể tải bài luyện tập"
        description={`${error} Hãy kiểm tra kết nối và thử lại.`}
        action={
          <button
            className="button button--secondary"
            onClick={() => {
              setError("");
              setSource(undefined);
              setReloadKey((key) => key + 1);
            }}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={18} /> Thử lại
          </button>
        }
      />
    );
  }
  if (!source) return <LoadingSkeleton />;

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
