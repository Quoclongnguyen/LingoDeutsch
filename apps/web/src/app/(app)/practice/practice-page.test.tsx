import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PracticePage from "./page";

describe("PracticePage", () => {
  it("routes learners to the three existing practice paths", () => {
    render(<PracticePage />);

    expect(screen.getByRole("link", { name: "Ôn từ đến hạn" })).toHaveAttribute(
      "href",
      "/practice/review",
    );
    expect(
      screen.getByRole("link", { name: "Chọn bài học A1" }),
    ).toHaveAttribute("href", "/learn");
    expect(
      screen.getByRole("link", { name: "Chọn chủ đề ngữ pháp" }),
    ).toHaveAttribute("href", "/learn/grammar");
    expect(
      screen.queryByText(/sẽ được mở ở giai đoạn sau/i),
    ).not.toBeInTheDocument();
  });
});
