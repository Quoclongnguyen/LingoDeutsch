import { ArrowLeft, LogIn, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <header className="not-found-header">
        <Link className="brand" href="/today">
          <span className="brand__mark" aria-hidden="true">
            LD
          </span>
          <span className="brand__copy">
            <strong>Lingo Deutsch</strong>
            <small>Học để sống tại Đức</small>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <section className="not-found-layout" aria-labelledby="not-found-title">
        <div className="not-found-copy">
          <p className="grammar-label">404 · NICHT GEFUNDEN</p>
          <SearchX aria-hidden="true" size={40} strokeWidth={1.5} />
          <h1 id="not-found-title">Không tìm thấy trang</h1>
          <p>
            Địa chỉ có thể đã thay đổi hoặc không còn tồn tại. Bạn có thể quay
            về buổi học hôm nay hoặc đăng nhập lại để tiếp tục.
          </p>
          <div className="not-found-actions">
            <Link className="button button--primary" href="/today">
              <ArrowLeft aria-hidden="true" size={18} />
              Về Hôm nay
            </Link>
            <Link className="button button--secondary" href="/auth/signin">
              <LogIn aria-hidden="true" size={18} />
              Đăng nhập
            </Link>
          </div>
        </div>

        <aside className="not-found-phrase" aria-label="Câu tiếng Đức hữu ích">
          <span lang="de">Entschuldigung, diese Seite gibt es nicht.</span>
          <p>Xin lỗi, trang này không tồn tại.</p>
        </aside>
      </section>
    </main>
  );
}
