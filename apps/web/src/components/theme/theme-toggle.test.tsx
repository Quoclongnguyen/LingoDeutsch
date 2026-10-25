import { fireEvent, render, screen } from "@testing-library/react";
import { useTheme } from "next-themes";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "@/components/theme/theme-toggle";

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

describe("ThemeToggle", () => {
  const setTheme = vi.fn();

  beforeEach(() => {
    setTheme.mockReset();
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      resolvedTheme: "light",
      setTheme,
      themes: ["light", "dark"],
      systemTheme: "light",
      forcedTheme: undefined,
    });
  });

  it("exposes the current theme and changes it with a labeled button", () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByRole("button", {
      name: "Dùng giao diện tối",
    });
    expect(
      screen.getByRole("button", { name: "Dùng giao diện sáng" }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(darkButton);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
