import { LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { PrimaryNavigation } from "@/components/shell/primary-navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AppShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Chuyển đến nội dung chính
      </a>

      <aside className="sidebar">
        <Link className="brand" href="/today">
          <span className="brand__mark" aria-hidden="true">
            LD
          </span>
          <span className="brand__copy">
            <strong>Lingo Deutsch</strong>
            <small>Học để sống tại Đức</small>
          </span>
        </Link>

        <PrimaryNavigation variant="desktop" />

        <div className="sidebar__footer">
          <div className="learner-chip">
            <span className="learner-chip__avatar" aria-hidden="true">
              {userName.slice(0, 1).toLocaleUpperCase("vi")}
            </span>
            <span className="learner-chip__copy">
              <strong>{userName}</strong>
              <small>Trình độ A1</small>
            </span>
          </div>
          <Link className="sign-out-link" href="/api/auth/signout">
            <LogOut aria-hidden="true" size={18} />
            <span>Đăng xuất</span>
          </Link>
        </div>
      </aside>

      <div className="app-frame">
        <header className="app-header">
          <div>
            <p className="eyebrow">Deutsch für deinen Alltag</p>
            <p className="app-header__message">
              Từng bước vững vàng cho hành trình tại Đức.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <main id="main-content" className="app-main">
          {children}
        </main>
      </div>

      <PrimaryNavigation variant="mobile" />
    </div>
  );
}
