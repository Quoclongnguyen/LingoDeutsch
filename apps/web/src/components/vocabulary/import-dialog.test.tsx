import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ImportDialog } from "./import-dialog";

afterEach(() => vi.unstubAllGlobals());

describe("ImportDialog", () => {
  it("shows a stable error when import preview returns an empty failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );
    const user = userEvent.setup();

    render(<ImportDialog onClose={vi.fn()} onImported={vi.fn()} />);
    await user.type(
      screen.getByLabelText("Dữ liệu từ vựng"),
      "Termin | lịch hẹn | noun | der | Termine | A1",
    );
    await user.click(screen.getByRole("button", { name: "Xem trước" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Không thể xem trước dữ liệu nhập.",
    );
    expect(
      screen.queryByText(/Unexpected end of JSON input/i),
    ).not.toBeInTheDocument();
  });
});
