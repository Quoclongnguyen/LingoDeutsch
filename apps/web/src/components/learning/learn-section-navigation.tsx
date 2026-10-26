"use client";

import { BookOpen, Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/learn", icon: BookOpen, label: "Lộ trình A1" },
  { href: "/learn/grammar", icon: Languages, label: "Ngữ pháp A1" },
] as const;

export function LearnSectionNavigation() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Nội dung học" className="learn-section-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const current =
          item.href === "/learn"
            ? pathname === "/learn"
            : pathname.startsWith(item.href);
        return (
          <Link
            aria-current={current ? "page" : undefined}
            className="learn-section-nav__link"
            href={item.href}
            key={item.href}
          >
            <Icon aria-hidden="true" size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
