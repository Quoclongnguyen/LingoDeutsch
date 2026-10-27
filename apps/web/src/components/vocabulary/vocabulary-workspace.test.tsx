import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VocabularyWorkspace } from "@/components/vocabulary/vocabulary-workspace";

const populatedResponse = {
  items: [
    {
      article: "der",
      examples: [
        {
          de: "Ich habe morgen einen Termin.",
          vi: "Ngày mai tôi có lịch hẹn.",
        },
      ],
      grammar: {},
      headword: "Termin",
      id: "000000000000000000000010",
      level: "A1",
      meaningsVi: ["lịch hẹn"],
      noPlural: false,
      plural: "Termine",
      review: { dueAt: "2026-10-25T00:00:00.000Z", state: "learning" },
      setIds: [],
      updatedAt: "2026-10-25T00:00:00.000Z",
      wordType: "noun",
    },
  ],
  pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
  summary: { due: 1, learning: 1, mastered: 0, total: 1 },
};

afterEach(() => vi.unstubAllGlobals());

describe("VocabularyWorkspace", () => {
  it("renders summary, German metadata, and meaningful actions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(populatedResponse)),
    );

    render(<VocabularyWorkspace />);

    expect(
      await screen.findByRole("heading", { name: "Termin" }),
    ).toBeInTheDocument();
    expect(screen.getByText("der")).toBeInTheDocument();
    expect(screen.getByText(/Termine/)).toBeInTheDocument();
    expect(screen.getByText("lịch hẹn")).toBeInTheDocument();
    expect(screen.getByLabelText("Tóm tắt kho từ")).toHaveTextContent(
      "Tổng số1",
    );
    expect(screen.getByRole("button", { name: "Thêm từ" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Nhập nhiều từ" })).toBeEnabled();
  });

  it("searches through the authenticated BFF without putting a user id in the URL", async () => {
    const fetcher = vi.fn<(input: string | URL | Request) => Promise<Response>>(
      async () => Response.json(populatedResponse),
    );
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(<VocabularyWorkspace />);
    await screen.findByRole("heading", { name: "Termin" });
    await user.type(
      screen.getByRole("searchbox", { name: "Tìm từ vựng" }),
      "Arbeit",
    );
    await user.click(screen.getByRole("button", { name: "Tìm kiếm" }));

    await waitFor(() =>
      expect(fetcher.mock.calls.length).toBeGreaterThanOrEqual(3),
    );
    const requestedUrl = String(
      fetcher.mock.calls.findLast(([url]) =>
        String(url).includes("q=Arbeit"),
      )?.[0] ?? "",
    );
    expect(requestedUrl).toContain("/api/domain/vocabulary?");
    expect(requestedUrl).toContain("q=Arbeit");
    expect(requestedUrl).not.toContain("userId");
  });

  it("shows a purposeful empty state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          items: [],
          pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
          summary: { due: 0, learning: 0, mastered: 0, total: 0 },
        }),
      ),
    );

    render(<VocabularyWorkspace />);

    const empty = await screen.findByRole("region", {
      name: "Kho từ đang trống",
    });
    expect(within(empty).getByText(/thêm từ đầu tiên/i)).toBeInTheDocument();
  });

  it("opens an accessible German-aware word form", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(populatedResponse)),
    );
    const user = userEvent.setup();

    render(<VocabularyWorkspace />);
    await screen.findByRole("heading", { name: "Termin" });
    await user.click(screen.getByRole("button", { name: "Thêm từ" }));

    const dialog = screen.getByRole("dialog", { name: "Thêm từ mới" });
    expect(within(dialog).getByLabelText("Từ tiếng Đức")).toBeRequired();
    expect(within(dialog).getByLabelText("Nghĩa tiếng Việt")).toBeRequired();
    expect(within(dialog).getByLabelText("Loại từ")).toBeInTheDocument();
  });

  it("closes the word dialog with Escape and restores focus to its trigger", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(populatedResponse)),
    );
    const user = userEvent.setup();

    render(<VocabularyWorkspace />);
    await screen.findByRole("heading", { name: "Termin" });
    const trigger = screen.getByRole("button", { name: "Thêm từ" });
    await user.click(trigger);

    expect(screen.getByLabelText("Từ tiếng Đức")).toHaveFocus();
    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "Thêm từ mới" }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("shows a stable error when the vocabulary response has no JSON body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) =>
        String(input).includes("vocabulary-sets")
          ? Response.json({ items: [] })
          : new Response(null, { status: 503 }),
      ),
    );

    render(<VocabularyWorkspace />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Máy chủ chưa thể xử lý yêu cầu.",
    );
    expect(
      screen.queryByText(/Unexpected end of JSON input/i),
    ).not.toBeInTheDocument();
  });
});
