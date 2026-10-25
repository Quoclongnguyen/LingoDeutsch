"use client";

import { Archive, FolderPlus, Layers3, Pencil } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { VocabularySet } from "@/components/vocabulary/types";

export function VocabularySetsView({
  onChanged,
  sets,
}: {
  onChanged: () => Promise<void>;
  sets: VocabularySet[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<VocabularySet | null>(null);
  const [error, setError] = useState("");

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const description = data.get("description")?.toString().trim();
    const response = await fetch("/api/domain/vocabulary-sets", {
      body: JSON.stringify({
        ...(description ? { description } : {}),
        name: data.get("name"),
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      setError("Không thể tạo bộ từ. Hãy kiểm tra lại tên bộ từ.");
      return;
    }
    form.reset();
    setCreating(false);
    setError("");
    await onChanged();
  }

  async function archive(set: VocabularySet) {
    if (
      !window.confirm(
        `Lưu trữ bộ từ “${set.name}”? Các từ bên trong vẫn được giữ lại.`,
      )
    )
      return;
    const response = await fetch(`/api/domain/vocabulary-sets/${set.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError("Không thể lưu trữ bộ từ.");
      return;
    }
    await onChanged();
  }

  async function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const description = data.get("description")?.toString().trim();
    const response = await fetch(`/api/domain/vocabulary-sets/${editing.id}`, {
      body: JSON.stringify({
        ...(description ? { description } : {}),
        name: data.get("name"),
      }),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) {
      setError("Không thể cập nhật bộ từ.");
      return;
    }
    setEditing(null);
    setError("");
    await onChanged();
  }

  return (
    <section className="sets-section" aria-labelledby="sets-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Nhóm từ theo mục tiêu</p>
          <h2 id="sets-heading">Bộ từ cá nhân</h2>
        </div>
        <button
          className="button button--secondary"
          type="button"
          onClick={() => setCreating((value) => !value)}
        >
          <FolderPlus aria-hidden="true" size={18} />
          Tạo bộ từ
        </button>
      </div>
      {creating ? (
        <form className="inline-create-form" onSubmit={create}>
          <label className="field">
            Tên bộ từ
            <input
              name="name"
              required
              maxLength={80}
              placeholder="Ví dụ: Phỏng vấn Ausbildung"
            />
          </label>
          <label className="field">
            Mô tả
            <input
              name="description"
              maxLength={320}
              placeholder="Mục tiêu của bộ từ"
            />
          </label>
          <button className="button button--primary" type="submit">
            Lưu bộ từ
          </button>
        </form>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {editing ? (
        <form
          className="inline-create-form"
          onSubmit={rename}
          aria-label={`Sửa bộ ${editing.name}`}
        >
          <label className="field">
            Tên bộ từ
            <input
              name="name"
              required
              maxLength={80}
              defaultValue={editing.name}
            />
          </label>
          <label className="field">
            Mô tả
            <input
              name="description"
              maxLength={320}
              defaultValue={editing.description}
            />
          </label>
          <div className="row-actions">
            <button
              className="button button--secondary"
              type="button"
              onClick={() => setEditing(null)}
            >
              Hủy
            </button>
            <button className="button button--primary" type="submit">
              Cập nhật
            </button>
          </div>
        </form>
      ) : null}
      {sets.length === 0 ? (
        <div className="compact-empty">
          <Layers3 aria-hidden="true" />
          <div>
            <h3>Chưa có bộ từ</h3>
            <p>Tạo một bộ để gom từ theo nghề nghiệp, chủ đề hoặc kỳ thi.</p>
          </div>
        </div>
      ) : (
        <div className="set-grid">
          {sets.map((set) => (
            <article className="set-card" key={set.id}>
              <div>
                <span className="metadata-chip">Bộ cá nhân</span>
                <h3>{set.name}</h3>
                <p>{set.description || "Chưa có mô tả."}</p>
              </div>
              <dl>
                <div>
                  <dt>Số từ</dt>
                  <dd>{set.wordCount}</dd>
                </div>
                <div>
                  <dt>Đến hạn</dt>
                  <dd>{set.dueCount}</dd>
                </div>
              </dl>
              <div className="set-card__actions">
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setEditing(set)}
                  aria-label={`Sửa bộ ${set.name}`}
                >
                  <Pencil aria-hidden="true" size={17} />
                </button>
                <button
                  className="icon-button icon-button--danger"
                  type="button"
                  onClick={() => archive(set)}
                  aria-label={`Lưu trữ bộ ${set.name}`}
                >
                  <Archive aria-hidden="true" size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
