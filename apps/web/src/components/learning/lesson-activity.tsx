import { BookmarkPlus, Check, MessageSquareText } from "lucide-react";

import type { LessonActivity, LessonVocabulary } from "./types";

export function LessonActivityView({
  activity,
  onSaveWord,
  onSelectAnswer,
  savingHeadword,
  selectedAnswer,
  vocabulary,
}: {
  activity: LessonActivity;
  onSaveWord: (headword: string) => Promise<void>;
  onSelectAnswer: (answer: string) => void;
  savingHeadword: string;
  selectedAnswer: string;
  vocabulary: LessonVocabulary[];
}) {
  if (activity.type === "dialogue") {
    return (
      <div className="lesson-activity">
        <div className="activity-title">
          <MessageSquareText aria-hidden="true" size={20} />
          <h2 lang="de">{activity.titleDe}</h2>
        </div>
        <p>{activity.instructionVi}</p>
        <div className="dialogue-lines">
          {activity.lines.map((line, index) => (
            <article key={`${line.speaker}-${index}`}>
              <span>{line.speaker}</span>
              <p lang="de">{line.de}</p>
              <small>{line.vi}</small>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (activity.type === "vocabulary") {
    const words = activity.headwords
      .map((headword) => vocabulary.find((word) => word.headword === headword))
      .filter((word): word is LessonVocabulary => Boolean(word));
    return (
      <div className="lesson-activity">
        <h2>Từ vựng trọng tâm</h2>
        <p>{activity.instructionVi}</p>
        <div className="lesson-word-list">
          {words.map((word) => (
            <article className="lesson-word" key={word.headword}>
              <div>
                <span className="grammar-label">{word.wordType}</span>
                <h3 lang="de">{germanLabel(word)}</h3>
                <p>{word.meaningsVi.join("; ")}</p>
                {word.examples[0] ? (
                  <small lang="de">{word.examples[0].de}</small>
                ) : null}
              </div>
              <button
                className="button button--secondary"
                type="button"
                disabled={word.isSaved || savingHeadword === word.headword}
                onClick={() => void onSaveWord(word.headword)}
              >
                {word.isSaved ? (
                  <Check aria-hidden="true" size={17} />
                ) : (
                  <BookmarkPlus aria-hidden="true" size={17} />
                )}
                {word.isSaved
                  ? "Đã lưu vào kho từ"
                  : savingHeadword === word.headword
                    ? "Đang lưu…"
                    : "Lưu vào kho từ"}
              </button>
            </article>
          ))}
        </div>
      </div>
    );
  }

  const isCorrect = selectedAnswer === activity.correctOptionId;
  return (
    <div className="lesson-activity">
      <h2 lang="de">{activity.questionDe}</h2>
      <p>{activity.instructionVi}</p>
      <div className="quiz-options" role="group" aria-label="Các lựa chọn">
        {activity.options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={selectedAnswer === option.id}
            onClick={() => onSelectAnswer(option.id)}
          >
            <span className="grammar-label">{index + 1}</span>
            <span lang="de">{option.text}</span>
          </button>
        ))}
      </div>
      {selectedAnswer ? (
        <p
          className={
            isCorrect
              ? "answer-feedback success-notice"
              : "answer-feedback form-error"
          }
          role="status"
        >
          {isCorrect
            ? activity.feedbackVi
            : "Chưa đúng. Hãy chú ý cách hỏi lịch sự với Sie."}
        </p>
      ) : null}
    </div>
  );
}

function germanLabel(word: LessonVocabulary) {
  if (word.wordType !== "noun") return word.headword;
  return [
    word.article,
    word.headword,
    word.plural ? `· ${word.plural}` : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}
