"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";

import type {
  VocabularySet,
  VocabularyWord,
} from "@/components/vocabulary/types";

type WordPayload = {
  article?: "der" | "die" | "das";
  examples: Array<{ de: string; vi?: string }>;
  grammar: Record<string, boolean | string>;
  headword: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  meaningsVi: string[];
  noPlural: boolean;
  plural?: string;
  setIds: string[];
  wordType: VocabularyWord["wordType"];
};

export function WordFormDialog({
  onClose,
  onSave,
  sets,
  word,
}: {
  onClose: () => void;
  onSave: (payload: WordPayload) => Promise<void>;
  sets: VocabularySet[];
  word?: VocabularyWord;
}) {
  const [wordType, setWordType] = useState<VocabularyWord["wordType"]>(
    word?.wordType ?? "noun",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const article = form.get("article")?.toString();
    const plural = form.get("plural")?.toString().trim();
    const exampleDe = form.get("exampleDe")?.toString().trim();
    const exampleVi = form.get("exampleVi")?.toString().trim();

    setPending(true);
    setError("");
    try {
      await onSave({
        ...(wordType === "noun" && article
          ? { article: article as WordPayload["article"] }
          : {}),
        ...(wordType === "noun" && plural ? { plural } : {}),
        examples: exampleDe
          ? [{ de: exampleDe, ...(exampleVi ? { vi: exampleVi } : {}) }]
          : [],
        grammar: {},
        headword: form.get("headword")?.toString().trim() ?? "",
        level: (form.get("level")?.toString() ?? "A1") as WordPayload["level"],
        meaningsVi: (form.get("meaningVi")?.toString() ?? "")
          .split(";")
          .map((value) => value.trim())
          .filter(Boolean),
        noPlural: wordType === "noun" && form.get("noPlural") === "on",
        setIds: form.getAll("setIds").map(String),
        wordType,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể lưu từ.");
      setPending(false);
    }
  }

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-dialog-title"
      >
        <header className="dialog-heading">
          <div>
            <p className="eyebrow">Mục từ cá nhân</p>
            <h2 id="word-dialog-title">
              {word ? "Chỉnh sửa từ" : "Thêm từ mới"}
            </h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>
        <form className="form-stack" onSubmit={submit}>
          <div className="form-grid">
            <label className="field field--wide">
              Từ tiếng Đức
              <input
                name="headword"
                defaultValue={word?.headword}
                required
                autoFocus
                lang="de"
              />
            </label>
            <label className="field field--wide">
              Nghĩa tiếng Việt
              <input
                name="meaningVi"
                defaultValue={word?.meaningsVi.join("; ")}
                required
                placeholder="Ngăn cách nhiều nghĩa bằng dấu ;"
              />
            </label>
            <label className="field">
              Loại từ
              <select
                name="wordType"
                value={wordType}
                disabled={Boolean(word)}
                onChange={(event) =>
                  setWordType(event.target.value as VocabularyWord["wordType"])
                }
              >
                <option value="noun">Danh từ</option>
                <option value="verb">Động từ</option>
                <option value="adjective">Tính từ</option>
                <option value="adverb">Trạng từ</option>
                <option value="phrase">Cụm từ</option>
                <option value="other">Khác</option>
              </select>
            </label>
            <label className="field">
              Trình độ
              <select name="level" defaultValue={word?.level ?? "A1"}>
                {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>
            {wordType === "noun" ? (
              <>
                <label className="field">
                  Mạo từ
                  <select
                    name="article"
                    defaultValue={word?.article ?? "der"}
                    required
                  >
                    <option value="der">der</option>
                    <option value="die">die</option>
                    <option value="das">das</option>
                  </select>
                </label>
                <label className="field">
                  Số nhiều
                  <input name="plural" defaultValue={word?.plural} lang="de" />
                </label>
                <label className="check-field field--wide">
                  <input
                    type="checkbox"
                    name="noPlural"
                    defaultChecked={word?.noPlural}
                  />{" "}
                  Không có dạng số nhiều
                </label>
              </>
            ) : null}
            <label className="field field--wide">
              Ví dụ tiếng Đức
              <input
                name="exampleDe"
                defaultValue={word?.examples[0]?.de}
                lang="de"
              />
            </label>
            <label className="field field--wide">
              Dịch ví dụ
              <input name="exampleVi" defaultValue={word?.examples[0]?.vi} />
            </label>
            {sets.length > 0 ? (
              <fieldset className="set-picker field--wide">
                <legend>Thêm vào bộ từ</legend>
                {sets.map((set) => (
                  <label className="check-field" key={set.id}>
                    <input
                      type="checkbox"
                      name="setIds"
                      value={set.id}
                      defaultChecked={word?.setIds.includes(set.id)}
                    />{" "}
                    {set.name}
                  </label>
                ))}
              </fieldset>
            ) : null}
          </div>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <footer className="dialog-actions">
            <button
              className="button button--secondary"
              type="button"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="button button--primary"
              type="submit"
              disabled={pending}
            >
              {pending ? "Đang lưu…" : "Lưu từ"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
