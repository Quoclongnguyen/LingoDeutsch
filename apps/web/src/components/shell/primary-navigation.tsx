"use client";

import {
  AudioLines,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Home,
  LibraryBig,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  { href: "/today", label: "Hôm nay", icon: Home },
  { href: "/learn", label: "Học", icon: BookOpen },
  { href: "/vocabulary", label: "Từ vựng", icon: LibraryBig },
  { href: "/practice", label: "Luyện tập", icon: AudioLines },
  { href: "/progress", label: "Tiến độ", icon: ChartNoAxesColumnIncreasing },
];

export function PrimaryNavigation({
  variant,
}: {
  variant: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  return (
    <nav
      aria-label={isMobile ? "Điều hướng di động" : "Điều hướng chính"}
      className={isMobile ? "mobile-nav" : "sidebar-nav"}
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isCurrent =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            className={isMobile ? "mobile-nav__link" : "sidebar-nav__link"}
          >
            <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
