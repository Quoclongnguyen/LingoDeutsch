"use client";

import { FileUp, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { readDomainJson } from "@/lib/api/read-domain-json";

type ImportRow = {
  errors: string[];
  input?: Record<string, unknown>;
  row: number;
  status: "valid" | "existing" | "duplicate" | "invalid";
};

export function ImportDialog({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => Promise<void>;
}) {
  const [format, setFormat] = useState<"lines" | "csv">("lines");
  const [content, setContent] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function preview(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const data = await readDomainJson<{
        rows?: ImportRow[];
        message?: string;
      }>(
        await fetch("/api/domain/vocabulary/import/preview", {
          body: JSON.stringify({ content, format }),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
        "Không thể xem trước dữ liệu nhập.",
      );
      setRows(data.rows ?? []);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Không thể xem trước dữ liệu nhập.",
      );
    } finally {
      setPending(false);
    }
  }

  async function commit() {
    const items = rows
      .filter((row) => row.status === "valid" && row.input)
      .map((row) => row.input);
    if (items.length === 0) return;
    setPending(true);
    setError("");
    try {
      await readDomainJson(
        await fetch("/api/domain/vocabulary/import/commit", {
          body: JSON.stringify({ items }),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
        "Không thể nhập từ.",
      );
      await onImported();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể nhập từ.");
      setPending(false);
    }
  }

  const validCount = rows.filter((row) => row.status === "valid").length;

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="dialog-panel dialog-panel--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-dialog-title"
      >
        <header className="dialog-heading">
          <div>
            <p className="eyebrow">Tối đa 200 từ mỗi lần</p>
            <h2 id="import-dialog-title">Nhập nhiều từ</h2>
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
        <form className="form-stack" onSubmit={preview}>
          <div className="segmented-control" aria-label="Định dạng nhập">
            <button
              type="button"
              aria-pressed={format === "lines"}
              onClick={() => setFormat("lines")}
            >
              Dòng phân cách
            </button>
            <button
              type="button"
              aria-pressed={format === "csv"}
              onClick={() => setFormat("csv")}
            >
              CSV
            </button>
          </div>
          <label className="field">
            Dữ liệu từ vựng
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={8}
              placeholder={
                format === "lines"
                  ? "Termin | lịch hẹn | noun | der | Termine | A1"
                  : "headword,meaningVi,wordType,article,plural,level"
              }
            />
          </label>
          <p className="field-hint">
            Dữ liệu chỉ được lưu sau khi bạn xem trước và xác nhận.
          </p>
          <button
            className="button button--secondary"
            type="submit"
            disabled={pending || !content.trim()}
          >
            <FileUp aria-hidden="true" size={18} />
            {pending ? "Đang kiểm tra…" : "Xem trước"}
          </button>
        </form>
        {rows.length > 0 ? (
          <div className="import-preview" aria-live="polite">
            <h3>Kết quả kiểm tra</h3>
            <ul>
              {rows.map((row) => (
                <li
                  key={row.row}
                  className={`import-row import-row--${row.status}`}
                >
                  <strong>Dòng {row.row}</strong>
                  <span>
                    {row.status === "valid"
                      ? "Hợp lệ"
                      : row.status === "existing"
                        ? "Đã có trong kho"
                        : row.status === "duplicate"
                          ? "Trùng trong dữ liệu nhập"
                          : row.errors.join("; ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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
            type="button"
            onClick={commit}
            disabled={pending || validCount === 0}
          >
            Nhập {validCount} từ hợp lệ
          </button>
        </footer>
      </section>
    </div>
  );
}
