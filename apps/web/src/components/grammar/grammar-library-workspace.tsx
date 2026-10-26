"use client";

import { ArrowRight, BookOpenText, Link2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { GrammarTopicListResponse } from "@lingo-deutsch/shared";
import { LearnSectionNavigation } from "@/components/learning/learn-section-navigation";
import { readDomainJson } from "@/components/learning/read-domain-json";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";

export function GrammarLibraryWorkspace() {
  const [response, setResponse] = useState<GrammarTopicListResponse>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/domain/grammar-topics?level=A1", { cache: "no-store" })
      .then(readDomainJson<GrammarTopicListResponse>)
      .then((result) => active && setResponse(result))
      .catch(
        (caught: unknown) =>
          active &&
          setError(
            caught instanceof Error
              ? caught.message
              : "Không thể tải thư viện ngữ pháp.",
          ),
      );
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <EmptyState
        icon={BookOpenText}
        title="Chưa thể tải ngữ pháp A1"
        description={`${error} Hãy tải lại trang để thử lại.`}
      />
    );
  }
  if (!response) return <LoadingSkeleton />;

  return (
    <div className="page-stack grammar-library-page">
      <LearnSectionNavigation />
      <header className="page-heading learning-heading">
        <div>
          <p className="eyebrow">Grammatik · Quy tắc trong ngữ cảnh</p>
          <h1>Ngữ pháp tiếng Đức A1</h1>
          <p>
            Đọc một quy tắc ngắn, so sánh ví dụ rồi quay lại bài học liên quan.
          </p>
        </div>
        <span className="milestone-chip">
          A1 · {response.topics.length} chủ đề
        </span>
      </header>

      <nav aria-label="Trình độ ngữ pháp" className="level-tabs">
        {(["A1", "A2", "B1", "B2"] as const).map((level) => (
          <button
            aria-current={level === "A1" ? "page" : undefined}
            disabled={level !== "A1"}
            key={level}
            type="button"
          >
            {level}
            {level !== "A1" ? <span>Chưa mở</span> : null}
          </button>
        ))}
      </nav>

      {response.topics.length === 0 ? (
        <EmptyState
          icon={BookOpenText}
          title="Chưa có chủ đề ngữ pháp A1"
          description="Hãy chạy seed A1 để thêm nội dung ngữ pháp đã được kiểm tra."
        />
      ) : (
        <div className="grammar-topic-list">
          {response.topics.map((topic) => (
            <details className="grammar-topic-card" key={topic.slug}>
              <summary>
                <span className="grammar-topic-order">
                  {String(topic.order).padStart(2, "0")}
                </span>
                <span>
                  <strong lang="de">{topic.titleDe}</strong>
                  <small>{topic.titleVi}</small>
                </span>
                <span className="grammar-topic-meta">
                  <Link2 aria-hidden="true" size={15} />{" "}
                  {topic.relatedLessonCount} bài học
                </span>
              </summary>
              <div className="grammar-topic-preview">
                <p>{topic.summaryVi}</p>
                {topic.example ? (
                  <blockquote>
                    <span lang="de">{topic.example.de}</span>
                    <small>{topic.example.vi}</small>
                  </blockquote>
                ) : null}
                <Link
                  className="text-link"
                  href={`/learn/grammar/${topic.slug}`}
                >
                  Mở {topic.titleDe}
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
