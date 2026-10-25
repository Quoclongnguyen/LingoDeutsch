"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribeToHydration = () => () => undefined;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const currentTheme = isHydrated ? resolvedTheme : undefined;

  return (
    <div className="theme-toggle" aria-label="Chọn giao diện">
      <button
        type="button"
        aria-label="Dùng giao diện sáng"
        aria-pressed={currentTheme === "light"}
        className="theme-toggle__button"
        disabled={!isHydrated}
        onClick={() => setTheme("light")}
      >
        <Sun aria-hidden="true" size={16} strokeWidth={1.8} />
        <span>Sáng</span>
      </button>
      <button
        type="button"
        aria-label="Dùng giao diện tối"
        aria-pressed={currentTheme === "dark"}
        className="theme-toggle__button"
        disabled={!isHydrated}
        onClick={() => setTheme("dark")}
      >
        <Moon aria-hidden="true" size={16} strokeWidth={1.8} />
        <span>Tối</span>
      </button>
    </div>
  );
}
