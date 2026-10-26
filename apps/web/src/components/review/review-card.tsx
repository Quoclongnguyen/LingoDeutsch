import { Eye, Layers3 } from "lucide-react";

import type { ReviewCardData, ReviewRating } from "@/components/review/types";

const ratingCopy: Array<{
  key: string;
  label: string;
  rating: ReviewRating;
}> = [
  { key: "1", label: "Lại", rating: "again" },
  { key: "2", label: "Khó", rating: "hard" },
  { key: "3", label: "Tốt", rating: "good" },
  { key: "4", label: "Dễ", rating: "easy" },
];

function intervalLabel(intervalDays: number) {
  if (intervalDays === 0) return "10 phút";
  if (intervalDays === 1) return "1 ngày";
  return `${intervalDays} ngày`;
}

export function ReviewCard({
  card,
  onRate,
  onReveal,
  rating,
  revealed,
}: {
  card: ReviewCardData;
  onRate: (rating: ReviewRating) => void;
  onReveal: () => void;
  rating?: ReviewRating;
  revealed: boolean;
}) {
  const { word } = card;
  return (
    <article className="review-card" aria-live="polite">
      <div className="review-card__prompt">
        <p className="eyebrow">Deutsch → Việt</p>
        <Layers3 aria-hidden="true" size={24} />
        <h2>{word.headword}</h2>
        <p>Hãy nhớ nghĩa và cách dùng của từ này trước khi hiện đáp án.</p>
      </div>

      {!revealed ? (
        <button
          className="button button--primary review-reveal"
          type="button"
          onClick={onReveal}
        >
          <Eye aria-hidden="true" size={19} />
          Hiện đáp án
          <kbd>Space</kbd>
        </button>
      ) : (
        <div className="review-answer">
          <div className="review-answer__word">
            <p className="eyebrow">Đáp án</p>
            <h3>
              {word.article ? `${word.article} ` : ""}
              {word.headword}
            </h3>
            {word.plural ? <p>Số nhiều: {word.plural}</p> : null}
            {word.noPlural ? <p>Không dùng ở dạng số nhiều.</p> : null}
          </div>
          <div className="review-answer__meaning">
            <p>{word.meaningsVi.join("; ")}</p>
            {word.examples[0] ? (
              <blockquote>
                <span lang="de">{word.examples[0].de}</span>
                {word.examples[0].vi ? (
                  <small>{word.examples[0].vi}</small>
                ) : null}
              </blockquote>
            ) : null}
            {word.grammar.notes ? (
              <p className="review-note">Ghi chú: {word.grammar.notes}</p>
            ) : null}
          </div>
          <fieldset className="rating-controls" disabled={Boolean(rating)}>
            <legend>Bạn nhớ từ này ở mức nào?</legend>
            {ratingCopy.map((option) => (
              <button
                key={option.rating}
                className={`rating-button rating-button--${option.rating}`}
                type="button"
                aria-pressed={rating === option.rating}
                onClick={() => onRate(option.rating)}
              >
                <span>{option.label}</span>
                <small>
                  {option.key} ·{" "}
                  {intervalLabel(
                    card.intervalPreviews[option.rating].intervalDays,
                  )}
                </small>
              </button>
            ))}
          </fieldset>
        </div>
      )}
    </article>
  );
}
