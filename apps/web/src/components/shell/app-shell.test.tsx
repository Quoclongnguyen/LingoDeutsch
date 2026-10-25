import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/shell/app-shell";

const pathname = vi.fn(() => "/today");

vi.mock("next/navigation", () => ({
  usePathname: () => pathname(),
}));

describe("AppShell", () => {
  beforeEach(() => pathname.mockReturnValue("/today"));

  it("renders the stable five-destination navigation and main content", () => {
    render(
      <AppShell userName="Long">
        <h1>Hôm nay</h1>
      </AppShell>,
    );

    const desktopNavigation = screen.getByLabelText("Điều hướng chính");
    const mobileNavigation = screen.getByLabelText("Điều hướng di động");

    for (const label of ["Hôm nay", "Học", "Từ vựng", "Luyện tập", "Tiến độ"]) {
      expect(within(desktopNavigation).getByText(label)).toBeInTheDocument();
      expect(within(mobileNavigation).getByText(label)).toBeInTheDocument();
    }

    expect(screen.getByRole("main")).toHaveTextContent("Hôm nay");
    expect(screen.getByText("Long")).toBeInTheDocument();
  });

  it("marks the current destination instead of always selecting Today", () => {
    pathname.mockReturnValue("/vocabulary");

    render(
      <AppShell userName="Long">
        <h1>Từ vựng</h1>
      </AppShell>,
    );

    const desktopNavigation = screen.getByLabelText("Điều hướng chính");
    expect(
      within(desktopNavigation).getByRole("link", { name: "Từ vựng" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(desktopNavigation).getByRole("link", { name: "Hôm nay" }),
    ).not.toHaveAttribute("aria-current");
  });
});
