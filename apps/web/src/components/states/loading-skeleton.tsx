export function LoadingSkeleton() {
  return (
    <div
      className="loading-layout"
      aria-busy="true"
      aria-label="Đang tải nội dung học tập"
    >
      <div className="skeleton skeleton--title" />
      <div className="loading-grid">
        <div className="skeleton skeleton--primary" />
        <div className="skeleton skeleton--secondary" />
      </div>
      <span className="sr-only">Đang tải nội dung học tập</span>
    </div>
  );
}
