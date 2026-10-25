"use client";

import { AlertTriangle, FileUp, LibraryBig, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { ImportDialog } from "@/components/vocabulary/import-dialog";
import type {
  VocabularyListResponse,
  VocabularySet,
  VocabularyWord,
} from "@/components/vocabulary/types";
import { VocabularySetsView } from "@/components/vocabulary/vocabulary-sets-view";
import { VocabularyTable } from "@/components/vocabulary/vocabulary-table";
import { WordFormDialog } from "@/components/vocabulary/word-form-dialog";

type Tab = "due" | "library" | "sets";
type Filters = {
  level: string;
  q: string;
  source: string;
  state: string;
  wordType: string;
};
const emptyData: VocabularyListResponse = {
  items: [],
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  summary: { due: 0, learning: 0, mastered: 0, total: 0 },
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { message?: string };
  if (!response.ok)
    throw new Error(data.message ?? "Máy chủ chưa thể xử lý yêu cầu.");
  return data;
}

export function VocabularyWorkspace() {
  const [tab, setTab] = useState<Tab>("library");
  const [filters, setFilters] = useState<Filters>({
    level: "",
    q: "",
    source: "",
    state: "",
    wordType: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<VocabularyListResponse>(emptyData);
  const [sets, setSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingWord, setEditingWord] = useState<
    VocabularyWord | null | undefined
  >(undefined);
  const [importing, setImporting] = useState(false);

  const loadSets = useCallback(async () => {
    const result = await readJson<{ items: VocabularySet[] }>(
      await fetch("/api/domain/vocabulary-sets", { cache: "no-store" }),
    );
    setSets(result.items);
  }, []);

  const loadWords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });
      for (const [key, value] of Object.entries(appliedFilters))
        if (value) params.set(key, value);
      if (tab === "due") params.set("due", "true");
      setData(
        await readJson<VocabularyListResponse>(
          await fetch(`/api/domain/vocabulary?${params}`, {
            cache: "no-store",
          }),
        ),
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Không thể tải kho từ.",
      );
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, tab]);

  useEffect(() => {
    // Loading remote application data is the synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWords();
  }, [loadWords]);

  useEffect(() => {
    // Loading remote application data is the synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSets().catch((caught: unknown) => {
      setError(
        caught instanceof Error ? caught.message : "Không thể tải dữ liệu.",
      );
      setLoading(false);
    });
  }, [loadSets]);

  function search(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  }

  async function saveWord(payload: Record<string, unknown>) {
    const editing = editingWord ?? undefined;
    await readJson(
      await fetch(`/api/domain/vocabulary${editing ? `/${editing.id}` : ""}`, {
        body: JSON.stringify(payload),
        headers: { "content-type": "application/json" },
        method: editing ? "PATCH" : "POST",
      }),
    );
    setEditingWord(undefined);
    setNotice(editing ? "Đã cập nhật từ." : "Đã thêm từ vào kho.");
    await loadWords();
  }

  async function archiveWord(word: VocabularyWord) {
    if (!window.confirm(`Lưu trữ “${word.headword}”?`)) return;
    const response = await fetch(`/api/domain/vocabulary/${word.id}`, {
      method: "DELETE",
    });
    if (!response.ok) return setError("Không thể lưu trữ từ này.");
    setNotice("Đã lưu trữ từ.");
    await loadWords();
  }

  const totalPages = data.pagination.totalPages;

  return (
    <div className="page-stack vocabulary-page">
      <header className="page-heading vocabulary-heading">
        <div>
          <p className="eyebrow">Wortschatz · Kho cá nhân</p>
          <h1>Từ vựng</h1>
          <p>
            Lưu từ đúng ngữ cảnh, theo dõi tiến độ và chuẩn bị cho mỗi lượt ôn.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setImporting(true)}
          >
            <FileUp aria-hidden="true" size={18} />
            Nhập nhiều từ
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => setEditingWord(null)}
          >
            <Plus aria-hidden="true" size={18} />
            Thêm từ
          </button>
        </div>
      </header>

      <dl className="summary-strip" aria-label="Tóm tắt kho từ">
        <div>
          <dt>Tổng số</dt>
          <dd>{data.summary.total}</dd>
        </div>
        <div>
          <dt>Đang học</dt>
          <dd>{data.summary.learning}</dd>
        </div>
        <div>
          <dt>Đã thuộc</dt>
          <dd>{data.summary.mastered}</dd>
        </div>
        <div>
          <dt>Đến hạn</dt>
          <dd>{data.summary.due}</dd>
        </div>
      </dl>

      <nav className="content-tabs" aria-label="Khu vực từ vựng">
        <button
          type="button"
          aria-current={tab === "due" ? "page" : undefined}
          onClick={() => {
            setPage(1);
            setTab("due");
          }}
        >
          Đến hạn <span>{data.summary.due}</span>
        </button>
        <button
          type="button"
          aria-current={tab === "library" ? "page" : undefined}
          onClick={() => {
            setPage(1);
            setTab("library");
          }}
        >
          Kho từ
        </button>
        <button
          type="button"
          aria-current={tab === "sets" ? "page" : undefined}
          onClick={() => setTab("sets")}
        >
          Bộ từ
        </button>
      </nav>

      {notice ? (
        <p className="success-notice" role="status">
          {notice}
        </p>
      ) : null}

      {tab === "sets" ? (
        <VocabularySetsView
          sets={sets}
          onChanged={async () => {
            await loadSets();
            setNotice("Đã cập nhật bộ từ.");
          }}
        />
      ) : (
        <>
          <form className="vocabulary-filters" role="search" onSubmit={search}>
            <label className="search-field">
              <Search aria-hidden="true" size={18} />
              <span className="sr-only">Tìm từ vựng</span>
              <input
                type="search"
                aria-label="Tìm từ vựng"
                placeholder="Tìm từ, số nhiều hoặc nghĩa…"
                value={filters.q}
                onChange={(event) =>
                  setFilters({ ...filters, q: event.target.value })
                }
              />
            </label>
            <Filter
              label="Trình độ"
              value={filters.level}
              onChange={(level) => setFilters({ ...filters, level })}
              options={[
                ["A1", "A1"],
                ["A2", "A2"],
                ["B1", "B1"],
                ["B2", "B2"],
                ["C1", "C1"],
              ]}
            />
            <Filter
              label="Loại từ"
              value={filters.wordType}
              onChange={(wordType) => setFilters({ ...filters, wordType })}
              options={[
                ["noun", "Danh từ"],
                ["verb", "Động từ"],
                ["adjective", "Tính từ"],
                ["adverb", "Trạng từ"],
                ["phrase", "Cụm từ"],
              ]}
            />
            <Filter
              label="Trạng thái"
              value={filters.state}
              onChange={(state) => setFilters({ ...filters, state })}
              options={[
                ["new", "Mới"],
                ["learning", "Đang học"],
                ["review", "Ôn tập"],
                ["mastered", "Đã thuộc"],
              ]}
            />
            <Filter
              label="Nguồn"
              value={filters.source}
              onChange={(source) => setFilters({ ...filters, source })}
              options={[
                ["manual", "Tự thêm"],
                ["lesson", "Bài học"],
              ]}
            />
            <button className="button button--secondary" type="submit">
              Tìm kiếm
            </button>
          </form>

          {loading ? (
            <div className="vocabulary-loading" role="status">
              <span className="loading-line" />
              <span className="loading-line" />
              <span className="loading-line" />
              <span className="sr-only">Đang tải kho từ…</span>
            </div>
          ) : error ? (
            <section className="inline-error" role="alert">
              <AlertTriangle aria-hidden="true" />
              <div>
                <h2>Chưa tải được kho từ</h2>
                <p>{error}</p>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => void loadWords()}
                >
                  Thử lại
                </button>
              </div>
            </section>
          ) : data.items.length === 0 ? (
            <section
              className="compact-empty"
              role="region"
              aria-label="Kho từ đang trống"
            >
              <LibraryBig aria-hidden="true" />
              <div>
                <h2>
                  {appliedFilters.q
                    ? "Không tìm thấy từ phù hợp"
                    : "Kho từ đang trống"}
                </h2>
                <p>
                  {appliedFilters.q
                    ? "Thử đổi từ khóa hoặc bỏ bớt bộ lọc."
                    : "Hãy thêm từ đầu tiên hoặc nhập danh sách có sẵn để bắt đầu."}
                </p>
              </div>
            </section>
          ) : (
            <VocabularyTable
              items={data.items}
              onArchive={(word) => void archiveWord(word)}
              onEdit={setEditingWord}
            />
          )}
          {!loading && !error && data.pagination.total > 0 ? (
            <nav className="pagination" aria-label="Phân trang kho từ">
              <button
                className="button button--secondary"
                type="button"
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Trang trước
              </button>
              <span>
                Trang {page} / {totalPages}
              </span>
              <button
                className="button button--secondary"
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Trang sau
              </button>
            </nav>
          ) : null}
        </>
      )}

      {editingWord !== undefined ? (
        <WordFormDialog
          word={editingWord ?? undefined}
          sets={sets}
          onClose={() => setEditingWord(undefined)}
          onSave={saveWord}
        />
      ) : null}
      {importing ? (
        <ImportDialog
          onClose={() => setImporting(false)}
          onImported={async () => {
            await loadWords();
            setNotice("Đã nhập các từ hợp lệ.");
          }}
        />
      ) : null}
    </div>
  );
}

function Filter({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[][];
  value: string;
}) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Tất cả</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
