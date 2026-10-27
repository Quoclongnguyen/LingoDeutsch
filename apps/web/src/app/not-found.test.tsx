import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("NotFound", () => {
  it("explains the missing page and provides recovery paths", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: "Không tìm thấy trang" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/địa chỉ có thể đã thay đổi hoặc không còn tồn tại/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Lingo Deutsch/i }),
    ).toHaveAttribute("href", "/today");
    expect(screen.getByRole("link", { name: "Về Hôm nay" })).toHaveAttribute(
      "href",
      "/today",
    );
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute(
      "href",
      "/auth/signin",
    );
  });
});
