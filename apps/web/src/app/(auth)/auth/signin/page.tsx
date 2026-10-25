import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function SignInPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="signin-title">
        <Link className="brand brand--auth" href="/">
          <span className="brand__mark" aria-hidden="true">
            LD
          </span>
          <span className="brand__copy">
            <strong>Lingo Deutsch</strong>
            <small>German study companion</small>
          </span>
        </Link>

        <div className="auth-panel__content">
          <p className="eyebrow">Willkommen zurück</p>
          <h1 id="signin-title">Tiếp tục học tiếng Đức</h1>
          <p>
            Đăng nhập để giữ lộ trình, từ vựng và lịch ôn tập riêng tư trên mọi
            thiết bị.
          </p>
          <Link
            className="button button--primary"
            href="/api/auth/signin/github?callbackUrl=/today"
          >
            Đăng nhập với GitHub
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <p className="auth-panel__privacy">
            <ShieldCheck aria-hidden="true" size={18} />
            Dữ liệu học tập của bạn không được công khai mặc định.
          </p>
        </div>
      </section>
      <aside className="auth-context" aria-label="Bối cảnh học tập">
        <div className="auth-context__phrase">
          <span className="grammar-label">A1 · FORMELL</span>
          <p>Guten Tag. Ich möchte einen Termin vereinbaren.</p>
          <small>Xin chào. Tôi muốn đặt một cuộc hẹn.</small>
        </div>
      </aside>
    </main>
  );
}
