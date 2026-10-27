import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ImportDialog } from "./import-dialog";

afterEach(() => vi.unstubAllGlobals());

describe("ImportDialog", () => {
  it("keeps keyboard focus inside the dialog and closes with Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ImportDialog onClose={onClose} onImported={vi.fn()} />);

    const input = screen.getByLabelText("Dữ liệu từ vựng");
    const close = screen.getByRole("button", { name: "Đóng" });
    const cancel = screen.getByRole("button", { name: "Hủy" });
    expect(input).toHaveFocus();

    close.focus();
    await user.tab({ shift: true });
    expect(cancel).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

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
