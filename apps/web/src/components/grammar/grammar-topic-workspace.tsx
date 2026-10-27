"use client";

import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import type { GrammarTopicDetail } from "@lingo-deutsch/shared";
import { LearnSectionNavigation } from "@/components/learning/learn-section-navigation";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { RetryableErrorState } from "@/components/states/retryable-error-state";
import { useDomainResource } from "@/components/states/use-domain-resource";

export function GrammarTopicWorkspace({ slug }: { slug: string }) {
  const {
    data: topic,
    error,
    loading,
    retry,
  } = useDomainResource<GrammarTopicDetail>(
    `/api/domain/grammar-topics/${encodeURIComponent(slug)}`,
    "Không thể tải chủ đề ngữ pháp.",
  );

  if (error) {
    return (
      <RetryableErrorState
        icon={BookOpen}
        title="Chưa thể tải chủ đề ngữ pháp"
        description={`${error} Bạn có thể thử lại hoặc quay về thư viện.`}
        onRetry={retry}
        secondaryAction={
          <Link className="button button--secondary" href="/learn/grammar">
            Quay lại thư viện
          </Link>
        }
      />
    );
  }
  if (loading || !topic) return <LoadingSkeleton />;
  const exercises = topic.exercises ?? [];

  return (
    <article className="page-stack grammar-topic-page">
      <LearnSectionNavigation />
      <header className="grammar-topic-header">
        <Link className="back-link" href="/learn/grammar">
          <ArrowLeft aria-hidden="true" size={18} /> Thư viện ngữ pháp
        </Link>
        <p className="eyebrow">
          {topic.level} · Thema {topic.order}
        </p>
        <h1 lang="de">{topic.titleDe}</h1>
        <p className="grammar-topic-title-vi">{topic.titleVi}</p>
        <p>{topic.summaryVi}</p>
      </header>

      <div className="grammar-rules">
        {topic.rules.map((rule) => (
          <section aria-labelledby={`rule-${rule.id}`} key={rule.id}>
            <p className="grammar-label">Regel</p>
            <h2 id={`rule-${rule.id}`} lang="de">
              {rule.titleDe}
            </h2>
            <p>{rule.explanationVi}</p>
          </section>
        ))}
      </div>

      <section className="grammar-examples" aria-labelledby="examples-title">
        <div>
          <p className="eyebrow">Beispiele</p>
          <h2 id="examples-title">Ví dụ đối chiếu</h2>
        </div>
        <ol>
          {topic.examples.map((example, index) => (
            <li key={`${example.de}-${index}`}>
              <span lang="de">{example.de}</span>
              <small>{example.vi}</small>
            </li>
          ))}
        </ol>
      </section>

      {topic.compactTable ? (
        <div className="grammar-table-region" tabIndex={0}>
          <table aria-label={topic.compactTable.captionVi}>
            <caption>{topic.compactTable.captionVi}</caption>
            <thead>
              <tr>
                {topic.compactTable.headers.map((header) => (
                  <th key={header} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topic.compactTable.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th key={cellIndex} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={cellIndex} lang="de">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {exercises.length > 0 ? (
        <section
          className="grammar-practice-callout"
          aria-labelledby="practice-title"
        >
          <div>
            <p className="eyebrow">Übungen</p>
            <h2 id="practice-title">Luyện chủ đề này</h2>
            <p>
              Hoàn thành {exercises.length} câu và nhận phản hồi sau khi nộp.
            </p>
          </div>
          <Link
            className="button button--primary"
            href={`/practice/exercises/grammar_topic/${topic.slug}`}
          >
            Bắt đầu luyện <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>
      ) : null}

      <section className="related-lessons" aria-labelledby="lessons-title">
        <div>
          <p className="eyebrow">Im Lernweg</p>
          <h2 id="lessons-title">Bài học liên quan</h2>
        </div>
        {topic.relatedLessons.length === 0 ? (
          <p className="muted-copy">
            Chưa có bài học đã xuất bản cho chủ đề này.
          </p>
        ) : (
          <ul>
            {topic.relatedLessons.map((lesson) => (
              <li key={lesson.slug}>
                <Link
                  className="related-lesson-link"
                  href={`/learn/${lesson.slug}`}
                >
                  <span>
                    <strong lang="de">{lesson.titleDe}</strong>
                    <small>{lesson.titleVi}</small>
                  </span>
                  <span className="text-link" aria-hidden="true">
                    Mở bài học <ArrowRight size={17} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
