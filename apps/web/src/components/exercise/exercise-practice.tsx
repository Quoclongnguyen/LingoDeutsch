"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import type {
  ExerciseAnswer,
  ExerciseSourceType,
  PublicExercise,
} from "@lingo-deutsch/shared";
import { readDomainJson } from "@/components/learning/read-domain-json";

type AttemptResult = {
  attempt: {
    id?: string;
    score: number;
    total: number;
  };
  idempotent: boolean;
  results: Array<{
    correct: boolean;
    exerciseId: string;
    feedbackVi: string;
    type: PublicExercise["type"];
  }>;
};

function createAttemptEventId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function buildAnswer(
  exercise: PublicExercise,
  answer: string | string[],
): ExerciseAnswer {
  if (exercise.type === "word_ordering") {
    return {
      answer: answer as string[],
      exerciseId: exercise.id,
      type: exercise.type,
    };
  }
  if (exercise.type === "fill_blank") {
    return {
      answer: answer as string,
      exerciseId: exercise.id,
      type: exercise.type,
    };
  }
  return {
    answer: answer as string,
    exerciseId: exercise.id,
    type: exercise.type,
  };
}

export function ExercisePractice({
  exercises,
  onComplete,
  onCompletionChange,
  sourceId,
  sourceType,
  title,
}: {
  exercises: PublicExercise[];
  onComplete?: (result: AttemptResult) => void;
  onCompletionChange?: (complete: boolean) => void;
  sourceId: string;
  sourceType: ExerciseSourceType;
  title: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [attemptEventId, setAttemptEventId] = useState(createAttemptEventId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AttemptResult>();
  const exercise = exercises[currentIndex];

  if (exercises.length === 0) {
    return (
      <section className="exercise-practice exercise-practice--empty">
        <h2>{title}</h2>
        <p>Chưa có câu hỏi phù hợp để luyện tập.</p>
      </section>
    );
  }

  function setCurrentAnswer(answer: string | string[]) {
    if (!exercise) return;
    setAnswers((current) => ({ ...current, [exercise.id]: answer }));
    setError("");
  }

  function answerReady(item: PublicExercise) {
    const answer = answers[item.id];
    if (item.type === "word_ordering") {
      return Array.isArray(answer) && answer.length === item.tokens.length;
    }
    return typeof answer === "string" && answer.trim().length > 0;
  }

  async function submit() {
    if (!exercises.every(answerReady)) {
      setError("Hãy trả lời đủ các câu trước khi nộp bài.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await readDomainJson<AttemptResult>(
        await fetch("/api/domain/exercise-attempts", {
          body: JSON.stringify({
            answers: exercises.map((item) =>
              buildAnswer(item, answers[item.id]!),
            ),
            attemptEventId,
            sourceId,
            sourceType,
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
      );
      setResult(response);
      onCompletionChange?.(true);
      onComplete?.(response);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Chưa thể chấm bài. Hãy thử nộp lại.",
      );
    } finally {
      setPending(false);
    }
  }

  function retry() {
    setAnswers({});
    setAttemptEventId(createAttemptEventId());
    setCurrentIndex(0);
    setError("");
    setResult(undefined);
    onCompletionChange?.(false);
  }

  if (result) {
    return (
      <section
        className="exercise-results"
        aria-labelledby="exercise-result-title"
      >
        <header>
          <p className="eyebrow">Abgeschlossen</p>
          <h2 id="exercise-result-title">
            Kết quả {result.attempt.score}/{result.attempt.total}
          </h2>
          <p>
            {result.attempt.total - result.attempt.score} câu cần xem lại trong
            lượt này.
          </p>
        </header>
        <ol className="exercise-feedback-list">
          {result.results.map((item, index) => (
            <li data-correct={item.correct} key={item.exerciseId}>
              {item.correct ? (
                <CheckCircle2 aria-hidden="true" size={20} />
              ) : (
                <XCircle aria-hidden="true" size={20} />
              )}
              <div>
                <strong>{item.correct ? "Đúng" : "Chưa đúng"}</strong>
                <span>Câu {index + 1}</span>
                <p>{item.feedbackVi}</p>
              </div>
            </li>
          ))}
        </ol>
        <button
          className="button button--secondary"
          type="button"
          onClick={retry}
        >
          <RotateCcw aria-hidden="true" size={18} /> Làm lại
        </button>
      </section>
    );
  }

  if (!exercise) return null;
  const currentAnswer = answers[exercise.id];
  const isLast = currentIndex === exercises.length - 1;

  return (
    <section className="exercise-practice" aria-labelledby="exercise-title">
      <header className="exercise-practice__header">
        <div>
          <p className="eyebrow">
            Übung {currentIndex + 1} / {exercises.length}
          </p>
          <h2 id="exercise-title">{title}</h2>
        </div>
        <div
          aria-label={`Câu ${currentIndex + 1} trên ${exercises.length}`}
          aria-valuemax={exercises.length}
          aria-valuemin={1}
          aria-valuenow={currentIndex + 1}
          className="exercise-progress"
          role="progressbar"
        >
          {exercises.map((item, index) => (
            <span data-active={index <= currentIndex} key={item.id} />
          ))}
        </div>
      </header>

      <div className="exercise-question">
        <p>{exercise.instructionVi}</p>
        {exercise.type !== "word_ordering" ? (
          <h3 lang="de">{exercise.promptDe}</h3>
        ) : null}

        {exercise.type === "multiple_choice" ? (
          <div className="quiz-options" role="group" aria-label="Các lựa chọn">
            {exercise.options.map((option, index) => (
              <button
                aria-label={option.text}
                aria-pressed={currentAnswer === option.id}
                key={option.id}
                onClick={() => setCurrentAnswer(option.id)}
                type="button"
              >
                <span className="grammar-label">{index + 1}</span>
                <span lang="de">{option.text}</span>
              </button>
            ))}
          </div>
        ) : null}

        {exercise.type === "fill_blank" ? (
          <div className="exercise-fill">
            <label htmlFor={`answer-${exercise.id}`}>Câu trả lời</label>
            <input
              autoComplete="off"
              id={`answer-${exercise.id}`}
              lang="de"
              onChange={(event) => setCurrentAnswer(event.target.value)}
              value={typeof currentAnswer === "string" ? currentAnswer : ""}
            />
            <small>Giữ nguyên umlaut và ß khi từ gốc có các ký tự này.</small>
          </div>
        ) : null}

        {exercise.type === "word_ordering" ? (
          <WordOrdering
            answer={Array.isArray(currentAnswer) ? currentAnswer : []}
            exercise={exercise}
            onChange={setCurrentAnswer}
          />
        ) : null}
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <footer className="exercise-actions">
        {currentIndex > 0 ? (
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setCurrentIndex((index) => index - 1)}
          >
            <ArrowLeft aria-hidden="true" size={18} /> Câu trước
          </button>
        ) : (
          <span />
        )}
        <button
          className="button button--primary"
          disabled={pending || !answerReady(exercise)}
          type="button"
          onClick={() =>
            isLast ? void submit() : setCurrentIndex((index) => index + 1)
          }
        >
          {pending ? "Đang chấm…" : isLast ? "Nộp bài" : "Câu tiếp theo"}
          {!pending ? <ArrowRight aria-hidden="true" size={18} /> : null}
        </button>
      </footer>
    </section>
  );
}

function WordOrdering({
  answer,
  exercise,
  onChange,
}: {
  answer: string[];
  exercise: Extract<PublicExercise, { type: "word_ordering" }>;
  onChange: (answer: string[]) => void;
}) {
  const tokenById = new Map(exercise.tokens.map((token) => [token.id, token]));
  const available = exercise.tokens.filter(
    (token) => !answer.includes(token.id),
  );
  const currentText = answer
    .map((id) => tokenById.get(id)?.text)
    .filter(Boolean)
    .join(" ");

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= answer.length) return;
    const next = [...answer];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  return (
    <div className="word-ordering">
      <p id={`ordering-help-${exercise.id}`}>
        Chọn từng từ để thêm vào câu. Dùng các nút trái, phải hoặc bỏ để chỉnh
        thứ tự mà không cần kéo thả.
      </p>
      <div
        aria-describedby={`ordering-help-${exercise.id}`}
        aria-label="Từ chưa dùng"
        className="word-token-bank"
        role="group"
      >
        {available.map((token) => (
          <button
            aria-label={`Thêm ${token.text.replace(/[.!?]$/u, "")}`}
            key={token.id}
            onClick={() => onChange([...answer, token.id])}
            type="button"
          >
            {token.text}
          </button>
        ))}
      </div>
      <div className="word-order-line">
        <span>Thứ tự câu</span>
        {answer.length === 0 ? <p>Chưa có từ nào.</p> : null}
        <ol>
          {answer.map((id, index) => {
            const token = tokenById.get(id);
            if (!token) return null;
            return (
              <li key={id}>
                <span lang="de">{token.text}</span>
                <span className="word-token-actions">
                  <button
                    aria-label={`Di chuyển ${token.text} sang trái`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    type="button"
                  >
                    ←
                  </button>
                  <button
                    aria-label={`Di chuyển ${token.text} sang phải`}
                    disabled={index === answer.length - 1}
                    onClick={() => move(index, 1)}
                    type="button"
                  >
                    →
                  </button>
                  <button
                    aria-label={`Bỏ ${token.text}`}
                    onClick={() =>
                      onChange(answer.filter((item) => item !== id))
                    }
                    type="button"
                  >
                    ×
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <p aria-label="Thứ tự hiện tại" aria-live="polite" role="status">
        {currentText || "Chưa có từ nào trong câu."}
      </p>
      <button
        className="button button--secondary"
        disabled={answer.length === 0}
        onClick={() => onChange([])}
        type="button"
      >
        <RotateCcw aria-hidden="true" size={17} /> Đặt lại thứ tự
      </button>
    </div>
  );
}
