import { Archive, Pencil } from "lucide-react";

import type { VocabularyWord } from "@/components/vocabulary/types";

const wordTypeLabels: Record<VocabularyWord["wordType"], string> = {
  adjective: "Tính từ",
  adverb: "Trạng từ",
  noun: "Danh từ",
  other: "Khác",
  phrase: "Cụm từ",
  verb: "Động từ",
};

const reviewLabels: Record<VocabularyWord["review"]["state"], string> = {
  learning: "Đang học",
  mastered: "Đã thuộc",
  new: "Mới",
  review: "Ôn tập",
};

export function VocabularyTable({
  items,
  onArchive,
  onEdit,
}: {
  items: VocabularyWord[];
  onArchive: (word: VocabularyWord) => void;
  onEdit: (word: VocabularyWord) => void;
}) {
  return (
    <div className="vocabulary-table-wrap">
      <table className="vocabulary-table">
        <thead>
          <tr>
            <th scope="col">Từ tiếng Đức</th>
            <th scope="col">Nghĩa</th>
            <th scope="col">Thông tin</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((word) => (
            <tr key={word.id}>
              <td data-label="Từ tiếng Đức">
                <div className="word-heading">
                  {word.article ? (
                    <span className="article-chip">{word.article}</span>
                  ) : null}
                  <h2 lang="de">{word.headword}</h2>
                </div>
                {word.plural ? (
                  <small lang="de">Số nhiều: {word.plural}</small>
                ) : null}
                {word.noPlural ? <small>Không có số nhiều</small> : null}
              </td>
              <td data-label="Nghĩa">{word.meaningsVi.join("; ")}</td>
              <td data-label="Thông tin">
                <span className="metadata-chip">{word.level ?? "—"}</span>
                <span className="metadata-chip">
                  {wordTypeLabels[word.wordType]}
                </span>
              </td>
              <td data-label="Trạng thái">
                <span
                  className={`review-state review-state--${word.review.state}`}
                >
                  {reviewLabels[word.review.state]}
                </span>
              </td>
              <td data-label="Thao tác">
                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => onEdit(word)}
                    aria-label={`Sửa ${word.headword}`}
                  >
                    <Pencil aria-hidden="true" size={17} />
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() => onArchive(word)}
                    aria-label={`Lưu trữ ${word.headword}`}
                  >
                    <Archive aria-hidden="true" size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
