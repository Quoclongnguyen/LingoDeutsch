"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application boundary error", error);
  }, [error]);

  return (
    <section
      className="error-state"
      role="alert"
      aria-labelledby="app-error-title"
    >
      <CircleAlert aria-hidden="true" size={28} />
      <div>
        <h1 id="app-error-title">Không thể tải không gian học tập</h1>
        <p>
          Hãy thử lại. Nếu lỗi vẫn còn, kiểm tra cấu hình môi trường phía
          server.
        </p>
      </div>
      <button
        className="button button--secondary"
        type="button"
        onClick={reset}
      >
        <RotateCcw aria-hidden="true" size={18} />
        Thử lại
      </button>
    </section>
  );
}
