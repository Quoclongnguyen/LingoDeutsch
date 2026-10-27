import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewWorkspace } from "./review-workspace";

const activeSession = {
  currentCard: {
    intervalPreviews: {
      again: { dueAt: "2026-10-26T12:10:00.000Z", intervalDays: 0 },
      easy: { dueAt: "2026-11-02T12:00:00.000Z", intervalDays: 7 },
      good: { dueAt: "2026-10-29T12:00:00.000Z", intervalDays: 3 },
      hard: { dueAt: "2026-10-27T12:00:00.000Z", intervalDays: 1 },
    },
    reviewState: {
      dueAt: "2026-10-26T12:00:00.000Z",
      easeFactor: 2.5,
      intervalDays: 0,
      lapseCount: 0,
      repetitions: 0,
      state: "new",
    },
    word: {
      article: "der",
      examples: [
        {
          de: "Ich habe morgen einen Termin.",
          vi: "Ngày mai tôi có một cuộc hẹn.",
        },
      ],
      grammar: { notes: "Dùng khi nói về một cuộc hẹn đã sắp xếp." },
      headword: "Termin",
      id: "000000000000000000000010",
      meaningsVi: ["cuộc hẹn"],
      noPlural: false,
      plural: "die Termine",
      wordType: "noun",
    },
  },
  currentIndex: 0,
  id: "000000000000000000000020",
  mode: "de-vi",
  resumed: false,
  reviewedCount: 0,
  status: "active",
  total: 1,
  wordIds: ["000000000000000000000010"],
};

const completedSession = {
  ...activeSession,
  currentCard: undefined,
  currentIndex: 1,
  reviewedCount: 1,
  status: "completed",
  summary: {
    difficultCount: 0,
    nextDueAt: "2026-10-29T12:00:00.000Z",
    reviewedCount: 1,
  },
};

afterEach(() => vi.unstubAllGlobals());

describe("ReviewWorkspace", () => {
  it("hides the answer until reveal and completes with Space then 3", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(activeSession, { status: 201 }))
      .mockResolvedValueOnce(
        Response.json({
          idempotent: false,
          nextState: activeSession.currentCard.intervalPreviews.good,
          session: completedSession,
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("crypto", {
      randomUUID: () => "review-event-component-test-0001",
    });
    const user = userEvent.setup();

    render(<ReviewWorkspace />);
    expect(
      await screen.findByRole("heading", { name: "Termin" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("cuộc hẹn")).not.toBeInTheDocument();

    await user.keyboard(" ");
    expect(screen.getByText("cuộc hẹn")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tốt.*3 ngày/i })).toBeEnabled();

    await user.keyboard("3");
    expect(
      await screen.findByRole("heading", { name: "Phiên ôn đã hoàn thành" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem tiến độ" })).toHaveAttribute(
      "href",
      "/progress",
    );
    expect(fetcher).toHaveBeenLastCalledWith(
      "/api/domain/review-sessions/000000000000000000000020/rate",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("asks before continuing a recovered session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ ...activeSession, resumed: true })),
    );
    const user = userEvent.setup();

    render(<ReviewWorkspace />);
    expect(
      await screen.findByRole("heading", { name: "Tiếp tục phiên đang dở?" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Termin" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Termin" })).toBeVisible(),
    );
  });
});
