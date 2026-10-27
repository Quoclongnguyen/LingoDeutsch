import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GrammarLibraryWorkspace } from "./grammar-library-workspace";
import { GrammarTopicWorkspace } from "./grammar-topic-workspace";

afterEach(() => vi.unstubAllGlobals());

describe("Phase 05 grammar workspaces", () => {
  it("renders the ordered A1 topic list and Learn sub-navigation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          level: "A1",
          topics: [
            {
              example: {
                de: "Guten Tag. Wie heißen Sie?",
                vi: "Xin chào. Ông/bà tên là gì?",
              },
              order: 1,
              relatedLessonCount: 1,
              slug: "a1-begruessung-und-anrede",
              summaryVi: "Chọn lời chào và cách xưng hô phù hợp.",
              titleDe: "Begrüßung und Anrede",
              titleVi: "Chào hỏi và xưng hô",
            },
          ],
        }),
      ),
    );

    render(<GrammarLibraryWorkspace />);

    expect(
      await screen.findByRole("heading", { name: "Ngữ pháp tiếng Đức A1" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lộ trình A1" })).toHaveAttribute(
      "href",
      "/learn",
    );
    expect(
      screen.getByRole("link", { name: /Begrüßung und Anrede/i }),
    ).toHaveAttribute("href", "/learn/grammar/a1-begruessung-und-anrede");
    expect(screen.getByText("Guten Tag. Wie heißen Sie?")).toBeInTheDocument();
  });

  it("renders structured rules, a compact table, and related lessons", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          compactTable: {
            captionVi: "Chia động từ sein",
            headers: ["Đại từ", "Dạng động từ"],
            rows: [
              ["ich", "bin"],
              ["Sie", "sind"],
            ],
          },
          examples: [
            { de: "Ich bin Long.", vi: "Tôi là Long." },
            { de: "Sie sind Frau Keller.", vi: "Bà là cô Keller." },
          ],
          exercises: [
            {
              feedbackCorrectVi: "Đúng.",
              feedbackIncorrectVi: "Hãy xem lại cách chia sein.",
              id: "sein-form",
              instructionVi: "Chọn dạng đúng.",
              options: [
                { id: "bin", text: "bin" },
                { id: "bist", text: "bist" },
              ],
              promptDe: "Ich ___ Long.",
              type: "multiple_choice",
            },
          ],
          id: "topic-1",
          level: "A1",
          order: 3,
          relatedLessons: [
            {
              slug: "a1-begruessung-und-vorstellung",
              titleDe: "Begrüßung und Vorstellung",
              titleVi: "Chào hỏi và giới thiệu",
            },
          ],
          rules: [
            {
              explanationVi: "Dạng của sein thay đổi theo chủ ngữ.",
              id: "sein-form",
              titleDe: "sein im Präsens",
            },
          ],
          slug: "a1-sein-und-haben",
          summaryVi: "Hai động từ cơ bản dùng để mô tả và sở hữu.",
          titleDe: "sein und haben",
          titleVi: "Động từ sein và haben",
        }),
      ),
    );

    render(<GrammarTopicWorkspace slug="a1-sein-und-haben" />);

    expect(
      await screen.findByRole("heading", { name: "sein und haben" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Dạng của sein thay đổi theo chủ ngữ."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Chia động từ sein" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Begrüßung und Vorstellung/i }),
    ).toHaveAttribute("href", "/learn/a1-begruessung-und-vorstellung");
    expect(
      screen.getByRole("link", { name: /Bắt đầu luyện/i }),
    ).toHaveAttribute(
      "href",
      "/practice/exercises/grammar_topic/a1-sein-und-haben",
    );
  });

  it("retries the grammar library request without reloading the page", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          { message: "Dịch vụ đang tạm thời gián đoạn." },
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(Response.json({ level: "A1", topics: [] }));
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(<GrammarLibraryWorkspace />);

    const retry = await screen.findByRole("button", { name: "Thử lại" });
    await user.click(retry);

    expect(
      await screen.findByRole("heading", { name: "Ngữ pháp tiếng Đức A1" }),
    ).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("retries a grammar topic request without reloading the page", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          { message: "Dịch vụ đang tạm thời gián đoạn." },
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json({
          examples: [],
          exercises: [],
          id: "topic-1",
          level: "A1",
          order: 3,
          relatedLessons: [],
          rules: [],
          slug: "a1-sein-und-haben",
          summaryVi: "Hai động từ cơ bản.",
          titleDe: "sein und haben",
          titleVi: "Động từ sein và haben",
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    render(<GrammarTopicWorkspace slug="a1-sein-und-haben" />);

    const retry = await screen.findByRole("button", { name: "Thử lại" });
    await user.click(retry);

    expect(
      await screen.findByRole("heading", { name: "sein und haben" }),
    ).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
